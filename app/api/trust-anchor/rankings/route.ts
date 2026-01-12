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

    const normalizedAddress = address.toLowerCase();

    // Get all refcount keys (real referral data from Upstash)
    const allRefcountKeys = await redis.keys('refcount:*');
    
    if (allRefcountKeys.length === 0) {
      // No users in system - this user gets rank 1
      return NextResponse.json({ 
        rank: 1, 
        totalUsers: 1,
        userReferrals: 0 
      });
    }

    // Get all referral counts
    const allRefcounts = await redis.mget(...allRefcountKeys);
    
    // Create user referral data
    const userReferrals = [];
    for (let i = 0; i < allRefcountKeys.length; i++) {
      const userAddr = allRefcountKeys[i].replace('refcount:', '');
      const count = allRefcounts[i] || 0;
      userReferrals.push({
        address: userAddr,
        referrals: typeof count === 'number' ? count : parseInt(String(count)) || 0
      });
    }
    
    // Sort by referrals descending
    userReferrals.sort((a, b) => b.referrals - a.referrals);

    console.log('User referrals for ranking:', userReferrals);

    // Find user's rank
    const userIndex = userReferrals.findIndex(u => u.address === normalizedAddress);
    
    let rank: number;
    let userReferralCount = 0;
    
    if (userIndex === -1) {
      // User not found in system - they get the next available rank
      rank = userReferrals.length + 1;
      userReferralCount = 0;
    } else {
      // User found - their rank is their position in the sorted list (1-based)
      rank = userIndex + 1;
      userReferralCount = userReferrals[userIndex].referrals;
    }

    // Total users includes the current user if they exist, or adds 1 if they don't
    const totalUsers = userIndex === -1 ? userReferrals.length + 1 : userReferrals.length;

    console.log(`Ranking for ${normalizedAddress}: rank=${rank}, totalUsers=${totalUsers}, userReferrals=${userReferralCount}`);

    return NextResponse.json({
      rank,
      totalUsers,
      userReferrals: userReferralCount,
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