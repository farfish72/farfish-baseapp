/**
 * Verify User Data Script
 * 
 * This script checks if all refcount keys have valid user data
 * 
 * Run with: node scripts/verify-user-data.js
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

async function verifyUserData() {
  console.log('🔍 Verifying user data consistency...\n');
  
  try {
    const refcountKeys = await redis.keys('refcount:*');
    console.log(`📊 Found ${refcountKeys.length} refcount keys\n`);
    
    for (const refcountKey of refcountKeys) {
      const address = refcountKey.replace('refcount:', '');
      const userKey = `user:${address}`;
      
      const refcount = await redis.get(refcountKey);
      const userData = await redis.get(userKey);
      
      const referrals = typeof refcount === 'number' ? refcount : parseInt(String(refcount)) || 0;
      
      console.log(`\n🔑 ${address}`);
      console.log(`   Refcount: ${referrals}`);
      
      if (!userData) {
        console.log(`   ⚠️  No user data found`);
      } else if (!userData.address) {
        console.log(`   ⚠️  Invalid user data (Steam data)`);
        console.log(`   Data:`, JSON.stringify(userData).substring(0, 100) + '...');
      } else {
        console.log(`   ✅ Valid Trust Anchor data`);
        console.log(`   User referrals field: ${userData.referrals}`);
        if (userData.referrals !== referrals) {
          console.log(`   ⚠️  Mismatch! User data shows ${userData.referrals} but refcount is ${referrals}`);
        }
      }
    }
    
    console.log('\n✅ Verification complete!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

verifyUserData().catch(console.error);
