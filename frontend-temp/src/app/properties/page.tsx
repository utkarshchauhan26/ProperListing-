"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth, useProperties } from '@/lib/hooks';
import { Property } from '@/lib/api';
import toast from 'react-hot-toast';
import styles from "../styles/Properties.module.css";
import { BentoGrid, BentoCard } from "../components/BentoGrid";

function PropertiesContent() {
  const { user, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    city: "",
    propertyType: "",
    roomType: "",
    minRent: undefined as number | undefined,
    maxRent: undefined as number | undefined,
    amenities: [] as string[]
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  
  // Use our real API hook
  const { properties, loading, error, refetch } = useProperties(filters);

  // Handle URL search parameters
  useEffect(() => {
    const locationParam = searchParams.get('location');
    if (locationParam) {
      setFilters(prev => ({
        ...prev,
        city: locationParam
      }));
      setSearchQuery(locationParam);
    }
  }, [searchParams]);

  const handleClearFilters = () => {
    setFilters({
      city: "",
      propertyType: "",
      roomType: "",
      minRent: undefined,
      maxRent: undefined,
      amenities: []
    });
    setSelectedAmenities([]);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'priceRange') {
      if (value === '') {
        setFilters(prev => ({ ...prev, minRent: undefined, maxRent: undefined }));
      } else {
        const [min, max] = value.split('-').map(p => p.replace('+', ''));
        setFilters(prev => ({
          ...prev,
          minRent: parseInt(min),
          maxRent: max ? parseInt(max) : undefined
        }));
      }
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAmenityChange = (amenity: string) => {
    const updatedAmenities = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter(a => a !== amenity)
      : [...selectedAmenities, amenity];
    
    setSelectedAmenities(updatedAmenities);
    setFilters(prev => ({ ...prev, amenities: updatedAmenities }));
  };

  const handleContact = (property: Property, type: 'call' | 'whatsapp') => {
    if (!isAuthenticated) {
      toast.error('Please login to contact landlords');
      return;
    }

    const { owner } = property;
    
    if (type === 'whatsapp' && owner.phone) {
      const message = `Hi, I'm interested in your property: ${property.title}. Can we discuss the details?`;
      window.open(`https://wa.me/${owner.phone}?text=${encodeURIComponent(message)}`, '_blank');
      toast.success('WhatsApp chat opened');
    } else if (type === 'call' && owner.phone) {
      navigator.clipboard.writeText(owner.phone).then(() => {
        toast.success(`Phone number copied to clipboard`);
      });
    } else {
      toast.error('Contact information not available');
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setFilters(prev => ({ ...prev, city: searchQuery.trim() }));
    }
  };

  return (
    <div className={styles["properties-page"]}>
      {/* Header */}
      <div className={styles["page-header"]}>
        <div className={styles.container}>
          <div className={styles["header-content"]}>
            <Link href="/" className={styles.logo}>
              <div className={styles["logo-icon"]}>
                <i className="fas fa-home" />
              </div>
              <span>ProperEase</span>
            </Link>
            
            <div className={styles["header-search"]}>
              <input
                type="text"
                placeholder="Search by city, area..."
                className={styles["search-input"]}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button className={styles["search-btn"]} onClick={handleSearch}>
                <i className="fas fa-search" />
              </button>
            </div>
            
            <div className={styles["header-actions"]}>
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" className={styles["btn-secondary"]}>
                    Dashboard
                  </Link>
                  {user?.userType === 'LANDLORD' && (
                    <Link href="/list-property" className={styles["btn-primary"]}>
                      List Property
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link href="/auth/login" className={styles["btn-secondary"]}>
                    Login
                  </Link>
                  <Link href="/auth/signup" className={styles["btn-primary"]}>
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles["properties-layout"]}>
          {/* Filters Sidebar */}
          <aside className={styles["filters-sidebar"]}>
            <BentoCard padding="md" className={styles["filters-card"]}>
              <div className={styles["filters-header"]}>
                <h3>Filters</h3>
                <button className={styles["clear-filters"]} onClick={handleClearFilters}>
                  Clear All
                </button>
              </div>

              <div className={styles["filter-group"]}>
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  placeholder="Enter city..."
                  value={filters.city}
                  onChange={handleFilterChange}
                  className={styles["filter-input"]}
                />
              </div>

              <div className={styles["filter-group"]}>
                <label>Price Range</label>
                <select name="priceRange" onChange={handleFilterChange}>
                  <option value="">Any Price</option>
                  <option value="0-10000">Under 10,000</option>
                  <option value="10000-20000">10,000 - 20,000</option>
                  <option value="20000-30000">20,000 - 30,000</option>
                  <option value="30000-50000">30,000 - 50,000</option>
                  <option value="50000+">Above 50,000</option>
                </select>
              </div>

              <div className={styles["filter-group"]}>
                <label>BHK Type</label>
                <select name="roomType" value={filters.roomType} onChange={handleFilterChange}>
                  <option value="">Any Type</option>
                  <option value="SINGLE">Single Room</option>
                  <option value="SHARED">Shared Room</option>
                  <option value="ONE_BHK">1BHK</option>
                  <option value="TWO_BHK">2BHK</option>
                  <option value="THREE_BHK">3BHK</option>
                  <option value="STUDIO">Studio</option>
                </select>
              </div>

              <div className={styles["filter-group"]}>
                <label>Property Type</label>
                <select name="propertyType" value={filters.propertyType} onChange={handleFilterChange}>
                  <option value="">All Types</option>
                  <option value="FLAT">Apartment</option>
                  <option value="INDEPENDENT">House</option>
                  <option value="PG">PG</option>
                  <option value="SHARED">Shared</option>
                  <option value="COLIVING">Co-living</option>
                </select>
              </div>

              <div className={styles["filter-group"]}>
                <label>Amenities</label>
                <div className={styles["checkbox-group"]}>
                  {['parking', 'gym', 'swimming_pool', 'security', 'lift', 'power_backup'].map((amenity) => (
                    <label key={amenity} className={styles["checkbox-label"]}>
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(amenity)}
                        onChange={() => handleAmenityChange(amenity)}
                      />
                      <span>{amenity.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </label>
                  ))}
                </div>
              </div>
            </BentoCard>
          </aside>

          {/* Properties List */}
          <main className={styles["properties-main"]}>
            <div className={styles["results-header"]}>
              <h2>
                {loading ? 'Loading...' : `${properties.length} Properties Found`}
              </h2>
              <div className={styles["sort-options"]}>
                <select>
                  <option>Sort by Relevance</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest First</option>
                </select>
              </div>
            </div>

            {error && (
              <div className={styles["error-message"]}>
                <p>Error loading properties: {error}</p>
                <button onClick={refetch} className={styles["retry-btn"]}>
                  Try Again
                </button>
              </div>
            )}

            {loading ? (
              <div className={styles["loading-state"]}>
                <i className="fas fa-spinner fa-spin" />
                <p>Loading properties...</p>
              </div>
            ) : (
              <BentoGrid columns={2} className={styles["properties-bento"]}>
                {properties.length > 0 ? (
                  properties.map((property) => (
                    <BentoCard key={property.id} padding="none" hover={true} className={styles["property-bento-card"]}>
                      <div className={styles["property-image"]}>
                        {property.images && property.images.length > 0 ? (
                          <img src={property.images[0].url} alt={property.title} />
                        ) : (
                          <div className={styles["placeholder-image"]}>
                            <i className="fas fa-home" />
                          </div>
                        )}
                        <div className={styles["verified-badge"]}>
                          <i className="fas fa-shield-check" />
                          <span>Verified</span>
                        </div>
                      </div>

                      <div className={styles["property-content"]}>
                        <h3 className={styles["property-title"]}>{property.title}</h3>
                        
                        <div className={styles["property-location"]}>
                          <i className="fas fa-map-marker-alt" />
                          <span>{property.city}, {property.state}</span>
                        </div>

                        <div className={styles["property-details"]}>
                          <span className={styles["property-type"]}>
                            {property.roomType} {property.propertyType}
                          </span>
                          <span className={styles["property-area"]}>
                            {property.location}
                          </span>
                        </div>

                        <div className={styles["property-amenities"]}>
                          {property.amenities.slice(0, 4).map((amenity, index) => (
                            <span key={index} className={styles["amenity-tag"]}>
                              {amenity.replace('_', ' ')}
                            </span>
                          ))}
                          {property.amenities.length > 4 && (
                            <span className={styles["amenity-tag"]}>
                              +{property.amenities.length - 4} more
                            </span>
                          )}
                        </div>

                        <div className={styles["property-footer"]}>
                          <div className={styles["property-price"]}>
                            <span className={styles.rent}>{property.rent.toLocaleString()}</span>
                            <span className={styles.period}>/month</span>
                          </div>
                          <div className={styles["property-status"]}>
                            <span className={property.available ? styles.available : styles.unavailable}>
                              {property.available ? 'Available' : 'Rented'}
                            </span>
                          </div>
                        </div>

                        <div className={styles["landlord-info"]}>
                          <small>Listed by: {property.owner.name}</small>
                        </div>

                        <div className={styles["property-actions"]}>
                          <Link href={`/properties/${property.id}`} className={styles["view-btn"]}>
                            View Details
                          </Link>
                          
                          {property.available && property.owner.phone && (
                            <>
                              <div className={styles["contact-info"]}>
                                <span className={styles["phone-number"]}>{property.owner.phone}</span>
                                <div className={styles["contact-buttons"]}>
                                  <button
                                    className={styles["contact-btn"]}
                                    onClick={() => handleContact(property, 'call')}
                                    title="Copy phone number"
                                  >
                                    <i className="fas fa-phone" />
                                    Call
                                  </button>
                                  
                                  <button
                                    className={styles["whatsapp-btn"]}
                                    onClick={() => handleContact(property, 'whatsapp')}
                                    title="Open WhatsApp"
                                  >
                                    <i className="fab fa-whatsapp" />
                                    WhatsApp
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </BentoCard>
                  ))
                ) : (
                  <BentoCard className={styles["no-results-card"]}>
                    <div className={styles["no-results"]}>
                      <i className="fas fa-search" />
                      <h3>No properties found</h3>
                      <p>Try adjusting your filters or search in a different location.</p>
                      <button onClick={handleClearFilters} className={styles["clear-all-btn"]}>
                        Clear All Filters
                      </button>
                    </div>
                  </BentoCard>
                )}
              </BentoGrid>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div>Loading properties...</div>}>
      <PropertiesContent />
    </Suspense>
  );
}
