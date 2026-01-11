"use client";

import Image from "next/image";
import { useMemo, useState, useEffect, useCallback, Suspense } from "react";
import { useAccount, useChainId } from "wagmi";
import { base } from "viem/chains";
import { getPublicClient } from "@wagmi/core";
import { wagmiConfig } from "@/app/lib/wagmi";
import Header from "@/app/components/Header";
import { NFT_CONTRACT_ADDRESS } from "@/app/constants";
import nftDropAbi from "@/app/abi/nftDrop.json";
import useUserStakes from "@/app/hooks/useUserStakes";
import { 
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownLink,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from '@coinbase/onchainkit/identity';

type ToastState = { type: "error" | "success"; message: string } | null;

type LiveStats = {
  nftsOwned: number;
  chestStreak: number;
};

const faqItems = [
  {
    question: "1. What is FarFISH?",
    answer: "FarFISH is a daily habit-building app on Base that rewards consistent on-chain activity. Connect your wallet, complete tasks, and earn rewards.",
  },
  {
    question: "2. How do I earn rewards?",
    answer: "Claim daily rewards in Chest, stake NFTs for bonus rewards, and maintain consistent on-chain activity.",
  },
  {
    question: "3. What are the main features?",
    answer: "Chest (daily rewards), Stake (NFT staking), and Profile (your stats and identity).",
  },
  {
    question: "4. How does staking work?",
    answer: "Mint or buy FarFISH NFTs, then stake them to earn higher daily rewards and unlock premium features. Unstake anytime.",
  },
  {
    question: "5. Is my data secure?",
    answer: "Yes. FarFISH is non-custodial and built on Base blockchain. You control your wallet and assets at all times.",
  },
  {
    question: "6. How does the app work?",
    answer: "All rewards and progress are tracked on-chain on Base. Your wallet is your identity and holds all your assets.",
  },
];

const formatStatValue = (value: number | string | undefined, suffix = "") => {
  if (value === undefined || value === null) return `0${suffix}`;
  return `${value}${suffix}`;
};

const TOKEN_IDS = Array.from({ length: 16 }, (_, i) => i); // 0-15

function ProfilePageContent() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [toast, setToast] = useState<ToastState>(null);
  const { activeStakes } = useUserStakes();

  // Wallet-dependent stats (only loaded when wallet connected)
  const [liveStats, setLiveStats] = useState<LiveStats>({ nftsOwned: 0, chestStreak: 0 });
  const [loadingStats, setLoadingStats] = useState(false);

  const isBaseNetwork = chainId === base.id;

  // Basic profile data (wallet-based only)
  const getUsername = () => {
    const localUsername = typeof window !== "undefined" ? localStorage.getItem('username') : null;
    if (localUsername && localUsername.trim()) {
      return localUsername.trim();
    }
    return "Base User";
  };

  const getAvatarUrl = () => {
    const localImage = typeof window !== "undefined" ? localStorage.getItem('profileImage') : null;
    if (localImage && localImage.trim()) {
      return localImage;
    }
    return "/farfish-logo.png";
  };

  // Wallet-dependent stats (only when wallet connected)
  type StatsErrorState = { nftsOwned: boolean; chestStreak: boolean };
  const [statsError, setStatsError] = useState<StatsErrorState>({
    nftsOwned: false,
    chestStreak: false,
  });
  const [statsRefreshToken, setStatsRefreshToken] = useState(0);

  const fetchLiveStats = useCallback(async () => {
    if (!address) {
      setLiveStats({ nftsOwned: 0, chestStreak: 0 });
      setStatsError({ nftsOwned: false, chestStreak: false });
      return;
    }

    setLoadingStats(true);
    setStatsError({ nftsOwned: false, chestStreak: false });
    try {
      // Fetch NFT owned count
      let nftsOwned = 0;
      if (NFT_CONTRACT_ADDRESS) {
        try {
          const publicClient = getPublicClient(wagmiConfig, { chainId: base.id });
          if (publicClient) {
            const balancePromises = TOKEN_IDS.map((id) =>
              (publicClient.readContract as any)({
                address: NFT_CONTRACT_ADDRESS as `0x${string}`,
                abi: nftDropAbi as any,
                functionName: "balanceOf",
                args: [address as `0x${string}`, BigInt(id)],
              }) as Promise<bigint>
            );
            const balances = await Promise.all(balancePromises);
            nftsOwned = balances.reduce((sum, balance) => sum + Number(balance), 0);
          }
        } catch (error) {
          setStatsError((prev) => ({ ...prev, nftsOwned: true }));
        }
      }

      // Fetch chest streak from localStorage (same source as chest page)
      let chestStreak = 0;
      try {
        if (typeof window !== "undefined") {
          const streakFromStorage = localStorage.getItem('ff_streak');
          chestStreak = streakFromStorage ? parseInt(streakFromStorage, 10) : 0;
        }
      } catch (error) {
        setStatsError((prev) => ({ ...prev, chestStreak: true }));
      }

      setLiveStats({ nftsOwned, chestStreak });
    } catch (error) {
      setStatsError((prev) => ({
        nftsOwned: prev.nftsOwned || true,
        chestStreak: prev.chestStreak || true,
      }));
    } finally {
      setLoadingStats(false);
    }
  }, [address, statsRefreshToken]);

  // Only fetch stats when wallet is connected
  useEffect(() => {
    if (address) {
      fetchLiveStats();
    }
  }, [fetchLiveStats, address]);

  // Listen for global staking updates so Profile stays in sync with on-chain state
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => {
      setStatsRefreshToken((prev) => prev + 1);
    };
    window.addEventListener("farfish:staking-updated", handler);
    return () => {
      window.removeEventListener("farfish:staking-updated", handler);
    };
  }, []);

  // Wallet stats (only when connected)
  const stats = useMemo(
    () => [
      {
        label: "NFTs Owned",
        value: loadingStats ? "…" : statsError.nftsOwned ? "Error" : formatStatValue(liveStats.nftsOwned),
        icon: "🐟",
        color: "from-[#00d4c4] to-[#3be6c1]",
        bgColor: "from-white/20 to-white/20"
      },
      {
        label: "NFTs Staked",
        value: loadingStats ? "…" : formatStatValue(activeStakes.length),
        icon: "🔒",
        color: "from-[#00d4c4] to-[#3be6c1]",
        bgColor: "from-white/20 to-white/20"
      },
      {
        label: "Chest Streak",
        value: loadingStats ? "…" : statsError.chestStreak ? "Error" : formatStatValue(liveStats.chestStreak, " days"),
        icon: "�",
        color: "from-[#00d4c4] to-[#3be6c1]",
        bgColor: "from-white/20 to-white/20"
      },
    ],
    [liveStats, loadingStats, statsError, activeStakes.length]
  );

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br">
      <Header title="Profile" />

      <main className="container mx-auto px-4 py-6 max-w-lg">
        <div className="flex flex-col gap-6">
          {/* Profile Identity Section */}
          <section className="glass-card rounded-3xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">👤</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold text-white leading-tight">
                    Profile Identity
                  </h2>
                  <p className="text-white/70 text-sm">Base network identity</p>
                </div>
              </div>

              {isConnected && address ? (
                <div className="space-y-6">
                  {/* Base Identity Display */}
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 border border-white/20">
                    <Identity address={address} className="flex items-center gap-3">
                      <Avatar className="h-16 w-16 rounded-2xl border-2 border-white/20" />
                      <div className="flex-1">
                        <Name className="text-white font-bold text-lg" />
                        <Address className="text-white/70 text-sm font-mono" />
                        <EthBalance className="text-white/60 text-xs mt-1" />
                      </div>
                    </Identity>
                  </div>

                  {/* Custom Profile Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 group relative">
                      <input
                        type="text"
                        className="text-lg font-bold bg-transparent border-b-2 border-transparent focus:border-white/40 focus:outline-none w-full pr-8 text-white placeholder-white/50"
                        defaultValue={getUsername()}
                        placeholder="Custom display name"
                        onBlur={(e) => {
                          const newUsername = e.target.value.trim();
                          if (newUsername) {
                            localStorage.setItem('username', newUsername);
                            setToast({ type: "success", message: "Display name updated!" });
                          } else {
                            localStorage.removeItem('username');
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') e.currentTarget.blur();
                        }}
                      />
                      <div className="absolute right-2 text-white/50 group-focus-within:text-white/70 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                        <span className="text-sm text-white/70">Connected to Base • Identity verified</span>
                      </div>
                      <Wallet>
                        <WalletDropdown>
                          <Identity
                            address={address}
                            className="px-4 pt-3 pb-2 hover:bg-white/10 rounded-xl"
                            hasCopyAddressOnClick
                          >
                            <Avatar className="h-8 w-8" />
                            <Name className="text-white font-medium" />
                            <Address className="text-white/70 text-sm" />
                            <EthBalance className="text-white/60 text-xs" />
                          </Identity>
                          <WalletDropdownLink
                            className="hover:bg-white/10 rounded-xl mx-2 my-1"
                            icon="wallet"
                            href="https://wallet.coinbase.com"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Wallet
                          </WalletDropdownLink>
                          <WalletDropdownDisconnect className="mx-2 mb-2 py-2 px-4 rounded-xl bg-gradient-primary text-black font-semibold text-sm transition-all duration-300 hover:shadow-lg text-center cursor-pointer" />
                        </WalletDropdown>
                      </Wallet>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 flex items-center justify-center">
                    <span className="text-2xl">🔐</span>
                  </div>
                  <p className="text-white/70 mb-4 font-medium">Sign in with Base to access your profile</p>
                  <p className="text-white/50 text-sm mb-6">Connect your wallet to view your Base identity, ENS name, and avatar</p>
                  <ConnectWallet className="w-full">
                    <div className="w-full py-3 px-6 rounded-2xl bg-gradient-primary text-black font-semibold transition-all duration-300 hover:shadow-lg text-center cursor-pointer">
                      Connect Wallet
                    </div>
                  </ConnectWallet>
                </div>
              )}
            </div>
          </section>

          {/* Wallet Stats Section */}
          {isConnected && address && (
            <section className="glass-card rounded-3xl">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📊</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-bold text-white leading-tight">
                      On-chain Stats
                    </h2>
                    <p className="text-white/70 text-sm">Your activity and assets</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {!isBaseNetwork && (
                    <div className="p-3 rounded-2xl bg-yellow-500/20 border border-yellow-500/30">
                      <div className="flex items-center gap-3">
                        <span className="text-yellow-400 text-lg">⚠️</span>
                        <p className="text-yellow-100 text-sm">Switch to Base network to view stats</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {stats.map((stat) => (
                      <div
                        key={stat.label}
                        className={`
                          relative overflow-hidden bg-surface backdrop-blur-sm 
                          border border-white/20 rounded-2xl p-4 hover:scale-105 transition-all duration-300
                          ${loadingStats ? "animate-pulse" : ""}
                        `}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-lg flex-shrink-0">
                            <span className="text-sm text-black">{stat.icon}</span>
                          </div>
                          <p className="text-xs uppercase tracking-wide text-white/60 font-medium">
                            {stat.label}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-white">
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  {Object.values(statsError).some(Boolean) && !loadingStats && (
                    <div className="p-3 rounded-2xl bg-white/10 border border-white/20">
                      <p className="text-sm text-white text-center">
                        Some stats failed to load. Try refreshing the page.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* FAQ Section */}
          <section className="glass-card rounded-3xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">❓</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold text-white leading-tight">
                    Frequently Asked Questions
                  </h2>
                  <p className="text-white/70 text-sm">Learn about FarFISH features</p>
                </div>
              </div>

              <div className="space-y-3">
                {faqItems.map((faq, idx) => {
                  const open = openIdx === idx;
                  return (
                    <div
                      key={faq.question}
                      className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:bg-white/10 transition-all duration-300"
                    >
                      <button
                        className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-white/5 transition-colors"
                        onClick={() => setOpenIdx(open ? null : idx)}
                      >
                        <span className="font-medium text-sm text-white">{faq.question}</span>
                        <div className={`
                          w-6 h-6 rounded-full bg-white/10 border border-white/20
                          flex items-center justify-center text-white/70 text-xs
                          transition-all duration-300 ${open ? 'bg-white/20 text-white' : 'hover:bg-white/15'}
                        `}>
                          {open ? '−' : '+'}
                        </div>
                      </button>
                      {open && (
                        <div className="px-6 pb-4 text-sm text-white/80 leading-relaxed border-t border-white/10 pt-4 mt-2">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </main>

      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-10 w-[90%] max-w-md">
          <div
            className={`rounded-2xl border px-6 py-4 text-sm shadow-medium backdrop-blur-md ${
              toast.type === "success"
                ? "border-white/40 bg-white/20 text-white"
                : "border-white/40 bg-white/20 text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">
                {toast.type === "success" ? "✅" : "❌"}
              </span>
              {toast.message}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-white/10 animate-pulse"></div>
              <div className="w-32 h-4 mx-auto rounded bg-white/10 animate-pulse"></div>
            </div>
          </div>
        </div>
      }
    >
      <ProfilePageContent />
    </Suspense>
  );
}