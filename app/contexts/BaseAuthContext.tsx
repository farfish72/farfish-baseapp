"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';

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
  error: string | null;
}

const BaseAuthContext = createContext<BaseAuthContextType | undefined>(undefined);

/**
 * Base Auth Provider - Simplified for Base App
 * 
 * Authentication is automatic via Base App context.
 * No manual sign-in, no localStorage, no external redirects.
 * 
 * @see https://docs.base.org/mini-apps/features/authentication
 */
export function BaseAuthProvider({ children }: { children: ReactNode }) {
  const { context } = useMiniKit();
  
  const [user, setUser] = useState<BaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Automatically load user from Base App context
  useEffect(() => {
    const loadUser = () => {
      setIsLoading(true);
      setError(null);

      try {
        // Check if we have Base App context (user is already authenticated)
        if (context?.user?.fid) {
          const baseUser: BaseUser = {
            fid: context.user.fid.toString(),
            username: context.user.username || `user-${context.user.fid}`,
            displayName: context.user.displayName || context.user.username || `User ${context.user.fid}`,
            pfpUrl: context.user.pfpUrl || '/farfish-logo-optimized.webp',
          };

          setUser(baseUser);
        } else {
          // No user context available yet
          setUser(null);
        }
      } catch (err) {
        console.error('[BaseAuth] Error loading user:', err);
        setError('Failed to load user profile');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [context]);

  const value: BaseAuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
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