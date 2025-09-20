import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { inquiryCreateSchema } from '../lib/validations';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Create inquiry
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const validationResult = inquiryCreateSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.issues,
      });
    }

    const { propertyId, contactType, message, userPhone, userEmail, userName } = validationResult.data;

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { owner: true },
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Create inquiry
    const inquiry = await prisma.inquiry.create({
      data: {
        propertyId,
        userId: req.user!.id,
        contactType,
        message,
        userPhone: userPhone || req.user!.phone,
        userEmail: userEmail || req.user!.email,
        userName: userName || req.user!.name,
      },
      include: {
        property: {
          select: {
            title: true,
            rent: true,
            location: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Inquiry created successfully',
      inquiry,
    });
  } catch (error) {
    console.error('Create inquiry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get inquiries for a property (landlord only)
router.get('/property/:propertyId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { propertyId } = req.params;

    // Check if user owns the property
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        ownerId: req.user!.id,
      },
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found or access denied' });
    }

    const inquiries = await prisma.inquiry.findMany({
      where: { propertyId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      inquiries,
    });
  } catch (error) {
    console.error('Get property inquiries error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's inquiries
router.get('/my-inquiries', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const inquiries = await prisma.inquiry.findMany({
      where: { userId: req.user!.id },
      include: {
        property: {
          select: {
            title: true,
            rent: true,
            location: true,
            images: {
              take: 1,
              orderBy: { order: 'asc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      inquiries,
    });
  } catch (error) {
    console.error('Get user inquiries error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update inquiry status (landlord only)
router.patch('/:id/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['NEW', 'CONTACTED', 'CLOSED', 'SPAM'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check if user owns the property for this inquiry
    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    if (inquiry.property.ownerId !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedInquiry = await prisma.inquiry.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        property: {
          select: {
            title: true,
            rent: true,
            location: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Inquiry status updated successfully',
      inquiry: updatedInquiry,
    });
  } catch (error) {
    console.error('Update inquiry status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
