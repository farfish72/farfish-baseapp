import { NextRequest, NextResponse } from 'next/server';
import { redis, getUserKey, UserTrustData } from '@/app/lib/upstash';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const userKey = getUserKey(normalizedAddress);
    
    // Get user data from our Trust Anchor structure
    let userData = await redis.get<UserTrustData>(userKey);
    
    // Validate that this is Trust Anchor data (not Steam or other feature data)
    if (userData && !userData.address) {
      // This is not Trust Anchor data, treat as new user
      userData = null;
    }
    
    // Get real referral count from Upstash refcount system
    const refcountKey = `refcount:${normalizedAddress}`;
    const realReferralCount = await redis.get(refcountKey);
    const referrals = realReferralCount ? (typeof realReferralCount === 'number' ? realReferralCount : parseInt(String(realReferralCount)) || 0) : 0;

    if (!userData) {
      // Return default data for new users, but with real referral count
      const defaultData: UserTrustData = {
        address: normalizedAddress,
        daysActive: 0,
        currentStreak: 0,
        lastClaimDate: null,
        referrals: referrals, // Use real referral count from Upstash
        referredBy: null,
        firstClaimDate: null,
      };
      
      return NextResponse.json(defaultData);
    }

    // Update existing user data with real referral count
    userData.referrals = referrals;

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching user trust data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}