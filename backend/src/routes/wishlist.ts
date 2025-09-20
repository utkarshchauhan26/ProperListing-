import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get user's wishlist
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: req.user!.id },
      include: {
        property: {
          include: {
            images: {
              take: 1,
              orderBy: { order: 'asc' },
            },
            owner: {
              select: {
                name: true,
                phone: true,
                whatsapp: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      wishlist: wishlist.map(item => item.property),
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add property to wishlist
router.post('/:propertyId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { propertyId } = req.params;

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Check if already in wishlist
    const existingWishlistItem = await prisma.wishlist.findUnique({
      where: {
        userId_propertyId: {
          userId: req.user!.id,
          propertyId,
        },
      },
    });

    if (existingWishlistItem) {
      return res.status(409).json({ error: 'Property already in wishlist' });
    }

    // Add to wishlist
    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId: req.user!.id,
        propertyId,
      },
      include: {
        property: {
          include: {
            images: {
              take: 1,
              orderBy: { order: 'asc' },
            },
            owner: {
              select: {
                name: true,
                phone: true,
                whatsapp: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Property added to wishlist',
      property: wishlistItem.property,
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove property from wishlist
router.delete('/:propertyId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { propertyId } = req.params;

    const wishlistItem = await prisma.wishlist.findUnique({
      where: {
        userId_propertyId: {
          userId: req.user!.id,
          propertyId,
        },
      },
    });

    if (!wishlistItem) {
      return res.status(404).json({ error: 'Property not in wishlist' });
    }

    await prisma.wishlist.delete({
      where: {
        userId_propertyId: {
          userId: req.user!.id,
          propertyId,
        },
      },
    });

    res.json({
      success: true,
      message: 'Property removed from wishlist',
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if property is in wishlist
router.get('/check/:propertyId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { propertyId } = req.params;

    const wishlistItem = await prisma.wishlist.findUnique({
      where: {
        userId_propertyId: {
          userId: req.user!.id,
          propertyId,
        },
      },
    });

    res.json({
      success: true,
      inWishlist: !!wishlistItem,
    });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
