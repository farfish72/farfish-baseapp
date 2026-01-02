"use client";

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class MinimalErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch() {
    // Minimal error boundary - no logging, just catch and show fallback
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center max-w-md">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-white/70 mb-4">Please refresh the page to continue.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-cyan-400 to-blue-500 text-black px-6 py-2 rounded-xl font-medium hover:scale-105 transition-transform"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default MinimalErrorBoundary;