// // const express = require("express");
// // const router = express.Router();
// // const paymentController = require("../controllers/paymentController");
// // const authMiddleware = require("../middleware/authMiddleware");
// // const roleMiddleware = require("../middleware/roleMiddleware");

// // // 1. إنشاء جلسة دفع
// // router.post("/create-session",
// //   authMiddleware,
// //   roleMiddleware([1]),
// //   paymentController.createPaymentSession
// // );

// // // 2. تأكيد الدفع
// // router.post("/confirm",
// //   authMiddleware,
// //   roleMiddleware([1]),
// //   paymentController.confirmPayment
// // );

// // // 3. التحقق من حالة الدفع
// // router.get("/status",
// //   authMiddleware,
// //   roleMiddleware([1]),
// //   paymentController.checkPaymentStatus
// // );

// // module.exports = router;




// // const express = require("express");
// // const router = express.Router();
// // const paymentController = require("../controllers/paymentController");
// // const { authenticate } = require("../middleware/authMiddleware");

// // // 🔴 **الدفع عبر Stripe**
// // router.post("/create-session", authenticate, paymentController.createStripePaymentSession);
// // router.post("/webhook", paymentController.stripeWebhook); // ⚠️ بدون authenticate
// // router.get("/details", authenticate, paymentController.getPaymentDetails);
// // router.post("/convert-currency", authenticate, paymentController.convertCurrency);

// // // 🔴 **للتطوير فقط**
// // router.post("/mock-payment", authenticate, paymentController.createMockPayment);

// // module.exports = router;

// // const express = require("express");
// // const router = express.Router();
// // const paymentController = require("../controllers/paymentController");
// // const { authenticate } = require("../middleware/authMiddleware");

// // // 🔴 **الدفع عبر Stripe**
// // router.post("/create-session", authenticate, paymentController.createStripePaymentSession);
// // router.post("/webhook", paymentController.stripeWebhook); // ⚠️ بدون authenticate
// // router.get("/details", authenticate, paymentController.getPaymentDetails);
// // router.post("/convert-currency", authenticate, paymentController.convertCurrency);

// // // 🔴 **للتطوير فقط**
// // router.post("/mock-payment", authenticate, paymentController.createMockPayment);

// // module.exports = router;











// // routes/paymentRoutes.js
// const express = require("express");
// const router = express.Router();
// const paymentController = require("../controllers/paymentController");
// const authMiddleware = require("../middleware/authMiddleware");
// const roleMiddleware = require("../middleware/roleMiddleware");

// // ✅ صلاحيات: اليوزر تايب 1 فقط (المسافرين)
// const passengerOnly = roleMiddleware([1]);

// // ✅ لـ webhook: ضروري express.raw() لمعالجة البيانات الخام من Stripe
// const webhookHandler = express.raw({ type: 'application/json' });

// // ✅ 1. إنشاء جلسة دفع Stripe
// router.post("/create-session", 
//   authMiddleware,          // تحقق من التوكن
//   passengerOnly,           // تحقق من الصلاحية (يوزر تايب 1 فقط)
//   paymentController.createStripePaymentSession
// );

// // ✅ 2. Webhook من Stripe (بدون مصادقة)
// router.post("/webhook", 
//   webhookHandler,          // لمعالجة البيانات الخام
//   paymentController.stripeWebhook
// );

// // ✅ 3. الحصول على تفاصيل الدفع
// router.get("/details", 
//   authMiddleware, 
//   passengerOnly, 
//   paymentController.getPaymentDetails
// );

// // ✅ 4. تحويل العملة
// router.post("/convert-currency", 
//   authMiddleware, 
//   passengerOnly, 
//   paymentController.convertCurrency
// );

// // ✅ 5. اختبار دفع وهمي (للتطوير)
// router.post("/mock-payment", 
//   authMiddleware, 
//   passengerOnly, 
//   paymentController.createMockPayment
// );

// module.exports = router;




const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ✅ صلاحيات: اليوزر تايب 1 فقط (المسافرين)
const passengerOnly = roleMiddleware([1]);

// ✅ صلاحيات: اليوزر تايب 3,4,5 (الموظفين، المشرفين، السائقين)
const staffOnly = roleMiddleware([3, 4, 5]);

