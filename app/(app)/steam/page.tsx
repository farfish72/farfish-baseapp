"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAccount, useReadContract } from "wagmi";
import { useComposeCast } from "@coinbase/onchainkit/minikit";
import useUserStakes from "@/app/hooks/useUserStakes";
import { NFT_CONTRACT_ADDRESS, STAKING_CONTRACT_ADDRESS } from "@/app/constants";
import nftAbi from "@/app/abi/nftDrop.json";
import stakeAbi from "@/app/abi/stake.json";

type TaskStatus = "not_started" | "verified";

type Task = {
  id: string;
  title: string;
  description: string;
  reward: number;
  type: "daily" | "base_activity" | "referral" | "referral_milestone" | "nft";
  status: TaskStatus;
  target?: number; // For referral milestones
  tokenId?: number; // For NFT tasks
  stakeId?: number; // For staking tasks
};

const TASKS: Omit<Task, "status">[] = [
  {
    id: "fishing",
    title: "Fishing",
    description: "Perform one fishing action per 24 hours to earn rewards",
    reward: 10,
    type: "daily",
  },
  {
    id: "activity_streak",
    title: "Activity Streak",
    description: "Maintain consecutive daily activity on Base",
    reward: 0, // Bonus increases with streak length
    type: "base_activity",
  },
  {
    id: "nft_mint",
    title: "Mint FarFISH NFT",
    description: "Mint a FarFISH NFT on Base",
    reward: 2500,
    type: "nft",
  },
  {
    id: "referral",
    title: "Referral Rewards (Base)",
    description: "Earn FRH when users join FarFISH using your invite",
    reward: 40,
    type: "referral",
  },
  {
    id: "referral_milestone_5",
    title: "5 Referrals",
    description: "Bonus reward for referring 5 users",
    reward: 200,
    type: "referral_milestone",
    target: 5,
  },
  {
    id: "referral_milestone_10",
    title: "10 Referrals",
    description: "Bonus reward for referring 10 users",
    reward: 400,
    type: "referral_milestone",
    target: 10,
  },
  {
    id: "referral_milestone_30",
    title: "30 Referrals",
    description: "Bonus reward for referring 30 users",
    reward: 1200,
    type: "referral_milestone",
    target: 30,
  },
  {
    id: "referral_milestone_50",
    title: "50 Referrals",
    description: "Bonus reward for referring 50 users",
    reward: 2000,
    type: "referral_milestone",
    target: 50,
  },
];

const REFERRAL_MILESTONES = [
  { count: 5, reward: 200 },
  { count: 10, reward: 400 },
  { count: 30, reward: 1200 },
  { count: 50, reward: 2000 },
];

