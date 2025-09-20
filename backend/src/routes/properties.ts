import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { propertyCreateSchema, propertyUpdateSchema, propertyQuerySchema } from '../lib/validations';
import { authenticateToken, requireLandlord, AuthRequest } from '../middleware/auth';
import { uploadMultiple, getFileUrl } from '../lib/upload';

const router = Router();

// Get properties of current user (landlord) - moved to top to avoid route conflicts
router.get('/my-properties', authenticateToken, requireLandlord, async (req: AuthRequest, res: Response) => {
  try {
    const properties = await prisma.property.findMany({
      where: { ownerId: req.user!.id },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            wishlist: true,
            inquiries: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: properties,
    });
  } catch (error) {
    console.error('Get user properties error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all properties with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    console.log('Query params:', req.query);
    
    // Simple test first - just get basic properties
    const properties = await prisma.property.findMany({
      take: 10,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            whatsapp: true,
          },
        },
        images: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log('Properties found:', properties.length);

    res.json({
      success: true,
      data: {
        properties,
        pagination: {
          page: 1,
          limit: 10,
          totalCount: properties.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      },
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single property by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            whatsapp: true,
          },
        },
        images: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            wishlist: true,
            inquiries: true,
          },
        },
      },
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json({
      success: true,
      property,
    });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new property (landlord only)
router.post('/', authenticateToken, requireLandlord, async (req: AuthRequest, res: Response) => {
  try {
    const validationResult = propertyCreateSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.issues,
      });
    }

    const propertyData = validationResult.data;

    const property = await prisma.property.create({
      data: {
        ...propertyData,
        ownerId: req.user!.id,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            whatsapp: true,
          },
        },
        images: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: property,
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update property (owner only)
router.put('/:id', authenticateToken, requireLandlord, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if property exists and user owns it
    const existingProperty = await prisma.property.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!existingProperty) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (existingProperty.ownerId !== req.user!.id) {
      return res.status(403).json({ error: 'You can only update your own properties' });
    }

    const validationResult = propertyUpdateSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.issues,
      });
    }

    const updateData = validationResult.data;

    const property = await prisma.property.update({
      where: { id },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            whatsapp: true,
          },
        },
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    res.json({
      success: true,
      message: 'Property updated successfully',
      property,
    });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete property (owner only)
router.delete('/:id', authenticateToken, requireLandlord, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if property exists and user owns it
    const existingProperty = await prisma.property.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!existingProperty) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (existingProperty.ownerId !== req.user!.id) {
      return res.status(403).json({ error: 'You can only delete your own properties' });
    }

    await prisma.property.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload images for a property
router.post('/:id/images', authenticateToken, requireLandlord, uploadMultiple, async (req: AuthRequest, res: Response) => {
  try {
    const propertyId = req.params.id;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    // Verify property belongs to user
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        ownerId: req.user!.id,
      },
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Create image records in database
    const imagePromises = files.map((file, index) => {
      return prisma.propertyImage.create({
        data: {
          propertyId,
          url: getFileUrl(file.filename),
          filename: file.filename,
          size: file.size,
          order: index + 1,
        },
      });
    });

    const images = await Promise.all(imagePromises);

    res.json({
      success: true,
      data: {
        images,
        count: images.length,
      },
    });
  } catch (error) {
    console.error('Upload images error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload images for property (owner only)
router.post('/:id/images', authenticateToken, requireLandlord, uploadMultiple, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    // Check if property exists and user owns it
    const property = await prisma.property.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (property.ownerId !== req.user!.id) {
      return res.status(403).json({ error: 'You can only upload images to your own properties' });
    }

    // Create image records
    const imagePromises = files.map((file, index) => {
      return prisma.propertyImage.create({
        data: {
          propertyId: id,
          url: getFileUrl(file.filename),
          filename: file.filename,
          size: file.size,
          order: index,
        },
      });
    });

    const images = await Promise.all(imagePromises);

    res.status(201).json({
      success: true,
      message: 'Images uploaded successfully',
      data: {
        images,
        count: images.length,
      },
    });
  } catch (error) {
    console.error('Upload images error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
