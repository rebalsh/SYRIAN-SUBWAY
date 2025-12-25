// const express = require("express");
// const router = express.Router();
// const { register, login } = require("../controllers/authController");

// // تسجيل مستخدم عادي
// router.post("/register", register);

// // تسجيل دخول
// router.post("/login", login);

// module.exports = router;
    





// const express = require("express");
// const router = express.Router();
// const { register, login, verifyEmail } = require("../controllers/authController");

// // تسجيل مستخدم عادي (userType = 1 فقط)
// router.post("/register", register);

// // تسجيل دخول
// router.post("/login", login);

// // التحقق من البريد الإلكتروني
// router.get("/verify-email/:token", verifyEmail);

// module.exports = router;























// const express = require("express");
// const router = express.Router();

// // استيراد الدوال من authController
// const authController = require("../controllers/authController");

// // استخراج الدوال
// const {
//   register,
//   login,
//   verifyEmail,
//   resendVerification,
//   debugToken,
//   verifyByCode,
//   adminLogin
// } = authController;

// // 🔧 التحقق من أن adminLogin هي دالة صالحة
// const adminLoginHandler = (typeof adminLogin === 'function') 
//   ? adminLogin 
//   : (req, res) => {
//       console.error("❌ adminLogin is not a function:", typeof adminLogin);
//       res.status(500).json({ 
//         message: "Server configuration error - adminLogin not available",
//         error: "Handler not a function" 
//       });
//     };

// // 🔧 تعريف المسارات
// router.post("/register", register);
// router.post("/login", login);
// router.post("/admin-login", adminLoginHandler); // ⬅️ السطر 65 الآمن
// router.get("/verify-email/:token", verifyEmail);
// router.post("/resend-verification", resendVerification);
// router.get("/debug-token", debugToken);
// router.post("/verify-code", verifyByCode);

// module.exports = router;


// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// ✅ مسارات المصادقة
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/admin-login", authController.adminLogin);
router.get("/verify-email/:token", authController.verifyEmail);
router.post("/resend-verification", authController.resendVerification);
router.post("/verify-by-code", authController.verifyByCode);
router.get("/debug-token", authController.debugToken);

module.exports = router;