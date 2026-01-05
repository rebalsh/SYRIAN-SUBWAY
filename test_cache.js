 
// test_cache.js - ملف اختبار أداء النظام مع الكاش
const axios = require('axios');

// إعدادات الاختبار
const BASE_URL = 'http://localhost:5000/api';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDEsInVzZXJUeXBlIjoxLCJ1c2VybmFtZSI6Itix2KfYqDEiLCJlbWFpbCI6ImZheWV6ZGFyd2lzaDIyMjFAZ21haWwuY29tIiwiaWF0IjoxNzY3NjE4Nzc2LCJleHAiOjE3Njc3MDUxNzZ9.ZFPvYButgBKZqnWUSOa6CyLxKwF5QxR2NXHIrgd27sg'; // ضع توكن حقيقي من Postman

// نقاط الاختبار
const endpoints = [
  {
    name: 'جميع المحطات',
    url: '/stations',
    description: 'GET /api/stations - كاش 30 دقيقة'
  },
  {
    name: 'جميع القطارات',
    url: '/trains',
    description: 'GET /api/trains - كاش 3 دقائق'
  },
  {
    name: 'إحصائيات المستخدمين',
    url: '/stats/users',
    description: 'GET /api/stats/users - كاش 5 دقائق'
  },
  {
    name: 'إحصائيات التذاكر',
    url: '/stats/tickets',
    description: 'GET /api/stats/tickets - كاش 5 دقائق'
  },
  {
    name: 'محطة محددة',
    url: '/stations/1',
    description: 'GET /api/stations/1 - كاش 30 دقيقة'
  }
];

// headers للطلبات
const headers = {
  'Authorization': `Bearer ${TEST_TOKEN}`,
  'Content-Type': 'application/json'
};

// دالة اختبار نقطة واحدة
async function testEndpoint(endpoint) {
  console.log(`\n🔍 اختبار: ${endpoint.name}`);
  console.log(`   📍 ${endpoint.description}`);
  
  const results = {
    firstRequest: 0,
    secondRequest: 0,
    cacheStatus: []
  };
  
  try {
    // 🔹 الطلب الأول (بدون كاش)
    console.log('   محاولة 1 - من دون كاش:');
    const start1 = Date.now();
    const response1 = await axios.get(BASE_URL + endpoint.url, { headers });
    const time1 = Date.now() - start1;
    results.firstRequest = time1;
    
    const cacheStatus1 = response1.headers['x-cache'] || 'MISS';
    results.cacheStatus.push(cacheStatus1);
    
    console.log(`     ⏱️  الوقت: ${time1}ms`);
    console.log(`     📦 حالة الكاش: ${cacheStatus1}`);
    console.log(`     📊 حجم البيانات: ${JSON.stringify(response1.data).length} بايت`);
    
    // انتظار ثانية
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 🔹 الطلب الثاني (مع كاش)
    console.log('   محاولة 2 - مع كاش:');
    const start2 = Date.now();
    const response2 = await axios.get(BASE_URL + endpoint.url, { headers });
    const time2 = Date.now() - start2;
    results.secondRequest = time2;
    
    const cacheStatus2 = response2.headers['x-cache'] || 'UNKNOWN';
    results.cacheStatus.push(cacheStatus2);
    
    console.log(`     ⏱️  الوقت: ${time2}ms`);
    console.log(`     📦 حالة الكاش: ${cacheStatus2}`);
    console.log(`     🔑 مفتاح الكاش: ${response2.headers['x-cache-key'] || 'غير معروف'}`);
    
    // 🔹 حساب التحسن
    if (time1 > 0) {
      const improvement = ((time1 - time2) / time1 * 100).toFixed(1);
      console.log(`     ✅ التحسن: ${improvement}% أسرع`);
      results.improvement = improvement;
    }
    
    // انتظار ثانية
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 🔹 الطلب الثالث (تأكيد)
    console.log('   محاولة 3 - تأكيد الكاش:');
    const start3 = Date.now();
    const response3 = await axios.get(BASE_URL + endpoint.url, { headers });
    const time3 = Date.now() - start3;
    
    const cacheStatus3 = response3.headers['x-cache'] || 'UNKNOWN';
    results.cacheStatus.push(cacheStatus3);
    
    console.log(`     ⏱️  الوقت: ${time3}ms`);
    console.log(`     📦 حالة الكاش: ${cacheStatus3}`);
    
    return results;
    
  } catch (error) {
    console.log(`   ❌ خطأ: ${error.message}`);
    if (error.response) {
      console.log(`     📍 الرابط: ${BASE_URL + endpoint.url}`);
      console.log(`     📋 الحالة: ${error.response.status}`);
      console.log(`     📝 الرسالة: ${error.response.data?.message || 'لا توجد رسالة'}`);
    }
    return null;
  }
}

