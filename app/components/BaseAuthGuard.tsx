"use client";

import { useBaseAppAuth } from '@/app/contexts/BaseAppAuthContext';
import { ReactNode } from 'react';
import { Warning, LockKey } from '@phosphor-icons/react';

interface BaseAuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Base App Auth Guard - 2026 Standard Web App
 * 
 * Wallet-based authentication guard for standalone Base App.
 * Requires wallet connection, not Farcaster context.
 * 
 * @see https://docs.base.org/apps/guides/migrate-to-standard-web-app
 */
export default function BaseAuthGuard({ children, fallback }: BaseAuthGuardProps) {
  const { isAuthenticated, isLoading, error } = useBaseAppAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-primary flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-white font-medium">Loading FarFISH</p>
          <p className="text-white/60 text-sm mt-2">Initializing Base App</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/20 flex items-center justify-center">
            <Warning size={32} weight="duotone" color="#ef4444" />
          </div>
          <p className="text-white font-medium mb-2">Connection Error</p>
          <p className="text-white/70 text-sm mb-6">{error}</p>
          <p className="text-white/60 text-xs">Please refresh and try again</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-primary flex items-center justify-center">
            <LockKey size={32} weight="duotone" color="#000000" />
          </div>
          <p className="text-white font-medium mb-2">Wallet Required</p>
          <p className="text-white/70 text-sm mb-6">
            Connect your wallet to access FarFISH
          </p>
          <p className="text-white/60 text-xs">
            Click "Connect Wallet" in the header to get started
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}