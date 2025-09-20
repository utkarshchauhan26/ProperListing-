import styles from "../styles/Landing.module.css";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Engineering Student, IIT Delhi",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b402?w=60&h=60&fit=crop&crop=face",
      rating: 5,
      text: "Found my perfect PG within 2 days! The verification process gave me confidence and the owner was genuine. Highly recommend ProperEase!"
    },
    {
      name: "Arjun Patel", 
      role: "MBA Student, IIM Bangalore",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face",
      rating: 5,
      text: "Zero brokerage was a game-changer! Saved thousands and found a great 2BHK near campus. The roommate matching feature is brilliant."
    },
    {
      name: "Sneha Reddy",
      role: "Medical Student, AIIMS",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face", 
      rating: 5,
      text: "Amazing platform! The 24/7 support helped me throughout the process. Found a safe, affordable accommodation close to my college."
    }
  ];

  return (
    <section className={styles.testimonials} id="testimonials">
      <div className={styles.container}>
        <div className={styles["section-header"]}>
          <h2 className={styles["section-title"]}>What Students Say</h2>
          <p className={styles["section-subtitle"]}>
            Don&apos;t just take our word for it - hear from our happy students
          </p>
        </div>
        <div className={styles["testimonials-grid"]}>
          {testimonials.map((testimonial, index) => (
            <div key={index} className={styles["testimonial-card"]}>
              <div className={styles["testimonial-header"]}>
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className={styles["testimonial-avatar"]}
                />
                <div className={styles["testimonial-info"]}>
                  <h4 className={styles["testimonial-name"]}>{testimonial.name}</h4>
                  <p className={styles["testimonial-role"]}>{testimonial.role}</p>
                </div>
                <div className={styles["testimonial-rating"]}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <i key={i} className="fas fa-star" />
                  ))}
                </div>
              </div>
              <blockquote className={styles["testimonial-text"]}>
                &ldquo;{testimonial.text}&rdquo;
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
