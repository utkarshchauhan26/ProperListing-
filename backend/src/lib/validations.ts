import { z } from 'zod';

// User validation schemas
export const userRegistrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  userType: z.enum(['STUDENT', 'LANDLORD']),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
});

export const userLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Property validation schemas
export const propertyCreateSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().optional(),
  rent: z.number().min(1, 'Rent must be greater than 0'),
  location: z.string().min(3, 'Location is required'),
  roomType: z.enum(['SINGLE', 'SHARED', 'ONE_BHK', 'TWO_BHK', 'THREE_BHK', 'STUDIO']),
  propertyType: z.enum(['PG', 'FLAT', 'INDEPENDENT', 'SHARED', 'COLIVING']),
  amenities: z.array(z.string()).default([]),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  smoking: z.boolean().default(false),
  drinking: z.boolean().default(false),
  pets: z.boolean().default(false),
  visitors: z.boolean().default(false),
  whatsappNumber: z.string().optional(),
});

export const propertyUpdateSchema = propertyCreateSchema.partial();

export const propertyQuerySchema = z.object({
  search: z.string().optional(),
  propertyType: z.enum(['PG', 'FLAT', 'INDEPENDENT', 'SHARED', 'COLIVING']).optional(),
  roomType: z.enum(['SINGLE', 'SHARED', 'ONE_BHK', 'TWO_BHK', 'THREE_BHK', 'STUDIO']).optional(),
  minRent: z.string().optional(),
  maxRent: z.string().optional(),
  city: z.string().optional(),
  amenities: z.string().optional(),
  available: z.string().optional(),
  verified: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

// Inquiry validation schemas
export const inquiryCreateSchema = z.object({
  propertyId: z.string().cuid(),
  contactType: z.enum(['WHATSAPP', 'PHONE', 'EMAIL', 'CONTACT_FORM']),
  message: z.string().optional(),
  userPhone: z.string().optional(),
  userEmail: z.string().email().optional(),
  userName: z.string().optional(),
});

export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
export type PropertyCreate = z.infer<typeof propertyCreateSchema>;
export type PropertyUpdate = z.infer<typeof propertyUpdateSchema>;
export type PropertyQuery = z.infer<typeof propertyQuerySchema>;
export type InquiryCreate = z.infer<typeof inquiryCreateSchema>;
