import styles from "../styles/Landing.module.css";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: "fas fa-search",
      title: "Search",
      description: "Enter your college or preferred location to find nearby properties"
    },
    {
      number: "02", 
      icon: "fas fa-filter",
      title: "Filter",
      description: "Use our smart filters to narrow down options by budget, amenities, and preferences"
    },
    {
      number: "03",
      icon: "fas fa-eye",
      title: "Visit",
      description: "Schedule virtual or physical visits to shortlisted properties"
    },
    {
      number: "04",
      icon: "fas fa-handshake",
      title: "Book",
      description: "Connect directly with verified owners and secure your perfect student home"
    }
  ];

  return (
    <section className={styles["how-it-works"]} id="how-it-works">
      <div className={styles.container}>
        <div className={styles["section-header"]}>
          <h2 className={styles["section-title"]}>How It Works</h2>
          <p className={styles["section-subtitle"]}>
            Finding your perfect student home is just 4 simple steps away
          </p>
        </div>
        <div className={styles["steps-container"]}>
          {steps.map((step, index) => (
            <div key={index} className={styles["step-card"]}>
              <div className={styles["step-number"]}>{step.number}</div>
              <div className={styles["step-icon"]}>
                <i className={step.icon} />
              </div>
              <h3 className={styles["step-title"]}>{step.title}</h3>
              <p className={styles["step-description"]}>{step.description}</p>
            </div>
          ))}
        </div>
        <div className={styles["process-illustration"]}>
          <div className={styles["process-line"]}></div>
        </div>
      </div>
    </section>
  );
}
