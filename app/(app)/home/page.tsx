/**
 * Base App Mint Flow - Pure Consumer App
 * 
 * Mint exactly 1 NFT per click, contract-enforced validation only.
 * No quantity selectors, no price display, no local restrictions.
 */
"use client";

import Image from "next/image";
import Header from "@/app/components/Header";
import BaseAuthGuard from "@/app/components/BaseAuthGuard";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { getPublicClient } from "@wagmi/core";
import { wagmiConfig } from "@/app/lib/wagmi";
import { NFT_CONTRACT_ADDRESS, getNameFromTokenId } from "@/app/constants";
import nftDropAbi from "@/app/abi/nftDrop.json";
import { base } from "viem/chains";
import { useToast, ToastProvider } from "@/app/providers/ToastProvider";
import { handleTransactionError } from "@/app/utils/errorHandling";

interface SupplyInfo {
  id: number;
  totalSupply: bigint;
  maxTotalSupply: bigint;
  remaining: bigint;
}

interface ClaimCondition {
  startTimestamp: bigint;
  maxClaimableSupply: bigint;
  supplyClaimed: bigint;
  quantityLimitPerWallet: bigint;
  merkleRoot: `0x${string}`;
  pricePerToken: bigint;
  currency: `0x${string}`;
  metadata: string;
}

