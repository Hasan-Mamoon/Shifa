import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { connect, clearDatabase, closeDatabase } from './setup.js';
import app from '../server.js';
import { blogModel } from '../models/blogModel.js';
import { doctormodel as Doctor } from '../models/doctor.js';
import bcrypt from 'bcryptjs';

// Mock AWS S3
const mockS3Send = jest.fn().mockResolvedValue({});
const mockGetSignedUrl = jest.fn().mockResolvedValue('https://mock-s3-url.com/image.jpg');

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: mockS3Send
  })),
  GetObjectCommand: jest.fn(),
  PutObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn()
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: mockGetSignedUrl
}));

// Create a test image buffer
const createTestImage = () => {
  return Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  );
};

describe('Blog Routes', () => {
  beforeAll(async () => await connect());
  afterEach(async () => {
    await clearDatabase();
    jest.clearAllMocks();
  });
  afterAll(async () => {
    await clearDatabase();
    await closeDatabase();
  });

  let doctorToken;
  let doctorId;
  let blogId;

  const testDoctor = {
    name: 'Dr. Test',
    email: 'doctor@example.com',
    password: 'Doctor123!',
    speciality: 'Cardiology',
    experience: '10 years',
    about: 'Experienced cardiologist',
    fees: 1000,
    address: {
      line1: 'Test Hospital',
      line2: 'Test Area'
    },
    image: 'test-image.jpg',
    degree: 'test-degree.pdf'
  };

  const testBlog = {
    title: 'Test Blog',
    content: 'Test blog content',
    category: 'Health'
  };

  beforeEach(async () => {
    // Create a doctor
    const doctor = await Doctor.create({
      ...testDoctor,
      password: await bcrypt.hash(testDoctor.password, 10)
    });
    doctorId = doctor._id;

    // Get doctor token
    const loginResponse = await request(app)
      .post('/doctor/login')
      .send({
        email: testDoctor.email,
        password: testDoctor.password
      });
    doctorToken = loginResponse.body.token;

    // Create a blog
    const blog = await blogModel.create({
      ...testBlog,
      author: doctor._id,
      image: 'test-blog-image.jpg'
    });
    blogId = blog._id;
  });

  describe('POST /blog/add-blog', () => {
    it('should create a new blog post', async () => {
      const response = await request(app)
        .post('/blog/add-blog')
        .field('title', 'New Blog')
        .field('content', 'New blog content')
        .field('category', 'Health')
        .field('author', doctorId.toString())
        .attach('image', createTestImage(), {
          filename: 'test-image.png',
          contentType: 'image/png'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Blog created successfully');
    });

    it('should not create blog without image', async () => {
      const response = await request(app)
        .post('/blog/add-blog')
        .field('title', 'New Blog')
        .field('content', 'New blog content')
        .field('category', 'Health')
        .field('author', doctorId.toString());

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Image file is required');
    });
  });

  describe('GET /blog/blogs', () => {
    it('should get all blog posts', async () => {
      const response = await request(app)
        .get('/blog/blogs');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(1);
      expect(response.body[0]).toHaveProperty('title', testBlog.title);
    });

    it('should filter blog posts by category', async () => {
      const response = await request(app)
        .get('/blog/blogs')
        .query({ category: testBlog.category });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(1);
      expect(response.body[0]).toHaveProperty('category', testBlog.category);
    });

    it('should return empty array for non-existent category', async () => {
      const response = await request(app)
        .get('/blog/blogs')
        .query({ category: 'NonExistentCategory' });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(0);
    });
  });

  describe('GET /blog/blogs/:id', () => {
    it('should get a specific blog post', async () => {
      const response = await request(app)
        .get(`/blog/blogs/${blogId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('title', testBlog.title);
      expect(response.body).toHaveProperty('content', testBlog.content);
    });

    it('should return 404 for non-existent blog post', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/blog/blogs/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Blog not found');
    });
  });

  describe('PUT /blog/update-blog/:id', () => {
    it('should update a blog post', async () => {
      const response = await request(app)
        .put(`/blog/update-blog/${blogId}`)
        .field('title', 'Updated Title')
        .field('content', 'Updated content')
        .field('category', 'Updated Category')
        .field('author', doctorId.toString())
        .attach('image', createTestImage(), {
          filename: 'updated-image.png',
          contentType: 'image/png'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Blog updated successfully');

      // Verify the update
      const updatedBlog = await blogModel.findById(blogId);
      expect(updatedBlog.title).toBe('Updated Title');
      expect(updatedBlog.content).toBe('Updated content');
      expect(updatedBlog.category).toBe('Updated Category');
    });

    it('should not update blog with wrong author', async () => {
      const wrongAuthorId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/blog/update-blog/${blogId}`)
        .field('title', 'Updated Title')
        .field('content', 'Updated content')
        .field('category', 'Updated Category')
        .field('author', wrongAuthorId.toString())
        .attach('image', createTestImage(), {
          filename: 'updated-image.png',
          contentType: 'image/png'
        });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Unauthorized to update this blog');
    });
  });

  describe('DELETE /blog/delete-blog/:id', () => {
    it('should delete a blog post', async () => {
      const response = await request(app)
        .delete(`/blog/delete-blog/${blogId}`)
        .send({ author: doctorId.toString() });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Blog deleted successfully');

      // Verify deletion
      const deletedBlog = await blogModel.findById(blogId);
      expect(deletedBlog).toBeNull();
    });

    it('should not delete blog with wrong author', async () => {
      const wrongAuthorId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/blog/delete-blog/${blogId}`)
        .send({ author: wrongAuthorId.toString() });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Unauthorized to delete this blog');

      // Verify blog still exists
      const blog = await blogModel.findById(blogId);
      expect(blog).toBeTruthy();
    });

    it('should return 404 for non-existent blog', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/blog/delete-blog/${fakeId}`)
        .send({ author: doctorId.toString() });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Blog not found');
    });
  });
}); 