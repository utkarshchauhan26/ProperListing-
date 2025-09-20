import Link from "next/link";
import styles from "../styles/Landing.module.css";

export default function ListingsPreview() {
  const sampleProperties = [
    {
      id: 1,
      images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=250&fit=crop"],
      title: "Cozy 2BHK near IIT Delhi",
      location: "Hauz Khas, New Delhi",
      rent: 12000,
      roomType: "Shared",
      amenities: ["WiFi", "AC", "Furnished", "Parking"],
      verified: true,
      distance: "5 min walk to IIT Delhi"
    },
    {
      id: 2,
      images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=250&fit=crop"],
      title: "Modern PG for Girls",
      location: "Koramangala, Bangalore",
      rent: 8500,
      roomType: "Single",
      amenities: ["WiFi", "Meals", "Laundry", "Security"],
      verified: true,
      distance: "3 min walk to metro"
    },
    {
      id: 3,
      images: ["https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=250&fit=crop"],
      title: "Spacious 1BHK Flat",
      location: "Powai, Mumbai",
      rent: 15000,
      roomType: "Private",
      amenities: ["WiFi", "Gym", "Pool", "Furnished"],
      verified: true,
      distance: "2 min walk to IIT Bombay"
    }
  ];

  return (
    <section className={styles["listings-preview"]} id="listings">
      <div className={styles.container}>
        <div className={styles["section-header"]}>
          <h2 className={styles["section-title"]}>Featured Properties</h2>
          <p className={styles["section-subtitle"]}>
            Handpicked student accommodations in prime locations
          </p>
        </div>
        <div className={styles["properties-grid"]}>
          {sampleProperties.map((property) => (
            <div key={property.id} className={styles["property-card"]}>
              <div className={styles["property-image"]}>
                <img src={property.images[0]} alt={property.title} />
                {property.verified && (
                  <div className={styles["verified-badge"]}>
                    <i className="fas fa-shield-check" />
                    <span>Verified</span>
                  </div>
                )}
              </div>
              <div className={styles["property-content"]}>
                <h3 className={styles["property-title"]}>{property.title}</h3>
                <div className={styles["property-location"]}>
                  <i className="fas fa-map-marker-alt" />
                  <span>{property.location}</span>
                </div>
                <div className={styles["property-distance"]}>
                  <i className="fas fa-walking" />
                  <span>{property.distance}</span>
                </div>
                <div className={styles["property-amenities"]}>
                  {property.amenities.slice(0, 3).map((amenity, index) => (
                    <span key={index} className={styles["amenity-tag"]}>
                      {amenity}
                    </span>
                  ))}
                  {property.amenities.length > 3 && (
                    <span className={styles["amenity-tag"]}>
                      +{property.amenities.length - 3} more
                    </span>
                  )}
                </div>
                <div className={styles["property-footer"]}>
                  <div className={styles["property-price"]}>
                    <span className={styles.rent}>₹{property.rent.toLocaleString()}</span>
                    <span className={styles.period}>/month</span>
                  </div>
                  <div className={styles["property-type"]}>
                    <span>{property.roomType}</span>
                  </div>
                </div>
                <Link href={`/properties/${property.id}`} className={styles["view-details-btn"]}>
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className={styles["section-cta"]}>
          <Link href="/properties" className={styles["btn-primary"]}>
            View All Properties
            <i className="fas fa-arrow-right" />
          </Link>
        </div>
      </div>
    </section>
  );
}
