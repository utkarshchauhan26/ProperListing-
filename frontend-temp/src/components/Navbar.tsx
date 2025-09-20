"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Hide navbar on dashboard and properties pages as they have their own headers
  if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/properties')) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    setIsProfileMenuOpen(false);
    router.push('/');
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <nav className={styles.navbar}>
        <div className={styles.container}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>
              <i className="fas fa-home"></i>
            </span>
            ProperEase
          </Link>
          <div className={styles.desktopNav}>
            <div style={{ width: '100px', height: '20px', background: '#f3f4f6', borderRadius: '4px' }}></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>
            <i className="fas fa-home"></i>
          </span>
          ProperEase
        </Link>

        {/* Desktop Navigation */}
        <div className={styles.desktopNav}>
          <Link href="/properties" className={styles.navLink}>
            Browse Properties
          </Link>
          
          {isAuthenticated && user ? (
            <>
              {/* User is logged in */}
              <Link href="/dashboard" className={styles.navLink}>
                Dashboard
              </Link>
              
              {user.userType === 'LANDLORD' && (
                <Link href="/list-property" className={styles.primaryButton}>
                  <i className="fas fa-plus"></i>
                  List Property
                </Link>
              )}
              
              {/* Profile Dropdown */}
              <div className={styles.profileDropdown}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className={styles.profileButton}
                >
                  <div className={styles.avatar}>
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className={styles.userName}>{user.name}</span>
                  <i className="fas fa-chevron-down"></i>
                </button>
                
                {isProfileMenuOpen && (
                  <div className={styles.dropdownMenu}>
                    <div className={styles.userInfo}>
                      <p className={styles.userNameFull}>{user.name}</p>
                      <p className={styles.userEmail}>{user.email}</p>
                      <span className={styles.userType}>
                        {user.userType}
                      </span>
                    </div>
                    
                    <div className={styles.dropdownDivider}></div>
                    
                    <Link href="/properties" className={styles.dropdownItem}>
                      <i className="fas fa-search"></i>
                      Browse Properties
                    </Link>
                    
                    <Link href="/dashboard" className={styles.dropdownItem}>
                      <i className="fas fa-tachometer-alt"></i>
                      Dashboard
                    </Link>
                    
                    <Link href="/profile" className={styles.dropdownItem}>
                      <i className="fas fa-user-edit"></i>
                      Edit Profile
                    </Link>
                    
                    <div className={styles.dropdownDivider}></div>
                    
                    <button onClick={handleLogout} className={styles.dropdownItem}>
                      <i className="fas fa-sign-out-alt"></i>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* User is not logged in */}
              <Link href="/auth/login" className={styles.navLink}>
                Login
              </Link>
              <Link href="/auth/signup" className={styles.primaryButton}>
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className={styles.mobileMenuButton}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <i className="fas fa-bars"></i>
        </button>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className={styles.mobileNav}>
            <Link 
              href="/properties" 
              className={styles.mobileNavLink}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Browse Properties
            </Link>
            
            {isAuthenticated && user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className={styles.mobileNavLink}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                
                {user.userType === 'LANDLORD' && (
                  <Link 
                    href="/list-property" 
                    className={styles.mobilePrimaryButton}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <i className="fas fa-plus"></i>
                    List Property
                  </Link>
                )}
                
                <div className={styles.mobileUserInfo}>
                  <div className={styles.mobileAvatar}>
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className={styles.mobileUserName}>{user.name}</p>
                    <p className={styles.mobileUserEmail}>{user.email}</p>
                  </div>
                </div>
                
                <button 
                  onClick={handleLogout} 
                  className={styles.mobileNavLink}
                >
                  <i className="fas fa-sign-out-alt"></i>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/auth/login" 
                  className={styles.mobileNavLink}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  href="/auth/signup" 
                  className={styles.mobilePrimaryButton}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
