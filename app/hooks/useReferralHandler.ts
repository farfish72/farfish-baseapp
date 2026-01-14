"use client";

import { useEffect, useCallback, useState } from 'react';
import { useAccount } from 'wagmi';
import { useTrustAnchor } from './useTrustAnchor';

const WEBSITE_URL = process.env.NEXT_PUBLIC_URL || 'https://farfish-baseapp.vercel.app';

export function useReferralHandler() {
  const { address, isConnected } = useAccount();
  const { processReferral } = useTrustAnchor();
  const [isClient, setIsClient] = useState(false);

  // Set client flag after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Generate referral code from wallet address
  const generateReferralCode = useCallback((walletAddress: string): string => {
    // Referral code = last 8 characters of referrer wallet address
    return walletAddress.toLowerCase().slice(-8);
  }, []);

  // Generate referral link
  const generateReferralLink = useCallback((walletAddress: string): string => {
    const code = generateReferralCode(walletAddress);
    return `${WEBSITE_URL}?ref=${code}`;
  }, [generateReferralCode]);

  // Process referral when user connects wallet
  const handleWalletConnection = useCallback(async () => {
    if (!address || !isConnected || !isClient) return;

    try {
      const pendingReferralCode = localStorage.getItem('pendingReferralCode');
      
      if (pendingReferralCode) {
        const response = await fetch(`/api/trust-anchor/referral-code/${pendingReferralCode}`);
        
        if (response.ok) {
          const data = await response.json();
          const success = await processReferral(data.referrerAddress);
          
          if (success) {
            localStorage.removeItem('pendingReferralCode');
          }
        } else {
          localStorage.removeItem('pendingReferralCode');
        }
      }
    } catch (error) {
      // Silent error handling
    }
  }, [address, isConnected, processReferral, isClient]);

  // Check for referral code in URL on page load - only on client
  useEffect(() => {
    if (!isClient) return;

    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get('ref');
    
    if (referralCode && /^[a-fA-F0-9]{8}$/.test(referralCode)) {
      // Store referral code for when user connects wallet
      localStorage.setItem('pendingReferralCode', referralCode);
      
      // Clean URL without refreshing page
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('ref');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [isClient]);

  // Process referral when wallet connects - only on client
  useEffect(() => {
    if (address && isConnected && isClient) {
      handleWalletConnection();
    }
  }, [address, isConnected, handleWalletConnection, isClient]);

  return {
    generateReferralCode,
    generateReferralLink,
    websiteUrl: WEBSITE_URL,
  };
}