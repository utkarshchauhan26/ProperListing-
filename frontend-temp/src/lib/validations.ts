import { z } from 'zod'

// Property Form Validation Schema
export const PropertySchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),
  
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  
  propertyType: z.enum(['PG', 'Flat', 'Independent', 'Shared'], {
    message: 'Please select a property type'
  }),
  
  rent: z.number()
    .min(1000, 'Rent must be at least ₹1,000')
    .max(100000, 'Rent must be less than ₹1,00,000'),
  
  location: z.string()
    .min(3, 'Location must be at least 3 characters')
    .max(200, 'Location must be less than 200 characters'),
  
  amenities: z.array(z.string())
    .min(1, 'Please select at least one amenity'),
  
  rules: z.object({
    smoking: z.boolean(),
    drinking: z.boolean(),
    pets: z.boolean().optional(),
    visitors: z.boolean().optional()
  }),
  
  landlordPhone: z.string()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'),
  
  whatsapp: z.string()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'),
  
  images: z.array(z.string().url())
    .max(10, 'Maximum 10 images allowed')
    .optional()
})

// Login Form Validation
export const LoginSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address'),
  
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
})

// Signup Form Validation  
export const SignupSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  
  email: z.string()
    .email('Please enter a valid email address'),
  
  phone: z.string()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number')
    .optional(),
  
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export type PropertyFormData = z.infer<typeof PropertySchema>
export type LoginFormData = z.infer<typeof LoginSchema>
export type SignupFormData = z.infer<typeof SignupSchema>
