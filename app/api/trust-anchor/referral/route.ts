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

    const normalizedNewUser = newUserAddress.toLowerCase();
    const normalizedReferrer = referrerAddress.toLowerCase();
    
    const newUserKey = getUserKey(normalizedNewUser);
    const referrerKey = getUserKey(normalizedReferrer);
    
    // Upstash refcount keys (for ranking system)
    const referrerRefcountKey = `refcount:${normalizedReferrer}`;
    const newUserRefcountKey = `refcount:${normalizedNewUser}`;

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
    
    // Validate that this is Trust Anchor data (not Steam or other feature data)
    if (referrerData && !referrerData.address) {
      // This is not Trust Anchor data, treat as new user
      referrerData = null;
    }
    
    // Get current refcount for referrer
    const currentRefcount = await redis.get(referrerRefcountKey);
    const referralCount = currentRefcount ? (typeof currentRefcount === 'number' ? currentRefcount : parseInt(String(currentRefcount)) || 0) : 0;
    
    if (!referrerData) {
      // Create referrer if they don't exist
      referrerData = {
        address: normalizedReferrer,
        daysActive: 0,
        currentStreak: 0,
        lastClaimDate: null,
        referrals: referralCount,
        referredBy: null,
        firstClaimDate: null,
      };
    }

    // Create new user with referral link
    const newUserData: UserTrustData = {
      address: normalizedNewUser,
      daysActive: 0,
      currentStreak: 0,
      lastClaimDate: null,
      referrals: 0,
      referredBy: normalizedReferrer,
      firstClaimDate: null,
    };

    // Increment referrer's refcount (this is what rankings use)
    const newRefcount = referralCount + 1;

    // Update referrer's referral count in UserTrustData (for consistency)
    const updatedReferrerData: UserTrustData = {
      ...referrerData,
      referrals: newRefcount,
    };

    // Save everything atomically
    await Promise.all([
      redis.set(newUserKey, newUserData),
      redis.set(referrerKey, updatedReferrerData),
      redis.set(referrerRefcountKey, newRefcount), // Update refcount for ranking
      redis.set(newUserRefcountKey, 0), // Initialize new user's refcount
    ]);

    console.log(`Referral processed: ${normalizedNewUser} referred by ${normalizedReferrer}. New refcount: ${newRefcount}`);

    return NextResponse.json({
      success: true,
      message: 'Referral processed successfully',
      newUser: newUserData,
      referrer: updatedReferrerData,
      referralCount: newRefcount,
    });

  } catch (error) {
    console.error('Error processing referral:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}