// ✅ صلاحيات: اليوزر تايب 2 (الموظفين الإداريين)
const adminOnly = roleMiddleware([2]);

// ✅ صلاحيات: الكل (بعد التوثيق)
const authenticated = authMiddleware;

// ✅ لـ webhook: ضروري express.raw() لمعالجة البيانات الخام من Stripe
const webhookHandler = express.raw({ type: 'application/json' });

// ========================
// 🔴 **1. مسارات Stripe الرئيسية**
// ========================

// ✅ 1. إنشاء جلسة دفع Stripe
router.post("/create-session", 
  authMiddleware,          // تحقق من التوكن
  passengerOnly,           // تحقق من الصلاحية (يوزر تايب 1 فقط)
  paymentController.createStripePaymentSession
);

// ✅ 2. Webhook من Stripe (بدون مصادقة - Stripe هي اللي بتبعت)
router.post("/webhook", 
  webhookHandler,          // لمعالجة البيانات الخام من Stripe
  paymentController.stripeWebhook
);

// ✅ 3. Webhook اختبار (بدون توقيع - للتطوير)
router.post("/test-webhook",
  paymentController.stripeWebhook  // نفس الدالة لكن بتعامل مع الاختبار
);

// ========================
// 🔴 **2. مسارات الدفع الوهمي (للتطوير)**
// ========================

// ✅ 4. اختبار دفع وهمي (للتطوير)
router.post("/mock-payment", 
  authMiddleware, 
  passengerOnly, 
  paymentController.createMockPayment
);

// ✅ 5. تأكيد الدفع يدوياً (للتطوير - بديل Webhook)
router.post("/manual-confirm", 
  authMiddleware, 
  passengerOnly, 
  paymentController.manualConfirmPayment
);

// ========================
// 🔴 **3. مسارات المعلومات والاستعلامات**
// ========================

// ✅ 6. الحصول على تفاصيل الدفع
router.get("/details", 
  authMiddleware, 
  passengerOnly, 
  paymentController.getPaymentDetails
);

// ✅ 7. تحويل العملة (IQD إلى USD)
router.post("/convert-currency", 
  authMiddleware, 
  passengerOnly, 
  paymentController.convertCurrency
);

// ✅ 8. اختبار اتصال Stripe
router.get("/test-connection", 
  authMiddleware,          // يحتاج توثيق
  paymentController.testStripeConnection
);

// ✅ 9. اختبار اتصال Stripe (عام - بدون توثيق للاختبار السريع)
router.get("/public-test", 
  paymentController.testStripeConnection
);

// ========================
// 🔴 **4. مسارات الإدارة (للموظفين)**
// ========================

// ✅ 10. استرداد تذكرة (للموظفين)
router.post("/refund", 
  authMiddleware,
  staffOnly,              // للموظفين والمشرفين فقط
  paymentController.refundTicket
);

// ✅ 11. جلب جميع المدفوعات (للمشرفين)
router.get("/all", 
  authMiddleware,
  adminOnly,              // للإداريين فقط
  async (req, res) => {
    try {
      const payments = await Payment.findAll({
        include: [
          { model: Ticket, include: [{ model: Trip }] },
          { model: User, attributes: ['id', 'username', 'email'] }
        ],
        order: [['timestamp', 'DESC']],
        limit: 100
      });
      
      res.json({
        success: true,
        count: payments.length,
        payments: payments
      });
    } catch (err) {
      res.status(500).json({
        message: "خطأ في جلب المدفوعات",
        error: err.message
      });
    }
  }
);

// ✅ 12. إحصائيات المدفوعات
router.get("/stats", 
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const totalPayments = await Payment.count();
      const totalAmount = await Payment.sum('amount');
      const completedPayments = await Payment.count({ where: { status: 'completed' } });
      const pendingPayments = await Payment.count({ where: { status: 'pending' } });
      
      res.json({
        success: true,
        stats: {
          total_payments: totalPayments,
          total_amount: totalAmount || 0,
          completed_payments: completedPayments,
          pending_payments: pendingPayments,
          success_rate: totalPayments > 0 ? (completedPayments / totalPayments * 100).toFixed(2) : 0
        }
      });
    } catch (err) {
      res.status(500).json({
        message: "خطأ في جلب الإحصائيات",
        error: err.message
      });
    }
  }
);

