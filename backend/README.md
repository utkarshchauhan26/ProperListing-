# 🏠 ProperEase Backend API

## 🚀 Quick Start Guide for Backend Developer

### **📋 Project Overview**
ProperEase is a property rental platform connecting landlords with tenants. The frontend is built with Next.js 14+ and uses NextAuth.js for authentication. Your job is to build the REST API for property management.

### **🔧 Tech Stack**
- **Framework**: Node.js with Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (frontend handles this)
- **Validation**: Zod schemas
- **File Upload**: Cloudinary or local storage

---

## 📊 **Database Schema (Prisma)**

### **Required Models**
```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// NextAuth.js Required Models (DO NOT MODIFY)
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  phone         String?   @unique
  emailVerified DateTime?
  image         String?
  userType      String    @default("landlord")
  createdAt     DateTime  @default(now())
  
  accounts      Account[]
  sessions      Session[]
  properties    Property[]
  
  @@map("users")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// Main Property Model (YOUR FOCUS)
model Property {
  id          String   @id @default(cuid())
  title       String
  description String?
  propertyType String  // "PG", "Flat", "Independent", "Shared"
  rent        Int      // Monthly rent in INR
  location    String   // Full address
  city        String   // For filtering
  state       String   // For filtering
  pincode     String?  // Optional
  
  // Property Details
  bedrooms    Int?     // Number of bedrooms
  bathrooms   Int?     // Number of bathrooms
  area        Int?     // Area in sqft
  furnished   String?  // "Fully", "Semi", "Unfurnished"
  
  // Features & Amenities
  amenities   String[] // ["WiFi", "AC", "Meals", "Laundry", "Parking"]
  rules       Json?    // {smoking: false, drinking: false, pets: true}
  
  // Media & Contact
  images      String[] // Array of image URLs
  whatsapp    String   // Landlord WhatsApp number
  
  // Metadata
  isVerified  Boolean  @default(false)
  isActive    Boolean  @default(true)
  viewCount   Int      @default(0)
  userId      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  user        User     @relation(fields: [userId], references: [id])
  
  @@map("properties")
}

model PropertyInquiry {
  id         String   @id @default(cuid())
  propertyId String
  name       String
  email      String
  phone      String
  message    String?
  createdAt  DateTime @default(now())
  
  @@map("property_inquiries")
}
```

---

## 🔗 **Required API Endpoints**

### **1. Properties Management**

#### **GET /api/properties**
Get all properties with filtering and pagination

```typescript
// Query Parameters:
// ?page=1&limit=10&city=Mumbai&type=PG&minRent=5000&maxRent=25000&amenities=WiFi,AC

Response: {
  properties: Property[],
  totalCount: number,
  currentPage: number,
  totalPages: number
}
```

#### **GET /api/properties/:id**
Get single property with details

```typescript
Response: {
  property: Property & { user: { name, phone, email } },
  similarProperties: Property[] // Optional: 3-4 similar properties
}
```

#### **POST /api/properties**
Create new property (Authentication Required)

```typescript
Request Body: {
  title: string,
  description?: string,
  propertyType: "PG" | "Flat" | "Independent" | "Shared",
  rent: number,
  location: string,
  city: string,
  state: string,
  bedrooms?: number,
  bathrooms?: number,
  area?: number,
  furnished?: string,
  amenities: string[],
  rules?: object,
  images: string[],
  whatsapp: string
}

Response: {
  success: true,
  property: Property
}
```

#### **PUT /api/properties/:id**
Update property (Owner only)

#### **DELETE /api/properties/:id**
Delete property (Owner only)

#### **GET /api/properties/my**
Get current user's properties (Authentication Required)

#### **POST /api/properties/:id/inquire**
Submit property inquiry

```typescript
Request Body: {
  name: string,
  email: string,
  phone: string,
  message?: string
}
```

### **2. Search & Filters**

#### **GET /api/properties/search**
Advanced search with multiple filters

```typescript
// Query Parameters:
// ?q=mumbai+flat&type=Flat&minRent=10000&maxRent=30000&bedrooms=2&amenities=WiFi,AC&city=Mumbai

Response: {
  properties: Property[],
  filters: {
    cities: string[],
    propertyTypes: string[],
    priceRange: { min: number, max: number },
    amenities: string[]
  }
}
```

### **3. File Upload**

#### **POST /api/upload**
Upload property images

```typescript
Request: FormData with files

Response: {
  success: true,
  urls: string[] // Array of uploaded image URLs
}
```

### **4. Analytics (Optional)**

#### **POST /api/properties/:id/view**
Track property views

#### **GET /api/analytics/dashboard**
Get user's property analytics (Authentication Required)

---

## 🔐 **Authentication Integration**

### **NextAuth.js Session Check**
```typescript
// middleware/auth.ts
import { getServerSession } from "next-auth/next"
import { authOptions } from "../app/api/auth/[...nextauth]/route"

export async function requireAuth(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    throw new Error("Unauthorized")
  }
  
  return session.user
}

// Usage in API routes:
export async function POST(request: Request) {
  try {
    const user = await requireAuth(request)
    // User is authenticated, proceed with API logic
    
  } catch (error) {
    return new Response("Unauthorized", { status: 401 })
  }
}
```

---

## ✅ **Data Validation with Zod**