export default function SteamPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [fishingCooldown, setFishingCooldown] = useState(0); // Cooldown in seconds
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { address: wallet } = useAccount();
  const { activeStakes } = useUserStakes();
  const { composeCast } = useComposeCast();
  const [referralData, setReferralData] = useState({ count: 0, rewards: 0 });
  const [streak, setStreak] = useState(0);
  const [nftData, setNftData] = useState<{ tokenId?: number; stakeId?: number }>({});
  
  // Toast effect
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Listen for custom toast events
  useEffect(() => {
    const handleToast = (event: any) => {
      setToast({
        type: event.detail.type,
        message: event.detail.message
      });
    };

    window.addEventListener('toast', handleToast);
    return () => window.removeEventListener('toast', handleToast);
  }, []);
  
  // Countdown effect for fishing cooldown
  useEffect(() => {
    if (fishingCooldown <= 0) return;
    
    const interval = setInterval(() => {
      setFishingCooldown(prev => {
        if (prev <= 1) {
          // Cooldown finished, refresh task status
          fetchTaskStatuses();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [fishingCooldown]);

  // Helper function to format cooldown time
  const formatCooldownTime = (seconds: number): string => {
    if (seconds <= 0) return "Available";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // NFT balance check - check multiple token IDs to find owned NFTs
  const { data: nftBalance0 } = useReadContract({
    address: NFT_CONTRACT_ADDRESS as `0x${string}`,
    abi: nftAbi,
    functionName: "balanceOf",
    args: wallet ? [wallet, 0] : undefined,
    query: { enabled: Boolean(wallet && NFT_CONTRACT_ADDRESS) },
  });

  const { data: nftBalance1 } = useReadContract({
    address: NFT_CONTRACT_ADDRESS as `0x${string}`,
    abi: nftAbi,
    functionName: "balanceOf", 
    args: wallet ? [wallet, 1] : undefined,
    query: { enabled: Boolean(wallet && NFT_CONTRACT_ADDRESS) },
  });

  const { data: nftBalance2 } = useReadContract({
    address: NFT_CONTRACT_ADDRESS as `0x${string}`,
    abi: nftAbi,
    functionName: "balanceOf",
    args: wallet ? [wallet, 2] : undefined,
    query: { enabled: Boolean(wallet && NFT_CONTRACT_ADDRESS) },
  });

  const { data: nftBalance3 } = useReadContract({
    address: NFT_CONTRACT_ADDRESS as `0x${string}`,
    abi: nftAbi,
    functionName: "balanceOf",
    args: wallet ? [wallet, 3] : undefined,
    query: { enabled: Boolean(wallet && NFT_CONTRACT_ADDRESS) },
  });

  // Check if user has any NFTs and get the first owned token ID
  const hasNFT = Boolean(
    (nftBalance0 && Number(nftBalance0) > 0) ||
    (nftBalance1 && Number(nftBalance1) > 0) ||
    (nftBalance2 && Number(nftBalance2) > 0) ||
    (nftBalance3 && Number(nftBalance3) > 0)
  );

  const ownedTokenId = hasNFT ? (
    (nftBalance0 && Number(nftBalance0) > 0) ? 0 :
    (nftBalance1 && Number(nftBalance1) > 0) ? 1 :
    (nftBalance2 && Number(nftBalance2) > 0) ? 2 :
    (nftBalance3 && Number(nftBalance3) > 0) ? 3 : undefined
  ) : undefined;

  const fetchReferralData = useCallback(async () => {
    if (!wallet) return;
    
    try {
      // Use trust anchor API to get referral data from Upstash KV
      const response = await fetch(`/api/trust-anchor/user/${wallet}`);
      if (response.ok) {
        const data = await response.json();
        const referralCount = data.referrals || 0;
        
        setReferralData({
          count: referralCount,
          rewards: referralCount * 40, // 40 FRH per referral
        });
      }
    } catch (error) {
      console.error('Referral data fetch error:', error);
    }
  }, [wallet]);

  const fetchTaskStatuses = useCallback(async () => {
    try {
      // Always load static tasks first
      const staticTasks = TASKS.map((task) => ({
        ...task,
        status: "not_started" as TaskStatus,
      }));
      setTasks(staticTasks);

      if (!wallet) {
        // If no wallet connected, show all tasks as not started but still visible
        setLoading(false);
        return;
      }

      // Fetch task completion status from API
      const res = await fetch(`/api/steam/task-status?wallet=${wallet}`);
      const taskStatusData = await res.json();
      
      // Set fishing cooldown from API response
      setFishingCooldown(taskStatusData.fishingCooldown || 0);

      // Get streak from Trust Anchor API (KV-based, not localStorage)
      const streakRes = await fetch(`/api/trust-anchor/user/${wallet}`);
      const streakData = await streakRes.json();
      setStreak(streakData.currentStreak || 0);

      // Update NFT data with auto-detected values
      const newNftData: { tokenId?: number; stakeId?: number } = {};
      if (ownedTokenId !== undefined) {
        newNftData.tokenId = ownedTokenId;
      }
      if (activeStakes.length > 0) {
        newNftData.stakeId = Number(Math.max(...activeStakes.map(s => Number(s.stakeId))));
      }
      setNftData(newNftData);

      const withStatus = TASKS.map((task) => {
        let status: TaskStatus = "not_started";
        let tokenId: number | undefined;
        let stakeId: number | undefined;

        if (task.type === "daily") {
          // Fishing task: "verified" means on cooldown, "not_started" means available
          const fishingOnCooldown = taskStatusData.tasks?.[task.id] || taskStatusData.fishingCooldown > 0;
          status = fishingOnCooldown ? "verified" : "not_started";
        } else if (task.type === "base_activity") {
          // Activity streak: only verified if user has streak from chest claims
          status = streakData.currentStreak > 0 ? "verified" : "not_started";
        } else if (task.type === "referral") {
          // Referral is always "verified" if user has referrals
          status = referralData.count > 0 ? "verified" : "not_started";
        } else if (task.type === "referral_milestone") {
          // Referral milestone: completed if referral count >= target
          status = referralData.count >= (task.target || 0) ? "verified" : "not_started";
        } else if (task.type === "nft") {
          // NFT tasks: auto-detect completion
          if (task.id === "nft_mint") {
            status = hasNFT ? "verified" : "not_started";
            if (hasNFT && ownedTokenId !== undefined) {
              tokenId = ownedTokenId;
            }
          }
        }

        return {
          ...task,
          status,
          tokenId,
          stakeId,
        };
      });

      setTasks(withStatus);
    } catch (error) {
      console.error('Task status fetch error:', error);
      // Even on error, show static tasks
      setTasks(
        TASKS.map((task) => ({
          ...task,
          status: "not_started" as TaskStatus,
        }))
      );
    } finally {
      setLoading(false);
    }
  }, [wallet, hasNFT, ownedTokenId, activeStakes, referralData.count]);

  useEffect(() => {
    fetchTaskStatuses();
  }, [fetchTaskStatuses]); // Refetch when function changes

  useEffect(() => {
    fetchReferralData();
  }, [fetchReferralData]); // Fetch referral data when function changes

  const handleFishing = async () => {
    if (!wallet) return;

    try {
      // Call the unified task completion API
      const response = await fetch('/api/steam/task/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: wallet,
          taskId: 'fishing',
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Refresh task status to reflect the completed fishing
        fetchTaskStatuses();
        setToast({
          type: 'success',
          message: 'Fishing completed! Earned 10 FRH'
        });
      } else if (response.status === 429) {
        // Cooldown active - update local cooldown state
        setFishingCooldown(data.cooldownRemaining || 0);
        setToast({
          type: 'error',
          message: `Fishing on cooldown: ${Math.ceil((data.cooldownRemaining || 0) / 3600)}h remaining`
        });
      } else {
        setToast({
          type: 'error',
          message: data.error || 'Fishing failed'
        });
      }
    } catch (error) {
      console.error('Fishing error:', error);
    }
  };

  const handleBaseAppInvite = async () => {
    if (!wallet) return;

    try {
      // Generate referral code from wallet address (last 8 characters)
      const referralCode = wallet.slice(-8).toUpperCase();
      
      // Create embed URL with referrer context
      const embedUrl = `https://farfish-baseapp.vercel.app/?ref=${referralCode}`;
      
      // Fixed embed content as specified
      const embedText = "🐟 Join me on FarFISH — daily rewards on Base.\nClaim the Daily Base Chest, build your activity streak,\nand earn FRH tokens over time.";
      
      // Use Farcaster/Base embed composer
      composeCast({
        text: embedText,
        embeds: [embedUrl]
      });
      
    } catch (error) {
      // Fail silently as specified
      console.error('Base App share error:', error);
    }
  };

  const completedTasks = tasks.filter(task => task.status === "verified").length;
  const totalTasks = tasks.length;
  const totalRewards = tasks
    .filter(task => task.status === "verified")
    .reduce((sum, task) => {
      if (task.type === "referral") {
        return sum + (referralData.count * task.reward);
      }
      return sum + task.reward;
    }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br">
        <main className="container mx-auto px-4 py-6 max-w-lg">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white/70">Loading Base tasks...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br">
      <main className="container mx-auto px-4 py-6 max-w-lg">
        <div className="flex flex-col gap-6">
          {/* Page Header */}
          <section className="glass-card rounded-3xl">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg">
                  <span className="text-xl">🎯</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Steam
                  </h2>
                  <p className="text-white/70 text-sm">Complete Base tasks to earn FRH</p>
                </div>
              </div>
            </div>
          </section>

          {/* Wallet Connection Notice */}
          {!wallet && (
            <section className="glass-card rounded-3xl">
              <div className="p-4">
                <div className="text-center">
                  <p className="text-white text-sm font-medium">
                    Connect wallet to verify & earn rewards
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Task Progress Card */}
          <section className="glass-card rounded-3xl">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    📊 Task Progress
                  </h3>
                  <p className="text-white/70 text-sm">Complete Base-native activities to earn verified FRH rewards</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {completedTasks}/{totalTasks}
                  </div>
                  <div className="text-xs text-white/80">Tasks Completed</div>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-white/80 mb-2">Total Earned:</p>
                <div className="text-lg font-bold text-white">
                  {wallet ? totalRewards : 0} FRH
                </div>
              </div>
            </div>
          </section>

          {/* Base Tasks Section */}
          <section className="glass-card rounded-3xl">
            <div className="p-4">
              <h3 className="text-xl font-bold text-white mb-6">
                🎯 Base Tasks
              </h3>

              <div className="space-y-4">
                {/* Fishing */}
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">🎣</span>
                        <h4 className="text-lg font-bold text-white">Fishing</h4>
                      </div>
                      <p className="text-white/70 text-sm mb-3">Perform one fishing action per 24 hours to earn rewards</p>
                      <div className="text-xs text-white font-medium">Reward: 10 FRH</div>
                      <div className="text-xs text-white/60 mt-1">Cooldown: 24 hours</div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      {fishingCooldown > 0 ? (
                        <div className="px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-sm font-medium">
                          {formatCooldownTime(fishingCooldown)}
                        </div>
                      ) : (
                        <button
                          onClick={handleFishing}
                          disabled={!wallet}
                          className={`bg-gradient-primary text-black px-4 py-2 rounded-xl font-medium text-sm ${
                            !wallet ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          Fishing
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Activity Streak */}
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">🔥</span>
                        <h4 className="text-lg font-bold text-white">Activity Streak</h4>
                      </div>
                      <p className="text-white/70 text-sm mb-3">Maintain consecutive daily activity on Base</p>
                      <div className="text-xs text-white font-medium">Increases only when claiming Daily Base Chest</div>
                      {streak > 0 && (
                        <div className="text-xs text-white mt-1">Current streak: {streak} days</div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <div className="px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-sm font-medium">
                        {streak > 0 ? `${streak} days` : "Start streak"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mint FarFISH NFT */}
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">🐟</span>
                        <h4 className="text-lg font-bold text-white">Mint FarFISH NFT</h4>
                      </div>
                      <p className="text-white/70 text-sm mb-3">Mint a FarFISH NFT on Base to unlock premium features and earn bonus rewards</p>
                      <div className="text-xs text-white font-medium">Reward: 2500 FRH</div>
                      <div className="text-xs text-white/60 mt-1">One-time reward for minting your first FarFISH NFT</div>
                      {hasNFT && ownedTokenId !== undefined && (
                        <div className="text-xs text-success mt-1">✅ NFT Owned - Token ID: {ownedTokenId}</div>
                      )}
                      {activeStakes.length > 0 ? (
                        <div className="text-xs text-success mt-1">🔒 Currently Staked – Stake ID: {Number(Math.max(...activeStakes.map(s => Number(s.stakeId))))}</div>
                      ) : (
                        <div className="text-xs text-white/60 mt-1">⏳ Not Staked – Stake an NFT to activate</div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      {hasNFT ? (
                        <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 text-sm font-medium">
                          ✅ Completed
                        </div>
                      ) : (
                        <div className="text-xs text-white/80 text-center">
                          ⏳ Incomplete<br />
                          <span className="text-white/60">Mint on Home page</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Referral Rewards Section */}
          <section className="glass-card rounded-3xl">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">
                🤝 Referral Rewards (Base)
              </h3>

              {/* Invite Users */}
              <div className="glass-card rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white mb-1">Share FarFISH on Base</h4>
                    <p className="text-white/70 text-sm mb-2">Invite friends to join FarFISH and earn rewards when they start their journey on Base.</p>
                    <div className="text-xs text-white font-medium mb-1">Reward: 40 FRH per successful referral</div>
                    <div className="text-xs text-white/60 mb-1">Current: {referralData.count} referrals · {referralData.count * 40} FRH earned</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={handleBaseAppInvite}
                      disabled={!wallet}
                      className={`bg-gradient-primary text-black px-3 py-1.5 rounded-lg font-medium text-sm ${
                        !wallet ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      Share Link
                    </button>
                  </div>
                </div>
              </div>

              {/* Referral Milestones */}
              <div className="mb-4">
                <h4 className="text-lg font-bold text-white mb-4">🏆 Referral Milestones</h4>
                <div className="grid grid-cols-2 gap-3">
                  {REFERRAL_MILESTONES.map((milestone) => (
                    <div
                      key={milestone.count}
                      className="glass-card rounded-xl p-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">
                          {milestone.count === 5 ? "🥉" : 
                           milestone.count === 10 ? "🥈" : 
                           milestone.count === 30 ? "🥇" : "👑"}
                        </span>
                        <div className="text-sm font-bold text-white">{milestone.count} Referrals</div>
                      </div>
                      <div className="text-xs text-white font-medium mb-2">Reward: {milestone.reward} FRH</div>
                      <div className="text-xs text-white/70">
                        Progress: {Math.min(referralData.count, milestone.count)} / {milestone.count}
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                        <div 
                          className="bg-gradient-primary h-2 rounded-full"
                          style={{ 
                            width: `${Math.min(100, (referralData.count / milestone.count) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* How it works */}
          <section className="glass-card rounded-3xl">
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-3 text-white">ℹ️ How it works</h3>
              <div className="space-y-2 text-white/80">
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Complete Base App activities to earn FRH</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Tasks verify automatically on Base</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Referral rewards use secure domain-based tracking</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Invalid or manipulated activity is filtered automatically</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Rewards are finalized before token distribution</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
          <div
            className={`rounded-2xl border px-6 py-4 text-sm shadow-medium backdrop-blur-md ${
              toast.type === "success"
                ? "border-green-500/40 bg-green-500/20 text-green-100"
                : "border-red-500/40 bg-red-500/20 text-red-100"
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