import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const walletRegex = /^0x[a-fA-F0-9]{40}$/;

/**
 * TRUST ANCHOR API - SINGLE SOURCE OF TRUTH
 * 
 * This is the authoritative source for all user activity data.
 * Streak ONLY increases when user successfully claims Daily Base Chest.
 * All other systems must defer to this API.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawAddress = searchParams.get('address');

    if (!rawAddress) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    const address = rawAddress.toLowerCase().trim();
    
    if (!walletRegex.test(address)) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    // Import Upstash functions dynamically
    const { getKey } = await import("../../../lib/upstash");
    
    const userKey = `user:${address}`;
    const userData = await getKey(userKey);
    
    let userObj: any = {};
    if (userData) {
      try {
        userObj = typeof userData === 'string' ? JSON.parse(userData) : userData;
      } catch {
        userObj = {};
      }
    }
    
    // Get chest data (authoritative source for streak)
    const chestData = userObj.chest || {};
    const streak = chestData.streak || 0;
    const daysActive = chestData.daysActive || 0;
    const lastClaimDate = chestData.lastClaimDate || null;
    
    // Get referral data from leaderboard API for consistency
    let referralCount = 0;
    try {
      // Use internal API call instead of fetch for server-side
      const { getKey: getLeaderboardKey } = await import("../../../lib/upstash");
      const leaderboardKey = `user:${address}`;
      const leaderboardData = await getLeaderboardKey(leaderboardKey);
      
      if (leaderboardData) {
        const parsedData = typeof leaderboardData === 'string' ? JSON.parse(leaderboardData) : leaderboardData;
        referralCount = parsedData.referrals_count || parsedData.referrals?.count || 0;
      }
    } catch (error) {
      console.error('Failed to fetch referral data:', error);
      // Fallback to stored referral data
      referralCount = userObj.referrals?.count || 0;
    }
    
    // Get rank data from stored data
    let rankData = null;
    try {
      // Check if rank is stored in user data
      rankData = userObj.rank || null;
      
      // If no rank stored, try to get from leaderboard data
      if (!rankData) {
        const leaderboardKey = `user:${address}`;
        const leaderboardData = await getKey(leaderboardKey);
        if (leaderboardData) {
          const parsedData = typeof leaderboardData === 'string' ? JSON.parse(leaderboardData) : leaderboardData;
          rankData = parsedData.rank || null;
        }
      }
    } catch (error) {
      console.error('Failed to fetch rank data:', error);
      rankData = userObj.rank || null;
    }

    return NextResponse.json({
      address,
      streak,
      daysActive,
      referrals: referralCount,
      rank: rankData,
      lastClaimDate,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Trust Anchor API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trust anchor data' },
      { status: 500 }
    );
  }
}

/**
 * UPDATE TRUST ANCHOR DATA
 * 
 * Called when user successfully claims Daily Base Chest.
 * This is the ONLY way streak can be incremented.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { address: rawAddress, action, txHash } = body;
    
    if (!rawAddress || !action) {
      return NextResponse.json(
        { error: 'Address and action are required' },
        { status: 400 }
      );
    }
    
    const address = rawAddress.toLowerCase().trim();
    
    if (!walletRegex.test(address)) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }
    
    if (action !== 'chest_claim_success') {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
    
    // Import Upstash functions dynamically
    const { getKey, setKey } = await import("../../../lib/upstash");
    
    const userKey = `user:${address}`;
    const now = Math.floor(Date.now() / 1000);
    const today = new Date().toISOString().split('T')[0];
    
    // Get existing user data
    let userData = await getKey(userKey);
    let userObj: any = {};
    
    if (userData) {
      try {
        userObj = typeof userData === 'string' ? JSON.parse(userData) : userData;
      } catch {
        userObj = {};
      }
    }
    
    // Initialize chest structure if it doesn't exist
    if (!userObj.chest) {
      userObj.chest = {};
    }
    
    const chestData = userObj.chest;
    const lastClaimDate = chestData.lastClaimDate;
    const currentStreak = chestData.streak || 0;
    
    // Calculate new streak based on consecutive days
    let newStreak = 1; // Default to 1 for any claim
    
    if (lastClaimDate) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (lastClaimDate === yesterdayStr) {
        // Consecutive day - increment streak
        newStreak = currentStreak + 1;
      } else if (lastClaimDate === today) {
        // Already claimed today - no change
        newStreak = currentStreak;
      }
      // If gap > 1 day, streak resets to 1 (default)
    }
    
    // Update chest data (Trust Anchor)
    userObj.chest = {
      ...chestData,
      streak: newStreak,
      daysActive: Math.max(chestData.daysActive || 0, newStreak),
      lastClaimDate: today,
      lastClaimTimestamp: now,
      txHash: txHash || null,
    };
    
    // Save updated user data
    await setKey(userKey, JSON.stringify(userObj));
    
    return NextResponse.json({
      success: true,
      address,
      streak: newStreak,
      daysActive: userObj.chest.daysActive,
      message: 'Trust Anchor updated successfully',
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Trust Anchor update error:', error);
    return NextResponse.json(
      { error: 'Failed to update trust anchor' },
      { status: 500 }
    );
  }
}