```typescript
// lib/validations.ts
import { z } from 'zod'

export const PropertySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().optional(),
  propertyType: z.enum(["PG", "Flat", "Independent", "Shared"]),
  rent: z.number().min(1000, "Minimum rent is ₹1,000").max(100000),
  location: z.string().min(10, "Please provide complete address"),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().regex(/^\d{6}$/, "Invalid pincode").optional(),
  bedrooms: z.number().min(1).max(10).optional(),
  bathrooms: z.number().min(1).max(10).optional(),
  area: z.number().min(100).max(10000).optional(),
  furnished: z.enum(["Fully", "Semi", "Unfurnished"]).optional(),
  amenities: z.array(z.string()).max(20),
  rules: z.object({
    smoking: z.boolean(),
    drinking: z.boolean(),
    pets: z.boolean().optional(),
    visitingHours: z.string().optional()
  }).optional(),
  images: z.array(z.string().url(), "Invalid image URL").min(1).max(10),
  whatsapp: z.string().regex(/^[6-9]\d{9}$/, "Invalid WhatsApp number")
})

export const InquirySchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid phone number"),
  message: z.string().max(500).optional()
})
```

---

## 🔧 **Environment Variables**

Create `.env` file:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/properease"

# NextAuth Integration
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# File Upload (Choose one)
# Option 1: Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Option 2: AWS S3
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET="your-bucket-name"
AWS_REGION="ap-south-1"

# Server
PORT=5000
NODE_ENV="development"
```

---

## 📦 **Dependencies to Install**

```bash
# Core dependencies
npm install express cors helmet morgan
npm install @prisma/client prisma
npm install zod
npm install next-auth @next-auth/prisma-adapter

# File upload (choose one)
npm install cloudinary multer
# OR
npm install aws-sdk multer multer-s3

# Development dependencies
npm install -D @types/node @types/express @types/cors @types/multer
npm install -D nodemon typescript ts-node
```

---

## 🚀 **Development Setup**

### **1. Initialize Database**
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed database (optional)
npx prisma db seed
```

### **2. Start Development Server**
```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

### **3. Test API Endpoints**
```bash
# Use this sample data for testing
curl -X POST http://localhost:5000/api/properties \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Spacious 2BHK in Bandra",
    "description": "Well-furnished apartment near railway station",
    "propertyType": "Flat",
    "rent": 35000,
    "location": "Bandra West, Mumbai, Maharashtra",
    "city": "Mumbai",
    "state": "Maharashtra",
    "bedrooms": 2,
    "bathrooms": 2,
    "furnished": "Fully",
    "amenities": ["WiFi", "AC", "Parking", "Security"],
    "images": ["https://example.com/image1.jpg"],
    "whatsapp": "9876543210"
  }'
```

---

## 📋 **Sample Data Structure**

### **Property Data Example**
```json
{
  "id": "cm234abc123",
  "title": "Luxurious PG near IT Park",
  "description": "Fully furnished PG with all amenities",
  "propertyType": "PG",
  "rent": 15000,
  "location": "Electronic City, Bangalore, Karnataka",
  "city": "Bangalore", 
  "state": "Karnataka",
  "pincode": "560100",
  "bedrooms": 1,
  "bathrooms": 1,
  "area": 150,
  "furnished": "Fully",
  "amenities": ["WiFi", "AC", "Meals", "Laundry", "Security"],
  "rules": {
    "smoking": false,
    "drinking": false,
    "pets": false,
    "visitingHours": "6 AM - 10 PM"
  },
  "images": [
    "https://cloudinary.com/image1.jpg",
    "https://cloudinary.com/image2.jpg"
  ],
  "whatsapp": "9876543210",
  "isVerified": true,
  "isActive": true,
  "viewCount": 45,
  "userId": "user123",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-20T15:45:00Z"
}
```

---

## 🔍 **Frontend Integration Notes**

### **Frontend will send:**
1. **Property creation** - Complete property form data
2. **Search requests** - Location, filters, pagination
3. **Contact inquiries** - User contact forms
4. **Image uploads** - Property photos

### **Backend should return:**
1. **Consistent JSON responses** with proper HTTP status codes
2. **Proper error messages** with field-specific validation errors
3. **Paginated results** for large datasets
4. **Filtered/sorted data** based on query parameters

### **Error Response Format:**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "title": "Title is required",
    "rent": "Rent must be greater than 1000"
  }
}
```

---

## 🎯 **Priority Implementation Order**

1. ✅ **Setup Prisma schema and database**
2. ✅ **Implement GET /api/properties (with basic filtering)**
3. ✅ **Implement GET /api/properties/:id**
4. ✅ **Implement POST /api/properties (with auth)**
5. ✅ **Implement image upload API**
6. ✅ **Add advanced search and filtering**
7. ✅ **Add property inquiry system**
8. ✅ **Add property analytics (optional)**

---

## 🧪 **Testing Checklist**

- [ ] All CRUD operations work correctly
- [ ] Authentication middleware blocks unauthorized requests  
- [ ] Data validation prevents invalid data
- [ ] Image upload works with proper file validation
- [ ] Search and filtering return accurate results
- [ ] API returns consistent JSON responses
- [ ] Error handling works for all edge cases
- [ ] Database queries are optimized

---

## 📞 **Frontend Developer Contact**

- **WhatsApp**: [Frontend dev contact]
- **API Integration Help**: Check `frontend/src/app/properties/page.tsx` for current frontend implementation
- **Testing**: Use `http://localhost:3000` for frontend testing

---

**Created**: ${new Date().toLocaleDateString()}  
**Last Updated**: ${new Date().toLocaleDateString()}  
**Backend Developer**: [Your partner's name]  
**Status**: Ready for development 🚀
