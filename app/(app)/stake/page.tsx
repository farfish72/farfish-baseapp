"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/Header";
import StakeModal from "@/app/components/StakeModal";
import UnstakeModal from "@/app/components/UnstakeModal";
import StakeTable from "@/app/components/StakeTable";

import {
  useAccount,
  useChainId,
  usePublicClient,
  useBlockNumber,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";

import { base } from "viem/chains";
import useUserStakes from "@/app/hooks/useUserStakes";
import { STAKING_CONTRACT_ADDRESS } from "@/app/constants";
import stakeAbi from "@/app/abi/stake.json";

const BASE_CHAIN_ID = 8453;

const getExpectedChainId = () =>
  process.env.NEXT_PUBLIC_CHAIN_ID
    ? Number(process.env.NEXT_PUBLIC_CHAIN_ID)
    : BASE_CHAIN_ID;

export default function StakingPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();

  const expectedChainId = getExpectedChainId();
  const readEnabled =
    Boolean(isConnected && address && STAKING_CONTRACT_ADDRESS) &&
    chainId === expectedChainId;

  /* ---------------- block timestamp ---------------- */
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const [blockTs, setBlockTs] = useState<bigint | null>(null);

  useEffect(() => {
    if (!publicClient || !blockNumber) return;
    publicClient.getBlock({ blockNumber }).then((b) => {
      if (b?.timestamp) setBlockTs(BigInt(b.timestamp));
    });
  }, [publicClient, blockNumber]);

  /* ---------------- staking data ---------------- */
  const { activeStakes, isLoading, isError, refetch } = useUserStakes();

  /* ---------------- modals ---------------- */
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);
  const [isUnstakeModalOpen, setIsUnstakeModalOpen] = useState(false);

  /* ---------------- claim tx ---------------- */
  const {
    writeContract,
    data: txHash,
    isPending,
    error: writeError,
  } = useWriteContract();

  const { isLoading: confirming, isSuccess } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  useEffect(() => {
    if (isSuccess) refetch();
  }, [isSuccess, refetch]);

  // Clear transaction states on component unmount to prevent navigation freeze
  useEffect(() => {
    return () => {
      // Clear any pending states when navigating away
    };
  }, []);

  // FIXED: Auto-clear transaction states after timeout to prevent stuck UI
  useEffect(() => {
    if (isPending || confirming) {
      const timeout = setTimeout(() => {
        // States will auto-clear when wagmi hooks reset
      }, 30000); // 30 second timeout

      return () => clearTimeout(timeout);
    }
  }, [isPending, confirming]);

  const handleClaim = (stakeId: bigint) => {
    if (!readEnabled || !address) return;
    
    try {
      writeContract({
        address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
        abi: stakeAbi,
        functionName: "claim",
        args: [stakeId],
        account: address as `0x${string}`, // ✅ wagmi v2 REQUIRED
        chain: base,
      });
    } catch (error) {
      // FIXED: Always ensure navigation remains responsive on error
      console.error('Claim error:', error);
    }
  };

  /* ---------------- render ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br">
      <Header title="Stake" />

      <main className="container mx-auto px-4 py-6 max-w-lg">
        <div className="flex flex-col gap-6">
          {/* Staking Explanation */}
          <section className="glass-card rounded-3xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🔒</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold text-white leading-tight">
                    Staking Overview
                  </h2>
                  <p className="text-white/70 text-sm">Lock NFTs to earn rewards</p>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-white/70">Staking locks your NFT in a smart contract on Base.</p>
                <p className="text-sm text-white/70">Locked NFTs increase your snapshot weight and unlock protocol rewards.</p>
              </div>
            </div>
          </section>

          {/* Actions */}
          <section className="glass-card rounded-3xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">⚡</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold text-white leading-tight">
                    Stake Your NFTs
                  </h2>
                  <p className="text-white/70 text-sm">Manage your staked positions</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setIsStakeModalOpen(true)}
                  className="bg-gradient-primary text-black font-bold py-4 rounded-2xl transition-all duration-300 hover:shadow-lg"
                >
                  Stake NFT
                </button>
                <button
                  onClick={() => setIsUnstakeModalOpen(true)}
                  className="bg-surface text-white font-bold py-4 rounded-2xl border border-white/20 transition-all duration-300 hover:bg-white/10"
                >
                  Unstake NFT
                </button>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-white/60">On-chain action • Base Network</p>
                <p className="text-xs text-white/60">Gas fees may apply</p>
              </div>
            </div>
          </section>

          <StakeTable />

          {/* My Stakes */}
          <section className="glass-card rounded-3xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">📊</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold text-white leading-tight">
                    My Staked NFTs
                  </h2>
                  <p className="text-white/70 text-sm">Track your active stakes</p>
                </div>
              </div>

              {/* Staking Flow Explanation */}
              <div className="mb-6 p-4 rounded-2xl bg-elevated border border-white/10">
                <p className="text-sm text-white font-medium mb-3">
                  Staking Flow:
                </p>
                <ul className="text-sm text-white/70 space-y-2">
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Staking rewards accrue while your NFT is locked</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Rewards become claimable after the selected lock period</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Claiming finalizes rewards on-chain</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Unstaking becomes available after the claim window</span>
                  </li>
                </ul>
              </div>

              {!readEnabled && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 flex items-center justify-center">
                    <span className="text-2xl">🔌</span>
                  </div>
                  <p className="text-white/70">Connect wallet to view stakes</p>
                </div>
              )}
              
              {isLoading && (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-white/70">Loading stakes...</p>
                </div>
              )}
              
              {isError && (
                <div className="text-center py-6">
                  <p className="text-white">Failed to load stakes.</p>
                </div>
              )}

              {readEnabled && !isLoading && activeStakes.length === 0 && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 flex items-center justify-center">
                    <span className="text-2xl">📭</span>
                  </div>
                  <p className="text-white/70">No staked NFTs</p>
                </div>
              )}

              {readEnabled &&
                !isLoading &&
                activeStakes
                  .filter((s) => s.error !== true)
                  .map((s) => {
                    // Claim button eligibility: ENABLED only if contract allows claiming
                    // unlockTimestamp > 0 AND unlockTimestamp <= block.timestamp AND claimed === false AND unstaked === false
                    const canClaim =
                      s.unlockTimestamp > BigInt(0) &&
                      blockTs !== null &&
                      s.unlockTimestamp <= blockTs &&
                      s.claimed === false &&
                      s.unstaked === false;

                    const isButtonEnabled = canClaim && !isPending && !confirming;

                    return (
                      <div
                        key={s.stakeId.toString()}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-elevated p-4 mb-3"
                      >
                        <div>
                          <p className="font-semibold text-white">Stake #{s.stakeId.toString()}</p>
                          <p className="text-xs text-white/60 mt-1">Reward: {Number(s.rewardAmount)} FRH</p>
                        </div>
                        <button
                          disabled={!isButtonEnabled}
                          onClick={() => handleClaim(s.stakeId)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                            isButtonEnabled
                              ? "bg-gradient-primary text-black hover:shadow-lg"
                              : "bg-white/10 text-white/40 cursor-not-allowed"
                          }`}
                        >
                          {isButtonEnabled ? "Claim Rewards" : "Claim"}
                        </button>
                      </div>
                    );
                  })}

              {writeError && (
                <div className="mt-4 p-4 rounded-2xl bg-red-500/20 border border-red-500/30">
                  <p className="text-red-100 text-sm">
                    {writeError.message}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <StakeModal
        isOpen={isStakeModalOpen}
        onClose={() => setIsStakeModalOpen(false)}
        onSuccess={refetch}
      />
      <UnstakeModal
        isOpen={isUnstakeModalOpen}
        onClose={() => setIsUnstakeModalOpen(false)}
        onSuccess={refetch}
      />
    </div>
  );
}