"use client";

import React, { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, usePublicClient, useBlockNumber } from "wagmi";
import { base } from "viem/chains";
import { STAKING_CONTRACT_ADDRESS } from "../constants";
import stakeAbi from "../abi/stake.json";
import useUserStakes from "../hooks/useUserStakes";

interface UnstakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  // Optional UX hint from parent: which stakeId to pre-select when opening.
  initialStakeId?: bigint | null;
}

const BASE_CHAIN_ID = 8453;

const getExpectedChainId = () => {
  return process.env.NEXT_PUBLIC_CHAIN_ID ? Number(process.env.NEXT_PUBLIC_CHAIN_ID) : BASE_CHAIN_ID;
};

export default function UnstakeModal({ isOpen, onClose, onSuccess, initialStakeId }: UnstakeModalProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const [selectedPosition, setSelectedPosition] = useState<ReturnType<typeof useUserStakes>["activeStakes"][number] | null>(null);

  const expectedChainId = getExpectedChainId();
  const isBaseNetwork = chainId === expectedChainId;
  const readEnabled = Boolean(isConnected && address && STAKING_CONTRACT_ADDRESS && isBaseNetwork);

  // Block timestamp tracking
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const [blockTs, setBlockTs] = useState<bigint | null>(null);

  useEffect(() => {
    if (!publicClient || !blockNumber) return;
    publicClient.getBlock({ blockNumber }).then((b) => {
      if (b?.timestamp) setBlockTs(BigInt(b.timestamp));
    });
  }, [publicClient, blockNumber]);

  // Canonical stake data – single source of truth.
  const { activeStakes, isLoading: isLoadingStakes, isError: stakesError, refetch } = useUserStakes();

  const { writeContract, data: txHash, isPending: isWritePending, error: writeError } = useWriteContract();
  const { isLoading: isTxConfirming, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const isPending = isWritePending || isTxConfirming;

  // Set initial selection by stakeId when modal opens (optional UX)
  useEffect(() => {
    if (!isOpen || !initialStakeId || !activeStakes.length) return;
    const match = activeStakes.find((p) => p.stakeId === initialStakeId);
    if (match) {
      setSelectedPosition(match);
    }
  }, [isOpen, initialStakeId, activeStakes]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedPosition(null);
    }
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle transaction success
  useEffect(() => {
    if (isTxSuccess && txHash) {
      refetch();
      // Broadcast a global staking update so other views (Profile, Chest, Stake) can refetch on-chain staking state.
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("farfish:staking-updated", {
            detail: { type: "unstake", txHash },
          }),
        );
      }
      onSuccess?.();
      onClose();
    }
  }, [isTxSuccess, txHash, refetch, onSuccess, onClose]);

  // Unstake button eligibility: Enable ONLY IF contract allows
  // unstaked === false AND unlockTimestamp > 0 AND unlockTimestamp <= block.timestamp
  const canUnstake = selectedPosition
    ? selectedPosition.unstaked === false &&
      selectedPosition.unlockTimestamp > BigInt(0) &&
      blockTs !== null &&
      selectedPosition.unlockTimestamp <= blockTs
    : false;

  const isButtonEnabled = canUnstake && !isPending;

  const handleUnstake = () => {
    if (!isButtonEnabled || !address || !STAKING_CONTRACT_ADDRESS || !selectedPosition) return;

    if (!isConnected || !isBaseNetwork) return;

    writeContract({
      address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
      abi: stakeAbi as any,
      functionName: "unstake",
      args: [selectedPosition.stakeId],
      account: address as `0x${string}`,
      chain: base,
    } as any);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/80 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl max-w-md w-full p-4 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Unstake NFT</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-xl"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Warning Notice */}
        <div className="mb-4 p-4 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-slate-900">⚠️</span>
            <p className="text-sm font-semibold text-slate-900">Warning</p>
          </div>
          <div className="text-sm text-slate-900 space-y-1">
            <p>• Unstaking removes your NFT from the protocol</p>
            <p>• You will stop earning rewards after unstaking</p>
          </div>
        </div>

        {/* Description */}
        <p className="mb-4 text-sm text-slate-300">
          When your claim period ends, you will be able to unstake your NFT.
          For more information, please refer to the master reward parameters.
        </p>

        {/* Stake list */}
        {!isConnected ? (
          <div className="mb-4 p-4 bg-yellow-600/20 border border-yellow-600/40 rounded-xl">
            <p className="text-yellow-200 text-center">Connect wallet to view positions.</p>
          </div>
        ) : isLoadingStakes ? (
          <div className="mb-4 p-4 bg-slate-800/30 border border-slate-600/50 rounded-xl">
            <p className="text-slate-300 text-center">Loading staked positions...</p>
          </div>
        ) : stakesError && activeStakes.length === 0 ? (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-600/30 rounded-xl">
            <p className="text-red-200 text-center">Failed to load your staked positions. Please try again.</p>
          </div>
        ) : !stakesError && !isLoadingStakes && activeStakes.length === 0 ? (
          <div className="mb-4 p-4 bg-slate-800/30 border border-slate-600/50 rounded-xl">
            <p className="text-slate-300 text-center">You have no staked positions to unstake.</p>
          </div>
        ) : (
          <div className="mb-4">
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {activeStakes
                .filter((s) => s.error !== true)
                .map((position) => {
                  const isSelected = selectedPosition?.stakeId === position.stakeId;

                  return (
                    <button
                      key={position.stakeId.toString()}
                      type="button"
                      onClick={() => {
                        setSelectedPosition(position);
                      }}
                      disabled={isPending}
                      className={`w-full rounded-xl p-4 border transition-all duration-200 ${
                        isSelected
                          ? "border-cyan-400 bg-cyan-400/10"
                          : "border-slate-600/50 bg-slate-800/30 hover:bg-slate-700/50"
                      } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <span className="text-lg font-medium text-white">
                        Stake #{position.stakeId.toString()}
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 mt-auto">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 py-4 px-6 bg-slate-800/50 border border-slate-600/50 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUnstake}
            disabled={!isButtonEnabled}
            className="flex-1 py-4 px-6 bg-slate-700/50 border border-slate-600/50 hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
          >
            {isPending ? "Unstaking..." : "Unstake"}
          </button>
        </div>
      </div>
    </div>
  );
}

