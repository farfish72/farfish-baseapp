"use client";

import { useEffect, useState, useCallback } from 'react';
import { useAccount } from 'wagmi';

export interface TrustAnchorData {
  daysActive: number;
  currentStreak: number;
  referrals: number;
  rank: number;
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useTrustAnchor() {
  const { address, isConnected } = useAccount();
  const [data, setData] = useState<TrustAnchorData>({
    daysActive: 0,
    currentStreak: 0,
    referrals: 0,
    rank: 1,
    isActive: false,
    isLoading: false,
    error: null,
  });

  const fetchTrustData = useCallback(async () => {
    // Don't fetch if not on client side
    if (typeof window === 'undefined') {
      return;
    }

    if (!address || !isConnected) {
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: null,
        isActive: false,
        daysActive: 0,
        currentStreak: 0,
        referrals: 0,
        rank: 1,
      }));
      return;
    }

    setData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Fetch user data and rankings in parallel
      const [userResponse, rankResponse] = await Promise.all([
        fetch(`/api/trust-anchor/user/${address}`),
        fetch(`/api/trust-anchor/rankings?address=${address}`),
      ]);

      if (!userResponse.ok || !rankResponse.ok) {
        throw new Error('Failed to fetch trust anchor data');
      }

      const userData = await userResponse.json();
      const rankData = await rankResponse.json();

      // Status becomes Active ONLY when user has successfully claimed Daily Base Chest
      const isActive = userData.daysActive > 0;

      setData({
        daysActive: userData.daysActive || 0,
        currentStreak: userData.currentStreak || 0,
        referrals: userData.referrals || 0,
        rank: rankData.rank || 1,
        isActive,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching trust anchor data:', error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }, [address, isConnected]);

  const recordClaim = useCallback(async (txHash: string) => {
    if (!address || typeof window === 'undefined') return false;

    try {
      const response = await fetch('/api/trust-anchor/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          txHash,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to record claim');
      }

      const result = await response.json();
      
      // Update local state with new data
      setData(prev => ({
        ...prev,
        daysActive: result.data.daysActive,
        currentStreak: result.data.currentStreak,
        isActive: true,
      }));

      // Refresh rankings
      await fetchTrustData();
      
      return true;
    } catch (error) {
      console.error('Error recording claim:', error);
      setData(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to record claim',
      }));
      return false;
    }
  }, [address, fetchTrustData]);

  const processReferral = useCallback(async (referrerAddress: string) => {
    if (!address || typeof window === 'undefined') return false;

    try {
      const response = await fetch('/api/trust-anchor/referral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newUserAddress: address,
          referrerAddress,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process referral');
      }

      // Refresh data after successful referral
      await fetchTrustData();
      return true;
    } catch (error) {
      console.error('Error processing referral:', error);
      return false;
    }
  }, [address, fetchTrustData]);

  // Fetch data when address changes
  useEffect(() => {
    fetchTrustData();
  }, [fetchTrustData]);

  return {
    ...data,
    refetch: fetchTrustData,
    recordClaim,
    processReferral,
  };
}