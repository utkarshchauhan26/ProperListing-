"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/Landing.module.css";

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Redirect to properties page with location filter
      router.push(`/properties?location=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      // Redirect to properties page without filter
      router.push('/properties');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section className={styles.hero} id="home">
      <div className={styles["hero-background"]}>
        <div className={styles.blob + " " + styles["blob-1"]}></div>
        <div className={styles.blob + " " + styles["blob-2"]}></div>
        <div className={styles.blob + " " + styles["blob-3"]}></div>
      </div>
      <div className={styles.container}>
        <div className={styles["hero-content"]}>
          <div className={styles["hero-text"]}>
            <h1 className={styles["hero-title"]}>
              Find your perfect <span className={styles.highlight}>property</span> with zero brokerage
            </h1>
            <p className={styles["hero-subtitle"]}>
              Direct from landlords - hassle-free rentals for all your housing needs
            </p>
            <div className={styles["search-container"]}>
              <div className={styles["search-box"]}>
                <div className={styles["search-input-wrapper"]}>
                  <i className="fas fa-map-marker-alt" />
                  <input 
                    type="text" 
                    placeholder="Enter your preferred area or locality..." 
                    className={styles["search-input"]} 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <button className={styles["search-btn"]} onClick={handleSearch}>
                    <i className="fas fa-search" />
                    <span>Search</span>
                  </button>
                </div>
              </div>
            </div>
            <div className={styles["trust-badges"]}>
              <div className={styles["trust-badge"]}>
                <i className="fas fa-check-circle" style={{color: '#1DA1F2'}} />
                <span>Verified Listings</span>
              </div>
              <div className={styles["trust-badge"]}>
                <i className="fas fa-hand-holding-dollar" />
                <span>Zero Brokerage</span>
              </div>
              <div className={styles["trust-badge"]}>
                <i className="fas fa-headset" />
                <span>24/7 Chat Support</span>
              </div>
            </div>
          </div>
          <div className={styles["hero-visual"]}>
            <div className={styles["hero-illustration"]}>
              <div className={styles["floating-card"] + " " + styles["card-1"]}>
                <i className="fas fa-home" />
                <span>2BHK near IIT</span>
                <div className={styles.price}>₹12,000/mo</div>
              </div>
              <div className={styles["floating-card"] + " " + styles["card-2"]}>
                <i className="fas fa-users" />
                <span>Perfect Roommate</span>
                <div className={styles.match}>95% Match</div>
              </div>
              <div className={styles["floating-card"] + " " + styles["card-3"]}>
                <i className="fas fa-graduation-cap" />
                <span>Near College</span>
                <div className={styles.distance}>5 min walk</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
