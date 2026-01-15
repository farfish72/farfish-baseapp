"use client";

import { useBaseAuth } from '@/app/contexts/BaseAuthContext';
import { ReactNode } from 'react';

interface BaseAuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function BaseAuthGuard({ children, fallback }: BaseAuthGuardProps) {
  const { isAuthenticated, isLoading, error, signIn } = useBaseAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-primary flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-white font-medium">Connected</p>
          <p className="text-white/60 text-sm mt-2">Authenticating your identity</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/20 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-white font-medium mb-2">Authentication Error</p>
          <p className="text-white/70 text-sm mb-6">{error}</p>
          <button
            onClick={signIn}
            className="py-3 px-6 rounded-2xl bg-gradient-primary text-black font-semibold transition-all duration-300 hover:shadow-lg"
          >
            Retry Authentication
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-primary flex items-center justify-center">
            <span className="text-2xl">🔐</span>
          </div>
          <p className="text-white font-medium mb-2">Base App Authentication Required</p>
          <p className="text-white/70 text-sm mb-6">Please authenticate with Base App to continue</p>
          <button
            onClick={signIn}
            className="py-3 px-6 rounded-2xl bg-gradient-primary text-black font-semibold transition-all duration-300 hover:shadow-lg"
          >
            Sign in with Base
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}