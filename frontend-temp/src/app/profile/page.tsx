"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks';
import styles from '../styles/Dashboard.module.css';

export default function ProfilePage() {
  const { user, updateUser, logout, loading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
  });

  // Update form data when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        whatsapp: user.whatsapp || '',
      });
    }
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await updateUser({
        name: formData.name,
        phone: formData.phone,
      });
      if (success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      whatsapp: user?.whatsapp || '',
    });
    setIsEditing(false);
  };

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.breadcrumb}>
            <button onClick={() => router.back()} className={styles.backButton}>
              <i className="fas fa-arrow-left"></i>
            </button>
            <span>Profile Settings</span>
          </div>
          <div className={styles.headerActions}>
            <a href="/dashboard" className={styles.dashboardButton}>
              <i className="fas fa-tachometer-alt"></i>
              Dashboard
            </a>
          </div>
        </div>
      </header>

      <div className={styles.container}>
        <div className={styles.profileSection}>
          {/* Profile Card */}
          <div className={styles.profileCard}>
            <div className={styles.profileHeader}>
              <div className={styles.avatarSection}>
                <div className={styles.profileAvatar}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className={styles.profileInfo}>
                  <h1>{user?.name}</h1>
                  <p className={styles.userEmail}>{user?.email}</p>
                  <span className={`${styles.userTypeBadge} ${styles[user?.userType?.toLowerCase() || '']}`}>
                    <i className={`fas ${user?.userType === 'LANDLORD' ? 'fa-home' : 'fa-graduation-cap'}`}></i>
                    {user?.userType}
                  </span>
                </div>
              </div>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className={styles.editButton}
                >
                  <i className="fas fa-edit"></i>
                  Edit Profile
                </button>
              )}
            </div>

            {/* Profile Form */}
            <div className={styles.profileForm}>
              <div className={styles.formSection}>
                <h3>Personal Information</h3>
                
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={styles.formInput}
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <div className={styles.formValue}>{user?.name || 'Not provided'}</div>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label>Email Address</label>
                    <div className={styles.formValue}>
                      {user?.email}
                      <span className={styles.readOnlyLabel}>Read-only</span>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Phone Number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={styles.formInput}
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <div className={styles.formValue}>{user?.phone || 'Not provided'}</div>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label>WhatsApp Number</label>
                    <div className={styles.formValue}>
                      {user?.whatsapp || 'Not provided'}
                      <span className={styles.readOnlyLabel}>Contact support to update</span>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Account Type</label>
                    <div className={styles.formValue}>
                      <span className={`${styles.userTypeBadge} ${styles[user?.userType?.toLowerCase() || '']}`}>
                        <i className={`fas ${user?.userType === 'LANDLORD' ? 'fa-home' : 'fa-graduation-cap'}`}></i>
                        {user?.userType}
                      </span>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Member Since</label>
                    <div className={styles.formValue}>
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Unknown'}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className={styles.formActions}>
                    <button 
                      onClick={handleCancel}
                      className={styles.cancelButton}
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSave}
                      className={styles.saveButton}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save"></i>
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Account Actions */}
              <div className={styles.formSection}>
                <h3>Account Actions</h3>
                <div className={styles.accountActions}>
                  <button 
                    onClick={() => router.push('/auth/change-password')}
                    className={styles.actionButton}
                  >
                    <i className="fas fa-key"></i>
                    Change Password
                  </button>
                  <button 
                    onClick={logout}
                    className={styles.logoutButton}
                  >
                    <i className="fas fa-sign-out-alt"></i>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
