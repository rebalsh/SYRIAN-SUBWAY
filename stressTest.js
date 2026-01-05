const autocannon = require('autocannon');

async function runStressTest() {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDEsInVzZXJUeXBlIjoxLCJ1c2VybmFtZSI6Itix2KfYqDEiLCJlbWFpbCI6ImZheWV6ZGFyd2lzaDIyMjFAZ21haWwuY29tIiwiaWF0IjoxNzY3NjI0MjA3LCJleHAiOjE3Njc3MTA2MDd9.MRuh1XIiwX5NkI3gWlRfiGYyq8YFFC4I97t8c5etOl0';

  console.log('🔥 Starting 1000 Request Stress Test');
  console.log('='.repeat(40));

  const result = await autocannon({
    url: 'http://localhost:5000/api/stations', // جرب على أي endpoint
    connections: 1000, // 1000 اتصال متزامن
    duration: 60, // دقيقة واحدة
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  console.log('\n📊 FINAL RESULTS:');
  console.log('='.repeat(40));
  console.log(`✅ Total Requests: ${result.requests.total}`);
  console.log(`⚡ Requests/sec: ${result.requests.average}`);
  console.log(`⏱️  Latency Avg: ${result.latency.average}ms`);
  console.log(`📉 Error Rate: ${((result.errors / result.requests.total) * 100).toFixed(2)}%`);
  console.log('='.repeat(40));
}

runStressTest().catch(console.error);