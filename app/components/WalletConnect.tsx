"use client";

import { useMemo } from "react";
import { useAccount, useConnect } from "wagmi";
import { detectFarcasterEnvironment } from "../utils/farcaster";

export default function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();

  const isFarcaster = useMemo(() => detectFarcasterEnvironment(), []);

  const handleConnect = () => {
    const connector = connectors[0];
    if (!connector) return;
    connect({ connector });
  };

  if (!isFarcaster) {
    return null;
  }

  return (
    <div className="w-full animate-slide-up">
      <div className="glass-card-interactive rounded-4xl p-4 mb-4 group shadow-elevated backdrop-blur-4xl">
        {/* Premium inner gradient */}
        <div className="absolute inset-0 bg-premium-gradient opacity-30 rounded-4xl"></div>
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-4xl"></div>
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-3xl bg-gradient-to-br from-primary-400 via-primary-300 to-blue-500 flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/25 to-white/5"></div>
              <svg className="w-6 h-6 text-white relative z-10 filter drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H6.99C4.58 7 2.4 8.84 2.05 11.25c-.18 1.23.18 2.45.96 3.38.43.51 1.05.87 1.74.87H6V14H4.75c-.41 0-.75-.34-.75-.75 0-.41.34-.75.75-.75H6V12H3.9zm8.1 0c0 1.71-1.39 3.1-3.1 3.1H4V14h4.99c2.41 0 4.59-1.84 4.94-4.25.18-1.23-.18-2.45-.96-3.38C12.54 5.86 11.92 5.5 11.23 5.5H10V7h1.25c.41 0 .75.34.75.75 0 .41-.34.75-.75.75H10v1h2.1z"/>
              </svg>
            </div>
            <div>
              <p className="text-base font-bold text-premium-lg text-premium mb-1">Base Wallet</p>
              {isConnected && address && (
                <p className="text-sm font-semibold text-green-200 flex items-center gap-2">
                  <div className="relative">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-glow"></div>
                    <div className="absolute inset-0 w-2 h-2 bg-green-300 rounded-full animate-ping opacity-60"></div>
                  </div>
                  Connected
                </p>
              )}
              {!isConnected && (
                <p className="text-sm font-medium text-muted">Not connected</p>
              )}
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleConnect}
            disabled={isPending || isConnected}
            className={`
              px-4 py-2.5 rounded-3xl text-sm font-bold transition-all duration-300 btn-premium
              transform-gpu will-change-transform relative overflow-hidden group/btn
              ${isPending || isConnected
                ? "bg-white/15 text-white/60 cursor-not-allowed"
                : "bg-gradient-to-r from-primary-400 to-blue-500 text-black hover:scale-105 shadow-glow hover:shadow-floating interactive-lift"
              }
            `}
          >
            {!isPending && !isConnected && (
              <div className="absolute inset-0 bg-shimmer opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
            )}
            
            <span className="relative z-10">
              {isConnected && address
                ? `Connected`
                : isPending
                ? (
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Connecting...
                  </div>
                )
                : "Connect Farcaster Wallet"}
            </span>
          </button>
        </div>
        
        {error && (
          <div className="mt-4 p-4 rounded-4xl bg-red-400/15 border border-red-400/40 animate-slide-up backdrop-blur-xl shadow-soft">
            <div className="flex items-center gap-3">
              <span className="text-red-400 text-lg">⚠️</span>
              <p className="text-sm font-semibold text-red-200 flex-1">{error.message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}