// app/components/TrustAnchor.tsx
'use client';

import { useAccount, useReadContract } from "wagmi";
import { ERC20_TOKEN_ADDRESS } from "../constants";
import erc20Abi from "../abi/erc20.json";
import { formatUnits } from "viem";
import { useTrustAnchor } from "../hooks/useTrustAnchor";

interface TrustAnchorProps {
  hasActiveStake: boolean;        // Whether user has active NFT stake
  hasMintedNFT: boolean;         // Whether user has minted at least 1 NFT
}

export default function TrustAnchor({
  hasActiveStake,
  hasMintedNFT,
}: TrustAnchorProps) {
  const { address } = useAccount();
  const trustData = useTrustAnchor();

  // Read ERC20 balance - keep current implementation (live on-chain FRH balance)
  const { data: frhBalance } = useReadContract({
    address: ERC20_TOKEN_ADDRESS as `0x${string}`,
    abi: erc20Abi as any,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && ERC20_TOKEN_ADDRESS) },
  });

  // Format number safely - ensure no negative numbers or null values
  const formatNumber = (num: number): string => {
    return Math.max(0, num).toString();
  };

  // Format FRH balance - keep current implementation
  const formatFrhBalance = (): string => {
    if (!frhBalance) return '0.00';
    const formatted = formatUnits(frhBalance as bigint, 18);
    return parseFloat(formatted).toFixed(2);
  };

  // Format rank - CRITICAL: NO user should ever display empty, null, or "--" rank
  const formatRank = (): string => {
    // Rank is based on referral count (descending)
    // Users with zero referrals MUST still receive a rank
    // Rank numbers must be continuous (1, 2, 3, …)
    return `#${Math.max(1, trustData.rank)}`;
  };

  // Determine tier - Premium if user has: At least 1 NFT minted OR At least 1 NFT staked
  // Basic if user has zero NFTs minted AND zero staked
  // Tier must update dynamically based on on-chain state
  const tier = (hasMintedNFT || hasActiveStake) ? 'Premium' : 'Basic';

  // Status becomes Active when the user successfully claims Daily Base Chest
  // If user has never claimed, status is Inactive
  // Status is NOT based on wallet connection alone
  const status = trustData.isActive ? 'Active' : 'Inactive';

  const cards = [
    { 
      icon: "✅", 
      label: "Status", 
      value: status
    },
    { 
      icon: "📅", 
      label: "Days Active", 
      value: formatNumber(trustData.daysActive)
    },
    { 
      icon: "🔥", 
      label: "Current Streak", 
      value: `${formatNumber(trustData.currentStreak)} days`
    },
    { 
      icon: "💝", 
      label: "Referrals", 
      value: formatNumber(trustData.referrals)
    },
    { 
      icon: "💰", 
      label: "Holding", 
      value: `${formatFrhBalance()} FRH`
    },
    { 
      icon: "📊", 
      label: "Rank", 
      value: formatRank()
    },
    { 
      icon: "⏰", 
      label: "Next Snapshot", 
      value: "30 days"
    },
    { 
      icon: tier === 'Premium' ? "👑" : "🥉", 
      label: "Tier", 
      value: tier
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
          <p className="premium-caption text-text-secondary mt-1">Your reputation metrics</p>
        </div>
        {trustData.isLoading && (
          <div className="ml-auto">
            <div className="premium-spinner w-5 h-5"></div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {trustData.error && (
        <div className="mb-6 outlined-card rounded-2xl p-4 border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-3">
            <span className="text-red-400 text-lg flex-shrink-0">⚠️</span>
            <p className="premium-caption text-red-300 flex-1">{trustData.error}</p>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-elevated rounded-2xl p-4 border border-white/10"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{card.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="premium-caption text-text-secondary uppercase tracking-wide">
                  {card.label}
                </p>
                <p className="premium-heading text-sm text-text-primary font-semibold truncate">
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
