"use client";
import Link from "next/link";
import styles from "../styles/Landing.module.css";

export default function CTABanner() {
  return (
    <section className={styles["cta-banner"]}>
      <div className={styles.container}>
        <div className={styles["cta-content"]}>
          <div className={styles["cta-text"]}>
            <h2 className={styles["cta-title"]}>
              Ready to Find Your Perfect Student Home?
            </h2>
            <p className={styles["cta-subtitle"]}>
              Join thousands of students who found their ideal accommodation through ProperEase
            </p>
          </div>
          <div className={styles["cta-actions"]}>
            <Link href="/properties" className={styles["btn-primary"]}>
              <i className="fas fa-search" />
              Start Searching
            </Link>
            <Link 
              href="/auth/login" 
              className={styles["btn-secondary"]}
            >
              <i className="fas fa-plus" />
              List Your Property
            </Link>
          </div>
        </div>
        <div className={styles["cta-stats"]}>
          <div className={styles["stat-item"]}>
            <span className={styles["stat-number"]}>10,000+</span>
            <span className={styles["stat-label"]}>Happy Students</span>
          </div>
          <div className={styles["stat-item"]}>
            <span className={styles["stat-number"]}>5,000+</span>
            <span className={styles["stat-label"]}>Verified Properties</span>
          </div>
          <div className={styles["stat-item"]}>
            <span className={styles["stat-number"]}>50+</span>
            <span className={styles["stat-label"]}>Cities Covered</span>
          </div>
          <div className={styles["stat-item"]}>
            <span className={styles["stat-number"]}>4.8/5</span>
            <span className={styles["stat-label"]}>User Rating</span>
          </div>
        </div>
      </div>
    </section>
  );
}
