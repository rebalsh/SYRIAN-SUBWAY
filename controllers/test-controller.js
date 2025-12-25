// اختبار استيراد paymentController
const path = require('path');
const fs = require('fs');

console.log("=== اختبار paymentController ===");

const controllerPath = path.join(__dirname, "controllers", "paymentController.js");
console.log("المسار:", controllerPath);
console.log("الملف موجود؟", fs.existsSync(controllerPath));

if (fs.existsSync(controllerPath)) {
  // قراءة الملف للتحقق
  const content = fs.readFileSync(controllerPath, 'utf8');
  
  console.log("\n=== البحث عن createStripePaymentSession ===");
  const lines = content.split('\n');
  let found = false;
  
  lines.forEach((line, index) => {
    if (line.includes("createStripePaymentSession")) {
      console.log(`سطر ${index + 1}: ${line}`);
      found = true;
    }
  });
  
  console.log("هل تم العثور على createStripePaymentSession؟", found);
  
  console.log("\n=== البحث عن module.exports ===");
  const exportLines = lines.filter(line => line.includes("module.exports") || line.includes("exports."));
  exportLines.forEach((line, index) => {
    console.log(`سطر: ${line}`);
  });
  
  // محاولة الاستيراد
  try {
    const controller = require("./controllers/paymentController");
    console.log("\n✅ تم استيراد الـ controller بنجاح");
    console.log("الدوال المتاحة:");
    Object.keys(controller).forEach(key => {
      console.log(`  ${key}: ${typeof controller[key]}`);
    });
  } catch (error) {
    console.log("\n❌ خطأ في الاستيراد:", error.message);
  }
} else {
  console.log("❌ ملف paymentController.js غير موجود!");
}