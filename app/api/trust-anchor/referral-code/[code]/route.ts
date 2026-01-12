import { NextRequest, NextResponse } from 'next/server';
import { redis, getUserKey, UserTrustData } from '@/app/lib/upstash';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    
    // Validate referral code format (8 hex characters)
    if (!code || !/^[a-fA-F0-9]{8}$/.test(code)) {
      return NextResponse.json(
        { error: 'Invalid referral code format' },
        { status: 400 }
      );
    }

    const normalizedCode = code.toLowerCase();
    
    // Search for wallet address ending with this code
    // This is a simplified approach - in production you might want to maintain a separate mapping
    const pattern = `*${normalizedCode}`;
    
    // Get all user keys and find matching wallet
    const keys = await redis.keys('user:*');
    let referrerAddress = null;
    
    for (const key of keys) {
      const address = key.replace('user:', '');
      if (address.endsWith(normalizedCode)) {
        // Verify this user exists
        const userData = await redis.get<UserTrustData>(key);
        if (userData) {
          referrerAddress = address;
          break;
        }
      }
    }
    
    if (!referrerAddress) {
      return NextResponse.json(
        { error: 'Referral code not found or expired' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      referrerAddress,
      code: normalizedCode,
    });

  } catch (error) {
    console.error('Error resolving referral code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}