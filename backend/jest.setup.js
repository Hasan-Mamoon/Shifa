import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod;

// Increase timeout for slow operations
jest.setTimeout(30000);

// Connect to the in-memory database before running tests
beforeAll(async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.error('Error connecting to test database:', error);
    throw error;
  }
});

// Clear all data after each test
afterEach(async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
      }
    }
  } catch (error) {
    console.error('Error clearing test database:', error);
    throw error;
  }
});

// Close database connection after all tests
afterAll(async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
    if (mongod) {
      await mongod.stop();
    }
  } catch (error) {
    console.error('Error closing test database:', error);
    throw error;
  }
});

// Set environment variables for testing
process.env.JWT_SECRET = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MzkyMjU2NTcsImV4cCI6MTc3MDc2MTY1NywiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6IkpvaG5ueSIsIlN1cm5hbWUiOiJSb2NrZXQiLCJFbWFpbCI6Impyb2NrZXRAZXhhbXBsZS5jb20iLCJSb2xlIjpbIk1hbmFnZXIiLCJQcm9qZWN0IEFkbWluaXN0cmF0b3IiXX0.N-Hys88Ck5dZkSzVD2jmYsozFEWU7Q5BMQB_XNk1Krc';
process.env.BUCKET_NAME = 'shifa-healthcare';
process.env.BUCKET_REGION = 'eu-north-1';
process.env.ACCESS_KEY = 'AKIATTSKGBZISI54PH3R';
process.env.SECRET_ACCESS_KEY = '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';
process.env.STRIPE_SECRET_KEY = 'sk_test_51R1H94CsJWOaW7Bds3LvYV1kd51fBxcM7gZLoGL6w7mdO3mdAPb7OzzP71UsAaxUHOyPnfY5WKhr7uCAKv6nyIkx007LujreRs';
process.env.NODE_ENV = 'test';

// Mock console.error to keep test output clean
global.console.error = jest.fn(); 