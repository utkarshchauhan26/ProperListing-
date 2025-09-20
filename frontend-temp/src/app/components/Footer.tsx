import Link from "next/link";
import styles from "../styles/Landing.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles["footer-content"]}>
          <div className={styles["footer-section"]}>
            <div className={styles["footer-logo"]}>
              <div className={styles["logo-icon"]}>
                <i className="fas fa-home" />
              </div>
              <span className={styles["logo-text"]}>ProperEase</span>
            </div>
            <p className={styles["footer-description"]}>
              Making student accommodation search simple, safe, and affordable. 
              Find your perfect home away from home.
            </p>
            <div className={styles["social-links"]}>
              <a href="#" className={styles["social-link"]}>
                <i className="fab fa-facebook-f" />
              </a>
              <a href="#" className={styles["social-link"]}>
                <i className="fab fa-twitter" />
              </a>
              <a href="#" className={styles["social-link"]}>
                <i className="fab fa-instagram" />
              </a>
              <a href="#" className={styles["social-link"]}>
                <i className="fab fa-linkedin-in" />
              </a>
            </div>
          </div>
          
          <div className={styles["footer-section"]}>
            <h3 className={styles["footer-title"]}>For Students</h3>
            <ul className={styles["footer-links"]}>
              <li><Link href="/properties">Browse Properties</Link></li>
              <li><Link href="/how-it-works">How It Works</Link></li>
              <li><Link href="/roommate-finder">Find Roommates</Link></li>
              <li><Link href="/safety-tips">Safety Tips</Link></li>
            </ul>
          </div>
          
          <div className={styles["footer-section"]}>
            <h3 className={styles["footer-title"]}>For Owners</h3>
            <ul className={styles["footer-links"]}>
              <li><Link href="/add-property">List Property</Link></li>
              <li><Link href="/owner-dashboard">Dashboard</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
              <li><Link href="/owner-tips">Tips for Owners</Link></li>
            </ul>
          </div>
          
          <div className={styles["footer-section"]}>
            <h3 className={styles["footer-title"]}>Support</h3>
            <ul className={styles["footer-links"]}>
              <li><Link href="/help">Help Center</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
            </ul>
          </div>
          
          <div className={styles["footer-section"]}>
            <h3 className={styles["footer-title"]}>Get In Touch</h3>
            <div className={styles["contact-info"]}>
              <div className={styles["contact-item"]}>
                <i className="fas fa-phone" />
                <span>+91 8868074497</span>
              </div>
              <div className={styles["contact-item"]}>
                <i className="fas fa-envelope" />
                <span>support@properease.com</span>
              </div>
              <div className={styles["contact-item"]}>
                <i className="fab fa-whatsapp" />
                <span>WhatsApp Support</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles["footer-bottom"]}>
          <div className={styles["footer-bottom-content"]}>
            <p>&copy; 2025 ProperEase. All rights reserved.</p>
            <div className={styles["footer-badges"]}>
              <span className={styles["footer-badge"]}>
                <i className="fas fa-shield-alt" />
                Secure Platform
              </span>
              <span className={styles["footer-badge"]}>
                <i className="fas fa-check-circle" />
                Verified Listings
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
