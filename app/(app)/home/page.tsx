/**
 * Base App Mint Flow - Pure Consumer App
 * 
 * Mint exactly 1 NFT per click, contract-enforced validation only.
 * No quantity selectors, no price display, no local restrictions.
 */
"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { getPublicClient } from "@wagmi/core";
import { wagmiConfig } from "@/app/lib/wagmi";
import { getBuilderCodeSuffix } from "@/app/lib/builderCode";
import { NFT_CONTRACT_ADDRESS, getNameFromTokenId, TOKEN_IDS } from "@/app/constants";
import nftDropAbi from "@/app/abi/nftDrop.json";
import { base } from "viem/chains";
import { useToast } from "@/app/providers/ToastProvider";
import { handleTransactionError } from "@/app/utils/errorHandling";
import { GameController, Rocket, ChartBar, Clock, Trophy, Diamond, Warning } from "@phosphor-icons/react";
import WalletConnection from "@/app/components/WalletConnection";

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

function HomeClient() {
  const { address, isConnected } = useAccount();
  const { showError, showSuccess, clearAll } = useToast();

  // State
  const [mounted, setMounted] = useState(false);
  const [supplyInfo, setSupplyInfo] = useState<SupplyInfo[]>([]);
  const [loadingSupplies, setLoadingSupplies] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [lastMintedTokenId, setLastMintedTokenId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [claimInfo, setClaimInfo] = useState<Map<number, TokenClaimInfo>>(new Map());
  const [loadingClaimConditions, setLoadingClaimConditions] = useState(false);
  const [mintMessage, setMintMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      setErrorMessage("Failed to load claim conditions");
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
        setLoadingSupplies(false);
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
      setMintMessage({ type: 'success', text: 'NFT minted successfully' });
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
      setMintMessage({ type: 'error', text: 'Minting temporarily unavailable' });
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
      setMintMessage({ type: 'error', text: 'No NFTs currently available for minting' });
      return;
    }

    try {
      // Select random tokenId weighted by remaining supply
      const tokenId = pickWeightedTokenId(candidates);
      const claim = claimInfo.get(tokenId);

      if (!claim || !claim.condition) {
        setMintMessage({ type: 'error', text: 'Minting conditions unavailable. Please try again' });
        return;
      }

      const { pricePerToken, currency, quantityLimitPerWallet } = claim.condition;
      const quantity = BigInt(1); // Always mint exactly 1

      // Verify mint has started
      const now = BigInt(Math.floor(Date.now() / 1000));
      if (claim.condition.startTimestamp > now) {
        setMintMessage({ type: 'error', text: 'Minting has not begun. Please check back soon' });
        return;
      }

      // Verify claim condition has remaining supply
      if (claim.condition.supplyClaimed >= claim.condition.maxClaimableSupply) {
        setMintMessage({ type: 'error', text: 'This rarity tier is sold out. Please try again' });
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
      setMintMessage({ type: 'info', text: 'Transaction initiated' });

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
        account: address as `0x${string}`,
        chain: base,
        dataSuffix: getBuilderCodeSuffix(), // Builder Code attribution
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
    <div className="min-h-screen bg-gradient-to-br">
      <main className="py-2 w-full">
        <div className="flex flex-col gap-4">
          {/* Pick Your Pass Section */}
          <section className="glass-card rounded-3xl p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">
                Pick Your Pass
              </h2>
              <p className="text-white/70 text-sm mt-1">
                Two tiers, one clear choice
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Basic Tier */}
              <div className="rounded-xl p-3.5 h-full" style={{ background: '#0b0e11', border: '1px solid rgba(100, 116, 139, 0.3)' }}>
                <div className="flex flex-col items-center text-center mb-4 h-[28px] mt-3">
                  <h3 className="text-lg font-bold text-white">Basic</h3>
                </div>
                <div className="space-y-2 text-white/80 text-sm">
                  <p className="text-center">• Daily chest access</p>
                  <p className="text-center">• Streak tracking</p>
                  <p className="text-center">• Leaderboard entry</p>
                </div>
              </div>

              {/* Premium Tier */}
              <div className="rounded-xl p-3.5 relative h-full" style={{ background: '#0b0e11', border: '1px solid rgba(34, 211, 238, 0.3)' }}>
                <div className="absolute -top-2 right-0">
                  <span className="bg-accent text-black text-xs font-bold px-2 py-1 rounded">
                    FEATURED
                  </span>
                </div>
                <div className="flex flex-col items-center text-center mb-4 h-[28px] mt-3">
                  <h3 className="text-lg font-bold text-white">Premium</h3>
                </div>
                <div className="space-y-2 text-white/80 text-sm">
                  <p className="text-center">• 2x chest yield</p>
                  <p className="text-center">• Priority ranking</p>
                  <p className="text-center">• Snapshot advantage</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-white/60">
                Consistent activity compounds over time.
              </p>
            </div>
          </section>

          {/* NFT Minting Section */}
          <div className="glass-card rounded-3xl">
            <div className="p-6">
              {/* Show heading only when wallet is connected */}
              {isConnected && (
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Get Your NFT
                    </h2>
                    <p className="text-white/70 text-sm mt-1">
                      {totalMaxSupply ? `${totalMaxSupply.toLocaleString()} total · 4 rarities` : "Loading availability..."}
                    </p>
                  </div>
                </div>
              )}

              {/* Wallet Connection Required - Show when not connected */}
              {!isConnected ? (
                <WalletConnection />
              ) : (
                <>
                  {!NFT_CONTRACT_ADDRESS && (
                    <div className="mb-6 p-4 rounded-2xl bg-neutral/10 border border-neutral/20">
                      <div className="flex items-center gap-3">
                        <Warning size={24} weight="duotone" color="#ffffff" />
                        <div>
                          <p className="font-semibold text-white">Contract Not Configured</p>
                          <p className="text-xs text-white/70">Minting is temporarily disabled</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="rounded-2xl p-4 text-center" style={{ background: '#0b0e11', border: '1px solid rgba(100, 116, 139, 0.3)' }}>
                      <div className="text-2xl font-bold text-white">
                        {loadingSupplies ? "..." : totalMinted.toLocaleString()}
                      </div>
                      <div className="text-xs text-white/70 mt-1">Minted</div>
                    </div>
                    <div className="rounded-2xl p-4 text-center" style={{ background: '#0b0e11', border: '1px solid rgba(100, 116, 139, 0.3)' }}>
                      <div className="text-2xl font-bold text-white">
                        {loadingSupplies ? "..." : `${mintedProgress.toFixed(1)}%`}
                      </div>
                      <div className="text-xs text-white/70 mt-1">Progress</div>
                    </div>
                    <div className="rounded-2xl p-4 text-center" style={{ background: '#0b0e11', border: '1px solid rgba(100, 116, 139, 0.3)' }}>
                      <div className="text-2xl font-bold text-white">
                        {loadingSupplies ? "..." : totalRemaining.toLocaleString()}
                      </div>
                      <div className="text-xs text-white/70 mt-1">Left</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-white/60">Supply minted</span>
                      <span className="text-sm text-white/60 font-medium">{mintedProgress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-surface rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-primary transition-all duration-1000 ease-out"
                        style={{ width: `${mintedProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Mint Premium Pass Button - Only when wallet connected */}
                  <button
                    type="button"
                    onClick={handleMint}
                    disabled={primaryButtonDisabled}
                    className={`
                      w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 border-2
                      ${primaryButtonDisabled 
                        ? "bg-ink border-muted/30 text-muted cursor-not-allowed" 
                        : "bg-ink border-teal text-white hover:shadow-glow hover:bg-teal/10"
                      }
                    `}
                  >
                    {isMinting || isMintPending || isMintConfirming ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        {isMinting ? "Preparing transaction..." : isMintPending ? "Awaiting confirmation..." : "Processing transaction..."}
                      </div>
                    ) : (
                      "Mint Premium Pass"
                    )}
                  </button>

                  {/* Mint Messages */}
                  {mintMessage && (
                    <div className={`mt-4 p-4 rounded-2xl border ${
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
                            <p className="text-xs opacity-80 mt-1">Your NFT has been minted successfully</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {lastMintedDisplay && (
                    <div className="mt-4 p-4 rounded-2xl bg-white/10 border border-white/30">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🎉</span>
                        <div>
                          <p className="font-semibold text-white">Minting Complete</p>
                          <p className="text-xs text-white/80">{lastMintedDisplay}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Why FarFISH? */}
          <section className="glass-card rounded-3xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: '#181a20', border: '2px solid #000000' }}>
                  <Diamond size={28} weight="fill" className="text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold text-white leading-tight">
                    Why FarFISH?
                  </h2>
                  <p className="text-white/70 text-sm mt-1">
                    The compounding edge
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Future Games */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#181a20', border: '2px solid #000000' }}>
                    <GameController size={20} weight="regular" className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Future Games</h3>
                    <p className="text-white/70 text-sm">Early access to play-to-earn</p>
                  </div>
                </div>

                {/* Compounding Rewards */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#181a20', border: '2px solid #000000' }}>
                    <Rocket size={20} weight="regular" className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Compounding Rewards</h3>
                    <p className="text-white/70 text-sm">Every action builds on the last</p>
                  </div>
                </div>

                {/* Built on Base */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#181a20', border: '2px solid #000000' }}>
                    <ChartBar size={20} weight="regular" className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Built on Base</h3>
                    <p className="text-white/70 text-sm">Fast, cheap, on-chain</p>
                  </div>
                </div>

                {/* Daily Edge */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#181a20', border: '2px solid #000000' }}>
                    <Clock size={20} weight="regular" className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Daily Edge</h3>
                    <p className="text-white/70 text-sm">Small habits, outsized returns</p>
                  </div>
                </div>

                {/* Early Access */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#181a20', border: '2px solid #000000' }}>
                    <Trophy size={20} weight="regular" className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Early Access</h3>
                    <p className="text-white/70 text-sm">First in line, every launch</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Collection Preview */}
          <div className="glass-card rounded-3xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#181a20', border: '2px solid #000000' }}>
              <span className="text-xl">🖼️</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Collection Preview
              </h3>
              <p className="text-white/70 text-sm mt-1">
                Four rarities. One collection.
              </p>
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                  <div className="absolute bottom-4 left-4">
                    <p className="text-white font-bold text-lg">{image.name}</p>
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