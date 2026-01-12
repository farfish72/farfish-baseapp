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
    const today = getTodayString();
    
    // Get existing user data
    let userData = await redis.get<UserTrustData>(userKey);
    
    if (!userData) {
      // First time user
      userData = {
        address: address.toLowerCase(),
        daysActive: 0,
        currentStreak: 0,
        lastClaimDate: null,
        referrals: 0,
        referredBy: null,
        firstClaimDate: null,
      };
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