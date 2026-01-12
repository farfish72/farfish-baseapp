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
      // Check if there's a pending referral code in localStorage
      const pendingReferralCode = localStorage.getItem('pendingReferralCode');
      
      if (pendingReferralCode) {
        // Resolve referral code to get referrer address
        const response = await fetch(`/api/trust-anchor/referral-code/${pendingReferralCode}`);
        
        if (response.ok) {
          const data = await response.json();
          
          // Process the referral
          const success = await processReferral(data.referrerAddress);
          
          if (success) {
            console.log('Referral processed successfully');
            // Clear the pending referral code
            localStorage.removeItem('pendingReferralCode');
          }
        } else {
          console.warn('Invalid or expired referral code');
          localStorage.removeItem('pendingReferralCode');
        }
      }
    } catch (error) {
      console.error('Error processing referral:', error);
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