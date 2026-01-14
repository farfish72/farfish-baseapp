"use client";

import { useAccount } from "wagmi";
import { useEffect, useMemo, useState } from "react";

type FarcasterProfile = {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  bio?: string;
  followerCount?: number;
  followingCount?: number;
};

type Rarity = "common" | "rare" | "epic" | "legendary";

type RarityBreakdown = Record<Rarity, number>;

type UserStats = {
  nftsOwned?: number;
  staked?: number;
  streakDays?: number;
  rankLabel?: string;
  rarityBreakdown?: RarityBreakdown;
};

type FarcasterUser = {
  displayName: string;
  fid: number;
  pfpUrl: string;
  walletAddress: string;
  stats?: UserStats;
  farcasterProfile?: FarcasterProfile | null;
};

const rarityOrder: Rarity[] = ["common", "rare", "epic", "legendary"];

const defaultBreakdown = (): RarityBreakdown => ({
  common: 0,
  rare: 0,
  epic: 0,
  legendary: 0,
});

export default function useUser() {
  const { address } = useAccount();
  const [loadingNFTs, setLoadingNFTs] = useState(false);
  const [loadingFarcaster, setLoadingFarcaster] = useState(false);
  const [rarityBreakdown, setRarityBreakdown] = useState<RarityBreakdown>(defaultBreakdown());
  const [farcasterProfile, setFarcasterProfile] = useState<FarcasterProfile | null>(null);
  const [stakedCount, setStakedCount] = useState(0);

  // For Base miniapp, we don't need Farcaster profile fetching
  useEffect(() => {
    if (!address) {
      setFarcasterProfile(null);
    }
    setLoadingFarcaster(false);
  }, [address]);

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!address) {
        setRarityBreakdown(defaultBreakdown());
        return;
      }

      setLoadingNFTs(true);
      try {
        // NFT fetching logic would go here
        setRarityBreakdown(defaultBreakdown());
      } catch (error) {
        setRarityBreakdown(defaultBreakdown());
      } finally {
        setLoadingNFTs(false);
      }
    };

    fetchNFTs();
  }, [address]);

  const nftsOwned = useMemo(
    () => rarityOrder.reduce((total, rarity) => total + (rarityBreakdown[rarity] ?? 0), 0),
    [rarityBreakdown]
  );

  // Display name priority: localStorage override > default
  const displayName = useMemo(() => {
    const localUsername = typeof window !== "undefined" ? localStorage.getItem('username') : null;
    
    // If user has set a custom username, use it
    if (localUsername && localUsername.trim()) {
      return localUsername.trim();
    }
    
    return "FarFISH Captain";
  }, []);

  // Profile picture priority: localStorage override > default
  const pfpUrl = useMemo(() => {
    const localImage = typeof window !== "undefined" ? localStorage.getItem('profileImage') : null;
    
    // If user has set a custom image, use it
    if (localImage && localImage.trim()) {
      return localImage;
    }
    
    return "/farfish-logo-optimized.webp";
  }, []);

  const fid = farcasterProfile?.fid ?? 0;

  const stats: UserStats = {
    nftsOwned,
    staked: stakedCount,
    streakDays: 0, // This comes from KV via API calls
    rankLabel:
      nftsOwned >= 5 ? "Gold" : nftsOwned >= 3 ? "Silver" : nftsOwned > 0 ? "Bronze" : "Unranked",
    rarityBreakdown,
  };

  const connectedUser: FarcasterUser | null = address
    ? {
        displayName,
        fid,
        pfpUrl,
        walletAddress: address, // Primary identifier for all tracking
        stats,
        farcasterProfile,
      }
    : null;

  return {
    user: connectedUser,
    loadingNFTs,
    loadingFarcaster,
    hasFarcasterProfile: !!farcasterProfile,
  };
}

export type { FarcasterUser, RarityBreakdown };

