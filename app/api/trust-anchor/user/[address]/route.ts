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

    const userKey = getUserKey(address);
    const userData = await redis.get<UserTrustData>(userKey);

    if (!userData) {
      // Return default data for new users
      const defaultData: UserTrustData = {
        address: address.toLowerCase(),
        daysActive: 0,
        currentStreak: 0,
        lastClaimDate: null,
        referrals: 0,
        referredBy: null,
        firstClaimDate: null,
      };
      
      return NextResponse.json(defaultData);
    }

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching user trust data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}