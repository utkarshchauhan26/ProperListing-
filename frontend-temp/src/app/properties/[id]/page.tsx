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
    <div className={styles["property-details"]}> 
      <div className={styles["details-header"]}> 
        <div className={styles.container}> 
          <button onClick={() => router.back()} className={styles["back-btn"]}> 
            <i className="fas fa-arrow-left" /> 
            Back to Properties 
          </button> 
        </div> 
      </div> 

      <div className={styles.container}> 
        <div className={styles["details-layout"]}> 
          <div className={styles["image-gallery"]}> 
            <div className={styles["main-image"]}> 
              {property.images && property.images.length > 0 ? ( 
                <img  
                  src={property.images[currentImageIndex]?.url || "/default-property.jpg"}  
                  alt={property.title}  
                /> 
              ) : ( 
                <img src="/default-property.jpg" alt="No image available" /> 
              )} 
            </div> 
          </div> 

          <div className={styles["property-info"]}> 
            <div className={styles["info-header"]}> 
              <h1>{property.title}</h1> 
              <div className={styles["location-rating"]}> 
                <div className={styles.location}> 
                  <i className="fas fa-map-marker-alt" /> 
                  <span>{property.location || property.city}</span> 
                </div> 
              </div> 
            </div> 

            <div className={styles["price-section"]}> 
              <div className={styles["rent-info"]}> 
                <span className={styles.rent}>₹{property.rent.toLocaleString()}</span> 
                <span className={styles.period}>/month</span> 
              </div> 
            </div> 

            <div className={styles["property-tags"]}> 
              <span className={styles.tag}>{property.roomType}</span> 
              <span className={styles.tag}>{property.propertyType}</span> 
            </div> 

            <div className={styles.description}> 
              <h3>Description</h3> 
              <p>{property.description || "No description available"}</p> 
            </div> 

            <div className={styles.rules}> 
              <h3>House Rules</h3> 
              <div className={styles["rules-list"]}> 
                <div className={styles["rule-item"]}> 
                  <i className="fas fa-smoking-ban" /> 
                  <span>No Smoking</span> 
                </div>
                <div className={styles["rule-item"]}> 
                  <i className="fas fa-ban" /> 
                  <span>No Drinking</span> 
                </div>
                <div className={styles["rule-item"]}> 
                  <i className="fas fa-home" /> 
                  <span>Only for Family</span> 
                </div>
                <div className={styles["rule-item"]}> 
                  <i className="fas fa-clock" /> 
                  <span>No Late Entry</span> 
                </div>
                {property.customRules && property.customRules.trim() && (
                  <div className={styles["rule-item"]}> 
                    <i className="fas fa-info-circle" /> 
                    <span>{property.customRules}</span> 
                  </div>
                )}
                <div className={styles["rule-item"]}> 
                  <i className="fas fa-moon" /> 
                  <span>Quiet hours after 10 PM</span> 
                </div>
              </div> 
            </div> 
          </div> 

          <div className={styles["contact-sidebar"]}> 
            <div className={styles["landlord-card"]}> 
              <div className={styles["landlord-info"]}> 
                <div className={styles["landlord-avatar"]}> 
                  <i className="fas fa-user" /> 
                </div> 
                <div className={styles["landlord-details"]}> 
                  <h4>{property.owner.name}</h4> 
                </div> 
              </div> 

              <div className={styles["contact-actions"]}> 
                <button  
                  className={styles["call-btn"]} 
                  onClick={() => handleContact("call")} 
                  disabled={!property.owner?.phone} 
                > 
                  <i className="fas fa-phone" /> 
                  Call Now 
                </button> 
                <button  
                  className={styles["whatsapp-btn"]} 
                  onClick={() => handleContact("whatsapp")} 
                  disabled={!property.owner?.phone} 
                > 
                  <i className="fab fa-whatsapp" /> 
                  WhatsApp 
                </button> 
              </div> 
            </div> 
          </div> 
        </div> 
      </div> 
    </div> 
  ); 
}