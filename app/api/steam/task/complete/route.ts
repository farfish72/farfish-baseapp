import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/app/lib/upstash';

export async function POST(request: NextRequest) {
  try {
    const { wallet, taskId } = await request.json();

    if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const normalizedWallet = wallet.toLowerCase();

    // Handle fishing task
    if (taskId === 'fishing') {
      const fishingKey = `fishing:${normalizedWallet}`;
      const lastFishingTime = await redis.get(fishingKey);
      
      const now = Date.now();
      const cooldownDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      
      if (lastFishingTime) {
        const lastTime = typeof lastFishingTime === 'number' ? lastFishingTime : parseInt(String(lastFishingTime));
        const timeRemaining = cooldownDuration - (now - lastTime);
        
        if (timeRemaining > 0) {
          return NextResponse.json(
            { 
              error: 'Fishing on cooldown',
              cooldownRemaining: Math.ceil(timeRemaining / 1000)
            },
            { status: 429 }
          );
        }
      }

      // Set new fishing timestamp
      await redis.set(fishingKey, now);
      
      // Award fishing rewards (could be tracked separately)
      const rewardsKey = `rewards:${normalizedWallet}`;
      const currentRewards = await redis.get(rewardsKey) || 0;
      const newRewards = (typeof currentRewards === 'number' ? currentRewards : parseInt(String(currentRewards)) || 0) + 10;
      await redis.set(rewardsKey, newRewards);

      return NextResponse.json({
        success: true,
        message: 'Fishing completed successfully',
        reward: 10,
        totalRewards: newRewards,
        nextFishingTime: now + cooldownDuration,
      });
    }

    return NextResponse.json(
      { error: 'Unknown task ID' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error completing task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}