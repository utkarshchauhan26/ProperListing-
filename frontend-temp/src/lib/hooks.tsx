'use client';

import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { apiClient, User, Property, ApiResponse } from './api';
import toast from 'react-hot-toast';

// Auth Context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    userType: 'STUDENT' | 'LANDLORD';
  }) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: { name?: string; phone?: string }) => Promise<boolean>;
  isAuthenticated: boolean;
  isLandlord: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('Checking auth status...');
      const response = await apiClient.getCurrentUser();
      console.log('Auth check response:', response);
      
      if (response.success && response.data) {
        console.log('Setting user from auth check:', response.data);
        setUser(response.data);
      } else {
        console.log('No valid user found, clearing user state');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Login attempt for:', email);
      const response = await apiClient.signin({ email, password });
      console.log('Login response:', response);
      
      if (response.success && response.data) {
        console.log('Setting user:', response.data.user);
        setUser(response.data.user);
        toast.success(`Successfully logged in as ${response.data.user.userType}!`);
        return true;
      } else {
        console.error('Login failed:', response.error);
        toast.error(response.error || 'Login failed');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed');
      return false;
    }
  };

  const signup = async (userData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    userType: 'STUDENT' | 'LANDLORD';
  }): Promise<boolean> => {
    try {
      const response = await apiClient.signup(userData);
      if (response.success && response.data) {
        setUser(response.data.user);
        toast.success('Account created successfully!');
        return true;
      } else {
        toast.error(response.error || 'Signup failed');
        return false;
      }
    } catch (error) {
      toast.error('Signup failed');
      return false;
    }
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = async (userData: { name?: string; phone?: string }): Promise<boolean> => {
    try {
      const response = await apiClient.updateProfile(userData);
      if (response.success && response.data) {
        setUser(response.data);
        toast.success('Profile updated successfully!');
        return true;
      } else {
        toast.error(response.error || 'Update failed');
        return false;
      }
    } catch (error) {
      toast.error('Update failed');
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isLandlord: user?.userType === 'LANDLORD',
  };

  const contextValue = value;
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Property hooks
export function useProperties(filters?: {
  city?: string;
  propertyType?: string;
  roomType?: string;
  minRent?: number;
  maxRent?: number;
}) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProperties(filters);
      if (response.success && response.data) {
        setProperties(response.data.properties);
        setError(null);
      } else {
        setError(response.error || 'Failed to fetch properties');
      }
    } catch (error) {
      setError('Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  return { properties, loading, error, refetch: fetchProperties };
}

export function useMyProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyProperties();
  }, []);

  const fetchMyProperties = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getMyProperties();
      if (response.success && response.data) {
        setProperties(response.data);
        setError(null);
      } else {
        setError(response.error || 'Failed to fetch properties');
      }
    } catch (error) {
      setError('Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  const deleteProperty = async (id: string): Promise<boolean> => {
    try {
      const response = await apiClient.deleteProperty(id);
      if (response.success) {
        setProperties(prev => prev.filter(p => p.id !== id));
        toast.success('Property deleted successfully');
        return true;
      } else {
        toast.error(response.error || 'Delete failed');
        return false;
      }
    } catch (error) {
      toast.error('Delete failed');
      return false;
    }
  };

  return { properties, loading, error, refetch: fetchMyProperties, deleteProperty };
}

export function useProperty(id: string) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProperty(id);
      if (response.success && response.data) {
        setProperty(response.data);
        setError(null);
      } else {
        setError(response.error || 'Failed to fetch property');
      }
    } catch (error) {
      setError('Failed to fetch property');
    } finally {
      setLoading(false);
    }
  };

  return { property, loading, error, refetch: fetchProperty };
}




