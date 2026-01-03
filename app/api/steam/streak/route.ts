import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const walletRegex = /^0x[a-fA-F0-9]{40}$/;

/**
 * STEAM STREAK ENDPOINT
 * 
 * Returns activity streak that increases ONLY when user claims Daily Base Chest.
 * Streak is stored in KV and managed by the chest claim process.
 */
export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet")?.trim().toLowerCase();
  
  if (!wallet || !walletRegex.test(wallet)) {
    return NextResponse.json({ error: "Missing or invalid wallet address" }, { status: 400 });
  }

  try {
    // Import Upstash functions dynamically
    const { getKey } = await import("../../../../lib/upstash");
    
    const userKey = `user:${wallet}`;
    const userData = await getKey(userKey);
    
    let userObj: any = {};
    if (userData) {
      try {
        userObj = typeof userData === 'string' ? JSON.parse(userData) : userData;
      } catch {
        userObj = {};
      }
    }
    
    // Get streak from chest data (only increases on chest claims)
    const chestData = userObj.chest || {};
    const streak = chestData.streak || 0;
    
    return NextResponse.json({
      wallet,
      streak,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch streak" },
      { status: 500 }
    );
  }
}