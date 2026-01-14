"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useReadContract } from "wagmi";
import { STAKING_CONTRACT_ADDRESS, NFT_CONTRACT_ADDRESS, LOCK_DURATIONS } from "../constants";
import stakeAbi from "../abi/stake.json";
import nftDropAbi from "../abi/nftDrop.json";
import { getPublicClient } from "@wagmi/core";
import { wagmiConfig } from "../lib/wagmi";
import { base } from "viem/chains";

interface StakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type LockDuration = typeof LOCK_DURATIONS[number];

// Category → Token Range Map (ON-CHAIN REALITY)
const NFT_CATEGORIES = {
  BlueFin: [0, 1, 2, 3, 4, 5, 6],
  GoldRay: [7, 8, 9, 10, 11],
  RedSpike: [12, 13, 14],
  ShadowGill: [15],
} as const;

type NFTCategory = keyof typeof NFT_CATEGORIES;

const BASESCAN_URL = "https://basescan.org/tx";
const BASE_CHAIN_ID = 8453;

export default function StakeModal({ isOpen, onClose, onSuccess }: StakeModalProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [selectedCategory, setSelectedCategory] = useState<NFTCategory | null>(null);
  const [resolvedTokenId, setResolvedTokenId] = useState<number | null>(null);
  const [isResolvingTokenId, setIsResolvingTokenId] = useState(false);
  const [ownershipError, setOwnershipError] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<LockDuration>(30);
  const [toast, setToast] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [needsApproval, setNeedsApproval] = useState<boolean | null>(true);

  const expectedChainId = process.env.NEXT_PUBLIC_CHAIN_ID ? Number(process.env.NEXT_PUBLIC_CHAIN_ID) : BASE_CHAIN_ID;
  const isBaseNetwork = chainId === expectedChainId;
  const readEnabled = Boolean(isConnected && address && NFT_CONTRACT_ADDRESS && STAKING_CONTRACT_ADDRESS && isBaseNetwork);

  // Check if user has approved the staking contract
  const { data: isApproved, refetch: refetchApproval } = useReadContract({
    address: NFT_CONTRACT_ADDRESS as `0x${string}`,
    abi: nftDropAbi,
    functionName: "isApprovedForAll",
    args: address && STAKING_CONTRACT_ADDRESS ? [address as `0x${string}`, STAKING_CONTRACT_ADDRESS as `0x${string}`] : undefined,
    query: { enabled: readEnabled },
  } as any);

  const { writeContract: writeApproval, data: approvalTx, isPending: isApprovalPending, error: approvalError } = useWriteContract();
  const { writeContract: writeStake, data: stakeTx, isPending: isStakePending, error: stakeError } = useWriteContract();

  // Wait for approval transaction
  const { isLoading: isApprovalConfirming, isSuccess: isApprovalSuccess } = useWaitForTransactionReceipt({
    hash: approvalTx,
  });

  // Wait for stake transaction
  const { isLoading: isStakeConfirming, isSuccess: isStakeSuccess } = useWaitForTransactionReceipt({
    hash: stakeTx,
  });

  const isPending = isApprovalPending || isApprovalConfirming || isStakePending || isStakeConfirming;
  const currentTxHash = approvalTx || stakeTx;

  const canStake = isConnected && isBaseNetwork && resolvedTokenId !== null && selectedDuration && !isResolvingTokenId && !ownershipError;

  // Update needsApproval when approval status changes
  useEffect(() => {
    if (isApproved !== undefined) {
      setNeedsApproval(!isApproved);
    }
  }, [isApproved]);

  // Clear transaction states on component unmount to prevent navigation freeze
  useEffect(() => {
    return () => {
      setNeedsApproval(true);
      setResolvedTokenId(null);
      setOwnershipError(null);
      setIsResolvingTokenId(false);
      setToast(null);
    };
  }, []);

  // Resolve tokenId when category is selected
  useEffect(() => {
    const resolveTokenId = async () => {
      if (!selectedCategory || !readEnabled || !address || !NFT_CONTRACT_ADDRESS) {
        setResolvedTokenId(null);
        setOwnershipError(null);
        return;
      }

      setIsResolvingTokenId(true);
      setOwnershipError(null);

      try {
        const publicClient = getPublicClient(wagmiConfig, { chainId: base.id });
        if (!publicClient) {
          setResolvedTokenId(null);
          setOwnershipError(null);
          setIsResolvingTokenId(false);
          return;
        }

        const tokenIds = NFT_CATEGORIES[selectedCategory];
        
        // Iterate through tokenIds and find first one with balance > 0
        for (const tokenId of tokenIds) {
          try {
            const balance = await publicClient.readContract({
              address: NFT_CONTRACT_ADDRESS as `0x${string}`,
              abi: nftDropAbi,
              functionName: "balanceOf",
              args: [address as `0x${string}`, BigInt(tokenId)],
            }) as bigint;

            if (balance > BigInt(0)) {
              setResolvedTokenId(tokenId);
              setOwnershipError(null);
              setIsResolvingTokenId(false);
              return;
            }
          } catch (err) {
            // Continue to next tokenId
          }
        }

        // No tokenId found with balance > 0
        setResolvedTokenId(null);
        setOwnershipError("You do not own this NFT");
        setIsResolvingTokenId(false);
      } catch (error) {
        setResolvedTokenId(null);
        setOwnershipError(null);
        setIsResolvingTokenId(false);
      }
    };

    resolveTokenId();
  }, [selectedCategory, readEnabled, address, NFT_CONTRACT_ADDRESS]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedCategory(null);
      setResolvedTokenId(null);
      setIsResolvingTokenId(false);
      setOwnershipError(null);
      setSelectedDuration(30);
      setToast(null);
      setNeedsApproval(null);
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

  // Refetch approval status when modal opens
  useEffect(() => {
    if (isOpen && readEnabled) {
      refetchApproval();
    }
  }, [isOpen, readEnabled, refetchApproval]);

  const proceedWithStake = useCallback(() => {
    if (!address || !STAKING_CONTRACT_ADDRESS || resolvedTokenId === null || !selectedDuration) return;

    const lockDurationSeconds = BigInt(selectedDuration * 86400);

    try {
      writeStake({
        address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
        abi: stakeAbi,
        functionName: "stake",
        args: [BigInt(resolvedTokenId), lockDurationSeconds],
      } as any);
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      if (errorMsg.includes("mint") || errorMsg.includes("Mint") || errorMsg.includes("revert")) {
        setToast({ type: "error", message: "Rewards temporarily unavailable — contact support." });
      } else {
        setToast({ type: "error", message: `Transaction failed: ${errorMsg}` });
      }
    }
  }, [address, STAKING_CONTRACT_ADDRESS, resolvedTokenId, selectedDuration, writeStake]);

  // Handle approval transaction success
  useEffect(() => {
    if (isApprovalSuccess && approvalTx) {
      setToast({ type: "success", message: "Approval confirmed! Proceeding to stake..." });
      refetchApproval();
      // After approval, automatically proceed to stake
      setTimeout(() => {
        proceedWithStake();
      }, 1000);
    }
  }, [isApprovalSuccess, approvalTx, refetchApproval, proceedWithStake]);

  // Handle stake transaction success
  useEffect(() => {
    if (isStakeSuccess && stakeTx) {
      setToast({ type: "success", message: "NFT staked successfully!" });

      // Broadcast a global staking update so other parts of the app (Profile, Chest, Stake page)
      // can refetch on-chain data such as getUserStakeIds, profile stats, and chest eligibility.
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("farfish:staking-updated", {
            detail: { type: "stake", txHash: stakeTx },
          }),
        );
      }

      // Let the parent trigger its own refetch and close the modal after a brief success state.
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    }
  }, [isStakeSuccess, stakeTx, onSuccess, onClose]);

  // Reset pending states when modal closes to prevent stuck loading
  useEffect(() => {
    if (!isOpen) {
      // Force reset by clearing any pending transaction states
      // The wagmi hooks will handle the actual state, but we ensure modal is clean
    }
  }, [isOpen]);

  // Handle approval errors
  useEffect(() => {
    if (approvalError) {
      const errorMsg = approvalError.message || String(approvalError);
      setToast({ type: "error", message: `Approval failed: ${errorMsg}` });
    }
  }, [approvalError]);

  // Handle stake errors
  useEffect(() => {
    if (stakeError) {
      const errorMsg = stakeError.message || String(stakeError);
      if (errorMsg.includes("mint") || errorMsg.includes("Mint") || errorMsg.includes("revert")) {
        setToast({ type: "error", message: "Rewards temporarily unavailable — contact support." });
      } else {
        setToast({ type: "error", message: `Transaction failed: ${errorMsg}` });
      }
    }
  }, [stakeError]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleStake = () => {
    if (!canStake || !address || !STAKING_CONTRACT_ADDRESS || !NFT_CONTRACT_ADDRESS || resolvedTokenId === null || !selectedDuration) return;

    // Precondition checks
    if (!isConnected) {
      setToast({ type: "error", message: "Please connect your wallet" });
      return;
    }

    if (!isBaseNetwork) {
      setToast({ type: "error", message: `Please switch to the correct network (chainId ${expectedChainId})` });
      return;
    }

    // Check if approval is needed
    if (needsApproval === true) {
      // Request approval from user wallet
      try {
        writeApproval({
          address: NFT_CONTRACT_ADDRESS as `0x${string}`,
          abi: nftDropAbi,
          functionName: "setApprovalForAll",
          args: [STAKING_CONTRACT_ADDRESS as `0x${string}`, true],
        } as any);
        setToast({ type: "success", message: "Please approve the transaction in your wallet..." });
      } catch (error: any) {
        const errorMsg = error?.message || String(error);
        setToast({ type: "error", message: `Approval failed: ${errorMsg}` });
      }
    } else if (needsApproval === false) {
      // Already approved, proceed with staking
      proceedWithStake();
    } else {
      // Approval status not yet loaded, wait a moment and retry
      setTimeout(() => {
        refetchApproval();
        if (isApproved) {
          proceedWithStake();
        } else {
          setToast({ type: "error", message: "Please wait for approval status to load..." });
        }
      }, 500);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/80 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl max-w-md w-full p-4 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Stake NFT</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-xl"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {!isConnected && (
          <div className="mb-4 p-4 bg-yellow-600/20 border border-yellow-600/40 rounded-xl">
            <p className="text-yellow-200 font-medium">Please connect your wallet to stake NFTs.</p>
          </div>
        )}

        {isConnected && !isBaseNetwork && (
          <div className="mb-4 p-4 bg-yellow-600/20 border border-yellow-600/40 rounded-xl">
            <p className="text-yellow-200 font-medium">Please switch to the correct network (chainId {expectedChainId}).</p>
          </div>
        )}

        {/* Category Selection */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white mb-3">Select NFT</h3>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(NFT_CATEGORIES) as NFTCategory[]).map((category) => {
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  disabled={isPending || isResolvingTokenId}
                  className={`rounded-xl p-4 border transition-all duration-200 ${
                    selectedCategory === category
                      ? "border-cyan-400 bg-cyan-400/10"
                      : "border-slate-600/50 bg-slate-800/30 hover:bg-slate-700/50"
                  } ${isPending || isResolvingTokenId ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span className="text-lg font-medium text-white">{category}</span>
                  {selectedCategory === category && isResolvingTokenId && (
                    <span className="text-xs text-slate-400 mt-1 block">Checking ownership...</span>
                  )}
                </button>
              );
            })}
          </div>
          {ownershipError && selectedCategory && (
            <div className="mt-3 p-3 bg-red-900/30 border border-red-600/30 rounded-xl">
              <p className="text-red-200 text-sm">{ownershipError}</p>
            </div>
          )}
        </div>

        {/* Lock Duration Selection */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white mb-3">Select Lock Duration</h3>
          <div className="grid grid-cols-4 gap-3">
            {LOCK_DURATIONS.map((duration) => (
              <button
                key={duration}
                type="button"
                onClick={() => setSelectedDuration(duration)}
                disabled={isPending}
                className={`rounded-xl p-4 border text-center transition-all duration-200 ${
                  selectedDuration === duration
                    ? "border-cyan-400 bg-cyan-400/10"
                    : "border-slate-600/50 bg-slate-800/30 hover:bg-slate-700/50"
                } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span className="text-lg font-bold text-white">{duration}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Approval Status */}
        {needsApproval === true && !isApprovalSuccess && (
          <div className="mb-4 p-4 bg-blue-900/20 border border-blue-600/30 rounded-xl">
            <p className="text-blue-200 text-sm">
              Approval required: Please approve the staking contract to transfer your NFTs.
            </p>
          </div>
        )}

        {/* Transaction Status */}
        {isPending && (
          <div className="mb-4 p-4 bg-blue-900/20 border border-blue-600/30 rounded-xl">
            <p className="text-blue-200 text-sm">
              {isApprovalPending || isApprovalConfirming
                ? isApprovalConfirming
                  ? "Confirming approval..."
                  : "Approval transaction pending..."
                : isStakeConfirming
                ? "Confirming stake..."
                : "Stake transaction pending..."}
            </p>
            {currentTxHash && (
              <a
                href={`${BASESCAN_URL}/${currentTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 text-sm underline mt-2 inline-block"
              >
                View on BaseScan
              </a>
            )}
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
            onClick={handleStake}
            disabled={!canStake || isPending}
            className="flex-1 py-4 px-6 bg-slate-700/50 border border-slate-600/50 hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
          >
            {isPending
              ? isApprovalPending || isApprovalConfirming
                ? "Approving..."
                : "Staking..."
              : needsApproval === true
              ? "Approve & Stake"
              : "Stake"}
          </button>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div
            className={`mb-4 p-4 rounded-xl border ${
              toast.type === "success"
                ? "bg-green-900/20 border-green-600/30 text-green-200"
                : "bg-red-900/20 border-red-600/30 text-red-200"
            }`}
          >
            <p className="text-sm">{toast.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
