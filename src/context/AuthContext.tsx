import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.ts';
import { api, getStoredToken } from '../lib/api.ts';
import {
  auth,
  googleProvider,
  signInWithPopup,
  firebaseSignOut,
  onAuthStateChanged,
  testFirebaseConnection,
} from '../lib/firebase.ts';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  googleLogin: (data: { email: string; name: string; avatarUrl?: string; googleId?: string }) => Promise<void>;
  firebaseGoogleLogin: () => Promise<void>;
  logout: () => Promise<void>;
  updateCredits: (newBalance: number) => void;
  refreshUser: () => Promise<void>;
  updateProfile: (name?: string, avatarUrl?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      if (!getStoredToken()) {
        setUser(null);
        return;
      }
      const res = await api.getMe();
      setUser(res.user);
    } catch (e) {
      console.warn('Failed to fetch authenticated user:', e);
      setUser(null);
    }
  };

  useEffect(() => {
    // Initial connection test
    testFirebaseConnection().catch(() => {});

    // Check existing stored session
    refreshUser().finally(() => setIsLoading(false));

    // Listen to real Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser && fbUser.email && !user) {
        try {
          const res = await api.googleLogin({
            email: fbUser.email,
            name: fbUser.displayName || fbUser.email.split('@')[0],
            avatarUrl: fbUser.photoURL || undefined,
            googleId: fbUser.uid,
          });
          setUser(res.user);
        } catch (err) {
          console.warn('Failed to sync Firebase user with session:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    setUser(res.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.register(name, email, password);
    setUser(res.user);
  };

  const googleLogin = async (data: { email: string; name: string; avatarUrl?: string; googleId?: string }) => {
    const res = await api.googleLogin(data);
    setUser(res.user);
  };

  const firebaseGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const res = await api.googleLogin({
        email: fbUser.email || '',
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Google User',
        avatarUrl: fbUser.photoURL || undefined,
        googleId: fbUser.uid,
      });
      setUser(res.user);
    } catch (error: any) {
      // If popup was blocked or closed by user, rethrow with friendly message
      if (error?.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in cancelled by user. Please try again.');
      } else if (error?.code === 'auth/popup-blocked') {
        throw new Error('Sign-in popup was blocked by browser. Please allow popups for this site.');
      } else if (error?.code === 'auth/unauthorized-domain' || error?.message?.includes('auth/unauthorized-domain')) {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'your deployment domain';
        console.warn('Firebase domain authorization pending in Firebase Console for domain:', domain);
        const customErr = new Error(`Firebase: Error (auth/unauthorized-domain). Current domain "${domain}" is not authorized in Firebase Console.`);
        (customErr as any).code = 'auth/unauthorized-domain';
        (customErr as any).domain = domain;
        throw customErr;
      }
      console.warn('Firebase Google Sign-In error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth).catch(() => {});
      await api.logout();
    } finally {
      setUser(null);
    }
  };

  const updateCredits = (newBalance: number) => {
    if (user) {
      setUser({ ...user, credits: newBalance });
    }
  };

  const updateProfile = async (name?: string, avatarUrl?: string) => {
    const res = await api.updateProfile({ name, avatarUrl });
    setUser(res.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        googleLogin,
        firebaseGoogleLogin,
        logout,
        updateCredits,
        refreshUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
