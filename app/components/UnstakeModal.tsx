"use client";

import React, { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, usePublicClient, useBlockNumber } from "wagmi";
import { base } from "viem/chains";
import Button from "./ui/Button";
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
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl max-w-md w-full p-4 shadow-2xl max-h-[85vh] flex flex-col no-button-ring">
        <div className="mb-3">
          <h2 className="text-lg font-bold text-white mb-2">Unstake NFT</h2>
          <p className="text-xs text-slate-300 mb-1">
            Release your NFT after the lock period ends.
          </p>
          <p className="text-xs text-slate-300">
            Connect your wallet to see locked NFTs.
          </p>
        </div>

        {/* Stake list */}
        {!isConnected ? (
          <div className="mb-3 p-3 bg-yellow-600/20 border border-yellow-600/40 rounded-lg">
            <p className="text-yellow-200 text-xs text-center">Connect your wallet to view positions</p>
          </div>
        ) : isLoadingStakes ? (
          <div className="mb-3 p-3 bg-slate-800/30 border border-slate-600/50 rounded-lg">
            <p className="text-slate-300 text-xs text-center">Loading...</p>
          </div>
        ) : stakesError && activeStakes.length === 0 ? (
          <div className="mb-3 p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
            <p className="text-red-200 text-xs text-center">Failed to load stakes</p>
          </div>
        ) : !stakesError && !isLoadingStakes && activeStakes.length === 0 ? (
          <div className="mb-3 p-3 bg-slate-800/30 border border-slate-600/50 rounded-lg">
            <p className="text-slate-300 text-xs text-center">No active stakes</p>
          </div>
        ) : (
          <div className="mb-3">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {activeStakes
                .filter((s) => s.error !== true)
                .map((position) => {
                  const isSelected = selectedPosition?.stakeId === position.stakeId;

                  return (
                    <Button
                      key={position.stakeId.toString()}
                      variant={isSelected ? 'primary' : 'outline'}
                      size="md"
                      onClick={() => {
                        setSelectedPosition(position);
                      }}
                      disabled={isPending}
                      className="w-full py-2"
                    >
                      <span className="text-base font-medium">
                        Stake #{position.stakeId.toString()}
                      </span>
                    </Button>
                  );
                })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-auto">
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={isPending}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={handleUnstake}
            disabled={!isButtonEnabled}
            className="flex-1"
          >
            {isPending ? "Unstaking..." : "Unstake NFT"}
          </Button>
        </div>
      </div>
    </div>
  );
}
