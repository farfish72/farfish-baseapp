import { NextRequest, NextResponse } from "next/server";
import { 
  getKey, 
  getSortedSetReverseRank, 
  getSortedSetScore 
} from "../../../lib/upstash";

export const dynamic = "force-dynamic";

const walletRegex = /^0x[a-fA-F0-9]{40}$/;

/**
 * Get complete user profile
 * GET /api/profile?wallet=0x...
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

    // Fetch all user data in parallel
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

    // Generate referral code (last 8 chars of wallet)
    const referralCode = wallet.slice(-8);

    // Parse refcount
    const totalReferrals = refCount ? parseInt(refCount, 10) : 0;

    // Calculate FRH tokens (score * 20)
    const frhTokens = score ? score * 20 : 0;

    return NextResponse.json({
      wallet,
      trustAnchor: {
        daysActive: userProfile?.daysActive || 0,
        currentStreak: userProfile?.currentStreak || 0,
        lastClaimDate: userProfile?.lastClaimDate || null,
        firstClaimDate: userProfile?.firstClaimDate || null,
      },
      referrals: {
        code: referralCode,
        count: totalReferrals,
        referredBy: referrerWallet,
        hasReferrer: !!referrerWallet,
      },
      rank: {
        position: rank !== null ? rank + 1 : null,
        score: score || 0,
        frhTokens,
      },
      steam: userProfile?.steam || {},
    });
  } catch (error: any) {
    console.error("❌ [PROFILE] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
