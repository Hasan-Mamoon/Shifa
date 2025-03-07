// import express from "express";
// import { blogModel } from "../models/blogModel.js";
// import { doctormodel } from "../models/doctor.js";
// import multer from "multer";
// import crypto from "crypto";
// import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// const router = express.Router();

// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// const bucketName = process.env.BUCKET_NAME;
// const bucketRegion = process.env.BUCKET_REGION;
// const accessKey = process.env.ACCESS_KEY;
// const secretAccessKey = process.env.SECRET_ACCESS_KEY;

// const s3 = new S3Client({
//   credentials: {
//     accessKeyId: accessKey,
//     secretAccessKey: secretAccessKey,
//   },
//   region: bucketRegion,
// });

// const randomImageName = (bytes = 32) =>
//   crypto.randomBytes(bytes).toString("hex");

// router.post("/add-blog", upload.single("image"), async (req, res) => {
//   try {
//     const { title, content, category, author } = req.body;
//     if (!req.file) {
//       return res.status(400).json({ message: "Image file is required" });
//     }

//     const imageName = randomImageName();
//     const buffer = req.file.buffer;

//     const imageParams = {
//       Bucket: bucketName,
//       Key: imageName,
//       Body: buffer,
//       ContentType: req.file.mimetype,
//     };

//     const imageCommand = new PutObjectCommand(imageParams);
//     await s3.send(imageCommand);

//     const newBlog = new blogModel({
//       title,
//       content,
//       category,
//       image: imageName,
//       author,
//     });

//     await newBlog.save();
//     return res.status(201).json({ message: "Blog created successfully" });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Error adding blog", error: err });
//   }
// });

// router.get("/blogs", async (req, res) => {
//   try {
//     const blogs = await blogModel.find().populate("author", "name");

//     for (const blog of blogs) {
//       const getObjectParams = {
//         Bucket: bucketName,
//         Key: blog.image,
//       };
//       const command = new GetObjectCommand(getObjectParams);
//       const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
//       blog.image = url;
//     }

//     return res.status(200).json(blogs);
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// });

// router.get("/blogs/:id", async (req, res) => {
//     try {
//       const blog = await blogModel.findById(req.params.id).populate("author", "name");

//       if (!blog) {
//         return res.status(404).json({ message: "Blog not found" });
//       }

//       const getObjectParams = {
//         Bucket: bucketName,
//         Key: blog.image,
//       };
//       const command = new GetObjectCommand(getObjectParams);
//       blog.image = await getSignedUrl(s3, command, { expiresIn: 3600 });

//       return res.status(200).json(blog);
//     } catch (err) {
//       console.error(err);
//       return res.status(500).json({ message: "Internal Server Error" });
//     }
//   });

// router.put("/update-blog/:id", upload.single("image"), async (req, res) => {
//   try {
//     const { title, content, category, author } = req.body;
//     const blog = await blogModel.findById(req.params.id);
//     if (!blog) {
//       return res.status(404).json({ message: "Blog not found" });
//     }
//     if (blog.author.toString() !== author) {
//       return res.status(403).json({ message: "Unauthorized to update this blog" });
//     }

//     if (req.file) {
//       const imageName = randomImageName();
//       const buffer = req.file.buffer;
//       const imageParams = {
//         Bucket: bucketName,
//         Key: imageName,
//         Body: buffer,
//         ContentType: req.file.mimetype,
//       };
//       const imageCommand = new PutObjectCommand(imageParams);
//       await s3.send(imageCommand);
//       blog.image = imageName;
//     }

//     blog.title = title;
//     blog.content = content;
//     blog.category = category;
//     await blog.save();

//     return res.status(200).json({ message: "Blog updated successfully" });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Error updating blog", error: err });
//   }
// });

// router.delete("/delete-blog/:id", async (req, res) => {
//   try {
//     const { author } = req.body;
//     const blog = await blogModel.findById(req.params.id);
//     if (!blog) {
//       return res.status(404).json({ message: "Blog not found" });
//     }
//     if (blog.author.toString() !== author) {
//       return res.status(403).json({ message: "Unauthorized to delete this blog" });
//     }

//     const deleteParams = {
//       Bucket: bucketName,
//       Key: blog.image,
//     };
//     const deleteCommand = new DeleteObjectCommand(deleteParams);
//     await s3.send(deleteCommand);

//     await blogModel.findByIdAndDelete(req.params.id);
//     return res.status(200).json({ message: "Blog deleted successfully" });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Error deleting blog", error: err });
//   }
// });

// export { router as blogRouter };

import express from 'express';
import { blogModel } from '../models/blogModel.js';
import { doctormodel } from '../models/doctor.js';
import multer from 'multer';
import crypto from 'crypto';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});

const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

// Add Blog
router.post('/add-blog', upload.single('image'), async (req, res) => {
  try {
    const { title, content, category, author } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    const imageName = randomImageName();
    const buffer = req.file.buffer;

    const imageParams = {
      Bucket: bucketName,
      Key: imageName,
      Body: buffer,
      ContentType: req.file.mimetype,
    };

    const imageCommand = new PutObjectCommand(imageParams);
    await s3.send(imageCommand);

    const newBlog = new blogModel({
      title,
      content,
      category,
      image: imageName,
      author,
    });

    await newBlog.save();
    return res.status(201).json({ message: 'Blog created successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error adding blog', error: err });
  }
});

// Get All Blogs with Optional Category Filter
router.get('/blogs', async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    const blogs = await blogModel.find(query).populate('author', 'name');

    for (const blog of blogs) {
      const getObjectParams = {
        Bucket: bucketName,
        Key: blog.image,
      };
      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
      blog.image = url;
    }

    return res.status(200).json(blogs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get Single Blog by ID
router.get('/blogs/:id', async (req, res) => {
  try {
    const blog = await blogModel.findById(req.params.id).populate('author', 'name');

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const getObjectParams = {
      Bucket: bucketName,
      Key: blog.image,
    };
    const command = new GetObjectCommand(getObjectParams);
    blog.image = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return res.status(200).json(blog);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update Blog
router.put('/update-blog/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, content, category, author } = req.body;
    const blog = await blogModel.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    if (blog.author.toString() !== author) {
      return res.status(403).json({ message: 'Unauthorized to update this blog' });
    }

    if (req.file) {
      const imageName = randomImageName();
      const buffer = req.file.buffer;
      const imageParams = {
        Bucket: bucketName,
        Key: imageName,
        Body: buffer,
        ContentType: req.file.mimetype,
      };
      const imageCommand = new PutObjectCommand(imageParams);
      await s3.send(imageCommand);
      blog.image = imageName;
    }

    blog.title = title;
    blog.content = content;
    blog.category = category;
    await blog.save();

    return res.status(200).json({ message: 'Blog updated successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error updating blog', error: err });
  }
});

// Delete Blog
router.delete('/delete-blog/:id', async (req, res) => {
  try {
    const { author } = req.body;
    const blog = await blogModel.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    if (blog.author.toString() !== author) {
      return res.status(403).json({ message: 'Unauthorized to delete this blog' });
    }

    const deleteParams = {
      Bucket: bucketName,
      Key: blog.image,
    };
    const deleteCommand = new DeleteObjectCommand(deleteParams);
    await s3.send(deleteCommand);

    await blogModel.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error deleting blog', error: err });
  }
});

export { router as blogRouter };
