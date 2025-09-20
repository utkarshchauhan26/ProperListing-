// API utilities for connecting to the backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// API Response types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

// User types
interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  whatsapp?: string;
  userType: 'STUDENT' | 'LANDLORD';
  createdAt: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

// Property types
interface Property {
  id: string;
  title: string;
  description?: string;
  rent: number;
  location: string;
  roomType: 'SINGLE' | 'SHARED' | 'ONE_BHK' | 'TWO_BHK' | 'THREE_BHK' | 'STUDIO';
  propertyType: 'PG' | 'FLAT' | 'INDEPENDENT' | 'SHARED' | 'COLIVING';
  amenities: string[];
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  smoking: boolean;
  drinking: boolean;
  pets: boolean;
  visitors: boolean;
  customRules?: string;
  whatsappNumber?: string;
  verified: boolean;
  available: boolean;
  images: PropertyImage[];
  owner: User;
  createdAt: string;
  updatedAt: string;
}

interface PropertyImage {
  id: string;
  url: string;
  filename: string;
  size: number;
  order: number;
}

// Inquiry types
interface Inquiry {
  id: string;
  propertyId: string;
  contactType: 'WHATSAPP' | 'PHONE' | 'EMAIL' | 'CONTACT_FORM';
  message?: string;
  createdAt: string;
  property?: Property;
}

// Auth token management
class TokenManager {
  private static TOKEN_KEY = 'properease_auth_token';
  
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem(this.TOKEN_KEY);
    console.log('Getting token:', token ? token.substring(0, 20) + '...' : 'null');
    return token;
  }
  
  static setToken(token: string): void {
    if (typeof window === 'undefined') return;
    console.log('Setting token:', token.substring(0, 20) + '...');
    localStorage.setItem(this.TOKEN_KEY, token);
  }
  
  static removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.TOKEN_KEY);
  }
}

// API client class
class ApiClient {
  private baseURL: string;
  
  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }
  
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const token = TokenManager.getToken();
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };
    
    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'An error occurred',
          details: data.details,
        };
      }
      
      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Network error occurred',
        details: error,
      };
    }
  }
  
  // Authentication methods
  async signup(userData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    userType: 'STUDENT' | 'LANDLORD';
  }): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }
  
  async signin(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<AuthResponse>> {
    console.log('API signin called with:', credentials.email);
    const response = await this.request<AuthResponse>('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    console.log('API signin response:', response);
    
    if (response.success && response.data?.token) {
      console.log('Storing token and user data');
      TokenManager.setToken(response.data.token);
    }
    
    return response;
  }
  
  async getCurrentUser(): Promise<ApiResponse<User>> {
    console.log('Getting current user, token:', TokenManager.getToken());
    const response = await this.request<User>('/api/auth/me');
    console.log('getCurrentUser response:', response);
    return response;
  }
  
  async updateProfile(userData: {
    name?: string;
    phone?: string;
  }): Promise<ApiResponse<User>> {
    return this.request<User>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }
  
  logout(): void {
    TokenManager.removeToken();
  }
  
  // Property methods
  async getProperties(params?: {
    page?: number;
    limit?: number;
    city?: string;
    propertyType?: string;
    roomType?: string;
    minRent?: number;
    maxRent?: number;
    amenities?: string[];
  }): Promise<ApiResponse<{ properties: Property[]; pagination: { page: number; limit: number; total: number; pages: number } }>> {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : String(value)])
    ).toString() : '';
    
    return this.request<{ properties: Property[]; pagination: { page: number; limit: number; total: number; pages: number } }>(`/api/properties${queryString}`);
  }
  
  async getProperty(id: string): Promise<ApiResponse<Property>> {
    return this.request<Property>(`/api/properties/${id}`);
  }
  
  async getMyProperties(): Promise<ApiResponse<Property[]>> {
    return this.request<Property[]>('/api/properties/my-properties');
  }
  
  async createProperty(propertyData: Omit<Property, 'id' | 'owner' | 'images' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Property>> {
    return this.request<Property>('/api/properties', {
      method: 'POST',
      body: JSON.stringify(propertyData),
    });
  }
  
  async updateProperty(id: string, propertyData: Partial<Property>): Promise<ApiResponse<Property>> {
    return this.request<Property>(`/api/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(propertyData),
    });
  }
  
  async deleteProperty(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/properties/${id}`, {
      method: 'DELETE',
    });
  }
  
  async uploadPropertyImages(propertyId: string, files: File[]): Promise<ApiResponse<{ images: PropertyImage[]; count: number }>> {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    
    return this.request<{ images: PropertyImage[]; count: number }>(`/api/properties/${propertyId}/images`, {
      method: 'POST',
      headers: {}, // Remove Content-Type for FormData
      body: formData,
    });
  }

  // Inquiry methods
  async createInquiry(inquiryData: {
    propertyId: string;
    contactType: 'WHATSAPP' | 'PHONE' | 'EMAIL' | 'CONTACT_FORM';
    message?: string;
  }): Promise<ApiResponse<Inquiry>> {
    return this.request('/api/inquiries', {
      method: 'POST',
      body: JSON.stringify(inquiryData),
    });
  }

  async getMyInquiries(): Promise<ApiResponse<Inquiry[]>> {
    return this.request('/api/inquiries/my-inquiries');
  }

  async getPropertyInquiries(propertyId: string): Promise<ApiResponse<Inquiry[]>> {
    return this.request(`/api/inquiries/property/${propertyId}`);
  }

  // Wishlist methods
  async getWishlist(): Promise<ApiResponse<{ wishlist: Property[] }>> {
    return this.request('/api/wishlist');
  }

  async addToWishlist(propertyId: string): Promise<ApiResponse<{ property: Property }>> {
    return this.request(`/api/wishlist/${propertyId}`, {
      method: 'POST',
    });
  }

  async removeFromWishlist(propertyId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/api/wishlist/${propertyId}`, {
      method: 'DELETE',
    });
  }

  async checkWishlist(propertyId: string): Promise<ApiResponse<{ inWishlist: boolean }>> {
    return this.request(`/api/wishlist/check/${propertyId}`);
  }
}

// Create and export API client instance
export const apiClient = new ApiClient();

// Export types
export type {
  User,
  Property,
  PropertyImage,
  AuthResponse,
  ApiResponse,
};

// Export token manager for direct access if needed
export { TokenManager };

// Helper functions for common API operations
export const fetchProperty = async (id: number): Promise<Property | null> => {
  const response = await apiClient.getProperty(String(id));
  if (response.success && response.data) {
    return response.data;
  }
  return null;
};
