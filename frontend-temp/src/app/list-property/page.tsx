"use client";
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/hooks';
import { PropertySchema, type PropertyFormData } from '@/lib/validations';
import { apiClient } from '@/lib/api';
import styles from '../styles/PropertyForm.module.css';

const AMENITIES_OPTIONS = [
  { id: 'wifi', label: 'WiFi', icon: 'fas fa-wifi' },
  { id: 'ac', label: 'AC', icon: 'fas fa-snowflake' },
  { id: 'meals', label: 'Meals', icon: 'fas fa-utensils' },
  { id: 'laundry', label: 'Laundry', icon: 'fas fa-tshirt' },
  { id: 'parking', label: 'Parking', icon: 'fas fa-car' },
  { id: 'security', label: 'Security', icon: 'fas fa-shield-alt' },
  { id: 'gym', label: 'Gym', icon: 'fas fa-dumbbell' },
  { id: 'pool', label: 'Swimming Pool', icon: 'fas fa-swimmer' },
  { id: 'backup', label: 'Power Backup', icon: 'fas fa-bolt' },
  { id: 'water', label: '24/7 Water', icon: 'fas fa-tint' }
];

const STEPS = [
  { id: 1, title: 'Basic Info', icon: 'fas fa-info-circle' },
  { id: 2, title: 'Property Details', icon: 'fas fa-home' },
  { id: 3, title: 'Amenities & Rules', icon: 'fas fa-check-circle' },
  { id: 4, title: 'Contact Info', icon: 'fas fa-user' },
  { id: 5, title: 'Images', icon: 'fas fa-camera' }
];

