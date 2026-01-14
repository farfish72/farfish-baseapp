// app/components/TrustAnchor.tsx
'use client';

import { useAccount, useReadContract } from "wagmi";
import { ERC20_TOKEN_ADDRESS } from "../constants";
import erc20Abi from "../abi/erc20.json";
import { formatUnits } from "viem";

interface TrustAnchorProps {
  hasActiveStake: boolean;        // Whether user has active NFT stake
  hasMintedNFT: boolean;         // Whether user has minted at least 1 NFT
}

export default function TrustAnchor({
  hasActiveStake,
  hasMintedNFT,
}: TrustAnchorProps) {
  const { address } = useAccount();

  // Read ERC20 balance - live on-chain FRH balance
  const { data: frhBalance } = useReadContract({
    address: ERC20_TOKEN_ADDRESS as `0x${string}`,
    abi: erc20Abi as any,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && ERC20_TOKEN_ADDRESS) },
  });

  // Format FRH balance
  const formatFrhBalance = (): string => {
    if (!frhBalance) return '0.00';
    const formatted = formatUnits(frhBalance as bigint, 18);
    return parseFloat(formatted).toFixed(2);
  };

  // Determine tier - Premium if user has: At least 1 NFT minted OR At least 1 NFT staked
  const tier = (hasMintedNFT || hasActiveStake) ? 'Premium' : 'Basic';

  // Status is Active if user is connected
  const status = address ? 'Active' : 'Inactive';

  const cards = [
    { 
      icon: "✅", 
      label: "Status", 
      value: status
    },
    { 
      icon: "💰", 
      label: "Holding", 
      value: `${formatFrhBalance()} FRH`
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
          <p className="premium-caption text-text-secondary mt-1">Your on-chain metrics</p>
        </div>
      </div>

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
