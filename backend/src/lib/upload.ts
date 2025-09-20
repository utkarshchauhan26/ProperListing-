import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Ensure upload directory exists
const ensureUploadDirectory = () => {
  const uploadPath = path.join(process.cwd(), 'uploads', 'properties');
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
    console.log('✅ Upload directory created:', uploadPath);
  }
};

// Initialize upload directory
ensureUploadDirectory();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create uploads directory for property images
    const uploadPath = path.join(process.cwd(), 'uploads', 'properties');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, `property-${uniqueSuffix}${fileExtension}`);
  }
});

// File filter for image validation
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 10, // Maximum 10 files per upload
  }
});

// Middleware for single image upload
export const uploadSingle = upload.single('image');

// Middleware for multiple image upload
export const uploadMultiple = upload.array('images', 10);

// Helper function to get file URL
export const getFileUrl = (filename: string): string => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
  return `${baseUrl}/uploads/properties/${filename}`;
};
