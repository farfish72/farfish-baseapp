"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAccount, useReadContract } from "wagmi";
import Header from "../components/Header";
import useUserStakes from "../hooks/useUserStakes";
import { NFT_CONTRACT_ADDRESS } from "../constants";
import nftAbi from "../abi/nftDrop.json";

type TaskStatus = "not_started" | "verified";

type Task = {
  id: string;
  title: string;
  description: string;
  reward: number;
  type: "daily" | "base_activity" | "referral" | "referral_milestone" | "nft" | "base_app";
  status: TaskStatus;
  target?: number; // For referral milestones
};

const TASKS: Omit<Task, "status">[] = [
  {
    id: "daily_checkin",
    title: "Daily Check-in",
    description: "Claim your daily Base activity reward",
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
    id: "open_farfish_base",
    title: "Open FarFISH (Base App)",
    description: "Open FarFISH via Base App to confirm activity",
    reward: 40,
    type: "base_app",
  },
  {
    id: "nft_mint",
    title: "Mint FarFISH NFT",
    description: "Mint a FarFISH NFT on Base",
    reward: 2500,
    type: "nft",
  },
  {
    id: "nft_stake",
    title: "Stake FarFISH NFT",
    description: "Stake any FarFISH NFT on Base",
    reward: 0, // Included in staking rewards
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
  const { address: wallet } = useAccount();
  const { activeStakes } = useUserStakes();
  const [referralData, setReferralData] = useState({ count: 0, rewards: 0 });
  const [streak, setStreak] = useState(0);
  
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

  // Debug log when page mounts
  useEffect(() => {
    console.log("[STEAM] Base App Steam page mounted");
  }, []);

  // Debug log when wallet is detected
  useEffect(() => {
    if (wallet) {
      console.log("[STEAM] Wallet address:", wallet);
    }
  }, [wallet]);

  // NFT balance check
  const { data: nftBalance } = useReadContract({
    address: NFT_CONTRACT_ADDRESS as `0x${string}`,
    abi: nftAbi,
    functionName: "balanceOf",
    args: wallet ? [wallet, 0] : undefined, // Check token ID 0 as example
    query: { enabled: Boolean(wallet && NFT_CONTRACT_ADDRESS) },
  });

  const fetchReferralData = useCallback(async () => {
    if (!wallet) return;
    
    try {
      const response = await fetch(`/api/leaderboard/user?wallet=${wallet}`);
      if (response.ok) {
        const data = await response.json();
        const referralCount = data.referrals_count || 0;
        
        console.log("[STEAM] Referral count:", referralCount);
        
        setReferralData({
          count: referralCount,
          rewards: data.rewards || 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch referral data:', error);
    }
  }, [wallet]);

  const fetchTaskStatuses = useCallback(async () => {
    try {
      // Always load static tasks first
      const staticTasks = TASKS.map((task) => ({
        ...task,
        status: "not_started" as TaskStatus,
      }));

      console.log("[STEAM] Base tasks loaded:", staticTasks);
      setTasks(staticTasks);

      if (!wallet) {
        // If no wallet connected, show all tasks as not started but still visible
        setLoading(false);
        return;
      }

      // Fetch task completion status from API
      const res = await fetch(`/api/steam/task-status?wallet=${wallet}`);
      const taskStatusData = await res.json();
      
      console.log("[STEAM] Task status response:", taskStatusData);

      // Set fishing cooldown from API response
      setFishingCooldown(taskStatusData.fishingCooldown || 0);

      // Get streak from localStorage
      const currentStreak = parseInt(localStorage.getItem('ff_streak') || '0', 10);
      setStreak(currentStreak);

      const withStatus = TASKS.map((task) => {
        let status: TaskStatus = "not_started";

        if (task.type === "daily") {
          // Daily check-in task: "verified" means on cooldown, "not_started" means available
          const dailyOnCooldown = taskStatusData.tasks?.[task.id];
          status = dailyOnCooldown ? "verified" : "not_started";
        } else if (task.type === "base_activity") {
          // Activity streak: always show as active if user has a streak
          status = currentStreak > 0 ? "verified" : "not_started";
        } else if (task.type === "base_app") {
          // Base app task completion from server
          status = taskStatusData.tasks?.[task.id] ? "verified" : "not_started";
        } else if (task.type === "referral") {
          // Referral is always "verified" if user has referrals
          status = referralData.count > 0 ? "verified" : "not_started";
        } else if (task.type === "referral_milestone") {
          // Referral milestone: completed if referral count >= target
          status = referralData.count >= (task.target || 0) ? "verified" : "not_started";
        } else if (task.type === "nft") {
          // NFT tasks: completed based on specific task
          if (task.id === "nft_mint") {
            const hasNFT = nftBalance && Number(nftBalance) > 0;
            status = hasNFT ? "verified" : "not_started";
          } else if (task.id === "nft_stake") {
            const hasStake = activeStakes.length > 0;
            status = hasStake ? "verified" : "not_started";
          }
        }

        return {
          ...task,
          status,
        };
      });

      console.log("[STEAM] Base referral milestones:", withStatus.filter(t => t.type === "referral_milestone"));

      setTasks(withStatus);
    } catch (error) {
      console.error('Failed to fetch task statuses:', error);
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
  }, [wallet, nftBalance, activeStakes, referralData.count]);

  useEffect(() => {
    fetchTaskStatuses();
  }, [fetchTaskStatuses]); // Refetch when function changes

  useEffect(() => {
    fetchReferralData();
  }, [fetchReferralData]); // Fetch referral data when function changes

  const handleBaseAppOpen = async () => {
    if (!wallet) return;

    try {
      // Call the unified task completion API for Base app open
      const response = await fetch('/api/steam/task/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: wallet,
          taskId: 'base_app_open',
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Refresh task status to show completion
        fetchTaskStatuses();
      } else {
        console.error('Base app open completion failed:', data.error);
      }
    } catch (error) {
      console.error("Base app open failed:", error);
    }
  };

  const handleDailyCheckin = async () => {
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
        // Refresh task status to reflect the completed check-in
        fetchTaskStatuses();
      } else if (response.status === 429) {
        // Cooldown active - update local cooldown state
        setFishingCooldown(data.cooldownRemaining || 0);
        console.log('Daily check-in on cooldown:', data.cooldownRemaining, 'seconds remaining');
      } else {
        console.error('Daily check-in failed:', data.error);
      }
    } catch (error) {
      console.error('Daily check-in error:', error);
    }
  };

  const handleReferralShare = async () => {
    if (!wallet) return;

    try {
      // Generate referral code from wallet address (first 8 characters)
      const referralCode = wallet.slice(2, 10).toUpperCase();
      const referralLink = `https://farfish-baseapp.vercel.app/?ref=${referralCode}`;
      
      // Create Base App embed text with domain-based referral
      const shareText = `Earn FRH tokens by completing Base activities.\n\nDaily rewards, referrals, on-chain progress.\nJoin FarFISH on Base now!\n\n${referralLink}`;
      
      // Use Base App sharing mechanism (if available)
      if (navigator.share) {
        await navigator.share({
          title: 'Join FarFISH on Base',
          text: shareText,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareText);
        alert('Referral link copied to clipboard!');
      }
    } catch (error) {
      console.error("Referral share failed:", error);
      // Fallback alert
      const referralCode = wallet.slice(2, 10).toUpperCase();
      const referralLink = `https://farfish-baseapp.vercel.app/?ref=${referralCode}`;
      alert(`Share this link: ${referralLink}`);
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
      <div className="flex flex-col flex-1">
        <Header title="Steam" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/70">Loading Base tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <Header title="Steam" />

      <div className="flex-1 space-y-4 mt-4">
        {/* Page Header */}
        <div className="bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-white/20 rounded-3xl p-4 shadow-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg">
              <span className="text-xl">⚡</span>
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Steam
              </h2>
              <p className="text-cyan-300 text-sm">Complete Base tasks to earn FRH</p>
            </div>
          </div>
        </div>

        {/* Wallet Connection Notice */}
        {!wallet && (
          <div className="bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 backdrop-blur-sm border border-yellow-400/30 rounded-2xl p-4">
            <div className="text-center">
              <p className="text-yellow-400 text-sm font-medium">
                Connect wallet to verify & earn rewards
              </p>
            </div>
          </div>
        )}

        {/* Task Progress Card */}
        <div className="bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-white/20 rounded-3xl p-4 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                📊 Task Progress
              </h3>
              <p className="text-white/70 text-sm">Complete Base-native activities to earn verified FRH rewards</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-cyan-400">
                {completedTasks}/{totalTasks}
              </div>
              <div className="text-xs text-white/80">Tasks Completed</div>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-white/80 mb-2">Total Earned:</p>
            <div className="text-lg font-bold text-cyan-400">
              {wallet ? totalRewards : 0} FRH
            </div>
          </div>
        </div>

        {/* Base Tasks Section */}
        <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-white/20 rounded-3xl p-4 shadow-2xl">
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
            🎯 Base Tasks
          </h3>

          <div className="space-y-4">
            {/* Daily Check-in */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🎣</span>
                    <h4 className="text-lg font-bold text-white">Daily Check-in</h4>
                  </div>
                  <p className="text-white/70 text-sm mb-3">Claim your daily Base activity reward</p>
                  <div className="text-xs text-cyan-400 font-medium">Reward: 10 FRH</div>
                  <div className="text-xs text-white/60 mt-1">Cooldown: 24 hours</div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  {fishingCooldown > 0 ? (
                    <div className="px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-400 text-sm font-medium">
                      {formatCooldownTime(fishingCooldown)}
                    </div>
                  ) : (
                    <button
                      onClick={handleDailyCheckin}
                      disabled={!wallet}
                      className={`bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 text-sm ${
                        !wallet ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      Check In
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Activity Streak */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🔥</span>
                    <h4 className="text-lg font-bold text-white">Activity Streak</h4>
                  </div>
                  <p className="text-white/70 text-sm mb-3">Maintain consecutive daily activity on Base</p>
                  <div className="text-xs text-cyan-400 font-medium">Bonus increases with streak length</div>
                  {streak > 0 && (
                    <div className="text-xs text-green-400 mt-1">Current streak: {streak} days</div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="px-3 py-1 rounded-full bg-green-500/20 border border-green-400/30 text-green-400 text-sm font-medium">
                    {streak > 0 ? `${streak} days` : "Start streak"}
                  </div>
                </div>
              </div>
            </div>

            {/* Open FarFISH Base App */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🧭</span>
                    <h4 className="text-lg font-bold text-white">Open FarFISH (Base App)</h4>
                  </div>
                  <p className="text-white/70 text-sm mb-3">Open FarFISH via Base App to confirm activity</p>
                  <div className="text-xs text-cyan-400 font-medium">Reward: 40 FRH</div>
                  <div className="text-xs text-white/60 mt-1">Status: {tasks.find(t => t.id === "open_farfish_base")?.status === "verified" ? "Completed" : "Pending"}</div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  {tasks.find(t => t.id === "open_farfish_base")?.status === "verified" ? (
                    <div className="px-3 py-1 rounded-full bg-green-500/20 border border-green-400/30 text-green-400 text-sm font-medium">
                      Completed
                    </div>
                  ) : (
                    <button
                      onClick={handleBaseAppOpen}
                      disabled={!wallet}
                      className={`bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 text-sm ${
                        !wallet ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      Confirm Open
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Mint FarFISH NFT */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🐟</span>
                    <h4 className="text-lg font-bold text-white">Mint FarFISH NFT</h4>
                  </div>
                  <p className="text-white/70 text-sm mb-3">Mint a FarFISH NFT on Base</p>
                  <div className="text-xs text-cyan-400 font-medium">Reward: 2500 FRH</div>
                  <div className="text-xs text-white/60 mt-1">Status: {tasks.find(t => t.id === "nft_mint")?.status === "verified" ? "Completed" : "Pending"}</div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  {tasks.find(t => t.id === "nft_mint")?.status === "verified" ? (
                    <div className="px-3 py-1 rounded-full bg-green-500/20 border border-green-400/30 text-green-400 text-sm font-medium">
                      Completed
                    </div>
                  ) : (
                    <div className="text-xs text-white/80 text-center">
                      Mint NFT<br />on Home page
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stake FarFISH NFT */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🔒</span>
                    <h4 className="text-lg font-bold text-white">Stake FarFISH NFT</h4>
                  </div>
                  <p className="text-white/70 text-sm mb-3">Stake any FarFISH NFT on Base</p>
                  <div className="text-xs text-cyan-400 font-medium">Reward: Included in staking rewards</div>
                  <div className="text-xs text-white/60 mt-1">Status: {tasks.find(t => t.id === "nft_stake")?.status === "verified" ? "Active" : "Inactive"}</div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  {tasks.find(t => t.id === "nft_stake")?.status === "verified" ? (
                    <div className="px-3 py-1 rounded-full bg-green-500/20 border border-green-400/30 text-green-400 text-sm font-medium">
                      Active
                    </div>
                  ) : (
                    <div className="text-xs text-white/80 text-center">
                      Stake NFT<br />on Stake page
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Rewards Section */}
        <div className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-500/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl">
          <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
            🤝 Referral Rewards (Base)
          </h3>

          {/* Invite Users */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <h4 className="text-lg font-bold text-white mb-2">Invite Users on Base</h4>
                <p className="text-white/70 text-sm mb-3">Earn FRH when users join FarFISH using your invite</p>
                <div className="text-xs text-cyan-400 font-medium mb-2">Reward: 40 FRH per referral</div>
                <div className="text-xs text-white/60">Current: {referralData.count} referrals ({referralData.count * 40} FRH earned)</div>
                <div className="text-xs text-white/60 mt-2">
                  Secure domain-based tracking via Base App embed.
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <button
                  onClick={handleReferralShare}
                  disabled={!wallet}
                  className={`bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 text-sm ${
                    !wallet ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Share Invite
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
                  className={`p-4 rounded-xl border ${
                    referralData.count >= milestone.count
                      ? "bg-green-500/20 border-green-400/30"
                      : "bg-slate-500/20 border-slate-400/30"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">
                      {milestone.count === 5 ? "🥉" : 
                       milestone.count === 10 ? "🥈" : 
                       milestone.count === 30 ? "🥇" : "👑"}
                    </span>
                    <div className="text-sm font-bold text-white">{milestone.count} Referrals</div>
                  </div>
                  <div className="text-xs text-cyan-400 font-medium mb-2">Reward: {milestone.reward} FRH</div>
                  <div className="text-xs text-white/70">
                    Progress: {Math.min(referralData.count, milestone.count)} / {milestone.count}
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-2 mt-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
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

        {/* How it works */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
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
      </div>
    </div>
  );
}
