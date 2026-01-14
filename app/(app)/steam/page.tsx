"use client";

import { useEffect, useState, useCallback } from "react";
import { useAccount, useReadContract } from "wagmi";
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
  type: "daily" | "base_activity" | "nft";
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
];

export default function SteamPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [fishingCooldown, setFishingCooldown] = useState(0); // Cooldown in seconds
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { address: wallet } = useAccount();
  const { activeStakes } = useUserStakes();
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

  const { data: nftBalance4 } = useReadContract({
    address: NFT_CONTRACT_ADDRESS as `0x${string}`,
    abi: nftAbi,
    functionName: "balanceOf",
    args: wallet ? [wallet, 4] : undefined,
    query: { enabled: Boolean(wallet && NFT_CONTRACT_ADDRESS) },
  });

  const { data: nftBalance5 } = useReadContract({
    address: NFT_CONTRACT_ADDRESS as `0x${string}`,
    abi: nftAbi,
    functionName: "balanceOf",
    args: wallet ? [wallet, 5] : undefined,
    query: { enabled: Boolean(wallet && NFT_CONTRACT_ADDRESS) },
  });

  const { data: nftBalance6 } = useReadContract({
    address: NFT_CONTRACT_ADDRESS as `0x${string}`,
    abi: nftAbi,
    functionName: "balanceOf",
    args: wallet ? [wallet, 6] : undefined,
    query: { enabled: Boolean(wallet && NFT_CONTRACT_ADDRESS) },
  });

  const { data: nftBalance7 } = useReadContract({
    address: NFT_CONTRACT_ADDRESS as `0x${string}`,
    abi: nftAbi,
    functionName: "balanceOf",
    args: wallet ? [wallet, 7] : undefined,
    query: { enabled: Boolean(wallet && NFT_CONTRACT_ADDRESS) },
  });

  const { data: nftBalance8 } = useReadContract({
    address: NFT_CONTRACT_ADDRESS as `0x${string}`,
    abi: nftAbi,
    functionName: "balanceOf",
    args: wallet ? [wallet, 8] : undefined,
    query: { enabled: Boolean(wallet && NFT_CONTRACT_ADDRESS) },
  });

  const { data: nftBalance9 } = useReadContract({
    address: NFT_CONTRACT_ADDRESS as `0x${string}`,
    abi: nftAbi,
    functionName: "balanceOf",
    args: wallet ? [wallet, 9] : undefined,
    query: { enabled: Boolean(wallet && NFT_CONTRACT_ADDRESS) },
  });

  const { data: nftBalance10 } = useReadContract({
    address: NFT_CONTRACT_ADDRESS as `0x${string}`,
    abi: nftAbi,
    functionName: "balanceOf",
    args: wallet ? [wallet, 10] : undefined,
    query: { enabled: Boolean(wallet && NFT_CONTRACT_ADDRESS) },
  });

  const { data: nftBalance11 } = useReadContract({
    address: NFT_CONTRACT_ADDRESS as `0x${string}`,
    abi: nftAbi,
    functionName: "balanceOf",
    args: wallet ? [wallet, 11] : undefined,
    query: { enabled: Boolean(wallet && NFT_CONTRACT_ADDRESS) },
  });

  const { data: nftBalance12 } = useReadContract({
    address: NFT_CONTRACT_ADDRESS as `0x${string}`,
    abi: nftAbi,
    functionName: "balanceOf",
    args: wallet ? [wallet, 12] : undefined,
    query: { enabled: Boolean(wallet && NFT_CONTRACT_ADDRESS) },
  });

  const { data: nftBalance13 } = useReadContract({
    address: NFT_CONTRACT_ADDRESS as `0x${string}`,
    abi: nftAbi,
    functionName: "balanceOf",
    args: wallet ? [wallet, 13] : undefined,
    query: { enabled: Boolean(wallet && NFT_CONTRACT_ADDRESS) },
  });

  const { data: nftBalance14 } = useReadContract({
    address: NFT_CONTRACT_ADDRESS as `0x${string}`,
    abi: nftAbi,
    functionName: "balanceOf",
    args: wallet ? [wallet, 14] : undefined,
    query: { enabled: Boolean(wallet && NFT_CONTRACT_ADDRESS) },
  });

  const { data: nftBalance15 } = useReadContract({
    address: NFT_CONTRACT_ADDRESS as `0x${string}`,
    abi: nftAbi,
    functionName: "balanceOf",
    args: wallet ? [wallet, 15] : undefined,
    query: { enabled: Boolean(wallet && NFT_CONTRACT_ADDRESS) },
  });

  // Check if user owns any FarFISH NFTs (ERC-1155)
  const ownsAnyNFT = Boolean(
    (nftBalance0 && Number(nftBalance0) > 0) ||
    (nftBalance1 && Number(nftBalance1) > 0) ||
    (nftBalance2 && Number(nftBalance2) > 0) ||
    (nftBalance3 && Number(nftBalance3) > 0) ||
    (nftBalance4 && Number(nftBalance4) > 0) ||
    (nftBalance5 && Number(nftBalance5) > 0) ||
    (nftBalance6 && Number(nftBalance6) > 0) ||
    (nftBalance7 && Number(nftBalance7) > 0) ||
    (nftBalance8 && Number(nftBalance8) > 0) ||
    (nftBalance9 && Number(nftBalance9) > 0) ||
    (nftBalance10 && Number(nftBalance10) > 0) ||
    (nftBalance11 && Number(nftBalance11) > 0) ||
    (nftBalance12 && Number(nftBalance12) > 0) ||
    (nftBalance13 && Number(nftBalance13) > 0) ||
    (nftBalance14 && Number(nftBalance14) > 0) ||
    (nftBalance15 && Number(nftBalance15) > 0)
  );

  const ownedTokenId = ownsAnyNFT ? (
    (nftBalance0 && Number(nftBalance0) > 0) ? 0 :
    (nftBalance1 && Number(nftBalance1) > 0) ? 1 :
    (nftBalance2 && Number(nftBalance2) > 0) ? 2 :
    (nftBalance3 && Number(nftBalance3) > 0) ? 3 :
    (nftBalance4 && Number(nftBalance4) > 0) ? 4 :
    (nftBalance5 && Number(nftBalance5) > 0) ? 5 :
    (nftBalance6 && Number(nftBalance6) > 0) ? 6 :
    (nftBalance7 && Number(nftBalance7) > 0) ? 7 :
    (nftBalance8 && Number(nftBalance8) > 0) ? 8 :
    (nftBalance9 && Number(nftBalance9) > 0) ? 9 :
    (nftBalance10 && Number(nftBalance10) > 0) ? 10 :
    (nftBalance11 && Number(nftBalance11) > 0) ? 11 :
    (nftBalance12 && Number(nftBalance12) > 0) ? 12 :
    (nftBalance13 && Number(nftBalance13) > 0) ? 13 :
    (nftBalance14 && Number(nftBalance14) > 0) ? 14 :
    (nftBalance15 && Number(nftBalance15) > 0) ? 15 : undefined
  ) : undefined;

  // Check if user has active stakes
  const hasActiveStake = activeStakes.length > 0;

  const fetchTaskStatuses = useCallback(async () => {
    if (!wallet) {
      const staticTasks = TASKS.map((task) => ({
        ...task,
        status: "not_started" as TaskStatus,
      }));
      setTasks(staticTasks);
      setLoading(false);
      return;
    }

    try {
      const staticTasks = TASKS.map((task) => ({
        ...task,
        status: "not_started" as TaskStatus,
      }));
      setTasks(staticTasks);

      const res = await fetch(`/api/steam/task-status?wallet=${wallet}`);
      const taskStatusData = await res.json();
      
      setFishingCooldown(taskStatusData.fishingCooldown || 0);

      const streakRes = await fetch(`/api/trust-anchor/user/${wallet}`);
      const streakData = await streakRes.json();
      setStreak(streakData.currentStreak || 0);

      const newNftData: { tokenId?: number; stakeId?: number } = {};
      if (ownedTokenId !== undefined) {
        newNftData.tokenId = ownedTokenId;
      }
      if (activeStakes && activeStakes.length > 0) {
        newNftData.stakeId = Number(Math.max(...activeStakes.map(s => Number(s.stakeId))));
      }
      setNftData(newNftData);

      const withStatus = TASKS.map((task) => {
        let status: TaskStatus = "not_started";
        let tokenId: number | undefined;
        let stakeId: number | undefined;

        if (task.type === "daily") {
          const fishingOnCooldown = taskStatusData.tasks?.[task.id] || taskStatusData.fishingCooldown > 0;
          status = fishingOnCooldown ? "verified" : "not_started";
        } else if (task.type === "base_activity") {
          status = streakData.currentStreak > 0 ? "verified" : "not_started";
        } else if (task.type === "nft") {
          if (task.id === "nft_mint") {
            status = (ownsAnyNFT || hasActiveStake) ? "verified" : "not_started";
            if (ownsAnyNFT && ownedTokenId !== undefined) {
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
      setTasks(
        TASKS.map((task) => ({
          ...task,
          status: "not_started" as TaskStatus,
        }))
      );
    } finally {
      setLoading(false);
    }
  }, [wallet, ownsAnyNFT, ownedTokenId, activeStakes, hasActiveStake]);

  useEffect(() => {
    fetchTaskStatuses();
  }, [fetchTaskStatuses]); // Refetch when function changes

  const handleFishing = async () => {
    if (!wallet) {
      setToast({
        type: 'error',
        message: 'Please connect your wallet'
      });
      return;
    }

    try {
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
        fetchTaskStatuses();
        setToast({
          type: 'success',
          message: 'Fishing completed! Earned 10 FRH'
        });
      } else if (response.status === 429) {
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
      setToast({
        type: 'error',
        message: 'Failed to complete fishing task'
      });
    }
  };

  const completedTasks = tasks.filter(task => task.status === "verified").length;
  const totalTasks = tasks.length;
  const totalRewards = tasks
    .filter(task => task.status === "verified")
    .reduce((sum, task) => sum + task.reward, 0);

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
                      {ownsAnyNFT && ownedTokenId !== undefined && (
                        <div className="text-xs text-success mt-1">✅ NFT Owned - Token ID: {ownedTokenId}</div>
                      )}
                      {activeStakes.length > 0 ? (
                        <div className="text-xs text-success mt-1">🔒 Currently Staked – Stake ID: {Number(Math.max(...activeStakes.map(s => Number(s.stakeId))))}</div>
                      ) : (
                        <div className="text-xs text-white/60 mt-1">⏳ Not Staked – Stake an NFT to activate</div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      {(ownsAnyNFT || hasActiveStake) ? (
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