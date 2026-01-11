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

import ChestCard from "@/app/components/ChestCard";
import TrustAnchor from "@/app/components/TrustAnchor";

import claimControllerAbi from "@/app/abi/claimController.json";
import { CLAIM_CONTROLLER_ADDRESS } from "@/app/constants";
/* ---------------- helpers ---------------- */
const formatTime = (seconds: bigint | number): string => {
  const s = typeof seconds === "bigint" ? Number(seconds) : seconds;
  if (!s || s <= 0) return "0h 0m";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}h ${m}m`;
};

/* ---------------- page ---------------- */
export default function ChestPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isBase = chainId === base.id;

  // Mock active stakes for now - replace with actual hook when available
  const activeStakes: any[] = [];

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

  // Update streak counter after successful daily claim (local state only)
  const [localStreak, setLocalStreak] = useState(0);
  
  useEffect(() => {
    if (dailySuccess && dailyTx) {
      // Increment local streak counter
      setLocalStreak(prev => prev + 1);
    }
  }, [dailySuccess, dailyTx]);

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

  // Update streak counter after successful silver claim (local state only)
  useEffect(() => {
    if (silverSuccess && silverTx) {
      // Increment local streak counter
      setLocalStreak(prev => prev + 1);
    }
  }, [silverSuccess, silverTx]);

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
    <div className="min-h-screen bg-gradient-to-br">
      <main className="container mx-auto px-4 py-6 max-w-lg">
        <div className="flex flex-col gap-6">
        {/* Transparency Notice */}
        <section className="glass-card rounded-3xl">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">ℹ️</span>
              <div>
                <p className="font-semibold text-white">Daily Rewards</p>
                <p className="text-sm text-white/70">Daily rewards are recorded on-chain on Base. Each claim contributes to monthly snapshot rewards.</p>
              </div>
            </div>
          </div>
        </section>

        <TrustAnchor
          streak={localStreak}
          daysActive={localStreak}
          referrals={0}
          rank={null}
          hasActiveStake={activeStakes.length > 0}
          isLoading={false}
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
      </main>
    </div>
  );
}