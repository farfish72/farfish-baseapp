'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log full error details for developers
    // Error boundary caught an error - component will show fallback UI
  }

  handleRefresh = () => {
    // Reset error state and reload
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-5 relative overflow-hidden">
          {/* Enhanced premium background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900"></div>
          
          {/* Animated background elements */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-400/15 to-transparent rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-red-500/10 to-transparent rounded-full blur-3xl animate-float-delayed"></div>
          
          <div className="w-full max-w-md glass-card bg-gradient-to-br from-red-500/15 via-red-500/8 to-red-500/5 backdrop-blur-4xl border border-red-400/40 rounded-5xl p-8 text-center shadow-floating relative z-10 animate-scale-in">
            {/* Premium inner gradient */}
            <div className="absolute inset-0 bg-premium-gradient opacity-30 rounded-5xl"></div>
            
            <div className="relative z-10">
              {/* Enhanced Error Icon */}
              <div className="w-20 h-20 mx-auto mb-8 rounded-4xl bg-gradient-to-br from-red-400 via-red-500 to-red-600 flex items-center justify-center shadow-floating group">
                <div className="absolute inset-0 rounded-4xl bg-gradient-to-br from-white/20 to-white/5"></div>
                <svg className="w-10 h-10 text-white relative z-10 filter drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2L13.09,8.26L22,9L17,14L18.18,22.74L12,19.27L5.82,22.74L7,14L2,9L10.91,8.26L12,2Z M12,15.4L16.76,18.16L15.62,12.77L19.24,9.67L13.81,9.33L12,4.12L10.19,9.33L4.76,9.67L8.38,12.77L7.24,18.16L12,15.4Z"/>
                </svg>
              </div>
              
              {/* Enhanced Error Message */}
              <h1 className="text-2xl font-display font-bold text-premium-xl text-premium mb-4">
                Something went wrong
              </h1>
              <p className="text-base font-medium text-secondary mb-8 leading-relaxed">
                We encountered an unexpected error. Please refresh the app to continue your experience.
              </p>
              
              {/* Enhanced Action Button */}
              <button
                onClick={this.handleRefresh}
                className="w-full py-5 rounded-4xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold text-lg transition-all duration-300 hover:scale-105 shadow-elevated btn-premium relative overflow-hidden group transform-gpu"
              >
                <div className="absolute inset-0 bg-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-4xl"></div>
                <span className="relative z-10">Refresh App</span>
              </button>
              
              {/* Enhanced Footer */}
              <div className="mt-8 glass-card rounded-3xl p-4">
                <p className="text-sm font-medium text-muted">
                  If this keeps happening, try closing and reopening the app.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}