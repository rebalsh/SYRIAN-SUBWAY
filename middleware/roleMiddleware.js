// // تحقق من نوع المستخدم
// module.exports = (roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.userType)) {
//       return res.status(403).json({ message: "صلاحيات غير كافية" });
//     }
//     next();
//   };
// };




// module.exports = (allowedTypes) => {
//   return (req, res, next) => {
//     if (!req.user) {
//       return res.status(401).json({ message: "لم يتم التعرف على المستخدم" });
//     }

//     if (!allowedTypes.includes(req.user.userType)) {
//       return res.status(403).json({ 
//         message: "صلاحيات غير كافية للوصول إلى هذا المسار" 
//       });
//     }
    
//     next();
//   };
// };









// module.exports = (allowedTypes) => {
//   return (req, res, next) => {
//     if (!req.user) {
//       return res.status(401).json({ message: "لم يتم التعرف على المستخدم" });
//     }

//     if (!allowedTypes.includes(req.user.userType)) {
//       return res.status(403).json({ 
//         message: "صلاحيات غير كافية للوصول إلى هذا المسار" 
//       });
//     }
    
//     next();
//   };
// };



// middleware/roleMiddleware.js
module.exports = (allowedTypes) => {
  return (req, res, next) => {
    if (!req.user) {
      console.log("❌ Role Middleware: No user found in request");
      return res.status(401).json({ 
        success: false,
        message: "لم يتم التعرف على المستخدم. يرجى تسجيل الدخول أولاً" 
      });
    }

    // ✅ التحقق من userType في req.user
    const userType = req.user.userType;
    
    if (!userType) {
      console.log("❌ Role Middleware: userType not found in req.user:", req.user);
      return res.status(403).json({ 
        success: false,
        message: "نوع المستخدم غير معروف" 
      });
    }

    if (!allowedTypes.includes(userType)) {
      console.log(`❌ Role Check Failed: User Type ${userType} not in allowed types [${allowedTypes}]`);
      return res.status(403).json({ 
        success: false,
        message: "صلاحيات غير كافية للوصول إلى هذا المسار" 
      });
    }
    
    console.log(`✅ Role Check Passed: User Type ${userType} allowed for route`);
    next();
  };
};