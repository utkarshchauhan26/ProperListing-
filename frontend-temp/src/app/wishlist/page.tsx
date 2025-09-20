"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks';
import { apiClient, Property } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import styles from '../styles/Properties.module.css';

export default function WishlistPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [wishlist, setWishlist] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    fetchWishlist();
  }, [isAuthenticated, loading, router]);

  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getWishlist();
      if (response.success && response.data) {
        setWishlist(response.data.wishlist || []);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (propertyId: string) => {
    try {
      const response = await apiClient.removeFromWishlist(propertyId);
      if (response.success) {
        setWishlist(prev => prev.filter(property => property.id !== propertyId));
        toast.success('Property removed from wishlist');
      } else {
        toast.error('Failed to remove from wishlist');
      }
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  const handleContact = (property: Property, type: 'call' | 'whatsapp') => {
    const { owner } = property;
    
    if (type === 'whatsapp') {
      const phone = owner.whatsapp || owner.phone;
      if (phone) {
        const message = `Hi, I'm interested in your property: ${property.title}. Can we discuss the details?`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
        toast.success('WhatsApp chat opened');
      } else {
        toast.error('WhatsApp number not available');
      }
    } else if (type === 'call') {
      const phone = owner.phone;
      if (phone) {
        navigator.clipboard.writeText(phone).then(() => {
          toast.success(`Phone number copied: ${phone}`);
        });
      } else {
        toast.error('Phone number not available');
      }
    }
  };

  if (loading || isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading your wishlist...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Please login to view your wishlist</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <i className="fas fa-heart"></i>
          My Wishlist
        </h1>
        <p className={styles.subtitle}>
          Properties you&apos;ve saved for later
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <i className="fas fa-heart-broken"></i>
          </div>
          <h3>Your wishlist is empty</h3>
          <p>Start adding properties you like to see them here</p>
          <Link href="/properties" className={styles.browseButton}>
            Browse Properties
          </Link>
        </div>
      ) : (
        <div className={styles.propertiesGrid}>
          {wishlist.map((property) => (
            <div key={property.id} className={styles.propertyCard}>
              <div className={styles.imageContainer}>
                <Link href={`/properties/${property.id}`}>
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={property.images[0].url}
                      alt={property.title}
                      className={styles.propertyImage}
                    />
                  ) : (
                    <div className={styles.placeholderImage}>
                      <i className="fas fa-image"></i>
                      <span>No Image</span>
                    </div>
                  )}
                </Link>
                <button
                  className={`${styles.wishlistBtn} ${styles.active}`}
                  onClick={() => removeFromWishlist(property.id)}
                  title="Remove from wishlist"
                >
                  <i className="fas fa-heart"></i>
                </button>
                {property.verified && (
                  <span className={styles.verifiedBadge}>
                    <i className="fas fa-check-circle"></i>
                    Verified
                  </span>
                )}
              </div>

              <div className={styles.propertyInfo}>
                <Link href={`/properties/${property.id}`}>
                  <h3 className={styles.propertyTitle}>{property.title}</h3>
                </Link>
                
                <div className={styles.propertyLocation}>
                  <i className="fas fa-map-marker-alt"></i>
                  {property.location}
                </div>

                <div className={styles.propertyDetails}>
                  <span className={styles.propertyType}>{property.propertyType}</span>
                  <span className={styles.roomType}>{property.roomType.replace('_', ' ')}</span>
                </div>

                <div className={styles.propertyPrice}>
                  <span className={styles.price}>₹{property.rent.toLocaleString()}</span>
                  <span className={styles.period}>/month</span>
                </div>

                {property.amenities && property.amenities.length > 0 && (
                  <div className={styles.amenities}>
                    {property.amenities.slice(0, 3).map((amenity, index) => (
                      <span key={index} className={styles.amenityTag}>
                        {amenity}
                      </span>
                    ))}
                    {property.amenities.length > 3 && (
                      <span className={styles.moreAmenities}>
                        +{property.amenities.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <div className={styles.propertyActions}>
                  <Link href={`/properties/${property.id}`} className={styles.viewBtn}>
                    View Details
                  </Link>
                  <div className={styles.contactButtons}>
                    <button
                      className={`${styles.contactBtn} ${styles.whatsappBtn}`}
                      onClick={() => handleContact(property, 'whatsapp')}
                      title="Contact via WhatsApp"
                    >
                      <i className="fab fa-whatsapp"></i>
                    </button>
                    <button
                      className={`${styles.contactBtn} ${styles.callBtn}`}
                      onClick={() => handleContact(property, 'call')}
                      title="Get phone number"
                    >
                      <i className="fas fa-phone"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
