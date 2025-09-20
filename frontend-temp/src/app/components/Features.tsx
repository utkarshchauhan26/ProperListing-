import styles from "../styles/Landing.module.css";

export default function Features() {
  const features = [
    {
      icon: "fas fa-check-circle",
      title: "Verified Properties",
      description: "Every property is verified by our team for authenticity and quality"
    },
    {
      icon: "fas fa-hand-holding-dollar",
      title: "Zero Brokerage",
      description: "Connect directly with property owners. No hidden fees or broker charges"
    },
    {
      icon: "fas fa-graduation-cap",
      title: "Student Friendly",
      description: "Properties curated specifically for students near colleges and universities"
    },
    {
      icon: "fas fa-headset",
      title: "24/7 Support",
      description: "Round-the-clock customer support via chat, call, or WhatsApp"
    },
    {
      icon: "fas fa-search-location",
      title: "Smart Search",
      description: "Find properties using advanced filters like college proximity, budget, and amenities"
    },
    {
      icon: "fas fa-users",
      title: "Roommate Matching",
      description: "Find compatible roommates based on lifestyle preferences and habits"
    }
  ];

  return (
    <section className={styles.features} id="features">
      <div className={styles.container}>
        <div className={styles["section-header"]}>
          <h2 className={styles["section-title"]}>Why Choose ProperEase?</h2>
          <p className={styles["section-subtitle"]}>
            We make finding your perfect student home simple, safe, and affordable
          </p>
        </div>
        <div className={styles["features-grid"]}>
          {features.map((feature, index) => (
            <div key={index} className={styles["feature-card"]}>
              <div className={styles["feature-icon"]}>
                <i className={feature.icon} />
              </div>
              <h3 className={styles["feature-title"]}>{feature.title}</h3>
              <p className={styles["feature-description"]}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
