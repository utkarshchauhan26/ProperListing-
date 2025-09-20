"use client";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { useAuth } from '@/lib/hooks';
import toast from 'react-hot-toast';
import styles from "../../styles/Auth.module.css";

export default function SignupPage() {
  const router = useRouter();
  const { signup, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    userType: "STUDENT" as "STUDENT" | "LANDLORD",
    agreeToTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    
    if (!formData.agreeToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await signup({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password,
        userType: formData.userType,
      });
      
      if (success) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles["auth-container"]}>
      {/* Left Side - Branding */}
      <div className={styles["auth-branding"]}>
        <div className={styles["branding-content"]}>
          <div className={styles["logo-section"]}>
            <div className={styles["brand-logo"]}>
              <i className="fas fa-home"></i>
            </div>
            <h1>ProperEase</h1>
            <p className={styles["brand-tagline"]}>Join thousands finding their perfect home with zero brokerage</p>
          </div>
          <div className={styles["features-list"]}>
            <div className={styles["feature-item"]}>
              <div className={styles["feature-icon"]}>
                <i className="fas fa-users"></i>
              </div>
              <div className={styles["feature-text"]}>
                <h3>Join Community</h3>
                <p>Connect directly with landlords and tenants</p>
              </div>
            </div>
            <div className={styles["feature-item"]}>
              <div className={styles["feature-icon"]}>
                <i className="fas fa-heart"></i>
              </div>
              <div className={styles["feature-text"]}>
                <h3>Save Favorites</h3>
                <p>Create wishlist of your dream properties</p>
              </div>
            </div>
            <div className={styles["feature-item"]}>
              <div className={styles["feature-icon"]}>
                <i className="fas fa-bell"></i>
              </div>
              <div className={styles["feature-text"]}>
                <h3>Zero Brokerage</h3>
                <p>Direct connection, no middleman fees</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className={styles["auth-form-section"]}>
        <div className={styles["form-container"]}>
          <div className={styles["form-header"]}>
            <h2>Create Account</h2>
            <p>Start your journey to find the perfect home</p>
          </div>

          <form onSubmit={handleSubmit} className={styles["auth-form"]}>
            <div className={styles["input-group"]}>
              <label htmlFor="name">Full Name</label>
              <div className={styles["input-wrapper"]}>
                <i className="fas fa-user"></i>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className={styles["input-group"]}>
              <label htmlFor="email">Email address</label>
              <div className={styles["input-wrapper"]}>
                <i className="fas fa-envelope"></i>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className={styles["input-group"]}>
              <label htmlFor="phone">Phone Number (Optional)</label>
              <div className={styles["input-wrapper"]}>
                <i className="fas fa-phone"></i>
                <input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className={styles["input-group"]}>
              <label htmlFor="userType">I am a</label>
              <div className={styles["input-wrapper"]}>
                <i className="fas fa-user-tag"></i>
                <select
                  id="userType"
                  value={formData.userType}
                  onChange={(e) => setFormData({ ...formData, userType: e.target.value as "STUDENT" | "LANDLORD" })}
                  style={{
                    width: '100%',
                    padding: '16px 16px 16px 48px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '12px',
                    fontSize: '16px',
                    background: 'white',
                    color: '#1F2937'
                  }}
                >
                  <option value="STUDENT">Student</option>
                  <option value="LANDLORD">Landlord</option>
                </select>
              </div>
            </div>

            <div className={styles["input-group"]}>
              <label htmlFor="password">Password</label>
              <div className={styles["input-wrapper"]}>
                <i className="fas fa-lock"></i>
                <input
                  id="password"
                  type="password"
                  placeholder="Create a strong password (min 6 characters)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className={styles["input-group"]}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className={styles["input-wrapper"]}>
                <i className="fas fa-lock"></i>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className={styles["form-options"]}>
              <label className={styles["checkbox-label"]}>
                <input
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                />
                <span className={styles["checkbox-custom"]}></span>
                I agree to the <Link href="/terms" className={styles["auth-link"]}>Terms & Conditions</Link>
              </label>
            </div>

            <button
              type="submit"
              className={styles["submit-btn"]}
              disabled={isLoading || loading}
            >
              {isLoading || loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className={styles["divider"]}>
            <span>or continue with</span>
          </div>

          <button
            onClick={() => toast.error('Google sign-up temporarily unavailable')}
            className={styles["google-btn"]}
            disabled={isLoading}
          >
            <i className="fab fa-google"></i>
            Continue with Google
          </button>

          <div className={styles["auth-footer"]}>
            <p>
              Already have an account?{' '}
              <Link href="/auth/login" className={styles["auth-link"]}>
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
