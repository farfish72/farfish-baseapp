import { NextRequest, NextResponse } from "next/server";
import { 
  getKey,
  getSortedSetReverseRank,
  getSortedSetScore 
} from "../../../lib/upstash";

export const dynamic = "force-dynamic";

const walletRegex = /^0x[a-fA-F0-9]{40}$/;

/**
 * Get Trust Anchor metrics for a user
 * GET /api/trust-anchor?wallet=0x...
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

    // Fetch all required data in parallel
    const [userData, refCount, rank, score] = await Promise.all([
      getKey<string>(`user:${wallet}`),
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

    // Parse refcount
    const totalReferrals = refCount ? parseInt(refCount, 10) : 0;

    // Calculate FRH balance (score * 20)
    const frhBalance = score ? score * 20 : 0;

    return NextResponse.json({
      wallet,
      status: "Active",
      daysActive: userProfile?.daysActive || 0,
      currentStreak: userProfile?.currentStreak || 0,
      lastClaimDate: userProfile?.lastClaimDate || null,
      firstClaimDate: userProfile?.firstClaimDate || null,
      rank: rank !== null ? rank + 1 : null,
      score: score || 0,
      frhBalance,
      referrals: totalReferrals,
      tier: "Basic", // Will be calculated based on NFT ownership on frontend
    });
  } catch (error: any) {
    console.error("❌ [TRUST ANCHOR] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trust anchor data" },
      { status: 500 }
    );
  }
}