interface TokenClaimInfo {
  tokenId: number;
  condition: ClaimCondition | null;
  activeConditionId: bigint | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Weighted random selection using browser crypto API.
 * Returns the selected tokenId from candidates based on remaining supply weights.
 */
function pickWeightedTokenId(candidates: SupplyInfo[]): number {
  if (candidates.length === 0) {
    throw new Error("No candidates available");
  }

  // Calculate total weight (sum of all remaining supplies)
  const totalWeight = candidates.reduce((sum, item) => sum + item.remaining, BigInt(0));

  if (totalWeight === BigInt(0)) {
    throw new Error("All tokens are sold out");
  }

  // Generate random number using crypto API
  const randomArray = new Uint32Array(1);
  crypto.getRandomValues(randomArray);
  const randomValue = randomArray[0];

  // Convert to BigInt and scale to [0, totalWeight)
  // Use modulo to map random value into the weight range
  const randomBigInt = BigInt(randomValue);
  const scaledRandom = randomBigInt % totalWeight;

  // Walk through candidates to find the selected one
  let accumulated = BigInt(0);
  for (const candidate of candidates) {
    accumulated += candidate.remaining;
    if (scaledRandom < accumulated) {
      return candidate.id;
    }
  }

  // Fallback to last candidate (should not happen)
  return candidates[candidates.length - 1].id;
}

const TOKEN_IDS = Array.from({ length: 16 }, (_, i) => i); // 0-15

function HomeClient() {
  const { address } = useAccount();
  const { showError, showSuccess, clearAll } = useToast();

  // State
  const [supplyInfo, setSupplyInfo] = useState<SupplyInfo[]>([]);
  const [loadingSupplies, setLoadingSupplies] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [lastMintedTokenId, setLastMintedTokenId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [claimInfo, setClaimInfo] = useState<Map<number, TokenClaimInfo>>(new Map());
  const [loadingClaimConditions, setLoadingClaimConditions] = useState(false);
  const [mintMessage, setMintMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const {
    writeContract: writeMint,
    data: mintTxHash,
    isPending: isMintPending,
    error: mintError,
  } = useWriteContract();
  const {
    isLoading: isMintConfirming,
    isSuccess: isMintConfirmed,
  } = useWaitForTransactionReceipt({
    hash: mintTxHash,
  });

  // Fetch claim conditions for a specific tokenId
  const fetchClaimCondition = useCallback(async (tokenId: number): Promise<TokenClaimInfo> => {
    if (typeof window === "undefined" || !NFT_CONTRACT_ADDRESS) {
      return {
        tokenId,
        condition: null,
        activeConditionId: null,
        isLoading: false,
        error: "Contract not available",
      };
    }

    try {
      const publicClient = getPublicClient(wagmiConfig, { chainId: base.id });
      if (!publicClient) {
        return {
          tokenId,
          condition: null,
          activeConditionId: null,
          isLoading: false,
          error: "Public client not available",
        };
      }

      // Get active claim condition ID
      const activeConditionId = (await (publicClient.readContract as any)({
        address: NFT_CONTRACT_ADDRESS as `0x${string}`,
        abi: nftDropAbi as any,
        functionName: "getActiveClaimConditionId",
        args: [BigInt(tokenId)],
      })) as bigint;

      // If no active condition, return error
      if (activeConditionId === BigInt(0)) {
        return {
          tokenId,
          condition: null,
          activeConditionId: null,
          isLoading: false,
          error: "No active claim condition",
        };
      }

      // Get claim condition details
      const condition = (await (publicClient.readContract as any)({
        address: NFT_CONTRACT_ADDRESS as `0x${string}`,
        abi: nftDropAbi as any,
        functionName: "getClaimConditionById",
        args: [BigInt(tokenId), activeConditionId],
      })) as ClaimCondition;

      return {
        tokenId,
        condition,
        activeConditionId,
        isLoading: false,
        error: null,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (errorMessage.includes("DropNoActiveCondition") || errorMessage.includes("execution reverted")) {
        return {
          tokenId,
          condition: null,
          activeConditionId: null,
          isLoading: false,
          error: "No active claim condition on-chain",
        };
      }
      return {
        tokenId,
        condition: null,
        activeConditionId: null,
        isLoading: false,
        error: errorMessage,
      };
    }
  }, []);

  // Fetch claim conditions for all tokenIds
  const fetchAllClaimConditions = useCallback(async () => {
    if (typeof window === "undefined" || !NFT_CONTRACT_ADDRESS) return;

    setLoadingClaimConditions(true);
    try {
      const claimPromises = TOKEN_IDS.map((id) => fetchClaimCondition(id));
      const results = await Promise.all(claimPromises);
      
      const newMap = new Map<number, TokenClaimInfo>();
      results.forEach((info) => {
        newMap.set(info.tokenId, info);
      });
      setClaimInfo(newMap);
    } catch (error) {
      // Silent error handling
    } finally {
      setLoadingClaimConditions(false);
    }
  }, [fetchClaimCondition]);

  // Fetch supply info for all tokenIds (0-15)
  const fetchSupplyInfo = useCallback(async () => {
    if (typeof window === "undefined" || !NFT_CONTRACT_ADDRESS) return;

    setLoadingSupplies(true);
    setErrorMessage(null);

    try {
      const publicClient = getPublicClient(wagmiConfig, { chainId: base.id });
      if (!publicClient) {
        setErrorMessage("Public client not available");
        return;
      }

      const supplyPromises = TOKEN_IDS.map(async (id) => {
        const [totalSupply, maxTotalSupply] = await Promise.all([
          (publicClient.readContract as any)({
            address: NFT_CONTRACT_ADDRESS as `0x${string}`,
            abi: nftDropAbi as any,
            functionName: "totalSupply",
            args: [BigInt(id)],
          }) as Promise<bigint>,
          (publicClient.readContract as any)({
            address: NFT_CONTRACT_ADDRESS as `0x${string}`,
            abi: nftDropAbi as any,
            functionName: "maxTotalSupply",
            args: [BigInt(id)],
          }) as Promise<bigint>,
        ]);

        const remaining = maxTotalSupply > totalSupply ? maxTotalSupply - totalSupply : BigInt(0);

        return {
          id,
          totalSupply,
          maxTotalSupply,
          remaining,
        } as SupplyInfo;
      });

      const supplies = await Promise.all(supplyPromises);
      setSupplyInfo(supplies);
    } catch (error) {
      setErrorMessage("Failed to load supply data");
    } finally {
      setLoadingSupplies(false);
    }
  }, []);

  // Fetch supply info and claim conditions on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      fetchSupplyInfo();
      fetchAllClaimConditions();
    }
  }, [fetchSupplyInfo, fetchAllClaimConditions]);

  // Handle mint success
  useEffect(() => {
    if (isMintConfirmed && mintTxHash) {
      fetchSupplyInfo();
      fetchAllClaimConditions();
      setIsMinting(false);
      setMintMessage({ type: 'success', text: 'Mint successful' });
    }
  }, [isMintConfirmed, mintTxHash, fetchSupplyInfo, fetchAllClaimConditions]);

  // Handle mint errors
  useEffect(() => {
    if (mintError) {
      setIsMinting(false);
      const appError = handleTransactionError(mintError);
      // Only show error if it's not a user cancellation
      if (appError.shouldShow) {
        setMintMessage({ type: 'error', text: appError.message });
      }
    }
  }, [mintError]);

  // Clear transaction states on component unmount
  useEffect(() => {
    return () => {
      setIsMinting(false);
      setErrorMessage(null);
      setMintMessage(null);
      clearAll(); // Clear any remaining toasts
    };
  }, []);

  const handleMint = useCallback(async () => {
    // Clear previous errors and messages
    setErrorMessage(null);
    setMintMessage(null);

    if (!NFT_CONTRACT_ADDRESS) {
      setMintMessage({ type: 'error', text: 'Contract not configured. Mint is disabled.' });
      return;
    }

    // Build candidates with remaining supply > 0 and valid claim conditions
    const candidates = supplyInfo.filter((info) => {
      if (info.remaining <= BigInt(0)) return false;
      const claim = claimInfo.get(info.id);
      if (!claim || !claim.condition) return false;
      
      // Check if mint has started
      const now = BigInt(Math.floor(Date.now() / 1000));
      if (claim.condition.startTimestamp > now) return false;
      
      // Check if there's remaining supply in claim condition
      if (claim.condition.supplyClaimed >= claim.condition.maxClaimableSupply) return false;
      
      return true;
    });

    if (candidates.length === 0) {
      setMintMessage({ type: 'error', text: 'No tokens available for minting at this time.' });
      return;
    }

    try {
      // Select random tokenId weighted by remaining supply
      const tokenId = pickWeightedTokenId(candidates);
      const claim = claimInfo.get(tokenId);

      if (!claim || !claim.condition) {
        setMintMessage({ type: 'error', text: 'Mint conditions not available. Please try again.' });
        return;
      }

      const { pricePerToken, currency, quantityLimitPerWallet } = claim.condition;
      const quantity = BigInt(1); // Always mint exactly 1

      // Verify mint has started
      const now = BigInt(Math.floor(Date.now() / 1000));
      if (claim.condition.startTimestamp > now) {
        setMintMessage({ type: 'error', text: 'Mint has not started yet. Please wait.' });
        return;
      }

      // Verify claim condition has remaining supply
      if (claim.condition.supplyClaimed >= claim.condition.maxClaimableSupply) {
        setMintMessage({ type: 'error', text: 'This token type is sold out. Please try again.' });
        return;
      }

      // Calculate total value needed (pricePerToken * quantity)
      const totalValue = pricePerToken * quantity;

      // Native ETH currency address (Thirdweb-style)
      const NATIVE_CURRENCY = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" as `0x${string}`;
      const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as `0x${string}`;
      
      // Check if currency is native ETH
      const isNativeCurrency = 
        currency.toLowerCase() === NATIVE_CURRENCY.toLowerCase() ||
        currency.toLowerCase() === ZERO_ADDRESS.toLowerCase();

      const normalizedCurrency = isNativeCurrency ? NATIVE_CURRENCY : currency;

      // Prepare allowlist proof
      const allowlistProof = {
        proof: [] as `0x${string}`[],
        quantityLimitPerWallet,
        pricePerToken,
        currency: normalizedCurrency,
      };

      setIsMinting(true);
      setMintMessage({ type: 'info', text: 'Mint started' });

      // Call claim function - Base App will handle wallet connection automatically
      await writeMint({
        address: NFT_CONTRACT_ADDRESS as `0x${string}`,
        abi: nftDropAbi as any,
        functionName: "claim",
        args: [
          address as `0x${string}`,
          BigInt(tokenId),
          quantity,
          normalizedCurrency,
          pricePerToken,
          allowlistProof,
          "0x" as `0x${string}`,
        ],
        value: isNativeCurrency ? totalValue : BigInt(0),
      } as any);

    } catch (error) {
      setIsMinting(false);
      
      const appError = handleTransactionError(error);
      // Only show error if it's not a user cancellation
      if (appError.shouldShow) {
        setMintMessage({ type: 'error', text: appError.message });
      }
    }
  }, [address, supplyInfo, claimInfo, writeMint]);

  // Calculate total minted and remaining across all tokenIds
  const totalMinted = useMemo(() => {
    return supplyInfo.reduce((sum, info) => sum + Number(info.totalSupply), 0);
  }, [supplyInfo]);

  const totalMaxSupply = useMemo(() => {
    return supplyInfo.reduce((sum, info) => sum + Number(info.maxTotalSupply), 0);
  }, [supplyInfo]);

  const totalRemaining = useMemo(() => {
    return Math.max(0, totalMaxSupply - totalMinted);
  }, [totalMinted, totalMaxSupply]);

  const mintedProgress = useMemo(() => {
    if (totalMaxSupply === 0) return 0;
    return Math.min(100, Math.max(0, (totalMinted / totalMaxSupply) * 100));
  }, [totalMinted, totalMaxSupply]);

  // Button states and labels - Always show mint button
  const primaryButtonDisabled =
    isMinting ||
    isMintPending ||
    isMintConfirming ||
    !NFT_CONTRACT_ADDRESS ||
    loadingSupplies ||
    loadingClaimConditions;

  const GALLERY_IMAGES = useMemo(
    () => [
      { src: "/bluefin.jpg", name: "BlueFin" },
      { src: "/goldray.jpg", name: "GoldRay" },
      { src: "/redspike.jpg", name: "RedSpike" },
      { src: "/shadowgill.jpg", name: "ShadowGill" }
    ],
    [],
  );

  const lastMintedDisplay = useMemo(() => {
    if (lastMintedTokenId === null) return null;
    const name = getNameFromTokenId(lastMintedTokenId);
    return name ?? "Minted FarFISH";
  }, [lastMintedTokenId]);

  return (
    <div className="min-h-screen bg-gradient-to-br">
      <Header title="Home" />

      <main className="container mx-auto px-4 py-6 max-w-lg">
        <div className="flex flex-col gap-6">
          {/* How FarFISH Works */}
          <section className="glass-card rounded-3xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🐟</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold text-white leading-tight">
                    How FarFISH Works
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-elevated">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">1️⃣</span>
                  </div>
                  <p className="text-white font-medium leading-relaxed">Mint a FarFISH NFT</p>
                </div>
                <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-elevated">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">2️⃣</span>
                  </div>
                  <p className="text-white font-medium leading-relaxed">Complete daily on-chain actions</p>
                </div>
                <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-elevated">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">3️⃣</span>
                  </div>
                  <p className="text-white font-medium leading-relaxed">Earn long-term rewards on Base</p>
                </div>
              </div>
            </div>
          </section>

          {/* NFT Minting Section */}
          <div className="glass-card rounded-3xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Mint FarFISH NFTs
                  </h2>
                  <p className="text-white/70 text-sm mt-1">
                    {totalMaxSupply ? `Total supply ${totalMaxSupply} and 4 rarities` : "Loading supply..."}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                  <span className="text-xs text-white/60">Live</span>
                </div>
              </div>

              {!NFT_CONTRACT_ADDRESS && (
                <div className="mb-6 p-4 rounded-2xl bg-neutral/10 border border-neutral/20">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <p className="font-semibold text-white">Contract Not Configured</p>
                      <p className="text-xs text-white/70">Minting is temporarily disabled</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-surface border border-white/30 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-white">
                    {loadingSupplies ? "..." : totalMinted.toLocaleString()}
                  </div>
                  <div className="text-xs text-white/70 mt-1">Minted</div>
                </div>
                <div className="bg-surface border border-white/30 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-white">
                    {loadingSupplies ? "..." : `${mintedProgress.toFixed(1)}%`}
                  </div>
                  <div className="text-xs text-white/70 mt-1">Progress</div>
                </div>
                <div className="bg-surface border border-white/30 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-white">
                    {loadingSupplies ? "..." : totalRemaining.toLocaleString()}
                  </div>
                  <div className="text-xs text-white/70 mt-1">Left</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-white/60">Mint Progress</span>
                  <span className="text-sm text-white/60 font-medium">{mintedProgress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-surface rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-primary transition-all duration-1000 ease-out"
                    style={{ width: `${mintedProgress}%` }}
                  />
                </div>
              </div>

              {/* Mint Premium Pass Button - Always Visible */}
              <button
                type="button"
                onClick={handleMint}
                disabled={primaryButtonDisabled}
                className={`
                  w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-medium
                  ${primaryButtonDisabled 
                    ? "bg-neutral/20 text-neutral cursor-not-allowed" 
                    : "bg-gradient-primary text-black hover:shadow-lg"
                  }
                `}
              >
                {isMinting || isMintPending || isMintConfirming ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    {isMinting ? "Preparing..." : isMintPending ? "Confirming..." : "Processing..."}
                  </div>
                ) : (
                  "Mint Premium Pass"
                )}
              </button>

              {/* Transaction Transparency */}
              <div className="text-center">
                <p className="text-xs text-white/60 mb-1">On-chain action • Base Network</p>
                <p className="text-xs text-white/60">Price shown in wallet confirmation</p>
              </div>

              {/* Mint Messages */}
              {mintMessage && (
                <div className={`p-4 rounded-2xl border ${
                  mintMessage.type === 'success' 
                    ? 'bg-green-500/20 border-green-500/30 text-green-100' 
                    : mintMessage.type === 'error'
                    ? 'bg-red-500/20 border-red-500/30 text-red-100'
                    : 'bg-blue-500/20 border-blue-500/30 text-blue-100'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {mintMessage.type === 'success' ? '✅' : mintMessage.type === 'error' ? '❌' : 'ℹ️'}
                    </span>
                    <div>
                      <p className="font-semibold">{mintMessage.text}</p>
                      {mintMessage.type === 'success' && (
                        <p className="text-xs opacity-80 mt-1">Premium Pass minted successfully!</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {lastMintedDisplay && (
                <div className="p-4 rounded-2xl bg-white/10 border border-white/30">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🎉</span>
                    <div>
                      <p className="font-semibold text-white">Successfully Minted!</p>
                      <p className="text-xs text-white/80">{lastMintedDisplay}</p>
                    </div>
                  </div>
                </div>
              )}
          </div>
          </div>

          {/* Collection Preview */}
          <div className="glass-card rounded-3xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center">
              <span className="text-xl">🖼️</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Collection Preview
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {GALLERY_IMAGES.map((image, idx) => (
              <div
                key={image.src}
                className="group relative bg-surface rounded-2xl aspect-square overflow-hidden border border-white/20 hover:border-white/50 transition-all duration-300"
              >
                <Image
                  src={image.src}
                  alt={image.name}
                  fill
                  priority={idx === 0}
                  sizes="(max-width: 768px) 50vw, 200px"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-3 left-3">
                    <p className="text-white font-semibold text-sm">{image.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}

export default function HomePage() {
  return <HomeClient />;
}