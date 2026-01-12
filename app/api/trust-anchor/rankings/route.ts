import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/app/lib/upstash';

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
    
    // Filter out null values and sort by referrals (descending)
    const validUsers = allUsers
      .filter((user): user is any => user !== null)
      .sort((a, b) => b.referrals - a.referrals);

    // Find user's rank
    const userAddress = address.toLowerCase();
    const userIndex = validUsers.findIndex(user => user.address === userAddress);
    
    // CRITICAL: NO user should ever display empty, null, or "--" rank
    // If user not found in system, they get rank based on total users + 1
    // If user exists, they get their position in the sorted list (1-based)
    let rank: number;
    let userReferrals = 0;
    
    if (userIndex === -1) {
      // User not found in system - assign them the next available rank
      rank = validUsers.length + 1;
      userReferrals = 0;
    } else {
      // User found - assign their rank based on position (1-based indexing)
      rank = userIndex + 1;
      userReferrals = validUsers[userIndex].referrals;
    }

    // Ensure rank is always a positive integer
    rank = Math.max(1, rank);
    const totalUsers = Math.max(1, validUsers.length);

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