// // middleware/cacheMiddleware.js - النسخة البسيطة بدون أخطاء
// const redisClient = require("../config/redis");

// const cacheMiddleware = (duration = 60) => {
//   return async (req, res, next) => {
//     // تخطي الطلبات غير GET
//     if (req.method !== "GET") {
//       return next();
//     }

//     // تخطي إذا طلب المستخدم عدم استخدام الكاش
//     if (req.query.nocache === "true") {
//       return next();
//     }

//     // إنشاء مفتاح فريد للكاش
//     const userType = req.user?.userType || "guest";
//     const userId = req.user?.id || "anonymous";
//     const cacheKey = `metro:${userType}:${userId}:${req.originalUrl}`;

//     try {
//       // محاولة جلب البيانات من الكاش
//       const cachedData = await redisClient.get(cacheKey);
      
//       if (cachedData) {
//         console.log(`✅ Cache HIT: ${req.originalUrl}`);
        
//         // إضافة معلومات الكاش للـ headers
//         res.set("X-Cache", "HIT");
//         res.set("X-Cache-Key", cacheKey);
//         res.set("X-Cache-TTL", duration);
        
//         return res.json(JSON.parse(cachedData));
//       }

//       // إذا ما كان في كاش، نعدل res.json لتحفظ في الكاش
//       const originalJson = res.json;
//       res.json = function (data) {
//         try {
//           // حفظ النتيجة في الكاش
//           redisClient.setex(cacheKey, duration, JSON.stringify(data));
//           console.log(`🔄 Cache SET: ${req.originalUrl} (${duration} seconds)`);
          
//           // إضافة معلومات الكاش للـ headers
//           res.set("X-Cache", "MISS");
//           res.set("X-Cache-Key", cacheKey);
//           res.set("X-Cache-TTL", duration);
          
//           return originalJson.call(this, data);
//         } catch (cacheError) {
//           // إذا فشل حفظ الكاش، أرسل البيانات عادي
//           console.log(`⚠️ Cache save failed: ${cacheError.message}`);
//           return originalJson.call(this, data);
//         }
//       };

//       next();
//     } catch (error) {
//       // إذا حصل خطأ في الكاش، أكمل بدون كاش
//       console.log(`⚠️ Cache middleware error: ${error.message}`);
//       next();
//     }
//   };
// };

// module.exports = cacheMiddleware;



// middleware/cacheMiddleware.js
// const redisClient = require("../config/redis");

// const cacheMiddleware = (duration = 60) => {
//   return async (req, res, next) => {
//     // تخطي الطلبات غير GET
//     if (req.method !== "GET") {
//       return next();
//     }

//     // تخطي إذا طلب المستخدم عدم استخدام الكاش
//     if (req.query.nocache === "true") {
//       res.set("X-Cache", "DISABLED");
//       return next();
//     }

//     // 🔴 كاش موحد للجميع (لجميع المستخدمين)
//     const cacheKey = `metro:lines:all`;

//     try {
//       // محاولة جلب البيانات من الكاش
//       const cachedData = await redisClient.get(cacheKey);
      
//       if (cachedData) {
//         console.log(`✅ Cache HIT: ${req.originalUrl}`);
        
//         // إضافة معلومات الكاش للـ headers
//         res.set("X-Cache", "HIT");
//         res.set("X-Cache-Key", cacheKey);
//         res.set("X-Cache-TTL", duration);
        
//         return res.json(JSON.parse(cachedData));
//       }

//       // إذا ما كان في كاش، نعدل res.json لتحفظ في الكاش
//       const originalJson = res.json;
//       res.json = function (data) {
//         try {
//           // حفظ النتيجة في الكاش (غير متزامن)
//           redisClient.setex(cacheKey, duration, JSON.stringify(data))
//             .then(() => {
//               console.log(`🔄 Cache SET: ${req.originalUrl} (${duration} seconds)`);
//             })
//             .catch(cacheError => {
//               console.log(`⚠️ Cache save failed: ${cacheError.message}`);
//             });
          
//           // إضافة معلومات الكاش للـ headers
//           res.set("X-Cache", "MISS");
//           res.set("X-Cache-Key", cacheKey);
//           res.set("X-Cache-TTL", duration);
          
//           return originalJson.call(this, data);
//         } catch (error) {
//           // إذا فشل حفظ الكاش، أرسل البيانات عادي
//           return originalJson.call(this, data);
//         }
//       };

//       next();
//     } catch (error) {
//       // إذا حصل خطأ في الكاش، أكمل بدون كاش
//       console.log(`⚠️ Cache middleware error: ${error.message}`);
//       next();
//     }
//   };
// };

// module.exports = cacheMiddleware;


const redisClient = require("../config/redis");

const cacheMiddleware = (duration = 60) => {
  return async (req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }

    if (req.query.nocache === "true") {
      res.set("X-Cache", "DISABLED");
      return next();
    }

    // 🔴 أصلح الخطأ: استخدم req.originalUrl بدل ثابت
    const cacheKey = `metro:${req.originalUrl}`;

    try {
      const cachedData = await redisClient.get(cacheKey);
      
      if (cachedData) {
        console.log(`✅ Cache HIT: ${req.originalUrl}`);
        
        res.set("X-Cache", "HIT");
        res.set("X-Cache-Key", cacheKey);
        res.set("X-Cache-TTL", duration);
        
        return res.json(JSON.parse(cachedData));
      }

      const originalJson = res.json;
      res.json = function (data) {
        try {
          redisClient.setex(cacheKey, duration, JSON.stringify(data))
            .then(() => {
              console.log(`🔄 Cache SET: ${cacheKey} (${duration}s)`);
            })
            .catch(cacheError => {
              console.log(`⚠️ Cache save failed: ${cacheError.message}`);
            });
          
          res.set("X-Cache", "MISS");
          res.set("X-Cache-Key", cacheKey);
          res.set("X-Cache-TTL", duration);
          
          return originalJson.call(this, data);
        } catch (error) {
          return originalJson.call(this, data);
        }
      };

      next();
    } catch (error) {
      console.log(`⚠️ Cache error: ${error.message}`);
      next();
    }
  };
};

module.exports = cacheMiddleware;