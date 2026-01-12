import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/app/lib/upstash';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    
    // Validate referral code format (8 characters, hex)
    if (!code || !/^[a-fA-F0-9]{8}$/.test(code)) {
      return NextResponse.json(
        { error: 'Invalid referral code format' },
        { status: 400 }
      );
    }

    // Get all user keys to find matching address
    const userKeys = await redis.keys('user:*');
    
    if (userKeys.length === 0) {
      return NextResponse.json(
        { error: 'Referral code not found' },
        { status: 404 }
      );
    }

    // Get all user data
    const allUsers = await redis.mget(...userKeys);
    
    // Find user whose address ends with the referral code
    const codeToMatch = code.toLowerCase();
    const matchingUser = allUsers.find((user: any) => {
      if (!user || !user.address) return false;
      const address = user.address.toLowerCase();
      // Referral code = last 8 characters of wallet address (without 0x)
      const addressSuffix = address.slice(-8);
      return addressSuffix === codeToMatch;
    }) as { address: string } | undefined;

    if (!matchingUser) {
      return NextResponse.json(
        { error: 'Referral code not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      referrerAddress: matchingUser.address,
      referralCode: code,
    });

  } catch (error) {
    console.error('Error resolving referral code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}