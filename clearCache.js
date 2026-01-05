// clearCache.js - النسخة البسيطة
const redisClient = require("./config/redis");

async function clearCache() {
  try {
    console.log('🧹 Starting cache cleanup...');
    
    // اعرض مفاتيح الكاش الحالية
    const allKeys = await redisClient.keys('*');
    console.log(`📋 Found ${allKeys.length} cache keys:`);
    
    if (allKeys.length > 0) {
      allKeys.forEach(key => console.log(`  - ${key}`));
      
      // امسح كل الكاش
      const result = await redisClient.flushall();
      console.log(`✅ Cache cleared successfully: ${result}`);
    } else {
      console.log('✅ Cache is already empty');
    }
    
    // تحقق
    const remainingKeys = await redisClient.keys('*');
    console.log(`📋 Remaining keys: ${remainingKeys.length}`);
    
    console.log('\n🎉 Cache cleanup completed!');
    process.exit(0);
    
  } catch (err) {
    console.error('❌ Error clearing cache:', err.message);
    process.exit(1);
  }
}

clearCache();