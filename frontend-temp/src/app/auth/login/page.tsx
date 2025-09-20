"use client";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { useAuth } from '@/lib/hooks';
import styles from "../../styles/Auth.module.css";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // Temporarily disabled until Google OAuth is configured
    // toast.error('Google sign-in temporarily unavailable. Please use email/password.');
    return;
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
            <p className={styles["brand-tagline"]}>Zero Brokerage Property Rentals</p>
          </div>
          <div className={styles["features-list"]}>
            <div className={styles["feature-item"]}>
              <div className={styles["feature-icon"]}>
                <i className="fas fa-shield-alt"></i>
              </div>
              <div className={styles["feature-text"]}>
                <h3>Zero Brokerage</h3>
                <p>Direct connection with landlords</p>
              </div>
            </div>
            <div className={styles["feature-item"]}>
              <div className={styles["feature-icon"]}>
                <i className="fas fa-clock"></i>
              </div>
              <div className={styles["feature-text"]}>
                <h3>Quick Response</h3>
                <p>Get instant responses from landlords</p>
              </div>
            </div>
            <div className={styles["feature-item"]}>
              <div className={styles["feature-icon"]}>
                <i className="fas fa-star"></i>
              </div>
              <div className={styles["feature-text"]}>
                <h3>Best Experience</h3>
                <p>Seamless property search experience</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className={styles["auth-form-section"]}>
        <div className={styles["form-container"]}>
          <div className={styles["form-header"]}>
            <h2>Welcome back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className={styles["auth-form"]}>
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
              <label htmlFor="password">Password</label>
              <div className={styles["input-wrapper"]}>
                <i className="fas fa-lock"></i>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className={styles["form-options"]}>
              <label className={styles["checkbox-label"]}>
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                />
                <span className={styles["checkbox-custom"]}></span>
                Remember me
              </label>
              <Link href="/auth/forgot-password" className={styles["forgot-link"]}>
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className={styles["submit-btn"]}
              disabled={isLoading || loading}
            >
              {isLoading || loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className={styles["divider"]}>
            <span>or continue with</span>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className={styles["google-btn"]}
            disabled={isLoading}
          >
            <i className="fab fa-google"></i>
            Continue with Google
          </button>

          <div className={styles["auth-footer"]}>
            <p>
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className={styles["auth-link"]}>
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
