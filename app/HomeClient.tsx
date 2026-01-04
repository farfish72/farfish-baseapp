/**
 * DropERC1155 Mint Flow on Base (chainId 8453)
 * 
 * One-per-wallet rule enforced by checking balanceOf(address, id) for all tokenIds 0-15.
 * Mint price and currency read directly from on-chain claim conditions.
 * Random tokenId selection weighted by remaining supply (maxTotalSupply - totalSupply).
 */
"use client";

import Image from "next/image";
import Header from "./components/Header";
import useFarcasterGate from "./hooks/useFarcasterGate";
import useFarcasterEnvironment from "./hooks/useFarcasterEnvironment";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useConnect } from "wagmi";
import { getPublicClient } from "@wagmi/core";
import { wagmiConfig } from "./lib/wagmi";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { NFT_CONTRACT_ADDRESS, getNameFromTokenId } from "./constants";
import nftDropAbi from "./abi/nftDrop.json";
import { base } from "viem/chains";
import { formatEther } from "viem";
import { useToast } from "./providers/ToastProvider";
import { handleWalletError, handleTransactionError, checkWalletConnection, checkNetwork } from "./utils/errorHandling";

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

export default function HomeClient() {
  const { blocked, message } = useFarcasterGate();
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { showError, showSuccess } = useToast();

  // State
  const [supplyInfo, setSupplyInfo] = useState<SupplyInfo[]>([]);
  const [loadingSupplies, setLoadingSupplies] = useState(false);
  const [hasMinted, setHasMinted] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [lastMintedTokenId, setLastMintedTokenId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [mintedTokenUri, setMintedTokenUri] = useState<string | null>(null);
  const [claimInfo, setClaimInfo] = useState<Map<number, TokenClaimInfo>>(new Map());
  const [loadingClaimConditions, setLoadingClaimConditions] = useState(false);
  const [justMinted, setJustMinted] = useState(false);

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

  const isFarcasterEnv = useFarcasterEnvironment("Home page");

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
      // Use the configured Base chain from wagmi to ensure we always read from the same chain
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

      // If no active condition (returns 0 or throws), return error
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
      const publicClient = getPublicClient(wagmiConfig, { chainId: base.id });
      const chainId = publicClient?.chain?.id;
      // Check for specific error types
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

  // Check if wallet has already minted (balanceOf > 0 for any tokenId)
  const checkHasMinted = useCallback(async () => {
    if (typeof window === "undefined" || !address || !NFT_CONTRACT_ADDRESS) {
      setHasMinted(false);
      return;
    }

    try {
      const publicClient = getPublicClient(wagmiConfig, { chainId: base.id });
      if (!publicClient) {
        return;
      }

      const balancePromises = TOKEN_IDS.map((id) =>
        (publicClient.readContract as any)({
          address: NFT_CONTRACT_ADDRESS as `0x${string}`,
          abi: nftDropAbi as any,
          functionName: "balanceOf",
          args: [address as `0x${string}`, BigInt(id)],
        }) as Promise<bigint>
      );

      const balances = await Promise.all(balancePromises);
      const hasAnyBalance = balances.some((balance) => balance > BigInt(0));
      setHasMinted(hasAnyBalance);

      // If user has minted, find which tokenId and fetch its URI
      if (hasAnyBalance) {
        const mintedId = balances.findIndex((balance) => balance > BigInt(0));
        if (mintedId >= 0) {
          setLastMintedTokenId(mintedId);
          try {
            const uri = (await (publicClient.readContract as any)({
              address: NFT_CONTRACT_ADDRESS as `0x${string}`,
              abi: nftDropAbi as any,
              functionName: "uri",
              args: [BigInt(mintedId)],
            })) as string;
            if (uri) {
              setMintedTokenUri(uri);
            }
          } catch {
            // URI fetch failed, continue without it
          }
        }
      }
    } catch (error) {
    }
  }, [address]);


  // Fetch supply info and claim conditions on mount and when contract address changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      fetchSupplyInfo();
      fetchAllClaimConditions();
    }
  }, [fetchSupplyInfo, fetchAllClaimConditions]);

  // Check mint status when wallet connects or address changes
  useEffect(() => {
    if (typeof window !== "undefined" && isConnected && address) {
      checkHasMinted();
      setJustMinted(false); // Reset justMinted when wallet changes
    } else {
      setHasMinted(false);
      setLastMintedTokenId(null);
      setMintedTokenUri(null);
      setJustMinted(false);
    }
  }, [isConnected, address, checkHasMinted]);

  // Handle mint success
  useEffect(() => {
    if (isMintConfirmed && mintTxHash) {
      fetchSupplyInfo();
      fetchAllClaimConditions();
      checkHasMinted();
      setIsMinting(false);
      setJustMinted(true);
      showSuccess("NFT minted successfully!");
    }
  }, [isMintConfirmed, mintTxHash, fetchSupplyInfo, fetchAllClaimConditions, checkHasMinted, showSuccess]);

  // Handle mint errors
  useEffect(() => {
    if (mintError) {
      setIsMinting(false);
      const appError = handleWalletError(mintError);
      showError(appError.message);
    }
  }, [mintError, showError]);

  // FIXED: Clear transaction states on component unmount to prevent navigation freeze
  useEffect(() => {
    return () => {
      setIsMinting(false);
      setErrorMessage(null);
    };
  }, []);

  // FIXED: Auto-clear transaction states after timeout to prevent stuck UI
  useEffect(() => {
    if (isMinting || isMintPending || isMintConfirming) {
      const timeout = setTimeout(() => {
        setIsMinting(false);
        setErrorMessage(null);
      }, 30000); // 30 second timeout

      return () => clearTimeout(timeout);
    }
  }, [isMinting, isMintPending, isMintConfirming]);

  const handleConnect = useCallback(() => {
    const connector = connectors[0];
    if (!connector) return;
    connect({ connector });
  }, [connect, connectors]);

  const handleMint = useCallback(async () => {
    // Clear previous errors
    setErrorMessage(null);

    // Pre-flight checks
    const walletError = checkWalletConnection(address, isConnected);
    if (walletError) {
      showError(walletError.message);
      return;
    }

    const networkError = checkNetwork(chainId);
    if (networkError) {
      showError(networkError.message);
      return;
    }

    if (!NFT_CONTRACT_ADDRESS) {
      showError("Contract not configured. Mint is disabled.");
      return;
    }

    if (hasMinted) {
      showError("You have already minted an NFT.");
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
      showError("No tokens available for minting at this time.");
      return;
    }

    try {
      // Select random tokenId weighted by remaining supply
      const tokenId = pickWeightedTokenId(candidates);
      const claim = claimInfo.get(tokenId);

      if (!claim || !claim.condition) {
        showError("Mint conditions not available. Please try again.");
        return;
      }

      const { pricePerToken, currency, quantityLimitPerWallet } = claim.condition;
      const quantity = BigInt(1);

      // Verify mint has started
      const now = BigInt(Math.floor(Date.now() / 1000));
      if (claim.condition.startTimestamp > now) {
        showError("Mint has not started yet. Please wait.");
        return;
      }

      // Verify claim condition has remaining supply
      if (claim.condition.supplyClaimed >= claim.condition.maxClaimableSupply) {
        showError("This token type is sold out. Please try again.");
        return;
      }

      // Calculate total value needed (pricePerToken * quantity)
      const totalValue = pricePerToken * quantity;

      // Native ETH currency address (Thirdweb-style - required for this contract)
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

      // Call claim function
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
      showError(appError.message);
    }
  }, [address, isConnected, chainId, hasMinted, supplyInfo, claimInfo, writeMint, showError]);

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

  // Get representative price from claim conditions (use first available token's price)
  // Only returns price if:
  // 1. Claim condition exists and is valid
  // 2. Token has remaining supply
  // 3. Mint has started (startTimestamp <= now)
  // 4. Claim condition has remaining supply (supplyClaimed < maxClaimableSupply)
  const representativePrice = useMemo(() => {
    for (const info of supplyInfo) {
      const claim = claimInfo.get(info.id);
      if (claim?.condition && !claim.error) {
        // Check if token has remaining supply
        if (info.remaining <= BigInt(0)) continue;

        // Check if mint has started
        const now = BigInt(Math.floor(Date.now() / 1000));
        if (claim.condition.startTimestamp > now) continue;

        // Check if claim condition has remaining supply
        if (claim.condition.supplyClaimed >= claim.condition.maxClaimableSupply) continue;

        // Return full condition (includes price and currency)
        return claim.condition;
      }
    }
    return null;
  }, [supplyInfo, claimInfo]);

  const priceDisplay = useMemo(() => {
    if (!representativePrice) return null;

    try {
      const { pricePerToken, currency } = representativePrice;
      const ethLikeAddresses = [
        "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        "0x0000000000000000000000000000000000000000",
      ];
      const isEth =
        ethLikeAddresses.includes(currency.toLowerCase());

      const symbol = isEth ? "ETH" : "TOKEN";
      const formattedPrice = formatEther(pricePerToken);

      return { formattedPrice, symbol };
    } catch {
      return null;
    }
  }, [representativePrice]);

  // Button states and labels
  const primaryButtonClasses = useMemo(() => {
    if (!NFT_CONTRACT_ADDRESS) {
      return "w-full py-4 text-lg font-semibold rounded-xl bg-white/10 text-white/50 cursor-not-allowed";
    }
    if (!address || !isConnected) {
      return "w-full py-4 text-lg font-semibold rounded-xl bg-white/15 text-white hover:bg-white/25 transition";
    }
    if (hasMinted) {
      return "w-full py-4 text-lg font-semibold rounded-xl bg-white/10 text-white/50 cursor-not-allowed";
    }
    return "w-full py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-[#00d4c4] to-[#3be6c1] text-black transition disabled:opacity-60";
  }, [address, isConnected, hasMinted]);

  const primaryButtonDisabled =
    isConnecting ||
    isMinting ||
    isMintPending ||
    isMintConfirming ||
    !NFT_CONTRACT_ADDRESS ||
    hasMinted ||
    loadingSupplies ||
    loadingClaimConditions ||
    representativePrice === null;

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

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
    <>
      <Header title="Home" />

      <div className="flex-1 flex flex-col gap-6">
        {/* Mandatory Onboarding Block */}
        <section className="glass-card rounded-3xl">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#00d4c4] to-[#3be6c1] flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🐟</span>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold text-white leading-tight">
                  How FarFISH Works
                </h2>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 py-2 px-3 rounded-xl bg-elevated">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">1️⃣</span>
                </div>
                <p className="text-white font-medium leading-relaxed">Mint a FarFISH NFT</p>
              </div>
              <div className="flex items-center gap-3 py-2 px-3 rounded-xl bg-elevated">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">2️⃣</span>
                </div>
                <p className="text-white font-medium leading-relaxed">Complete daily on-chain actions</p>
              </div>
              <div className="flex items-center gap-3 py-2 px-3 rounded-xl bg-elevated">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">3️⃣</span>
                </div>
                <p className="text-white font-medium leading-relaxed">Earn long-term rewards on Base</p>
              </div>
            </div>
          </div>
        </section>
        {/* Hero Section with tier cards */}
        <section className="relative">
          <div className="glass-card rounded-3xl">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-2xl font-bold text-white leading-tight">
                    Choose Your Tier
                  </h2>
                  <p className="text-white/70 text-sm leading-relaxed mt-1">Unlock exclusive benefits</p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#00d4c4] to-[#3be6c1] flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🐟</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Basic Tier */}
                <div className="bg-surface backdrop-blur-sm border border-white/20 rounded-2xl interactive-scale">
                  <div className="text-center p-4">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/20 flex items-center justify-center">
                      <span className="text-lg">🥉</span>
                    </div>
                    <h3 className="font-bold text-white mb-2 leading-tight">Basic</h3>
                    <div className="space-y-1 text-xs text-white/70">
                      <p>• Claim daily rewards</p>
                      <p>• Build your activity streak</p>
                      <p>• Appear on the leaderboard</p>
                    </div>
                  </div>
                </div>

                {/* Premium Tier */}
                <div className="relative bg-surface backdrop-blur-sm border border-white/20 rounded-2xl interactive-scale">
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#00d4c4] to-[#3be6c1] text-xs font-bold text-black px-3 py-1 rounded-full">
                    HOT 🔥
                  </div>
                  <div className="text-center p-4">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-r from-[#00d4c4] to-[#3be6c1] flex items-center justify-center">
                      <span className="text-lg">👑</span>
                    </div>
                    <h3 className="font-bold text-white mb-2 leading-tight">Premium</h3>
                    <div className="space-y-1 text-xs text-white/70">
                      <p>• Earn rewards faster</p>
                      <p>• Boost your leaderboard rank</p>
                      <p>• Priority snapshot inclusion</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <p className="text-xs text-white/60 leading-relaxed">
                  Higher activity leads to higher long-term rewards.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* NFT Minting Section */}
        <div className="glass-card rounded-3xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">
                Mint FarFISH NFTs
              </h2>
              <p className="text-white/70 text-sm">
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
              <div className="text-xs text-white/70">Minted</div>
            </div>
            <div className="bg-surface border border-white/30 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {loadingSupplies ? "..." : `${mintedProgress.toFixed(1)}%`}
              </div>
              <div className="text-xs text-white/70">Progress</div>
            </div>
            <div className="bg-surface border border-white/30 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {loadingSupplies ? "..." : totalRemaining.toLocaleString()}
              </div>
              <div className="text-xs text-white/70">Left</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-white/60">Mint Progress</span>
              <span className="text-xs text-white/60">{mintedProgress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-surface rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00d4c4] to-[#3be6c1] transition-all duration-1000 ease-out"
                style={{ width: `${mintedProgress}%` }}
              />
            </div>
          </div>

          {/* Action Button */}
          {blocked ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🚫</span>
                  <div>
                    <p className="font-semibold text-white">Access Restricted</p>
                    <p className="text-xs text-white/70">{message}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => connect({ connector: farcasterMiniApp() })}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00d4c4] to-[#3be6c1] text-black font-bold transition-all duration-300 interactive-scale"
              >
                Connect Wallet
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleMint}
                disabled={primaryButtonDisabled}
                className={`
                  w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-medium
                  ${primaryButtonDisabled 
                    ? "bg-neutral/20 text-neutral cursor-not-allowed" 
                    : hasMinted 
                      ? "bg-gradient-to-r from-[#00d4c4] to-[#3be6c1] text-black"
                      : "bg-gradient-to-r from-[#00d4c4] to-[#3be6c1] text-black interactive-scale"
                  }
                `}
              >
                {isMinting || isMintPending || isMintConfirming ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    {isMinting ? "Preparing..." : isMintPending ? "Confirming..." : "Processing..."}
                  </div>
                ) : (
                  hasMinted ? "Minted" : "Early Access Mint"
                )}
              </button>

              {/* Transaction Transparency */}
              {!hasMinted && (
                <div className="text-center">
                  <p className="text-xs text-white/60 mb-1">On-chain action • Base Network</p>
                  <p className="text-xs text-white/60">Gas fees apply</p>
                </div>
              )}

              {lastMintedDisplay && (
                <div className="p-4 rounded-2xl bg-white/10 border border-white/30">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🎉</span>
                    <div>
                      <p className="font-semibold text-white">Successfully Minted!</p>
                      <p className="text-xs text-white/80">
                        {lastMintedDisplay}
                        {mintedTokenUri && (
                          <a href="/profile" className="ml-2 underline hover:text-white">
                            View NFT
                          </a>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {priceDisplay && (
                <div className="text-center">
                  <p className="text-sm text-white/70">
                    Price: <span className="font-bold text-white">{priceDisplay.formattedPrice} {priceDisplay.symbol}</span> + gas
                  </p>
                </div>
              )}
            </div>
          )}

          {toast && (
            <div className={`
              mt-4 p-4 rounded-2xl border backdrop-blur-sm
              ${toast.type === "success" 
                ? "bg-white/10 border-white/30 text-white" 
                : "bg-white/10 border-white/30 text-white"
              }
            `}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{toast.type === "success" ? "✅" : "❌"}</span>
                <p className="font-medium">{toast.message}</p>
              </div>
            </div>
          )}
        </div>

        {/* Why Mint Section */}
        <div className="glass-card rounded-3xl p-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#00d4c4] to-[#3be6c1] flex items-center justify-center">
              <span className="text-xl">💎</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Why Get FarFISH?
              </h3>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { icon: "🎮", title: "Future Games", desc: "Access upcoming play-to-earn features" },
              { icon: "🚀", title: "Growing Value", desc: "Activity builds long-term rewards" },
              { icon: "🌊", title: "Base Network", desc: "Built for Base ecosystem" },
              { icon: "⏰", title: "Daily Progress", desc: "Small actions, big results" },
              { icon: "🏆", title: "Early Access", desc: "First to try new features" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-surface interactive-scale">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">{item.icon}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                  <p className="text-sm text-white/70">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Collection Preview */}
        <div className="glass-card rounded-3xl p-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#00d4c4] to-[#3be6c1] flex items-center justify-center">
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
                className="group relative bg-surface rounded-2xl aspect-square overflow-hidden border border-white/20 hover:border-white/50 transition-all duration-300 interactive-scale"
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
    </>
  );
}
