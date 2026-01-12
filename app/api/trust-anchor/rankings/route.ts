import { NextRequest, NextResponse } from 'next/server';
import { redis, UserTrustData } from '@/app/lib/upstash';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    // Get all user keys
    const userKeys = await redis.keys('user:*');
    
    if (userKeys.length === 0) {
      // No users in system - this user gets rank 1
      return NextResponse.json({ 
        rank: 1, 
        totalUsers: 1,
        userReferrals: 0 
      });
    }

    // Get all user data
    const allUsers = await redis.mget(...userKeys);
    
    // Filter out null values and ensure proper typing
    const validUsers = allUsers
      .filter((user): user is UserTrustData => user !== null && typeof user === 'object')
      .map(user => ({
        address: user.address,
        referrals: user.referrals || 0
      }))
      .sort((a, b) => b.referrals - a.referrals); // Sort by referrals descending

    console.log('Valid users for ranking:', validUsers);

    // Find user's rank
    const userAddress = address.toLowerCase();
    const userIndex = validUsers.findIndex(user => user.address === userAddress);
    
    let rank: number;
    let userReferrals = 0;
    
    if (userIndex === -1) {
      // User not found in system - they get the next available rank
      // If there are N users, new user gets rank N+1
      rank = validUsers.length + 1;
      userReferrals = 0;
    } else {
      // User found - their rank is their position in the sorted list (1-based)
      rank = userIndex + 1;
      userReferrals = validUsers[userIndex].referrals;
    }

    // Total users includes the current user if they exist, or adds 1 if they don't
    const totalUsers = userIndex === -1 ? validUsers.length + 1 : validUsers.length;

    console.log(`Ranking for ${userAddress}: rank=${rank}, totalUsers=${totalUsers}, userReferrals=${userReferrals}`);

    return NextResponse.json({
      rank,
      totalUsers,
      userReferrals,
    });
  } catch (error) {
    console.error('Error calculating rankings:', error);
    
    // Even on error, return a valid rank to prevent empty states
    return NextResponse.json({
      rank: 1,
      totalUsers: 1,
      userReferrals: 0,
    });
  }
}