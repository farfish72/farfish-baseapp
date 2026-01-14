/**
 * Check Refcount Keys Script
 * 
 * This script lists all refcount keys in Upstash
 * 
 * Run with: node scripts/check-refcounts.js
 */

const { Redis } = require('@upstash/redis');
const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.error('❌ Missing Upstash Redis environment variables');
  process.exit(1);
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function checkRefcounts() {
  console.log('🔍 Checking refcount keys...\n');
  
  try {
    const refcountKeys = await redis.keys('refcount:*');
    console.log(`📊 Found ${refcountKeys.length} refcount keys\n`);
    
    if (refcountKeys.length === 0) {
      console.log('✅ No refcount keys found');
      return;
    }
    
    // Get all values
    const values = await redis.mget(...refcountKeys);
    
    for (let i = 0; i < refcountKeys.length; i++) {
      const address = refcountKeys[i].replace('refcount:', '');
      const count = values[i] || 0;
      const referrals = typeof count === 'number' ? count : parseInt(String(count)) || 0;
      
      console.log(`${address}: ${referrals} referrals`);
    }
    
    console.log('\n✅ Check complete!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

checkRefcounts().catch(console.error);
