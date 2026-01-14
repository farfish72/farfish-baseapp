import { NextRequest, NextResponse } from 'next/server';
import { redis, getUserKey, UserTrustData, getTodayString } from '@/app/lib/upstash';

export async function POST(request: NextRequest) {
  try {
    const { address, txHash } = await request.json();
    
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    if (!txHash || !/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
      return NextResponse.json(
        { error: 'Invalid transaction hash' },
        { status: 400 }
      );
    }

    const userKey = getUserKey(address);
    const normalizedAddress = address.toLowerCase();
    const refcountKey = `refcount:${normalizedAddress}`;
    const today = getTodayString();
    
    // Get existing user data
    let userData = await redis.get<UserTrustData>(userKey);
    
    // Validate that this is Trust Anchor data (not Steam or other feature data)
    if (userData && !userData.address) {
      // This is not Trust Anchor data, treat as new user
      userData = null;
    }
    
    // Get current refcount
    const currentRefcount = await redis.get(refcountKey);
    const referralCount = currentRefcount ? (typeof currentRefcount === 'number' ? currentRefcount : parseInt(String(currentRefcount)) || 0) : 0;
    
    if (!userData) {
      // First time user - initialize refcount if not exists
      userData = {
        address: normalizedAddress,
        daysActive: 0,
        currentStreak: 0,
        lastClaimDate: null,
        referrals: referralCount,
        referredBy: null,
        firstClaimDate: null,
      };
      
      // Initialize refcount if it doesn't exist
      if (currentRefcount === null) {
        await redis.set(refcountKey, 0);
      }
    } else {
      // Update existing user's referral count from refcount
      userData.referrals = referralCount;
    }

    // Check if already claimed today
    if (userData.lastClaimDate === today) {
      return NextResponse.json(
        { error: 'Already claimed today' },
        { status: 400 }
      );
    }

    // Calculate new streak
    let newStreak = 1;
    if (userData.lastClaimDate) {
      const lastClaimDate = new Date(userData.lastClaimDate);
      const todayDate = new Date(today);
      const daysDiff = Math.floor((todayDate.getTime() - lastClaimDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // Consecutive day
        newStreak = userData.currentStreak + 1;
      } else {
        // Streak broken or gap
        newStreak = 1;
      }
    }

    // Update user data
    const updatedData: UserTrustData = {
      ...userData,
      daysActive: userData.daysActive + 1,
      currentStreak: newStreak,
      lastClaimDate: today,
      firstClaimDate: userData.firstClaimDate || today,
    };

    // Save to Redis
    await redis.set(userKey, updatedData);

    return NextResponse.json({
      success: true,
      data: updatedData,
    });
  } catch (error) {
    console.error('Error processing claim:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}