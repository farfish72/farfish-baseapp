"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import {
  useAccount,
  useChainId,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { base } from "viem/chains";
import { getBuilderCodeSuffix } from "@/app/lib/builderCode";

import ChestCard from "@/app/components/ChestCard";
import TrustAnchor from "@/app/components/TrustAnchor";

import claimControllerAbi from "@/app/abi/claimController.json";
import { CLAIM_CONTROLLER_ADDRESS } from "@/app/constants";
import { useNFTStatus } from "@/app/hooks/useNFTStatus";
import useUserStakes from "@/app/hooks/useUserStakes";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // NFT status hooks
  const { hasMintedNFT } = useNFTStatus();
  const { stakes } = useUserStakes();

  // Check if user has active stakes
  const hasActiveStake = stakes.some(stake => !stake.unstaked && !stake.claimed);

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
        dataSuffix: getBuilderCodeSuffix(), // Builder Code attribution
      });
    } catch (error) {
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
        dataSuffix: getBuilderCodeSuffix(), // Builder Code attribution
      });
    } catch (error) {
      throw error;
    }
  }, [silver, address, claimSilver]);

  /* ================= UI ================= */
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2 w-full">
      <div className="flex flex-col gap-4">

      <TrustAnchor
        hasActiveStake={hasActiveStake}
        hasMintedNFT={hasMintedNFT}
      />
        
        <ChestCard
          title="Daily Bronze Chest"
          description="Opens every 24 hours."
          variant="bronze"
          badge={daily?.canClaim ? "Ready" : "Cooling"}
          progress={daily?.canClaim ? 100 : 0}
          actionLabel={
            daily?.canClaim 
              ? "Claim 3 FRH • On-chain transaction" 
              : `Available in: ${formatTime(daily?.timeLeft ?? 0n)}`
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
          title="Silver Chest"
          description="Requires an active NFT stake."
          variant="silver"
          badge={
            !silver?.hasStaked
              ? "Stake required"
              : silver?.canClaim
              ? "Ready"
              : "Cooling"
          }
          progress={daily?.canClaim ? 100 : 0}
          actionLabel={
            silver?.canClaim
              ? "Claim 6 FRH • On-chain transaction"
              : `Available in: ${formatTime(silver?.timeLeft ?? 0n)}`
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
          title="Gold Chest"
          description="Staking milestone rewards coming."
          variant="default"
          badge="Next Up"
          actionLabel="Next Up"
          progress={daily?.canClaim ? 100 : 0}
          actionDisabled={true}
          onAction={() => {}}
        />
        </div>
    </div>
  );
}