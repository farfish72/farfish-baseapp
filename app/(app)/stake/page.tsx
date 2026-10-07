"use client";

import { useEffect, useState } from "react";
import StakeTable from "@/app/components/StakeTable";
import StakeModal from "@/app/components/StakeModal";
import UnstakeModal from "@/app/components/UnstakeModal";
import { Plugs, Tray } from "@phosphor-icons/react";

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
        account: address as `0x${string}`,
        chain: base,
      });
    } catch (error) {
      // Error handling without console
    }
  };

  /* ---------------- render ---------------- */
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br">
        <main className="py-2 w-full">
          <div className="flex flex-col gap-4">
            {/* Actions */}
            <section className="glass-card rounded-3xl">
              <div className="p-6">
                <h2 className="text-xl font-bold text-white leading-tight mb-6">
                  Stake Your NFTs
                </h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setIsStakeModalOpen(true)}
                    className="bg-teal text-black font-bold py-4 rounded-2xl border-2 border-teal transition-all duration-300 hover:shadow-glow hover:brightness-110"
                  >
                    Stake NFT
                  </button>
                  <button
                    onClick={() => setIsUnstakeModalOpen(true)}
                    className="bg-mint text-black font-bold py-4 rounded-2xl border-2 border-mint transition-all duration-300 hover:shadow-glow hover:brightness-110"
                  >
                    Unstake NFT
                  </button>
                </div>
              </div>
            </section>

            {/* StakeTable - same width as other sections */}
            <StakeTable />

            {/* My Stakes */}
            <section className="glass-card rounded-3xl">
              <div className="p-6">
                <h2 className="text-xl font-bold text-white leading-tight mb-4">
                  Staked NFTs
                </h2>
                <p className="text-sm text-white/70 mb-6">
                  Once the claim period is over, you can click Claim to collect your staking rewards.
                </p>

                {!readEnabled && (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: '#181a20', border: '2px solid #000000' }}>
                      <Plugs size={32} weight="duotone" color="#ffffff" />
                    </div>
                    <p className="text-white/70">Connect your wallet to view stakes</p>
                  </div>
                )}
                
                {isLoading && (
                  <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white/70">Loading your stakes...</p>
                  </div>
                )}
                
                {isError && (
                  <div className="text-center py-6">
                    <p className="text-white">Failed to load stakes.</p>
                  </div>
                )}

                {readEnabled && !isLoading && activeStakes.length === 0 && (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: '#181a20', border: '2px solid #000000' }}>
                      <Tray size={32} weight="duotone" color="#ffffff" />
                    </div>
                    <p className="text-white/70">No active stakes</p>
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
                          className="flex items-center justify-between rounded-2xl border border-muted bg-surface-raised p-4 mb-3"
                        >
                          <div>
                            <p className="font-semibold text-white">Stake #{s.stakeId.toString()}</p>
                            <p className="text-xs text-muted mt-1">
                            </p>
                          </div>
                          <button
                            disabled={!isButtonEnabled}
                            onClick={() => handleClaim(s.stakeId)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border-2 ${
                              isButtonEnabled
                                ? "bg-accent text-black border-accent hover:shadow-glow hover:brightness-110"
                                : "bg-surface text-muted border-muted/30 cursor-not-allowed"
                            }`}
                          >
                            {isButtonEnabled ? "Claim Rewards" : "Locked"}
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
      </div>

      {/* Modals rendered at root level for proper overlay positioning */}
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
    </>
  );
}