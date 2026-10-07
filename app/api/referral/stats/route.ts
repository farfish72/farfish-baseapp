import { NextRequest, NextResponse } from "next/server";
import { getKey } from "../../../../lib/upstash";

export const dynamic = "force-dynamic";

const walletRegex = /^0x[a-fA-F0-9]{40}$/;

/**
 * Get user's referral statistics
 * GET /api/referral/stats?wallet=0x...
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

    // Fetch referral data
    const [referralData, refCount] = await Promise.all([
      getKey<string>(`referral:${wallet}`),
      getKey<string>(`refcount:${wallet}`),
    ]);

    // Parse referral data to get who referred this user
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

    // Calculate rewards
    const rewardsEarned = totalReferrals * 20; // 20 FRH per referral

    return NextResponse.json({
      wallet,
      referralCode,
      totalReferrals,
      rewardsEarned,
      referredBy: referrerWallet,
      hasReferrer: !!referrerWallet,
      isReferrer: totalReferrals > 0,
    });
  } catch (error: any) {
    console.error("❌ [REFERRAL STATS] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch referral stats" },
      { status: 500 }
    );
  }
}
