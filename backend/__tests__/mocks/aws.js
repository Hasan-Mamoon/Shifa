import { jest } from '@jest/globals';

// Mock functions
export const mockS3Send = jest.fn().mockResolvedValue({});
export const mockGetSignedUrl = jest.fn().mockResolvedValue('https://mock-s3-url.com/image.jpg');
export const mockS3Client = jest.fn().mockImplementation(() => ({
  send: mockS3Send
}));
export const mockGetObjectCommand = jest.fn();
export const mockPutObjectCommand = jest.fn();
export const mockDeleteObjectCommand = jest.fn();

// Mock AWS SDK
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: mockS3Client,
  GetObjectCommand: mockGetObjectCommand,
  PutObjectCommand: mockPutObjectCommand,
  DeleteObjectCommand: mockDeleteObjectCommand
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: mockGetSignedUrl
})); 