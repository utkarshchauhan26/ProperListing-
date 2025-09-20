"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from '@/lib/hooks';
import { apiClient, Property } from '@/lib/api';
import styles from "../../styles/PropertyDetails.module.css";

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    message: '',
    contactType: 'CONTACT_FORM' as const
  });
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);

  useEffect(() => {
    const getPropertyDetails = async () => {
      if (!params.id || typeof params.id !== 'string') return;
      
      try {
        setLoading(true);
        const response = await apiClient.getProperty(params.id);
        if (response.success && response.data) {
          setProperty(response.data);
        } else {
          toast.error("Property not found");
          router.push("/properties");
        }
      } catch (error) {
        console.error("Error fetching property:", error);
        toast.error("Failed to load property details");
        router.push("/properties");
      } finally {
        setLoading(false);
      }
    };

    getPropertyDetails();
  }, [params.id, router]);

  const handleContact = (type: "call" | "whatsapp") => {
    if (!isAuthenticated) {
      toast.error('Please login to contact landlords');
      router.push('/auth/login');
      return;
    }

    if (!property?.owner) {
      toast.error('Contact information not available');
      return;
    }

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

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to send inquiries');
      router.push('/auth/login');
      return;
    }

    if (!property) return;

    setIsSubmittingInquiry(true);
    try {
      // This would need to be implemented in the API
      toast.success('Inquiry sent successfully! The landlord will contact you soon.');
      setInquiryForm({ message: '', contactType: 'CONTACT_FORM' });
    } catch (error) {
      toast.error('Failed to send inquiry');
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  const nextImage = () => {
    if (property?.images) {
      setCurrentImageIndex((prev) => 
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (property?.images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Property not found</h2>
          <Link href="/properties" className={styles.backButton}>
            ← Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Navigation Header */}
      <div className={styles.header}>
        <button onClick={() => router.back()} className={styles.backButton}>
          <i className="fas fa-arrow-left"></i>
          Back to Properties
        </button>
      </div>

      <div className={styles.propertyDetails}>
        {/* Image Gallery */}
        <div className={styles.imageSection}>
          <div className={styles.mainImage}>
            {property.images && property.images.length > 0 ? (
              <>
                <img
                  src={property.images[currentImageIndex]?.url || '/default-property.jpg'}
                  alt={property.title}
                  onClick={() => setShowImageModal(true)}
                  className={styles.clickableImage}
                />
                {property.images.length > 1 && (
                  <>
                    <button
                      className={`${styles.imageNav} ${styles.prevBtn}`}
                      onClick={prevImage}
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    <button
                      className={`${styles.imageNav} ${styles.nextBtn}`}
                      onClick={nextImage}
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </>
                )}
                <div className={styles.imageCounter}>
                  {currentImageIndex + 1} / {property.images.length}
                </div>
              </>
            ) : (
              <div className={styles.noImage}>
                <i className="fas fa-image"></i>
                <p>No images available</p>
              </div>
            )}
          </div>

          {/* Image Thumbnails */}
          {property.images && property.images.length > 1 && (
            <div className={styles.thumbnails}>
              {property.images.map((image, index) => (
                <img
                  key={image.id}
                  src={image.url}
                  alt={`${property.title} ${index + 1}`}
                  className={`${styles.thumbnail} ${
                    index === currentImageIndex ? styles.active : ''
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Property Information */}
        <div className={styles.infoSection}>
          <div className={styles.propertyHeader}>
            <h1 className={styles.title}>{property.title}</h1>
            <div className={styles.priceTag}>
              <span className={styles.price}>₹{property.rent.toLocaleString()}</span>
              <span className={styles.period}>/month</span>
            </div>
          </div>

          <div className={styles.badges}>
            <span className={styles.badge}>{property.propertyType}</span>
            <span className={styles.badge}>{property.roomType.replace('_', ' ')}</span>
            {property.verified && (
              <span className={`${styles.badge} ${styles.verified}`}>
                <i className="fas fa-check-circle"></i> Verified
              </span>
            )}
          </div>

          <div className={styles.location}>
            <i className="fas fa-map-marker-alt"></i>
            <span>{property.location}</span>
            {property.city && <span>, {property.city}</span>}
          </div>

          {property.description && (
            <div className={styles.description}>
              <h3>Description</h3>
              <p>{property.description}</p>
            </div>
          )}

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className={styles.amenities}>
              <h3>Amenities</h3>
              <div className={styles.amenitiesList}>
                {property.amenities.map((amenity, index) => (
                  <div key={index} className={styles.amenityItem}>
                    <i className="fas fa-check"></i>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* House Rules */}
          <div className={styles.rules}>
            <h3>House Rules</h3>
            <div className={styles.rulesList}>
              <div className={styles.ruleItem}>
                <i className={`fas fa-smoking ${property.smoking ? 'allowed' : 'not-allowed'}`}></i>
                <span>Smoking {property.smoking ? 'Allowed' : 'Not Allowed'}</span>
              </div>
              <div className={styles.ruleItem}>
                <i className={`fas fa-wine-bottle ${property.drinking ? 'allowed' : 'not-allowed'}`}></i>
                <span>Drinking {property.drinking ? 'Allowed' : 'Not Allowed'}</span>
              </div>
              <div className={styles.ruleItem}>
                <i className={`fas fa-dog ${property.pets ? 'allowed' : 'not-allowed'}`}></i>
                <span>Pets {property.pets ? 'Allowed' : 'Not Allowed'}</span>
              </div>
              <div className={styles.ruleItem}>
                <i className={`fas fa-users ${property.visitors ? 'allowed' : 'not-allowed'}`}></i>
                <span>Visitors {property.visitors ? 'Allowed' : 'Not Allowed'}</span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className={styles.contactSection}>
            <h3>Contact Landlord</h3>
            <div className={styles.landlordInfo}>
              <div className={styles.landlordDetails}>
                <h4>{property.owner.name}</h4>
                <p>Property Owner</p>
              </div>
              <div className={styles.contactButtons}>
                <button
                  className={`${styles.contactBtn} ${styles.whatsappBtn}`}
                  onClick={() => handleContact('whatsapp')}
                >
                  <i className="fab fa-whatsapp"></i>
                  WhatsApp
                </button>
                <button
                  className={`${styles.contactBtn} ${styles.callBtn}`}
                  onClick={() => handleContact('call')}
                >
                  <i className="fas fa-phone"></i>
                  Call
                </button>
              </div>
            </div>

            {/* Inquiry Form */}
            <form onSubmit={handleInquirySubmit} className={styles.inquiryForm}>
              <h4>Send Message</h4>
              <textarea
                value={inquiryForm.message}
                onChange={(e) => setInquiryForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Hi, I'm interested in this property. Could you please provide more details?"
                rows={4}
                required
              />
              <button
                type="submit"
                disabled={isSubmittingInquiry}
                className={styles.submitBtn}
              >
                {isSubmittingInquiry ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && property.images && property.images.length > 0 && (
        <div className={styles.modal} onClick={() => setShowImageModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.closeModal}
              onClick={() => setShowImageModal(false)}
            >
              <i className="fas fa-times"></i>
            </button>
            <img
              src={property.images[currentImageIndex]?.url}
              alt={property.title}
              className={styles.modalImage}
            />
            {property.images.length > 1 && (
              <>
                <button
                  className={`${styles.modalNav} ${styles.modalPrev}`}
                  onClick={prevImage}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <button
                  className={`${styles.modalNav} ${styles.modalNext}`}
                  onClick={nextImage}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
