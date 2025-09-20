import dotenv from 'dotenv';
// Load environment variables first, before any other imports
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth';
import propertyRoutes from './routes/properties';
import inquiryRoutes from './routes/inquiries';
import wishlistRoutes from './routes/wishlist';
import { prisma } from './lib/prisma';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploaded images
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'ProperEase Backend API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      properties: '/api/properties',
      inquiries: '/api/inquiries',
      wishlist: '/api/wishlist',
    },
  });
});

// Test database connection
app.get('/test-db', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    const propertyCount = await prisma.property.count();
    res.json({
      success: true,
      database: 'Connected',
      userCount,
      propertyCount,
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      success: false,
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️ Database: Connected`);
  console.log(`🔐 API Endpoints:`);
  console.log(`   - Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   - Properties: http://localhost:${PORT}/api/properties`);
  console.log(`   - Inquiries: http://localhost:${PORT}/api/inquiries`);
  console.log(`   - Wishlist: http://localhost:${PORT}/api/wishlist`);
});