'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Define the user type
interface User {
  userId?: string;
  id?: string;
  role: 'admin' | 'mentor' | 'company' | 'student';
  email?: string;
}

// Define the context type
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    // Debug: Check what's in localStorage
    console.log('🔍 AuthContext Debug:', {
      storedToken: storedToken ? 'EXISTS' : 'MISSING',
      storedUser: storedUser ? storedUser : 'MISSING',
      rawUserData: storedUser
    });
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('✅ Setting user:', parsedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error('❌ Error parsing user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } else {
      console.log('❌ No stored auth data found');
    }
    setLoading(false);
  }, []);

  // Ensure user/token are cleared if token is missing (handles edge cases)
  useEffect(() => {
    if (!token && user) {
      console.log('🚨 Clearing user because token is missing');
      setUser(null);
    }
  }, [token, user]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const adminResponse = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (adminResponse.ok) {
        const adminData = await adminResponse.json();
        const userData: User = { id: "admin", role: "admin" };
        
        localStorage.setItem('token', adminData.token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setToken(adminData.token);
        setUser(userData);
        router.push('/admin');
        return;
      }

      const userResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const userData = await userResponse.json();

      if (userResponse.ok) {
        const userToStore = {
          userId: userData.userId,
          role: userData.role,
          email: email  // Store the email too
        };
        
        localStorage.setItem('token', userData.token);
        localStorage.setItem('user', JSON.stringify(userToStore));

        console.log('✅ Login successful, storing user:', userToStore);
        
        setToken(userData.token);
        setUser(userToStore);

        // Redirect based on role
        switch (userData.role) {
          case 'admin':
            router.push('/admin');
            break;
          case 'mentor':
            router.push('/mentor');
            break;
          case 'company':
            router.push('/company');
            break;
          case 'student':
            router.push('/');
            break;
          default:
            router.push('/');
        }
      } else {
        // Handle email verification required case
        if (userData.emailNotVerified) {
          // Redirect to verification page with email as parameter
          const encodedEmail = encodeURIComponent(email);
          router.push(`/verify-email?email=${encodedEmail}`);
          throw new Error('Please complete email verification to continue.');
        }
        throw new Error(userData.message || 'Login failed');
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
    router.push('/');
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 