// const jwt = require("jsonwebtoken");
// const JWT_SECRET = "supersecretkey";

// module.exports = (req, res, next) => {
//   const token = req.headers["authorization"]?.split(" ")[1];
//   if (!token) return res.status(403).json({ message: "مطلوب توكن" });

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     res.status(401).json({ message: "توكن غير صالح" });
//   }
// };



// const jwt = require("jsonwebtoken");
// const JWT_SECRET = "supersecretkey";

// module.exports = (req, res, next) => {
//   const token = req.headers["authorization"]?.split(" ")[1];
  
//   if (!token) {
//     return res.status(403).json({ message: "مطلوب توكن للوصول" });
//   }

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     res.status(401).json({ message: "توكن غير صالح أو منتهي الصلاحية" });
//   }
// };


// const jwt = require("jsonwebtoken");

// const authMiddleware = (req, res, next) => {
//   const token = req.headers["authorization"]?.split(" ")[1];
  
//   if (!token) {
//     return res.status(403).json({ message: "مطلوب توكن للوصول" });
//   }

//   try {
//     const decoded = jwt.verify(token, "supersecretkey");
//     req.user = decoded;
//     next();
//   } catch (err) {
//     res.status(401).json({ message: "توكن غير صالح أو منتهي الصلاحية" });
//   }
// };

// module.exports = authMiddleware;







// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(403).json({ 
        success: false,
        message: "مطلوب توكن للوصول. يرجى تسجيل الدخول" 
      });
    }
    
    const token = authHeader.split(" ")[1];
    
    if (!token) {
      return res.status(403).json({ 
        success: false,
        message: "التوكن غير موجود في الهيدر" 
      });
    }

    const decoded = jwt.verify(token, "supersecretkey");
    
    // ✅ تأكد من شكل البيانات - التعامل مع userType أو user_type
    req.user = {
      id: decoded.id,
      userType: decoded.userType || decoded.user_type, // ✅ دعم الاثنين
      username: decoded.username,
      email: decoded.email
    };
    
    console.log("✅ Auth Middleware - User authenticated:", { 
      id: req.user.id, 
      userType: req.user.userType 
    });
    next();
  } catch (err) {
    console.error("❌ Auth Middleware Error:", err.message);
    return res.status(401).json({ 
      success: false,
      message: "توكن غير صالح أو منتهي الصلاحية" 
    });
  }
};

module.exports = authMiddleware;