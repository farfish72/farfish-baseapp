"use client";

import { useBaseAuth } from '@/app/contexts/BaseAuthContext';
import { ReactNode } from 'react';

interface BaseAuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Base Auth Guard - Simplified for Base App
 * 
 * Authentication is automatic via Base App.
 * No manual sign-in buttons - users are already authenticated.
 * 
 * @see https://docs.base.org/mini-apps/features/authentication
 */
export default function BaseAuthGuard({ children, fallback }: BaseAuthGuardProps) {
  const { isAuthenticated, isLoading, error } = useBaseAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-primary flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-white font-medium">Loading FarFISH</p>
          <p className="text-white/60 text-sm mt-2">Connecting to Base App</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/20 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-white font-medium mb-2">Connection Error</p>
          <p className="text-white/70 text-sm mb-6">{error}</p>
          <p className="text-white/60 text-xs">Please try reopening the app from Base</p>
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
            <span className="text-2xl">🔐</span>
          </div>
          <p className="text-white font-medium mb-2">Base App Required</p>
          <p className="text-white/70 text-sm mb-6">
            Please open FarFISH from the Base App to continue
          </p>
          <p className="text-white/60 text-xs">
            Authentication is automatic when launched from Base
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}