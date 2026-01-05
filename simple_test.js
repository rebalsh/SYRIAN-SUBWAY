// simple_test.js - اختبار بسيط مع تفاصيل الأخطاء
const axios = require('axios');

async function simpleTest() {
  console.log('🔍 اختبار أداء النظام\n');
  
  // جرب بدون توكن أولاً
  const testUrl = 'http://localhost:5000/api/health';
  
  try {
    console.log('1. اختبار صحة السيرفر:');
    const healthResponse = await axios.get(testUrl);
    console.log(`   ✅ الصحة: ${healthResponse.data.message}`);
    console.log(`   ⏱️  الوقت: ${healthResponse.headers['x-response-time'] || 'غير معروف'}`);
  } catch (error) {
    console.log(`   ❌ السيرفر غير متاح: ${error.message}`);
    return;
  }
  
  // إذا كان عندك توكن، جرب به
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDEsInVzZXJUeXBlIjoxLCJ1c2VybmFtZSI6Itix2KfYqDEiLCJlbWFpbCI6ImZheWV6ZGFyd2lzaDIyMjFAZ21haWwuY29tIiwiaWF0IjoxNzY3NjE4Nzc2LCJleHAiOjE3Njc3MDUxNzZ9.ZFPvYButgBKZqnWUSOa6CyLxKwF5QxR2NXHIrgd27sg'; // اتركه فارغاً إذا ما عندك
  
  if (token && token !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDEsInVzZXJUeXBlIjoxLCJ1c2VybmFtZSI6Itix2KfYqDEiLCJlbWFpbCI6ImZheWV6ZGFyd2lzaDIyMjFAZ21haWwuY29tIiwiaWF0IjoxNzY3NjE4Nzc2LCJleHAiOjE3Njc3MDUxNzZ9.ZFPvYButgBKZqnWUSOa6CyLxKwF5QxR2NXHIrgd27sg') {
    console.log('\n2. اختبار مع التوكن:');
    await testWithToken(token);
  } else {
    console.log('\n⚠️  التوكن غير متوفر، جرب الخطوات التالية:');
    console.log('   1. افتح Postman');
    console.log('   2. استخدم /api/auth/login لتسجيل الدخول');
    console.log('   3. انسخ التوكن من الـ response');
    console.log('   4. ضعه في المتغير token');
  }
}

async function testWithToken(token) {
  const headers = { Authorization: `Bearer ${token}` };
  const endpoints = [
    '/api/stations',
    '/api/trains',
    '/api/stats/users'
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\n🔍 اختبار: ${endpoint}`);
    
    try {
      // الطلب الأول
      const start1 = Date.now();
      const response1 = await axios.get('http://localhost:5000' + endpoint, { headers });
      const time1 = Date.now() - start1;
      const cache1 = response1.headers['x-cache'] || 'UNKNOWN';
      
      console.log(`   المحاولة 1: ${time1}ms (Cache: ${cache1})`);
      
      // انتظار
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // الطلب الثاني
      const start2 = Date.now();
      const response2 = await axios.get('http://localhost:5000' + endpoint, { headers });
      const time2 = Date.now() - start2;
      const cache2 = response2.headers['x-cache'] || 'UNKNOWN';
      
      console.log(`   المحاولة 2: ${time2}ms (Cache: ${cache2})`);
      
      if (time1 > 0) {
        const improvement = ((time1 - time2) / time1 * 100).toFixed(1);
        console.log(`   ✅ التحسن: ${improvement}%`);
      }
      
    } catch (error) {
      console.log(`   ❌ خطأ: ${error.response?.status || 'No response'} - ${error.message}`);
    }
  }
}

// تشغيل الاختبار
simpleTest();