// ========================
// 🔴 **5. مسارات الصحة والاختبار**
// ========================

// ✅ 13. صفحة الصحة (Health Check)
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "Payment API",
    timestamp: new Date().toISOString(),
    endpoints: [
      "POST /create-session",
      "POST /mock-payment", 
      "POST /manual-confirm",
      "GET /details",
      "POST /convert-currency"
    ],
    note: "For development: use mock-payment or manual-confirm"
  });
});

// ✅ 14. اختبار المصادقة
router.get("/test-auth", 
  authMiddleware,
  (req, res) => {
    res.json({
      success: true,
      message: "المصادقة ناجحة",
      user: {
        id: req.user.id,
        username: req.user.username,
        user_type: req.user.user_type
      },
      permissions: {
        can_pay: req.user.user_type === 1,
        is_staff: [3, 4, 5].includes(req.user.user_type),
        is_admin: req.user.user_type === 2
      }
    });
  }
);

// ✅ 15. قائمة جميع المسارات
router.get("/routes", (req, res) => {
  const routes = [
    {
      method: "POST",
      path: "/api/payments/create-session",
      description: "إنشاء جلسة دفع Stripe",
      auth: "مطلوب (مسافر)",
      body: "{ ticket_id أو periodic_ticket_number }"
    },
    {
      method: "POST",
      path: "/api/payments/mock-payment",
      description: "دفع وهمي للتطوير",
      auth: "مطلوب (مسافر)",
      body: "{ ticket_id أو periodic_ticket_number }"
    },
    {
      method: "POST", 
      path: "/api/payments/manual-confirm",
      description: "تأكيد يدوي للدفع (بديل Webhook)",
      auth: "مطلوب (مسافر)",
      body: "{ periodic_ticket_number }"
    },
    {
      method: "GET",
      path: "/api/payments/details",
      description: "تفاصيل الدفع",
      auth: "مطلوب (مسافر)",
      query: "session_id أو periodic_ticket_number"
    },
    {
      method: "POST",
      path: "/api/payments/convert-currency",
      description: "تحويل IQD إلى USD",
      auth: "مطلوب (مسافر)",
      body: "{ amount_iqd }"
    },
    {
      method: "GET",
      path: "/api/payments/test-connection",
      description: "اختبار اتصال Stripe",
      auth: "مطلوب"
    },
    {
      method: "POST",
      path: "/api/payments/refund",
      description: "استرداد تذكرة",
      auth: "مطلوب (موظف)"
    },
    {
      method: "GET",
      path: "/api/payments/health",
      description: "فحص صحة الخدمة",
      auth: "غير مطلوب"
    },
    {
      method: "POST",
      path: "/api/payments/webhook",
      description: "Webhook من Stripe (لا تستدعيه يدوياً)",
      auth: "غير مطلوب",
      note: "Stripe هي اللي بتبعت له"
    }
  ];
  
  res.json({
    service: "Metro Payment System API",
    version: "1.0.0",
    total_routes: routes.length,
    routes: routes
  });
});

// ✅ 16. صفحة تعليمات الاستخدام
router.get("/instructions", (req, res) => {
  res.json({
    title: "تعليمات استخدام نظام الدفع",
    development_flow: [
      "1. استخدم /periodic-tickets/book لحجز التذكرة",
      "2. خذ periodic_ticket_number من الرد",
      "3. استخدم /payments/mock-payment للدفع الوهمي",
      "4. أو استخدم /payments/create-session للدفع بـ Stripe",
      "5. بعد الدفع في Stripe، استخدم /payments/manual-confirm",
      "6. تحقق من التذاكر بـ /periodic-tickets/my-periodic-tickets"
    ],
    test_data: {
      test_card: "4242 4242 4242 4242",
      test_expiry: "12/34",
      test_cvc: "123",
      test_country: "United States"
    },
    important_notes: [
      "لا تستدعي /webhook يدوياً - Stripe هي اللي تبعت",
      "استخدم mock-payment أو manual-confirm للتطوير",
      "التذاكر تبقى pending حتى تأكيد الدفع",
      "Webhook حقيقي يعمل فقط في الإنتاج مع Stripe CLI أو نشر فعلي"
    ]
  });
});

module.exports = router;