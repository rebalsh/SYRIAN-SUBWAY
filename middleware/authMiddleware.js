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



const jwt = require("jsonwebtoken");
const JWT_SECRET = "supersecretkey";

module.exports = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  
  if (!token) {
    return res.status(403).json({ message: "مطلوب توكن للوصول" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "توكن غير صالح أو منتهي الصلاحية" });
  }
};