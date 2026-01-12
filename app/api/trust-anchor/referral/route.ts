import { NextRequest, NextResponse } from 'next/server';
import { redis, getUserKey, UserTrustData } from '@/app/lib/upstash';

export async function POST(request: NextRequest) {
  try {
    const { newUserAddress, referrerAddress } = await request.json();
    
    // Validate addresses
    if (!newUserAddress || !/^0x[a-fA-F0-9]{40}$/.test(newUserAddress)) {
      return NextResponse.json(
        { error: 'Invalid new user wallet address' },
        { status: 400 }
      );
    }

    if (!referrerAddress || !/^0x[a-fA-F0-9]{40}$/.test(referrerAddress)) {
      return NextResponse.json(
        { error: 'Invalid referrer wallet address' },
        { status: 400 }
      );
    }

    // Prevent self-referrals
    if (newUserAddress.toLowerCase() === referrerAddress.toLowerCase()) {
      return NextResponse.json(
        { error: 'Cannot refer yourself' },
        { status: 400 }
      );
    }

    const newUserKey = getUserKey(newUserAddress);
    const referrerKey = getUserKey(referrerAddress);

    // Check if new user already exists
    const existingUser = await redis.get<UserTrustData>(newUserKey);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists - referral only works for new users' },
        { status: 400 }
      );
    }

    // Get referrer data
    let referrerData = await redis.get<UserTrustData>(referrerKey);
    if (!referrerData) {
      // Create referrer if they don't exist
      referrerData = {
        address: referrerAddress.toLowerCase(),
        daysActive: 0,
        currentStreak: 0,
        lastClaimDate: null,
        referrals: 0,
        referredBy: null,
        firstClaimDate: null,
      };
    }

    // Create new user with referral link
    const newUserData: UserTrustData = {
      address: newUserAddress.toLowerCase(),
      daysActive: 0,
      currentStreak: 0,
      lastClaimDate: null,
      referrals: 0,
      referredBy: referrerAddress.toLowerCase(),
      firstClaimDate: null,
    };

    // Update referrer's referral count
    const updatedReferrerData: UserTrustData = {
      ...referrerData,
      referrals: referrerData.referrals + 1,
    };

    // Save both users
    await Promise.all([
      redis.set(newUserKey, newUserData),
      redis.set(referrerKey, updatedReferrerData),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Referral processed successfully',
      newUser: newUserData,
      referrer: updatedReferrerData,
    });

  } catch (error) {
    console.error('Error processing referral:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}