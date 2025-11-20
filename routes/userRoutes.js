
// const express = require("express");
// const router = express.Router();
// const { createAdmin, updateProfile, changePassword , getProfile  } = require("../controllers/userController");
// const authMiddleware = require("../middleware/authMiddleware");
// const roleMiddleware = require("../middleware/roleMiddleware");

// // إنشاء إداري (فقط السوبر أدمن userType=2)
// router.post(
//   "/create-admin",
//   authMiddleware,
//   roleMiddleware([2]), // فقط userType = 2
//   createAdmin
// );

// // تحديث الملف الشخصي (جميع المستخدمين)
// router.put(
//   "/profile",
//   authMiddleware,
//   updateProfile
// );

// // تغيير كلمة المرور (جميع المستخدمين)
// router.put(
//   "/change-password",
//   authMiddleware,
//   changePassword
// );

// // الحصول على الملف الشخصي (جميع المستخدمين)
// router.get(
//   "/profile",
//   authMiddleware,
//   getProfile
// );

// module.exports = router;
 



// const express = require("express");
// const router = express.Router();
// const { 
//   createAdmin, 
//   updateProfile, 
//   changePassword, 
//   getProfile,
//   getUsersByType,
//   getUserNamesByType
// } = require("../controllers/userController");
// const authMiddleware = require("../middleware/authMiddleware");
// const roleMiddleware = require("../middleware/roleMiddleware");

// // إنشاء إداري (فقط السوبر أدمن userType=2)
// router.post(
//   "/create-admin",
//   authMiddleware,
//   roleMiddleware([2]),
//   createAdmin
// );

// // الحصول على المستخدمين حسب userType (للسوبر أدمن والمشرفين)
// router.get(
//   "/type/:userType",
//   authMiddleware,
//   roleMiddleware([2, 3]),
//   getUsersByType
// );

// // الحصول على أسماء المستخدمين فقط حسب userType (للسوبر أدمن والمشرفين)
// router.get(
//   "/names/:userType",
//   authMiddleware,
//   roleMiddleware([2, 3]),
//   getUserNamesByType
// );

// // تحديث الملف الشخصي (جميع المستخدمين)
// router.put(
//   "/profile",
//   authMiddleware,
//   updateProfile
// );

// // تغيير كلمة المرور (جميع المستخدمين)
// router.put(
//   "/change-password",
//   authMiddleware,
//   changePassword
// );

// // الحصول على الملف الشخصي (جميع المستخدمين)
// router.get(
//   "/profile",
//   authMiddleware,
//   getProfile
// );

// module.exports = router;








const express = require("express");
const router = express.Router();
const { 
  createAdmin, 
  updateProfile, 
  changePassword, 
  getProfile,
  getUsersByType,
  getUserNamesByType,
  deleteUser  // ✅ تمت إضافة دالة الحذف
} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// إنشاء إداري (فقط السوبر أدمن userType=2)
router.post(
  "/create-admin",
  authMiddleware,
  roleMiddleware([2]),
  createAdmin
);

// الحصول على المستخدمين حسب userType (للسوبر أدمن والمشرفين)
router.get(
  "/type/:userType",
  authMiddleware,
  roleMiddleware([2, 3]),
  getUsersByType
);

// الحصول على أسماء المستخدمين فقط حسب userType (للسوبر أدمن والمشرفين)
router.get(
  "/names/:userType",
  authMiddleware,
  roleMiddleware([2, 3]),
  getUserNamesByType
);

// ✅ حذف مستخدم (فقط السوبر أدمن)
router.delete(
  "/:userId",
  authMiddleware,
  roleMiddleware([2]),
  deleteUser
);

// تحديث الملف الشخصي (جميع المستخدمين)
router.put(
  "/profile",
  authMiddleware,
  updateProfile
);

// تغيير كلمة المرور (جميع المستخدمين)
router.put(
  "/change-password",
  authMiddleware,
  changePassword
);

// الحصول على الملف الشخصي (جميع المستخدمين)
router.get(
  "/profile",
  authMiddleware,
  getProfile
);

module.exports = router;