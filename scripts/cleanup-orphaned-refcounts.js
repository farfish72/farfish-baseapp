/**
 * Cleanup Orphaned Refcounts Script
 * 
 * This script removes refcount keys that don't have valid Trust Anchor user data.
 * Use with caution - this will permanently delete data!
 * 
 * Run with: node scripts/cleanup-orphaned-refcounts.js
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

async function cleanupOrphanedRefcounts() {
  console.log('🧹 Cleaning up orphaned refcount keys...\n');
  console.log('⚠️  WARNING: This will permanently delete refcount keys without valid user data!\n');
  
  try {
    const refcountKeys = await redis.keys('refcount:*');
    console.log(`📊 Found ${refcountKeys.length} refcount keys\n`);
    
    const toDelete = [];
    
    for (const refcountKey of refcountKeys) {
      const address = refcountKey.replace('refcount:', '');
      const userKey = `user:${address}`;
      
      const refcount = await redis.get(refcountKey);
      const userData = await redis.get(userKey);
      
      const referrals = typeof refcount === 'number' ? refcount : parseInt(String(refcount)) || 0;
      
      // Check if user data is invalid or missing
      if (!userData || !userData.address) {
        console.log(`🗑️  Will delete: ${refcountKey} (${referrals} referrals)`);
        if (!userData) {
          console.log(`   Reason: No user data found`);
        } else {
          console.log(`   Reason: Invalid user data (not Trust Anchor)`);
        }
        toDelete.push(refcountKey);
      } else {
        console.log(`✅ Keep: ${refcountKey} (${referrals} referrals) - valid user data`);
      }
    }
    
    if (toDelete.length === 0) {
      console.log('\n✅ No orphaned refcounts found!');
      return;
    }
    
    console.log(`\n⚠️  About to delete ${toDelete.length} refcount keys`);
    console.log('   This action cannot be undone!');
    console.log('\n   To proceed, uncomment the deletion code in this script.\n');
    
    // UNCOMMENT THE FOLLOWING LINES TO ACTUALLY DELETE THE KEYS:
    // for (const key of toDelete) {
    //   await redis.del(key);
    //   console.log(`   ✅ Deleted: ${key}`);
    // }
    // console.log('\n✅ Cleanup complete!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

cleanupOrphanedRefcounts().catch(console.error);
