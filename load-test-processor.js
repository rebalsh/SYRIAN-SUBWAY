// load-test-processor.js
module.exports = {
  // دالة لوضع التوكن في الهيدر
  setAuthToken: function (context, events, done) {
    // إذا كان هناك توكن محفوظ
    if (context.vars.authToken) {
      // نضع التوكن في هيدر Authorization
      context.vars.headers = context.vars.headers || {};
      context.vars.headers['Authorization'] = `Bearer ${context.vars.authToken}`;
      console.log(`🔑 تم تعيين التوكن: ${context.vars.authToken.substring(0, 20)}...`);
    } else {
      console.log("⚠️  لا يوجد توكن متاح");
    }
    return done();
  },

  // دالة لفحص الاستجابة
  checkResponse: function (requestParams, response, context, events, done) {
    // نسجل أي خطأ
    if (response.statusCode !== 200) {
      console.log(`❌ خطأ ${response.statusCode} في: ${requestParams.url}`);
      console.log(`   الرسالة: ${response.body}`);
    } else {
      console.log(`✅ ناجح ${response.statusCode} في: ${requestParams.url}`);
    }
    return done();
  }
};