"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuthenticate, useMiniKit } from '@coinbase/onchainkit/minikit';

interface BaseUser {
  fid: string;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

interface BaseAuthContextType {
  user: BaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => void;
  error: string | null;
}

// Define the AuthenticatedUser type based on the documentation
interface AuthenticatedUser {
  fid: string;
  signature: string;
  message: string;
}

const BaseAuthContext = createContext<BaseAuthContextType | undefined>(undefined);

export function BaseAuthProvider({ children }: { children: ReactNode }) {
  const { signIn: authenticate } = useAuthenticate();
  const { context } = useMiniKit();
  
  const [user, setUser] = useState<BaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto sign-in on app load
  useEffect(() => {
    const autoSignIn = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Check if we have Base App context (user is already authenticated in Base App)
        if (context?.user?.fid) {
          await loadUserProfile(context.user.fid.toString());
          setIsLoading(false);
          return;
        }

        // Check if user is already saved in localStorage
        const savedUser = localStorage.getItem('base_auth_user');
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            if (parsedUser && parsedUser.fid) {
              setUser(parsedUser);
              setIsLoading(false);
              return;
            }
          } catch (err) {
            console.error('Failed to parse saved user:', err);
            localStorage.removeItem('base_auth_user');
          }
        }

        // If no context and no saved user, we'll wait for manual authentication
        setIsLoading(false);
      } catch (err) {
        console.error('Auto sign-in failed:', err);
        setError('Authentication failed');
        setIsLoading(false);
      }
    };

    autoSignIn();
  }, [context]);

  const loadUserProfile = async (fid: string) => {
    try {
      // Use Base App context for user profile data
      const baseUser: BaseUser = {
        fid,
        username: context?.user?.username || `user-${fid}`,
        displayName: context?.user?.displayName || context?.user?.username || `User ${fid}`,
        pfpUrl: context?.user?.pfpUrl || '/farfish-logo.png',
      };

      // Validate profile photo URL if it exists
      if (context?.user?.pfpUrl) {
        try {
          // Test if the profile photo URL is accessible
          const response = await fetch(context.user.pfpUrl, { method: 'HEAD' });
          if (!response.ok) {
            baseUser.pfpUrl = '/farfish-logo.png';
          }
        } catch (err) {
          console.warn('Profile photo URL not accessible, using fallback:', err);
          baseUser.pfpUrl = '/farfish-logo.png';
        }
      }

      setUser(baseUser);
      
      // Store in localStorage for persistence
      localStorage.setItem('base_auth_user', JSON.stringify(baseUser));
    } catch (err) {
      console.error('Failed to load user profile:', err);
      setError('Failed to load profile');
    }
  };

  const signIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const authResult = await authenticate();
      
      // Handle the result - it can be false or SignInResult
      if (authResult) {
        // Check if the result has fid property
        if (typeof authResult === 'object' && 'fid' in authResult) {
          await loadUserProfile(authResult.fid as string);
        } else {
          // If no fid in result, check context
          if (context?.user?.fid) {
            await loadUserProfile(context.user.fid.toString());
          } else {
            setError('Authentication succeeded but no user data available');
          }
        }
      } else {
        setError('Authentication failed');
      }
    } catch (err) {
      console.error('Sign in failed:', err);
      setError('Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    setError(null);
    
    // Clear localStorage
    localStorage.removeItem('base_auth_user');
    
    // Clear any cached data
    if (typeof window !== 'undefined') {
      // Force reload to clear all state
      window.location.reload();
    }
  };

  // Load user from localStorage on mount (for persistence across page reloads)
  useEffect(() => {
    // This is now handled in the autoSignIn effect above
    // to avoid duplicate loading logic
  }, []);

  const value: BaseAuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signOut,
    error,
  };

  return (
    <BaseAuthContext.Provider value={value}>
      {children}
    </BaseAuthContext.Provider>
  );
}

export function useBaseAuth() {
  const context = useContext(BaseAuthContext);
  if (context === undefined) {
    throw new Error('useBaseAuth must be used within a BaseAuthProvider');
  }
  return context;
}