/**
 * Test Rankings Script
 * 
 * This script tests the ranking system with the existing users
 * 
 * Run with: node scripts/test-rankings.js
 */

const testUsers = [
  '0xbf7ed0f9d543ea11cfe6ea3fe993dd6e8ac78ee9',
  '0xc7a4b3c14a28cdf65225ba14c67e1b18e11f9422',
];

async function testRankings() {
  console.log('🧪 Testing Trust Anchor Ranking System\n');
  
  for (const address of testUsers) {
    console.log(`\n📍 Testing user: ${address}`);
    
    try {
      // Test user data endpoint
      const userResponse = await fetch(`http://localhost:3000/api/trust-anchor/user/${address}`);
      const userData = await userResponse.json();
      console.log('   User Data:', JSON.stringify(userData, null, 2));
      
      // Test rankings endpoint
      const rankResponse = await fetch(`http://localhost:3000/api/trust-anchor/rankings?address=${address}`);
      const rankData = await rankResponse.json();
      console.log('   Ranking:', JSON.stringify(rankData, null, 2));
      
    } catch (error) {
      console.error(`   ❌ Error testing ${address}:`, error.message);
    }
  }
  
  console.log('\n✅ Test complete!');
}

testRankings().catch(console.error);
