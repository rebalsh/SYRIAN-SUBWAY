// // تحقق من نوع المستخدم
// module.exports = (roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.userType)) {
//       return res.status(403).json({ message: "صلاحيات غير كافية" });
//     }
//     next();
//   };
// };




module.exports = (allowedTypes) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "لم يتم التعرف على المستخدم" });
    }

    if (!allowedTypes.includes(req.user.userType)) {
      return res.status(403).json({ 
        message: "صلاحيات غير كافية للوصول إلى هذا المسار" 
      });
    }
    
    next();
  };
};