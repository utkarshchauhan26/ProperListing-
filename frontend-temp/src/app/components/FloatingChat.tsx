"use client";
import { useState } from "react";
import styles from "../styles/Landing.module.css";

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Chat Button */}
      <div className={styles["floating-chat-btn"]} onClick={() => setIsOpen(!isOpen)}>
        <i className={isOpen ? "fas fa-times" : "fas fa-comments"} />
      </div>

      {/* Chat Widget */}
      {isOpen && (
        <div className={styles["chat-widget"]}>
          <div className={styles["chat-header"]}>
            <h4>Need Help?</h4>
            <p>We&apos;re here to assist you</p>
          </div>
          <div className={styles["chat-options"]}>
            <a 
              href="https://wa.me/919876543210" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles["chat-option"]}
            >
              <i className="fab fa-whatsapp" />
              <div>
                <span className={styles["option-title"]}>WhatsApp</span>
                <span className={styles["option-desc"]}>Quick response</span>
              </div>
            </a>
            <a 
              href="tel:+919876543210"
              className={styles["chat-option"]}
            >
              <i className="fas fa-phone" />
              <div>
                <span className={styles["option-title"]}>Call Us</span>
                <span className={styles["option-desc"]}>+91 9876543210</span>
              </div>
            </a>
            <a 
              href="mailto:support@properease.com"
              className={styles["chat-option"]}
            >
              <i className="fas fa-envelope" />
              <div>
                <span className={styles["option-title"]}>Email</span>
                <span className={styles["option-desc"]}>support@properease.com</span>
              </div>
            </a>
          </div>
          <div className={styles["chat-footer"]}>
            <p>We typically reply within minutes</p>
          </div>
        </div>
      )}
    </>
  );
}
