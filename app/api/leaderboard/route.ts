import { NextResponse } from "next/server";
import { getSortedSetRange, getKey } from "../../../lib/upstash";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const entries = await getSortedSetRange("leaderboard", 0, 99);

    // Fetch referral counts for all users in parallel
    const entriesWithReferrals = await Promise.all(
      entries.map(async ({ member, score }, index) => {
        const refCount = await getKey<string>(`refcount:${member}`);
        const referralsCount = refCount ? parseInt(refCount, 10) : 0;
        
        return {
          rank: index + 1,
          wallet: member,
          referrals_count: referralsCount,
          rewards: score * 20, // Convert score to FRH tokens (1 point = 20 FRH)
        };
      })
    );

    return NextResponse.json(entriesWithReferrals);
  } catch (error) {
    console.error("[LEADERBOARD] Failed to load leaderboard:", error);
    return NextResponse.json({ error: "Failed to load leaderboard" }, { status: 500 });
  }
}