// الدالة الرئيسية
async function runAllTests() {
  console.log('🚀 بدء اختبار أداء نظام القطارات');
  console.log('='.repeat(70));
  console.log(`⏰ الوقت: ${new Date().toLocaleString()}`);
  console.log(`📍 الرابط الأساسي: ${BASE_URL}`);
  console.log(`🔑 مستخدم: ${TEST_TOKEN ? 'تم التعريف' : 'غير معروف'}`);
  console.log('='.repeat(70));
  
  const allResults = [];
  let successCount = 0;
  
  // اختبار كل نقطة
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    if (result) {
      allResults.push({
        name: endpoint.name,
        ...result
      });
      successCount++;
    }
  }
  
  // عرض النتائج الإجمالية
  console.log('\n' + '='.repeat(70));
  console.log('📊 النتائج الإجمالية');
  console.log('='.repeat(70));
  
  if (allResults.length > 0) {
    console.log('\n📋 جدول المقارنة:');
    console.log('─'.repeat(80));
    console.log('النقطة                   | من دون كاش  | مع كاش     | التحسن    | حالة الكاش');
    console.log('─'.repeat(80));
    
    allResults.forEach(result => {
      const name = result.name.padEnd(25);
      const first = `${result.firstRequest}ms`.padStart(10);
      const second = `${result.secondRequest}ms`.padStart(10);
      const improvement = result.improvement ? `${result.improvement}%`.padStart(8) : 'N/A'.padStart(8);
      const cacheStatus = result.cacheStatus[1] || 'UNKNOWN';
      
      console.log(`${name} | ${first} | ${second} | ${improvement} | ${cacheStatus}`);
    });
    
    console.log('─'.repeat(80));
    
    // حساب المتوسطات
    const avgFirst = allResults.reduce((sum, r) => sum + r.firstRequest, 0) / allResults.length;
    const avgSecond = allResults.reduce((sum, r) => sum + r.secondRequest, 0) / allResults.length;
    const avgImprovement = ((avgFirst - avgSecond) / avgFirst * 100).toFixed(1);
    
    console.log(`\n📈 المتوسطات الإجمالية:`);
    console.log(`   ⏱️  متوسط الوقت بدون كاش: ${avgFirst.toFixed(2)}ms`);
    console.log(`   ⏱️  متوسط الوقت مع كاش: ${avgSecond.toFixed(2)}ms`);
    console.log(`   📊 متوسط التحسن: ${avgImprovement}%`);
    
    // حفظ النتائج في ملف
    const fs = require('fs');
    const resultFile = 'test_results.json';
    
    const output = {
      testDate: new Date().toISOString(),
      baseUrl: BASE_URL,
      endpointsTested: successCount,
      results: allResults,
      summary: {
        averageWithoutCache: avgFirst,
        averageWithCache: avgSecond,
        averageImprovement: avgImprovement
      }
    };
    
    fs.writeFileSync(resultFile, JSON.stringify(output, null, 2));
    console.log(`\n💾 تم حفظ النتائج في: ${resultFile}`);
  }
  
  console.log('\n' + '='.repeat(70));
  console.log(`✅ تم إكمال اختبار ${successCount} من ${endpoints.length} نقطة`);
  console.log('='.repeat(70));
}

// رسالة إذا التوكن غير موجود
if (TEST_TOKEN === 'ضع_التوكن_هنا') {
  console.log('⚠️  تحذير: لم تقم بتعيين التوكن!');
  console.log('كيفية الحصول على التوكن:');
  console.log('1. افتح Postman');
  console.log('2. سجل دخول بأي مستخدم');
  console.log('3. انسخ التوكن من headers');
  console.log('4. ضع التوكن في متغير TEST_TOKEN');
  console.log('\nأو قم بتعديل الكود لاختبار نقطة بدون توكن.');
  
  // خيار: اختبار نقطة عامة بدون توكن
  const testWithoutToken = async () => {
    console.log('\n🔍 محاولة اختبار نقطة عامة بدون توكن...');
    try {
      const response = await axios.get('http://localhost:5000/api/health');
      console.log(`✅ الصحة: ${response.data.message}`);
    } catch (error) {
      console.log(`❌ لا يمكن الوصول: ${error.message}`);
    }
  };
  
  testWithoutToken().then(() => {
    console.log('\n📝 قم بتعديل TEST_TOKEN في السطر 6 ثم أعد التشغيل.');
  });
} else {
  // تشغيل الاختبارات
  runAllTests().catch(error => {
    console.error('❌ خطأ في الاختبار:', error.message);
  });
}