import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/app/lib/upstash';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    const normalizedWallet = wallet.toLowerCase();
    
    // Get fishing cooldown from KV
    const fishingKey = `fishing:${normalizedWallet}`;
    const lastFishingTime = await redis.get(fishingKey);
    
    let fishingCooldown = 0;
    if (lastFishingTime) {
      const lastTime = typeof lastFishingTime === 'number' ? lastFishingTime : parseInt(String(lastFishingTime));
      const now = Date.now();
      const cooldownDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      const timeRemaining = cooldownDuration - (now - lastTime);
      
      if (timeRemaining > 0) {
        fishingCooldown = Math.ceil(timeRemaining / 1000); // Convert to seconds
      }
    }

    // Get other task statuses from KV
    const taskStatuses = {
      fishing: fishingCooldown > 0,
    };

    return NextResponse.json({
      success: true,
      fishingCooldown,
      tasks: taskStatuses,
    });

  } catch (error) {
    console.error('Error fetching task status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}