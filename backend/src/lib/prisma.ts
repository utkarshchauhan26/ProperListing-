import { PrismaClient } from '../../generated/prisma/index';
import dotenv from 'dotenv';

// Load environment variables before initializing Prisma
dotenv.config();

// Set DATABASE_URL directly if not already set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://postgres:suraj121@localhost:5432/properease";
  console.log('✅ DATABASE_URL set to default value');
}

console.log('✅ DATABASE_URL loaded:', process.env.DATABASE_URL.substring(0, 20) + '...');

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma client with explicit DATABASE_URL
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Export for use in routes
