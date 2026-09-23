"use client";

import { useState } from 'react';
import { FiShare2 } from 'react-icons/fi';

interface ShareButtonProps {
  title?: string;
  text?: string;
  url?: string;
  variant?: 'primary' | 'secondary' | 'icon';
  className?: string;
  onShareComplete?: () => void;
}

/**
 * ShareButton Component
 * 
 * Provides native share functionality for Base App.
 * Uses Web Share API when available, falls back to copy link.
 * 
 * @see https://docs.base.org/mini-apps/quickstart/launch-checklist
 */
export default function ShareButton({
  title = 'FarFISH - Mint • Stake • Earn',
  text = 'Check out FarFISH! Premium NFT collection on Base Network. 🐟',
  url,
  variant = 'primary',
  className = '',
  onShareComplete,
}: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  const shareUrl = url || (typeof window !== 'undefined' ? `${window.location.origin}/share` : '');

  const handleShare = async () => {
    setIsSharing(true);

    try {
      // Check if Web Share API is available
      if (navigator.share) {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        });
        
        onShareComplete?.();
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
        
        onShareComplete?.();
      }
    } catch (error) {
      // User cancelled share or error occurred
      console.log('Share cancelled or failed:', error);
    } finally {
      setIsSharing(false);
    }
  };

  // Icon variant - just the icon button
  if (variant === 'icon') {
    return (
      <button
        onClick={handleShare}
        disabled={isSharing}
        className={`p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 disabled:opacity-50 ${className}`}
        aria-label="Share"
      >
        <FiShare2 className="w-5 h-5 text-white" />
      </button>
    );
  }

  // Secondary variant - outlined button
  if (variant === 'secondary') {
    return (
      <button
        onClick={handleShare}
        disabled={isSharing}
        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/30 text-white font-medium transition-all duration-300 hover:bg-white/20 disabled:opacity-50 ${className}`}
      >
        {showCopied ? (
          <>
            <span className="text-lg">✓</span>
            <span>Link Copied</span>
          </>
        ) : (
          <>
            <FiShare2 className="w-4 h-4" />
            <span>{isSharing ? 'Sharing...' : 'Share FarFISH'}</span>
          </>
        )}
      </button>
    );
  }

  // Primary variant - full button
  return (
    <button
      onClick={handleShare}
      disabled={isSharing}
      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-primary text-black font-bold transition-all duration-300 hover:shadow-lg disabled:opacity-50 ${className}`}
    >
      {showCopied ? (
        <>
          <span className="text-lg">✓</span>
          <span>Link Copied</span>
        </>
      ) : (
        <>
          <FiShare2 className="w-5 h-5" />
          <span>{isSharing ? 'Sharing...' : 'Share FarFISH'}</span>
        </>
      )}
    </button>
  );
}
