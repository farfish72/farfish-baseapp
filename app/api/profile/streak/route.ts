import { NextRequest, NextResponse } from "next/server";
import { getKey } from "../../../../lib/upstash";

export const dynamic = "force-dynamic";

const walletRegex = /^0x[a-fA-F0-9]{40}$/;

/**
 * Get user's streak data
 * GET /api/profile/streak?wallet=0x...
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

    // Fetch user data from Redis
    const userData = await getKey<string>(`user:${wallet}`);

    if (!userData) {
      // User has no data yet - return default streak of 0
      return NextResponse.json({
        wallet,
        streakDays: 0,
        daysActive: 0,
        lastClaimDate: null,
        firstClaimDate: null,
      });
    }

    // Parse user data
    let userProfile: any = null;
    try {
      userProfile = typeof userData === 'string' ? JSON.parse(userData) : userData;
    } catch (error) {
      console.error("Failed to parse user data:", error);
      return NextResponse.json(
        { error: "Failed to parse user data" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      wallet,
      streakDays: userProfile?.currentStreak || 0,
      daysActive: userProfile?.daysActive || 0,
      lastClaimDate: userProfile?.lastClaimDate || null,
      firstClaimDate: userProfile?.firstClaimDate || null,
    });
  } catch (error: any) {
    console.error("❌ [PROFILE STREAK] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch streak data" },
      { status: 500 }
    );
  }
}
