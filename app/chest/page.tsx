"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useChainId,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { base } from "viem/chains";

import Header from "../components/Header";
import ChestCard from "../components/ChestCard";
import TrustAnchor from "../components/TrustAnchor";
import useFarcasterEnvironment from "../hooks/useFarcasterEnvironment";
import useUserStakes from "../hooks/useUserStakes";

import claimControllerAbi from "../abi/claimController.json";
import { CLAIM_CONTROLLER_ADDRESS } from "../constants";

/* ---------------- helpers ---------------- */
const formatTime = (seconds: bigint | number): string => {
  const s = typeof seconds === "bigint" ? Number(seconds) : seconds;
  if (!s || s <= 0) return "0h 0m";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}h ${m}m`;
};

/* ---------------- TRUST ANCHOR TYPES ---------------- */
interface TrustAnchorData {
  streak: number;
  daysActive: number;
  referrals: number;
  rank: number | null;
  lastClaimDate: string | null;
}

/* ---------------- page ---------------- */
export default function ChestPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isBase = chainId === base.id;

  useFarcasterEnvironment("Chest");

  // Get user stakes to determine tier
  const { activeStakes } = useUserStakes();
  
  // Trust Anchor state - SINGLE SOURCE OF TRUTH
  const [trustAnchorData, setTrustAnchorData] = useState<TrustAnchorData>({
    streak: 0,
    daysActive: 0,
    referrals: 0,
    rank: null,
    lastClaimDate: null,
  });
  const [trustAnchorLoading, setTrustAnchorLoading] = useState(false);

  // Fetch Trust Anchor data (authoritative)
  const fetchTrustAnchorData = useCallback(async () => {
    if (!address) return;
    
    setTrustAnchorLoading(true);
    try {
      const response = await fetch(`/api/trust-anchor?address=${address}`);
      if (response.ok) {
        const data = await response.json();
        setTrustAnchorData({
          streak: data.streak || 0,
          daysActive: data.daysActive || 0,
          referrals: data.referrals || 0,
          rank: data.rank,
          lastClaimDate: data.lastClaimDate,
        });
      }
    } catch (error) {
      console.error('Failed to fetch Trust Anchor data:', error);
    } finally {
      setTrustAnchorLoading(false);
    }
  }, [address]);

  // Load Trust Anchor data on address change
  useEffect(() => {
    fetchTrustAnchorData();
  }, [fetchTrustAnchorData]);

  /* ================= DAILY BRONZE ================= */
  const { data: dailyData } = useReadContract({
    address: CLAIM_CONTROLLER_ADDRESS,
    abi: claimControllerAbi,
    functionName: "canClaimDailyChest",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(isConnected && address && isBase) },
  });

  const daily = useMemo(() => {
    if (!dailyData || !Array.isArray(dailyData)) return null;
    return {
      canClaim: Boolean(dailyData[0]),
      timeLeft: BigInt(dailyData[1]),
    };
  }, [dailyData]);

  const {
    writeContract: claimDaily,
    data: dailyTx,
    isPending: dailyPending,
  } = useWriteContract();

  const { isLoading: dailyConfirming, isSuccess: dailySuccess } = useWaitForTransactionReceipt({
    hash: dailyTx,
  });

  // Update Trust Anchor after successful daily claim
  useEffect(() => {
    if (dailySuccess && dailyTx && address) {
      const updateTrustAnchor = async () => {
        try {
          const response = await fetch('/api/trust-anchor', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              address,
              action: 'chest_claim_success',
              txHash: dailyTx,
            }),
          });
          
          if (response.ok) {
            // Refresh Trust Anchor data
            await fetchTrustAnchorData();
          }
        } catch (error) {
          console.error('Failed to update Trust Anchor:', error);
        }
      };
      
      updateTrustAnchor();
    }
  }, [dailySuccess, dailyTx, address, fetchTrustAnchorData]);

  const handleBronzeClaim = useCallback(async () => {
    if (!daily?.canClaim || !address) return;

    try {
      await claimDaily({
        address: CLAIM_CONTROLLER_ADDRESS,
        abi: claimControllerAbi,
        functionName: "claimDailyChest",
        args: [],
        account: address,
        chain: base,
      });
    } catch (error) {
      console.error('Daily claim error:', error);
      throw error;
    }
  }, [daily, address, claimDaily]);

  /* ================= SILVER ================= */
  const { data: silverData } = useReadContract({
    address: CLAIM_CONTROLLER_ADDRESS,
    abi: claimControllerAbi,
    functionName: "canClaimSilverChest",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(isConnected && address && isBase) },
  });

  const silver = useMemo(() => {
    if (!silverData || !Array.isArray(silverData)) return null;
    return {
      canClaim: Boolean(silverData[0]),
      timeLeft: BigInt(silverData[1]),
      hasStaked: Boolean(silverData[2]),
    };
  }, [silverData]);

  const {
    writeContract: claimSilver,
    data: silverTx,
    isPending: silverPending,
  } = useWriteContract();

  const { isLoading: silverConfirming, isSuccess: silverSuccess } = useWaitForTransactionReceipt({
    hash: silverTx,
  });

  // Update Trust Anchor after successful silver claim
  useEffect(() => {
    if (silverSuccess && silverTx && address) {
      const updateTrustAnchor = async () => {
        try {
          const response = await fetch('/api/trust-anchor', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              address,
              action: 'chest_claim_success',
              txHash: silverTx,
            }),
          });
          
          if (response.ok) {
            // Refresh Trust Anchor data
            await fetchTrustAnchorData();
          }
        } catch (error) {
          console.error('Failed to update Trust Anchor:', error);
        }
      };
      
      updateTrustAnchor();
    }
  }, [silverSuccess, silverTx, address, fetchTrustAnchorData]);

  const handleSilverClaim = useCallback(async () => {
    if (!silver?.canClaim || !address) return;

    try {
      await claimSilver({
        address: CLAIM_CONTROLLER_ADDRESS,
        abi: claimControllerAbi,
        functionName: "claimSilverChest",
        args: [],
        account: address,
        chain: base,
      });
    } catch (error) {
      console.error('Silver claim error:', error);
      throw error;
    }
  }, [silver, address, claimSilver]);

  /* ================= UI ================= */
  return (
    <>
      <Header title="Chest" />

      {/* Transparency Notice */}
      <div className="mt-4 mb-4 p-4 rounded-2xl bg-blue-500/10 border border-blue-400/30">
        <div className="flex items-center gap-3">
          <span className="text-xl">ℹ️</span>
          <div>
            <p className="font-semibold text-blue-300">Daily Rewards</p>
            <p className="text-sm text-blue-400">Daily rewards are recorded on-chain on Base. Each claim contributes to monthly snapshot rewards.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        <TrustAnchor
          streak={trustAnchorData.streak}
          daysActive={trustAnchorData.daysActive}
          referrals={trustAnchorData.referrals}
          hasActiveStake={activeStakes.length > 0}
          isLoading={trustAnchorLoading}
        />
        
        <ChestCard
          title="Daily Base Chest"
          description="Claim rewards every 24 hours."
          variant="bronze"
          badge={daily?.canClaim ? "Ready" : "Cooling"}
          progress={daily?.canClaim ? 100 : 0}
          actionLabel={
            daily?.canClaim 
              ? "Claim 3 FRH • On-chain action" 
              : `Next claim in: ${formatTime(daily?.timeLeft ?? 0n)}`
          }
          actionDisabled={
            !isConnected ||
            !isBase ||
            !daily?.canClaim ||
            dailyPending ||
            dailyConfirming
          }
          onAction={handleBronzeClaim}
        />

        <ChestCard
          title="Staked Base Chest"
          description="Stake tokens to unlock higher rewards. Snapshot weight increases with staked NFTs."
          variant="silver"
          badge={
            !silver?.hasStaked
              ? "Stake required"
              : silver?.canClaim
              ? "Ready"
              : "Cooling"
          }
          actionLabel={
            silver?.canClaim
              ? "Claim 6 FRH • On-chain action"
              : `Next claim in: ${formatTime(silver?.timeLeft ?? 0n)}`
          }
          actionDisabled={
            !isConnected ||
            !isBase ||
            !silver?.hasStaked ||
            !silver?.canClaim ||
            silverPending ||
            silverConfirming
          }
          onAction={handleSilverClaim}
        />

        <ChestCard
          title="Future Rewards"
          description="More reward types coming soon."
          variant="default"
          badge="Coming Soon"
          actionLabel="Coming Soon"
          actionDisabled={true}
          onAction={() => {}}
        />
      </div>
    </>
  );
}
