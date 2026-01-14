/**
 * Diagnose User Data Script
 * 
 * This script checks all user entries to identify invalid data
 * 
 * Run with: node scripts/diagnose-users.js
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

async function diagnoseUsers() {
  console.log('🔍 Diagnosing user data...\n');
  
  try {
    const userKeys = await redis.keys('user:*');
    console.log(`📊 Found ${userKeys.length} user keys\n`);
    
    for (const userKey of userKeys) {
      const userData = await redis.get(userKey);
      console.log(`\n🔑 Key: ${userKey}`);
      console.log(`📄 Data:`, JSON.stringify(userData, null, 2));
      
      if (!userData) {
        console.log('   ⚠️  NULL or undefined data');
      } else if (typeof userData !== 'object') {
        console.log(`   ⚠️  Invalid type: ${typeof userData}`);
      } else if (!userData.address) {
        console.log('   ⚠️  Missing address field');
      } else {
        console.log('   ✅ Valid data structure');
      }
    }
    
    console.log('\n✅ Diagnosis complete!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

diagnoseUsers().catch(console.error);
