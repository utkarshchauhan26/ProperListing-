"use client";
import { useAuth, useMyProperties } from '@/lib/hooks';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from "react";
import Link from "next/link";
import toast from 'react-hot-toast';
import styles from "../styles/Dashboard.module.css";

export default function DashboardPage() {
  const { user, loading, isAuthenticated, isLandlord, logout, updateUser } = useAuth();
  const { properties: rawProperties, loading: propertiesLoading, error: propertiesError, deleteProperty, refetch } = useMyProperties();
  const properties = Array.isArray(rawProperties) ? rawProperties : [];
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
    email: ""
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  useEffect(() => {
    if (loading) return; // Wait for auth to finish loading
    
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    if (user) {
      setProfileData({
        name: user.name || "",
        phone: user.phone || "",
        email: user.email || ""
      });
    }
  }, [loading, isAuthenticated, user, router]);

  // Refresh properties when returning to dashboard
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isLandlord) {
        refetch();
      }
    };

    const handleFocus = () => {
      if (isLandlord) {
        refetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isLandlord, refetch]);

  const handleProfileUpdate = async () => {
    setIsUpdatingProfile(true);
    try {
      const success = await updateUser({
        name: profileData.name,
        phone: profileData.phone
      });
      if (success) {
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    
    const success = await deleteProperty(propertyId);
    if (success) {
      toast.success('Property deleted successfully!');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <div className={styles.loading}>Loading...</div>;
  }

  const userIsLandlord = user.userType === 'LANDLORD';

  // Calculate analytics for landlord
  const analytics = properties ? {
    totalProperties: properties.length || 0,
    totalViews: 0, // Will implement when backend supports it
    totalInquiries: 0, // Will implement when backend supports it
    availableProperties: properties.filter(prop => prop.available).length
  } : null;

  return (
    <div className={styles["dashboard-page"]}>
      {/* Header */}
      <header className={styles["dashboard-header"]}>
        <div className={styles.container}>
          <div className={styles["header-content"]}>
            <Link href="/" className={styles.logo}>
              <div className={styles["logo-icon"]}>
                <i className="fas fa-home" />
              </div>
              <span>ProperEase</span>
            </Link>
            
            <nav className={styles["dashboard-nav"]}>
              {userIsLandlord && (
                <Link href="/list-property" className={styles["nav-link"]}>
                  <i className="fas fa-plus-circle" />
                  List Property
                </Link>
              )}
              <Link href="/properties" className={styles["nav-link"]}>
                <i className="fas fa-search" />
                Browse Properties
              </Link>
            </nav>

            <div className={styles["user-menu"]} onClick={handleLogout}>
              <img 
                src={`https://ui-avatars.com/api/?name=${user.name}&background=4F46E5&color=fff`} 
                alt={user.name} 
                className={styles.avatar} 
              />
              <span>{user.name}</span>
              <i className="fas fa-chevron-down" />
            </div>
          </div>
        </div>
      </header>

      <div className={styles.container}>
        <div className={styles["dashboard-layout"]}>
          {/* Sidebar */}
          <aside className={styles["dashboard-sidebar"]}>
            <div className={styles["user-info"]}>
              <img 
                src={`https://ui-avatars.com/api/?name=${user.name}&background=4F46E5&color=fff`} 
                alt={user.name} 
                className={styles["user-avatar"]} 
              />
              <h3>{user.name}</h3>
              <p>{user.email}</p>
              <span className={styles["user-type"]}>
                {userIsLandlord ? 'Landlord' : 'Student'}
              </span>
            </div>

            <nav className={styles["sidebar-nav"]}>
              <button
                className={styles["nav-item"]}
                onClick={() => setActiveTab("overview")}
              >
                <i className="fas fa-tachometer-alt" />
                <span>Overview</span>
              </button>

              {userIsLandlord && (
                <button
                  className={styles["nav-item"]}
                  onClick={() => setActiveTab("properties")}
                >
                  <i className="fas fa-home" />
                  <span>My Properties</span>
                </button>
              )}

              {!userIsLandlord && (
                <button
                  className={styles["nav-item"]}
                  onClick={() => setActiveTab("saved")}
                >
                  <i className="fas fa-heart" />
                  <span>Saved Properties</span>
                </button>
              )}

              <button
                className={styles["nav-item"]}
                onClick={() => setActiveTab("profile")}
              >
                <i className="fas fa-user" />
                <span>Profile</span>
              </button>

              {userIsLandlord && (
                <Link href="/list-property" className={styles["nav-item"]}>
                  <i className="fas fa-plus-circle" />
                  <span>List New Property</span>
                </Link>
              )}
            </nav>
          </aside>

          {/* Main Content */}
          <main className={styles["dashboard-main"]}>
            {activeTab === "overview" && (
              <div className={styles["overview-tab"]}>
                <h2>{userIsLandlord ? 'Landlord Dashboard' : 'Student Dashboard'}</h2>

                {userIsLandlord && analytics && (
                  <div className={styles["stats-grid"]}>
                    <div className={styles["stat-card"]}>
                      <div className={styles["stat-icon"]}>
                        <i className="fas fa-home" />
                      </div>
                      <div className={styles["stat-info"]}>
                        <h3>{analytics.totalProperties}</h3>
                        <p>Total Properties</p>
                      </div>
                    </div>
                    <div className={styles["stat-card"]}>
                      <div className={styles["stat-icon"]}>
                        <i className="fas fa-check-circle" />
                      </div>
                      <div className={styles["stat-info"]}>
                        <h3>{analytics.availableProperties}</h3>
                        <p>Available</p>
                      </div>
                    </div>
                    <div className={styles["stat-card"]}>
                      <div className={styles["stat-icon"]}>
                        <i className="fas fa-eye" />
                      </div>
                      <div className={styles["stat-info"]}>
                        <h3>{analytics.totalViews}</h3>
                        <p>Total Views</p>
                      </div>
                    </div>
                    <div className={styles["stat-card"]}>
                      <div className={styles["stat-icon"]}>
                        <i className="fas fa-envelope" />
                      </div>
                      <div className={styles["stat-info"]}>
                        <h3>{analytics.totalInquiries}</h3>
                        <p>Inquiries</p>
                      </div>
                    </div>
                  </div>
                )}

                {!userIsLandlord && (
                  <div className={styles["student-overview"]}>
                    <div className={styles["welcome-card"]}>
                      <h3>Welcome to ProperEase!</h3>
                      <p>Find your perfect home with zero brokerage fees.</p>
                      <Link href="/properties" className={styles["browse-btn"]}>
                        <i className="fas fa-search" />
                        Browse Properties
                      </Link>
                    </div>
                  </div>
                )}

                {userIsLandlord && (
                  <div className={styles["quick-actions"]}>
                    <h3>Quick Actions</h3>
                    <div className={styles["action-buttons"]}>
                      <Link href="/list-property" className={styles["action-btn"]}>
                        <i className="fas fa-plus-circle" />
                        Add New Property
                      </Link>
                      <button 
                        onClick={() => setActiveTab("properties")} 
                        className={styles["action-btn"]}
                      >
                        <i className="fas fa-edit" />
                        Manage Properties
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "properties" && userIsLandlord && (
              <div className={styles["properties-tab"]}>
                <div className={styles["properties-header"]}>
                  <h2>My Properties</h2>
                  <Link href="/list-property" className={styles["add-property-btn"]}>
                    <i className="fas fa-plus" />
                    Add Property
                  </Link>
                </div>

                {propertiesLoading && <div className={styles.loading}>Loading properties...</div>}
                {propertiesError && <div className={styles.error}>{propertiesError}</div>}

                                 {!propertiesLoading && !propertiesError && (
                   <div className={styles["properties-grid"]}>
                     {!properties || properties.length === 0 ? (
                      <div className={styles["empty-state"]}>
                        <i className="fas fa-home" />
                        <h3>No properties listed yet</h3>
                        <p>Start by adding your first property listing</p>
                        <Link href="/list-property" className={styles["add-first-btn"]}>
                          Add Your First Property
                        </Link>
                      </div>
                    ) : (
                      properties.map((property) => (
                        <div key={property.id} className={styles["property-card"]}>
                          <div className={styles["property-image"]}>
                            {property.images && property.images.length > 0 ? (
                              <img src={property.images[0].url} alt={property.title} />
                            ) : (
                              <div className={styles["placeholder-image"]}>
                                <i className="fas fa-home" />
                              </div>
                            )}
                            <div className={styles["property-status"]}>
                              <span className={property.available ? styles.available : styles.unavailable}>
                                {property.available ? 'Available' : 'Rented'}
                              </span>
                            </div>
                          </div>
                          <div className={styles["property-content"]}>
                            <h4>{property.title}</h4>
                            <p className={styles["property-location"]}>
                              <i className="fas fa-map-marker-alt" />
                              {property.city}, {property.state}
                            </p>
                            <div className={styles["property-details"]}>
                              <span className={styles["property-rent"]}>
                                {property.rent.toLocaleString()}/month
                              </span>
                              <span className={styles["property-type"]}>
                                {property.roomType} {property.propertyType}
                              </span>
                            </div>
                                                         <div className={styles["property-actions"]}>
                               <Link href={`/properties/${property.id}`} className={styles["view-btn"]}>
                                 View
                               </Link>
                              <button 
                                onClick={() => handleDeleteProperty(property.id)}
                                className={styles["delete-btn"]}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "saved" && !isLandlord && (
              <div className={styles["saved-tab"]}>
                <h2>Saved Properties</h2>
                <div className={styles["saved-notice"]}>
                  <i className="fas fa-heart" />
                  <p>Save properties while browsing to view them here.</p>
                  <Link href="/properties" className={styles["browse-btn"]}>
                    <i className="fas fa-search" />
                    Browse Properties
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div className={styles["profile-tab"]}>
                <h2>Profile Settings</h2>
                <div className={styles["profile-form"]}>
                  <div className={styles["form-group"]}>
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div className={styles["form-group"]}>
                    <label>Email</label>
                    <input 
                      type="email" 
                      value={profileData.email} 
                      readOnly 
                      className={styles["readonly-input"]}
                    />
                    <small>Email cannot be changed</small>
                  </div>
                  
                  <div className={styles["form-group"]}>
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      placeholder="Enter your phone number"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  
                  <div className={styles["form-group"]}>
                    <label>Account Type</label>
                    <input 
                      type="text" 
                      value={user.userType === 'LANDLORD' ? 'Landlord' : 'Student'} 
                      readOnly 
                      className={styles["readonly-input"]}
                    />
                    <small>Account type cannot be changed</small>
                  </div>
                  
                  <button 
                    onClick={handleProfileUpdate}
                    className={styles["save-btn"]}
                    disabled={isUpdatingProfile}
                  >
                    {isUpdatingProfile ? (
                      <>
                        <i className="fas fa-spinner fa-spin" />
                        Updating...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
