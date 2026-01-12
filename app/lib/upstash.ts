import { Redis } from '@upstash/redis';

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('Missing Upstash Redis environment variables');
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Trust Anchor data types
export interface UserTrustData {
  address: string;
  daysActive: number;
  currentStreak: number;
  lastClaimDate: string | null;
  referrals: number;
  referredBy: string | null;
  firstClaimDate: string | null;
}

// Key generators
export const getUserKey = (address: string) => `user:${address.toLowerCase()}`;
export const getReferralKey = (referrerAddress: string) => `referrals:${referrerAddress.toLowerCase()}`;
export const getRankingKey = () => 'rankings:global';

// Helper to get today's date string
export const getTodayString = () => new Date().toISOString().split('T')[0];