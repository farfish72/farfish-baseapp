import { NextRequest, NextResponse } from "next/server";
import { 
  getKey,
  getSortedSetReverseRank,
  getSortedSetScore 
} from "../../../../lib/upstash";

export const dynamic = "force-dynamic";

const walletRegex = /^0x[a-fA-F0-9]{40}$/;

/**
 * Get user activity statistics
 * GET /api/user/stats?wallet=0x...
 */
export async function GET(req: NextRequest) {
  try {
    const wallet = req.nextUrl.searchParams.get("wallet")?.trim().toLowerCase();
    
    if (!wallet || !walletRegex.test(wallet)) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    // Fetch all data in parallel
    const [userData, referralData, refCount, rank, score] = await Promise.all([
      getKey<string>(`user:${wallet}`),
      getKey<string>(`referral:${wallet}`),
      getKey<string>(`refcount:${wallet}`),
      getSortedSetReverseRank("leaderboard", wallet),
      getSortedSetScore("leaderboard", wallet),
    ]);

    // Parse user data
    let userProfile: any = null;
    if (userData) {
      try {
        userProfile = typeof userData === 'string' ? JSON.parse(userData) : userData;
      } catch {
        userProfile = null;
      }
    }

    // Parse referral data
    let referrerWallet: string | null = null;
    if (referralData) {
      try {
        const parsed = typeof referralData === 'string' ? JSON.parse(referralData) : referralData;
        referrerWallet = parsed.referrer || referralData;
      } catch {
        referrerWallet = referralData;
      }
    }

    // Parse refcount
    const totalReferrals = refCount ? parseInt(refCount, 10) : 0;

    // Calculate rewards
    const totalRewards = score ? score * 20 : 0;

    // Count completed steam tasks
    const steamTasks = userProfile?.steam || {};
    const completedTasks = Object.keys(steamTasks).filter(taskKey => {
      const task = steamTasks[taskKey];
      return task && task.completed === true;
    }).length;

    return NextResponse.json({
      wallet,
      activity: {
        daysActive: userProfile?.daysActive || 0,
        currentStreak: userProfile?.currentStreak || 0,
        lastActive: userProfile?.lastClaimDate || null,
        firstActive: userProfile?.firstClaimDate || null,
      },
      rewards: {
        total: totalRewards,
        leaderboardScore: score || 0,
      },
      referrals: {
        count: totalReferrals,
        referredBy: referrerWallet,
        hasReferrer: !!referrerWallet,
      },
      tasks: {
        completed: completedTasks,
        steam: steamTasks,
      },
      leaderboard: {
        rank: rank !== null ? rank + 1 : null,
        score: score || 0,
      },
    });
  } catch (error: any) {
    console.error("❌ [USER STATS] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}
