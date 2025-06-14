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

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Try admin login first
      const adminResponse = await fetch('http://localhost:4000/api/admin/login', {
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

      // Try regular user login
      const userResponse = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const userData = await userResponse.json();

      if (userResponse.ok) {
        localStorage.setItem('token', userData.token);
        localStorage.setItem('user', JSON.stringify({
          userId: userData.userId,
          role: userData.role
        }));

        setToken(userData.token);
        setUser({
          userId: userData.userId,
          role: userData.role
        });

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
        throw new Error(userData.message || 'Login failed');
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.push('/login');
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