const autocannon = require('autocannon');

// إعدادات اختبارك
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDEsInVzZXJUeXBlIjoxLCJ1c2VybmFtZSI6Itix2KfYqDEiLCJlbWFpbCI6ImZheWV6ZGFyd2lzaDIyMjFAZ21haWwuY29tIiwiaWF0IjoxNzY3NjM0NjM2LCJleHAiOjE3Njc3MjEwMzZ9.J87iGp1soLV6Lhokdc_fmTFsUTPjKVhAUhMHViPRNB4'; 

const endpoints = [
          { name: 'GET Trips', path: '/api/trips' }
];

async function testEndpoint(endpoint) {
  console.log(`\n🔍 Testing: ${endpoint.name}`);
  console.log('─'.repeat(30));

  const result = await autocannon({
    url: `http://localhost:5000${endpoint.path}`,
    connections: 250, // 250 طلب متزامن
    duration: 30, // 30 ثانية
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  console.log(`✅ Requests: ${result.requests.total}`);
  console.log(`📈 Avg Latency: ${result.latency.average}ms`);
  console.log(`📉 Errors: ${result.errors}`);
  console.log(`⚡ Throughput: ${Math.round(result.throughput.total / 1024)} KB/sec`);
  
  return result;
}

async function runAllTests() {
  console.log('🚀 Starting Load Tests with REAL Token');
  console.log('='.repeat(40));

  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
  }
}

runAllTests().catch(console.error);