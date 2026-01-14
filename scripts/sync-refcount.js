/**
 * Sync Refcount Script
 * 
 * This script syncs the referral counts from UserTrustData to refcount: keys
 * to fix the ranking system.
 * 
 * Run with: node scripts/sync-refcount.js
 */

const { Redis } = require('@upstash/redis');

// Load environment variables from .env file manually
const fs = require('fs');
const path = require('path');

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
  console.error('   Make sure .env file contains:');
  console.error('   UPSTASH_REDIS_REST_URL=...');
  console.error('   UPSTASH_REDIS_REST_TOKEN=...');
  process.exit(1);
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function syncRefcounts() {
  console.log('🔄 Starting refcount sync...\n');
  
  try {
    // Get all user keys
    const userKeys = await redis.keys('user:*');
    console.log(`📊 Found ${userKeys.length} users in the system\n`);
    
    if (userKeys.length === 0) {
      console.log('✅ No users to sync');
      return;
    }
    
    let synced = 0;
    let created = 0;
    let errors = 0;
    
    for (const userKey of userKeys) {
      try {
        // Get user data
        const userData = await redis.get(userKey);
        
        if (!userData || !userData.address) {
          console.log(`⚠️  Skipping ${userKey} - invalid data`);
          errors++;
          continue;
        }
        
        const address = userData.address.toLowerCase();
        const refcountKey = `refcount:${address}`;
        const referralCount = userData.referrals || 0;
        
        // Check if refcount exists
        const existingRefcount = await redis.get(refcountKey);
        
        if (existingRefcount === null) {
          // Create new refcount
          await redis.set(refcountKey, referralCount);
          console.log(`✅ Created refcount for ${address}: ${referralCount} referrals`);
          created++;
        } else {
          // Update existing refcount if different
          const currentCount = typeof existingRefcount === 'number' ? existingRefcount : parseInt(String(existingRefcount)) || 0;
          
          if (currentCount !== referralCount) {
            await redis.set(refcountKey, referralCount);
            console.log(`🔄 Updated refcount for ${address}: ${currentCount} → ${referralCount}`);
            synced++;
          } else {
            console.log(`✓  Refcount already correct for ${address}: ${referralCount}`);
          }
        }
      } catch (error) {
        console.error(`❌ Error processing ${userKey}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n📈 Sync Summary:');
    console.log(`   Created: ${created}`);
    console.log(`   Updated: ${synced}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Total: ${userKeys.length}`);
    console.log('\n✅ Refcount sync complete!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the sync
syncRefcounts().catch(console.error);
