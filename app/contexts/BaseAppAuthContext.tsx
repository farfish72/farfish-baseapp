"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAccount } from 'wagmi';

interface BaseAppUser {
  wallet: string;
  username: string;
  displayName: string;
  pfpUrl: string;
}

interface BaseAppAuthContextType {
  user: BaseAppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const BaseAppAuthContext = createContext<BaseAppAuthContextType | undefined>(undefined);

/**
 * Base App Auth Provider - 2026 Standard Web App
 * 
 * Wallet-first authentication for standalone Base App.
 * Auto-creates user profile on first wallet connection.
 * Reuses existing backend APIs (/api/profile, /api/user/init).
 * 
 * @see https://docs.base.org/apps/guides/migrate-to-standard-web-app
 */
export function BaseAppAuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  
  const [user, setUser] = useState<BaseAppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load or create user profile when wallet connects
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!isConnected || !address) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Try to fetch existing user profile
        const profileResponse = await fetch(`/api/profile?wallet=${address}`, {
          cache: 'no-store',
        });

        if (profileResponse.ok) {
          // User exists - load profile
          const profile = await profileResponse.json();
          
          setUser({
            wallet: address,
            username: profile.steam?.username || `user-${address.slice(-6)}`,
            displayName: profile.steam?.displayName || `User ${address.slice(2, 6)}`,
            pfpUrl: profile.steam?.pfpUrl || '/farfish-logo-optimized.webp',
          });
        } else if (profileResponse.status === 404 || !profileResponse.ok) {
          // User doesn't exist - auto-initialize
          try {
            const initResponse = await fetch('/api/user/init', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ wallet: address }),
            });

            if (initResponse.ok) {
              // Successfully initialized - set default user
              setUser({
                wallet: address,
                username: `user-${address.slice(-6)}`,
                displayName: `User ${address.slice(2, 6)}`,
                pfpUrl: '/farfish-logo-optimized.webp',
              });
            } else {
              // Init failed but allow user to proceed
              setUser({
                wallet: address,
                username: `user-${address.slice(-6)}`,
                displayName: `User ${address.slice(2, 6)}`,
                pfpUrl: '/farfish-logo-optimized.webp',
              });
            }
          } catch (initError) {
            console.error('[BaseAppAuth] User init failed:', initError);
            // Still allow user to proceed with basic profile
            setUser({
              wallet: address,
              username: `user-${address.slice(-6)}`,
              displayName: `User ${address.slice(2, 6)}`,
              pfpUrl: '/farfish-logo-optimized.webp',
            });
          }
        }
      } catch (err) {
        console.error('[BaseAppAuth] Error loading user profile:', err);
        setError('Failed to load profile');
        // Still allow user to proceed with basic profile
        setUser({
          wallet: address,
          username: `user-${address.slice(-6)}`,
          displayName: `User ${address.slice(2, 6)}`,
          pfpUrl: '/farfish-logo-optimized.webp',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [address, isConnected]);

  const value: BaseAppAuthContextType = {
    user,
    isAuthenticated: !!user && isConnected,
    isLoading,
    error,
  };

  return (
    <BaseAppAuthContext.Provider value={value}>
      {children}
    </BaseAppAuthContext.Provider>
  );
}

export function useBaseAppAuth() {
  const context = useContext(BaseAppAuthContext);
  if (context === undefined) {
    throw new Error('useBaseAppAuth must be used within a BaseAppAuthProvider');
  }
  return context;
}