export default function ListPropertyPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    trigger,
    control,
    formState: { errors }
  } = useForm<PropertyFormData>({
    resolver: zodResolver(PropertySchema),
    defaultValues: {
      rules: {
        smoking: false,
        drinking: false,
        pets: false,
        visitors: true
      },
      amenities: [],
      landlordPhone: user?.phone || '',
      whatsapp: user?.phone || ''
    }
  });

  // Redirect if not authenticated or not a landlord
  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  if (user.userType !== 'LANDLORD') {
    router.push('/dashboard');
    toast.error('Only landlords can list properties');
    return null;
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setSelectedImages(prev => [...prev, ...files]);
    
    // Create preview URLs
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      setPreviewUrls(prev => [...prev, url]);
    });
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof PropertyFormData)[] = [];
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ['title', 'description', 'propertyType', 'rent'];
        break;
      case 2:
        fieldsToValidate = ['location'];
        break;
      case 3:
        fieldsToValidate = ['amenities'];
        break;
      case 4:
        fieldsToValidate = ['landlordPhone', 'whatsapp'];
        break;
      case 5:
        if (selectedImages.length === 0) {
          toast.error('Please select at least one image');
          return;
        }
        break;
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: PropertyFormData) => {
    if (selectedImages.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create property data with proper type mapping
      const propertyTypeMap = {
        'PG': 'PG' as const,
        'Flat': 'FLAT' as const,
        'Independent': 'INDEPENDENT' as const,
        'Shared': 'SHARED' as const
      };

      const propertyData = {
        title: data.title,
        description: data.description,
        location: data.location,
        rent: data.rent,
        propertyType: propertyTypeMap[data.propertyType],
        roomType: 'SINGLE' as const, // Default room type
        amenities: data.amenities || [],
        smoking: data.rules?.smoking || false,
        drinking: data.rules?.drinking || false,
        pets: data.rules?.pets || false,
        visitors: data.rules?.visitors || false,
        whatsappNumber: data.whatsapp,
        verified: false,
        available: true
      };

      // Create property first
      const response = await apiClient.createProperty(propertyData);
      const property = response.data;

      // Upload images
      if (selectedImages.length > 0 && property) {
        await apiClient.uploadPropertyImages(property.id, selectedImages);
      }

      toast.success('Property listed successfully!');
      router.push('/dashboard');
    } catch (error: unknown) {
      console.error('Property creation error:', error);
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Failed to list property. Please try again.';
      toast.error(errorMessage || 'Failed to list property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        body {
          background: #F9FAFB !important;
        }
      `}</style>
      <div className={styles.modernContainer} style={{ background: '#F9FAFB', minHeight: '100vh' }}>  
        {/* Header */}
        <div className={styles.modernHeader}>
          <h1>List Your Property</h1>
          <p>Get your property in front of thousands of potential tenants</p>
        </div>

        {/* Progress Steps */}
        <div className={styles.stepsContainer}>
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={[styles.step, currentStep === step.id ? styles.stepActive : ''].join(' ')}
            >
              <div className={styles.stepIcon}>
                <i className={step.icon}></i>
              </div>
              <span className={styles.stepTitle}>{step.title}</span>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className={styles.modernForm}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className={styles.stepContent}>
                <h2>Basic Information</h2>
                <p>Tell us about your property</p>
                
                <div className={styles.modernField}>
                  <label htmlFor="title">Property Title</label>
                  <input
                    id="title"
                    type="text"
                    placeholder="e.g., Spacious 2BHK near Metro Station"
                    {...register('title')}
                    className={errors.title ? styles.error : ''}
                  />
                  {errors.title && <span className={styles.errorText}>{errors.title.message}</span>}
                </div>

                <div className={styles.modernField}>
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    rows={4}
                    placeholder="Describe your property, nearby amenities, transportation..."
                    {...register('description')}
                  />
                  {errors.description && <span className={styles.errorText}>{errors.description.message}</span>}
                </div>

                <div className={styles.fieldGrid}>
                  <div className={styles.modernField}>
                    <label htmlFor="propertyType">Property Type</label>
                    <select
                      id="propertyType"
                      {...register('propertyType')}
                      className={errors.propertyType ? styles.error : ''}
                    >
                      <option value="">Select property type</option>
                      <option value="PG">PG (Paying Guest)</option>
                      <option value="Flat">Flat/Apartment</option>
                      <option value="Independent">Independent House</option>
                      <option value="Shared">Shared Accommodation</option>
                    </select>
                    {errors.propertyType && <span className={styles.errorText}>{errors.propertyType.message}</span>}
                  </div>

                  <div className={styles.modernField}>
                    <label htmlFor="rent">Monthly Rent ()</label>
                    <input
                      id="rent"
                      type="number"
                      placeholder="15000"
                      {...register('rent', { valueAsNumber: true })}
                      className={errors.rent ? styles.error : ''}
                    />
                    {errors.rent && <span className={styles.errorText}>{errors.rent.message}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Property Details */}
            {currentStep === 2 && (
              <div className={styles.stepContent}>
                <h2>Property Details</h2>
                <p>Provide location and room details</p>
                
                <div className={styles.modernField}>
                  <label htmlFor="location">Property Location</label>
                  <textarea
                    id="location"
                    rows={3}
                    placeholder="House/Flat number, Street, Area, City, State, Pincode"
                    {...register('location')}
                    className={errors.location ? styles.error : ''}
                  />
                  {errors.location && <span className={styles.errorText}>{errors.location.message}</span>}
                </div>
              </div>
            )}

            {/* Step 3: Amenities & Rules */}
            {currentStep === 3 && (
              <div className={styles.stepContent}>
                <h2>Amenities & House Rules</h2>
                <p>Select available amenities and set house rules</p>
                
                <div className={styles.modernField}>
                  <label>Available Amenities</label>
                  <Controller
                    name="amenities"
                    control={control}
                    render={({ field }) => (
                      <div className={styles.amenitiesGrid}>
                        {AMENITIES_OPTIONS.map((amenity) => (
                          <div 
                            key={amenity.id}
                            className={[styles.amenityCard, (field.value || []).includes(amenity.label) ? styles.amenitySelected : ''].join(' ')}
                            onClick={() => {
                              const current = field.value || [];
                              const updated = current.includes(amenity.label)
                                ? current.filter(a => a !== amenity.label)
                                : [...current, amenity.label];
                              field.onChange(updated);
                            }}
                          >
                            <div className={styles.amenityIcon}>
                              <i className={amenity.icon}></i>
                            </div>
                            <span>{amenity.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  />
                  {errors.amenities && <span className={styles.errorText}>{errors.amenities.message}</span>}
                </div>

                <div className={styles.modernField}>
                  <label>House Rules</label>
                  <div className={styles.rulesGrid}>
                    <label className={styles.ruleItem}>
                      <input type="checkbox" {...register('rules.smoking')} />
                      <span className={styles.ruleCheckbox}></span>
                      Smoking Allowed
                    </label>
                    <label className={styles.ruleItem}>
                      <input type="checkbox" {...register('rules.drinking')} />
                      <span className={styles.ruleCheckbox}></span>
                      Drinking Allowed
                    </label>
                    <label className={styles.ruleItem}>
                      <input type="checkbox" {...register('rules.pets')} />
                      <span className={styles.ruleCheckbox}></span>
                      Pets Allowed
                    </label>
                    <label className={styles.ruleItem}>
                      <input type="checkbox" {...register('rules.visitors')} />
                      <span className={styles.ruleCheckbox}></span>
                      Visitors Allowed
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Contact Info */}
            {currentStep === 4 && (
              <div className={styles.stepContent}>
                <h2>Contact Information</h2>
                <p>How can tenants reach you?</p>
                
                <div className={styles.fieldGrid}>
                  <div className={styles.modernField}>
                    <label htmlFor="landlordPhone">Phone Number</label>
                    <input
                      id="landlordPhone"
                      type="tel"
                      placeholder="+91 9876543210"
                      {...register('landlordPhone')}
                      className={errors.landlordPhone ? styles.error : ''}
                    />
                    {errors.landlordPhone && <span className={styles.errorText}>{errors.landlordPhone.message}</span>}
                  </div>

                  <div className={styles.modernField}>
                    <label htmlFor="whatsapp">WhatsApp Number</label>
                    <input
                      id="whatsapp"
                      type="tel"
                      placeholder="+91 9876543210"
                      {...register('whatsapp')}
                      className={errors.whatsapp ? styles.error : ''}
                    />
                    {errors.whatsapp && <span className={styles.errorText}>{errors.whatsapp.message}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Images */}
            {currentStep === 5 && (
              <div className={styles.stepContent}>
                <h2>Property Images</h2>
                <p>Upload photos of your property (Maximum 5 images)</p>
                
                <div className={styles.modernField}>
                  <label htmlFor="images">Upload Images</label>
                  <div className={styles.imageUploadContainer}>
                    <input
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      className={styles.imageInput}
                    />
                    <div className={styles.imageUploadArea}>
                      <i className="fas fa-cloud-upload-alt"></i>
                      <p>Click to upload images or drag and drop</p>
                      <small>PNG, JPG up to 5MB each</small>
                    </div>
                  </div>
                  
                  {previewUrls.length > 0 && (
                    <div className={styles.imagePreviewGrid}>
                      {previewUrls.map((url, index) => (
                        <div key={index} className={styles.imagePreview}>
                          <img src={url} alt={'Preview ' + (index + 1)} />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className={styles.removeImageBtn}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className={styles.navigationButtons}>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className={styles.prevButton}
                >
                  <i className="fas fa-arrow-left"></i>
                  Previous
                </button>
              )}
              
              {currentStep < 5 ? (
                <button
                  type="button" 
                  onClick={nextStep}
                  className={styles.nextButton}
                >
                  Next
                  <i className="fas fa-arrow-right"></i>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={styles.submitButton}
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Listing Property...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check"></i>
                      List Property
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
