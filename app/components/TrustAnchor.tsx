// app/components/TrustAnchor.tsx
'use client';

import { useAccount, useReadContract } from "wagmi";
import { ERC20_TOKEN_ADDRESS } from "../constants";
import erc20Abi from "../abi/erc20.json";
import { formatUnits } from "viem";
import { useState, useEffect } from "react";

interface TrustAnchorProps {
  hasActiveStake: boolean;        // Whether user has active NFT stake
  hasMintedNFT: boolean;         // Whether user has minted at least 1 NFT
}

export default function TrustAnchor({
  hasActiveStake,
  hasMintedNFT,
}: TrustAnchorProps) {
  const { address, isConnected } = useAccount();
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);

  // Read ERC20 balance - live on-chain FRH balance
  const { 
    data: frhBalance, 
    isError: balanceError,
    isLoading: balanceLoading,
    refetch: refetchBalance 
  } = useReadContract({
    address: ERC20_TOKEN_ADDRESS as `0x${string}`,
    abi: erc20Abi as any,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { 
      enabled: Boolean(address && ERC20_TOKEN_ADDRESS && isConnected),
      refetchInterval: 30000, // Refetch every 30 seconds
    },
  });

  // Update loading state
  useEffect(() => {
    setIsLoadingBalance(balanceLoading);
  }, [balanceLoading]);

  // Listen for staking updates to refetch balance
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStakingUpdate = () => {
      refetchBalance();
    };

    window.addEventListener('farfish:staking-updated', handleStakingUpdate);
    return () => window.removeEventListener('farfish:staking-updated', handleStakingUpdate);
  }, [refetchBalance]);

  // Format FRH balance with error handling
  const formatFrhBalance = (): string => {
    if (!isConnected) return '0.00';
    if (isLoadingBalance) return '...';
    if (balanceError) return '0.00';
    if (!frhBalance) return '0.00';
    
    try {
      const formatted = formatUnits(frhBalance as bigint, 18);
      const value = parseFloat(formatted);
      
      // Format with appropriate decimals
      if (value >= 1000) {
        return value.toFixed(0);
      } else if (value >= 1) {
        return value.toFixed(2);
      } else {
        return value.toFixed(4);
      }
    } catch (error) {
      console.error('Error formatting FRH balance:', error);
      return '0.00';
    }
  };

  // Determine tier - Premium if user has: At least 1 NFT minted OR At least 1 NFT staked
  const tier = (hasMintedNFT || hasActiveStake) ? 'Premium' : 'Basic';

  // Status is Active if user is connected
  const status = isConnected ? 'Active' : 'Inactive';

  const cards = [
    { 
      icon: "✅", 
      label: "Status", 
      value: status,
      color: isConnected ? "text-green-400" : "text-gray-400"
    },
    { 
      icon: "💰", 
      label: "Holding", 
      value: `${formatFrhBalance()} FRH`,
      color: "text-cyan-400"
    },
    { 
      icon: "⏰", 
      label: "Next Snapshot", 
      value: "30 days",
      color: "text-blue-400"
    },
    { 
      icon: tier === 'Premium' ? "👑" : "🥉", 
      label: "Tier", 
      value: tier,
      color: tier === 'Premium' ? "text-yellow-400" : "text-gray-400"
    }
  ];

  return (
    <article className="glass-card rounded-3xl p-6 relative">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-primary">
          <span className="text-xl text-black">📈</span>
        </div>
        <div>
          <h3 className="premium-heading text-lg text-text-primary">Trust Anchor</h3>
          <p className="premium-caption text-text-secondary mt-1">Your on-chain metrics</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-elevated rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{card.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="premium-caption text-text-secondary uppercase tracking-wide text-xs">
                  {card.label}
                </p>
                <p className={`premium-heading text-sm font-semibold truncate ${card.color || 'text-text-primary'}`}>
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Error state for balance loading */}
      {balanceError && isConnected && (
        <div className="mt-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
          <p className="text-yellow-200 text-xs text-center">
            Unable to load FRH balance. Please refresh.
          </p>
        </div>
      )}
    </article>
  );
}
