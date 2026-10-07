import { NextRequest, NextResponse } from "next/server";
import { getSortedSetReverseRank, getSortedSetScore, getKey } from "../../../../lib/upstash";

export const dynamic = "force-dynamic";

const walletRegex = /^0x[a-fA-F0-9]{40}$/;

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet")?.trim().toLowerCase();

  if (!wallet || !walletRegex.test(wallet)) {
    return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
  }

  try {
    const [rank, score, refCount] = await Promise.all([
      getSortedSetReverseRank("leaderboard", wallet),
      getSortedSetScore("leaderboard", wallet),
      getKey<string>(`refcount:${wallet}`),
    ]);

    if (rank === null || score === null) {
      return NextResponse.json({ error: "Wallet is not ranked" }, { status: 404 });
    }

    const referralsCount = refCount ? parseInt(refCount, 10) : 0;

    return NextResponse.json({
      rank: rank + 1,
      wallet,
      referrals_count: referralsCount,
      rewards: score * 20, // Convert score to FRH tokens (1 point = 20 FRH)
    });
  } catch (error) {
    console.error("[LEADERBOARD USER] Failed to load rank:", error);
    return NextResponse.json({ error: "Failed to load rank" }, { status: 500 });
  }
}
