"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useReadContract } from "wagmi";
import Button from "./ui/Button";
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
      setToast({ type: "success", message: "Approval confirmed. Proceeding to stake..." });
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
      setToast({ type: "success", message: "NFT staked successfully" });

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
      setToast({ type: "error", message: "Connect your wallet" });
      return;
    }

    if (!isBaseNetwork) {
      setToast({ type: "error", message: "Switch to Base Network to continue" });
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
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl max-w-md w-full p-4 shadow-2xl max-h-[85vh] flex flex-col no-button-ring">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-white">Stake NFT</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="w-8 h-8"
            aria-label="Close modal"
          >
            ✕
          </Button>
        </div>

        {!isConnected && (
          <div className="mb-3 p-3 bg-yellow-600/20 border border-yellow-600/40 rounded-lg">
            <p className="text-yellow-200 text-sm font-medium">Connect your wallet to continue.</p>
          </div>
        )}

        {isConnected && !isBaseNetwork && (
          <div className="mb-3 p-3 bg-yellow-600/20 border border-yellow-600/40 rounded-lg">
            <p className="text-yellow-200 text-sm font-medium">Switch to Base Network to continue</p>
          </div>
        )}

        {/* Category Selection */}
        <div className="mb-3">
          <h3 className="text-base font-semibold text-white mb-2">Select Your NFT</h3>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(NFT_CATEGORIES) as NFTCategory[]).map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <Button
                  key={category}
                  variant={isSelected ? 'primary' : 'outline'}
                  size="md"
                  onClick={() => setSelectedCategory(category)}
                  disabled={isPending || isResolvingTokenId}
                  className="w-full py-2"
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-base font-medium">{category}</span>
                    {isSelected && !isResolvingTokenId && (
                      <span className="text-cyan-400 text-xs">✓</span>
                    )}
                    {isSelected && isResolvingTokenId && (
                      <span className="text-xs text-slate-400">Verifying...</span>
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
          {ownershipError && selectedCategory && (
            <div className="mt-2 p-2 bg-red-900/30 border border-red-600/30 rounded-lg">
              <p className="text-red-200 text-xs">This NFT is not in your wallet</p>
            </div>
          )}
        </div>

        {/* Lock Duration Selection */}
        <div className="mb-3">
          <h3 className="text-base font-semibold text-white mb-2">Lock Duration</h3>
          <div className="grid grid-cols-4 gap-2">
            {LOCK_DURATIONS.map((duration) => (
              <Button
                key={duration}
                variant={selectedDuration === duration ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedDuration(duration)}
                disabled={isPending}
                className="w-full py-2"
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-lg font-bold">
                    {duration}d
                  </span>
                  {selectedDuration === duration && (
                    <span className="text-cyan-400 text-xs">✓</span>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Approval Status */}
        {needsApproval === true && !isApprovalSuccess && (
          <div className="mb-3 p-2 bg-blue-900/20 border border-blue-600/30 rounded-lg">
            <p className="text-blue-200 text-xs">
              Approval required to stake
            </p>
          </div>
        )}

        {/* Transaction Status */}
        {isPending && (
          <div className="mb-3 p-2 bg-blue-900/20 border border-blue-600/30 rounded-lg">
            <p className="text-blue-200 text-xs">
              {isApprovalPending || isApprovalConfirming
                ? isApprovalConfirming
                  ? "Awaiting approval confirmation..."
                  : "Approval transaction pending..."
                : isStakeConfirming
                ? "Awaiting confirmation..."
                : "Stake transaction pending..."}
            </p>
            {currentTxHash && (
              <a
                href={`${BASESCAN_URL}/${currentTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 text-xs underline mt-1 inline-block"
              >
                View on BaseScan
              </a>
            )}
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
            variant="primary"
            size="md"
            onClick={handleStake}
            disabled={!canStake || isPending}
            className="flex-1"
          >
            {isPending
              ? isApprovalPending || isApprovalConfirming
                ? "Authorizing..."
                : "Staking..."
              : needsApproval === true
              ? "Authorize & Stake"
              : "Stake NFT"}
          </Button>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div
            className={`mb-3 p-2 rounded-lg border ${
              toast.type === "success"
                ? "bg-green-900/20 border-green-600/30 text-green-200"
                : "bg-red-900/20 border-red-600/30 text-red-200"
            }`}
          >
            <p className="text-xs">{toast.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
