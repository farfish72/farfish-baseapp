// app/components/TrustAnchor.tsx
'use client';

import { useAccount, useReadContract } from "wagmi";
import { ERC20_TOKEN_ADDRESS } from "../constants";
import erc20Abi from "../abi/erc20.json";
import { formatUnits } from "viem";
import { useState, useEffect } from "react";

interface TrustAnchorProps {
  streak: number | null;          // Current consecutive streak
  daysActive: number | null;      // Total cumulative days (never resets)
  referrals: number | null;       // Lifetime referral count
  hasActiveStake: boolean;        // Whether user has active NFT stake
  rank: number | null;            // User rank from Trust Anchor API
  isLoading?: boolean;            // Loading state
  error?: string | null;          // Error message if any
}

export default function TrustAnchor({
  streak,
  daysActive,
  referrals,
  hasActiveStake,
  rank,
  isLoading = false,
  error = null,
}: TrustAnchorProps) {
  const { address } = useAccount();

  // Read ERC20 balance
  const { data: frhBalance } = useReadContract({
    address: ERC20_TOKEN_ADDRESS as `0x${string}`,
    abi: erc20Abi as any,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && ERC20_TOKEN_ADDRESS) },
  });

  // Format number safely
  const formatNumber = (num: number | null): string => {
    return num !== null && num >= 0 ? num.toString() : '0';
  };

  // Format FRH balance
  const formatFrhBalance = (): string => {
    if (!frhBalance) return '0';
    return formatUnits(frhBalance as bigint, 18);
  };

  // Format rank
  const formatRank = (): string => {
    return rank ? `#${rank}` : '#0';
  };

  // Determine tier based ONLY on active stake status
  const tier = hasActiveStake ? 'Premium' : 'Basic';

  const fields = [
    { 
      icon: "💰", 
      label: "Earning", 
      value: `${formatFrhBalance()} FRH`,
      color: "from-green-400 to-emerald-500",
      bgColor: "from-green-500/20 to-emerald-500/20"
    },
    { 
      icon: "📅", 
      label: "Days Active", 
      value: formatNumber(daysActive),
      color: "from-white to-white",
      bgColor: "from-white/20 to-white/20"
    },
    { 
      icon: "🔥", 
      label: "Current Streak", 
      value: `${formatNumber(streak)} days`,
      color: "from-orange-400 to-red-500",
      bgColor: "from-orange-500/20 to-red-500/20"
    },
    { 
      icon: "🤝", 
      label: "Referrals", 
      value: formatNumber(referrals),
      color: "from-purple-400 to-pink-500",
      bgColor: "from-purple-500/20 to-pink-500/20"
    },
    { 
      icon: "📊", 
      label: "Rank", 
      value: formatRank(),
      color: "from-yellow-400 to-amber-500",
      bgColor: "from-yellow-500/20 to-amber-500/20"
    },
    { 
      icon: "⏱️", 
      label: "Next Snapshot", 
      value: "~30 days",
      color: "from-indigo-400 to-purple-500",
      bgColor: "from-indigo-500/20 to-purple-500/20"
    },
    { 
      icon: tier === 'Premium' ? "👑" : "🥉", 
      label: "Tier", 
      value: tier,
      color: tier === 'Premium' ? "from-white to-white" : "from-gray-400 to-slate-500",
      bgColor: tier === 'Premium' ? "from-white/20 to-white/20" : "from-gray-500/20 to-slate-500/20"
    }
  ];

  return (
    <div className="glass-card rounded-3xl p-6 shadow-2xl shadow-slate-500/20">
      {/* Animated background elements */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white to-white flex items-center justify-center shadow-lg shadow-white/25">
            <span className="text-2xl">📈</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              Trust Anchor
            </h3>
            <p className="text-sm text-white/70">Protocol-based activity tracking</p>
          </div>
        </div>

        {/* Fields Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {fields.map((field, idx) => (
            <div 
              key={idx}
              className={`
                relative overflow-hidden bg-gradient-to-br ${field.bgColor} backdrop-blur-sm 
                border border-white/10 rounded-2xl p-3 hover:scale-105 transition-all duration-300
              `}
            >
              <div className="flex items-center gap-2">
                <div className={`
                  w-8 h-8 rounded-lg bg-gradient-to-br ${field.color} 
                  flex items-center justify-center shadow-lg flex-shrink-0
                `}>
                  <span className="text-sm">{field.icon}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-white/60 font-medium">{field.label}</p>
                  <p className="text-sm font-bold text-white truncate">
                    {isLoading ? '...' : field.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Explanation */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm border border-white/10">
          <p className="text-sm text-white/80 text-center">
            Activity is measured per wallet and finalized during snapshots.
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-2xl bg-white/10 border border-white/30">
            <div className="flex items-center gap-2">
              <span className="text-white">⚠️</span>
              <p className="text-sm text-white">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
