// // const bcrypt = require("bcryptjs");
// // const jwt = require("jsonwebtoken");
// // const { User } = require("../models");

// // // مفتاح JWT
// // const JWT_SECRET = "supersecretkey"; // يفضل تحطه بملف .env

// // // ✅ Register (للمستخدمين userType = 1)
// // exports.register = async (req, res) => {
// //   try {
// //     const { username, email, password, address, phone_number, emergency_phone_number } = req.body;

// //     const existingUser = await User.findOne({ where: { email } });
// //     if (existingUser) {
// //       return res.status(400).json({ message: "البريد موجود مسبقاً" });
// //     }

// //     const hashedPassword = await bcrypt.hash(password, 10);

// //     const newUser = await User.create({
// //       username,
// //       email,
// //       password: hashedPassword,
// //       userType: 1, // مستخدم عادي
// //       address,
// //       phone_number,
// //       emergency_phone_number,
// //     });

// //     res.status(201).json({ message: "تم إنشاء الحساب بنجاح", user: newUser });
// //   } catch (err) {
// //     res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
// //   }
// // };

// // // ✅ Login
// // exports.login = async (req, res) => {
// //   try {
// //     const { email, password } = req.body;

// //     const user = await User.findOne({ where: { email } });
// //     if (!user) return res.status(404).json({ message: "الحساب غير موجود" });

// //     const isMatch = await bcrypt.compare(password, user.password);
// //     if (!isMatch) return res.status(401).json({ message: "كلمة السر غير صحيحة" });

// //     const token = jwt.sign(
// //       { id: user.id, userType: user.userType },
// //       JWT_SECRET,
// //       { expiresIn: "1d" }
// //     );

// //     res.json({ message: "تم تسجيل الدخول", token, user });
// //   } catch (err) {
// //     res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
// //   }
// // };



// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const { User } = require("../models");
// const nodemailer = require("nodemailer");
// const crypto = require("crypto");
// require('dotenv').config();
// const { Op } = require('sequelize');

// // إعداد ناقل البريد الإلكتروني
// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: process.env.EMAIL_PORT,
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // ✅ Register (للمستخدمين userType = 1 فقط - المسافرين)
// exports.register = async (req, res) => {
//   try {
//     const { username, email, password, address, phone_number, emergency_phone_number } = req.body;

//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) {
//       return res.status(400).json({ message: "البريد موجود مسبقاً" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     // إنشاء رمز تحقق وتاريخ انتهاء (24 ساعة)
//     const verificationToken = crypto.randomBytes(32).toString('hex');
//     const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

//     const newUser = await User.create({
//       username,
//       email,
//       password: hashedPassword,
//       userType: 1, // ⚠️ مقيدة بالرقم 1 للمسافرين فقط
//       address,
//       phone_number,
//       emergency_phone_number,
//       isVerified: false,
//       verificationToken,
//       verificationTokenExpires
//     });

//     // إرسال بريد التحقق
//     const verificationLink = `${process.env.BASE_URL}/api/auth/verify-email/${verificationToken}`;
    
//     const mailOptions = {
//       from: `"Metro System" <${process.env.EMAIL_USER}>`,
//       to: newUser.email,
//       subject: 'الرجاء التحقق من بريدك الإلكتروني - نظام المترو',
//       html: `<p>مرحبًا ${newUser.username}،</p>
//              <p>شكرًا لتسجيلك في تطبيق المترو. الرجاء النقر على الرابط أدناه لتفعيل حسابك:</p>
//              <p><a href="${verificationLink}">${verificationLink}</a></p>
//              <p>هذا الرابط سينتهي خلال 24 ساعة.</p>
//              <p>إذا لم تطلب هذا التسجيل، يمكنك تجاهل هذه الرسالة.</p>`
//     };

//     await transporter.sendMail(mailOptions);

//     res.status(201).json({
//       message: "تم إنشاء الحساب بنجاح. الرجاء التحقق من بريدك الإلكتروني لتفعيل الحساب.",
//       user: {
//         id: newUser.id,
//         username: newUser.username,
//         email: newUser.email,
//         userType: newUser.userType
//       }
//     });

//   } catch (err) {
//     console.error("تفاصيل الخطأ في التسجيل:", err);
//     res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
//   }
// };

// // ✅ Login (مع منع المستخدمين غير المفعلين)
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ where: { email } });
//     if (!user) return res.status(404).json({ message: "الحساب غير موجود" });

//     // 🔥 التحقق من أن الحساب مفعل
//     if (!user.isVerified) {
//       return res.status(403).json({ 
//         message: "الحساب غير مفعل. الرجاء التحقق من بريدك الإلكتروني أولاً." 
//       });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(401).json({ message: "كلمة السر غير صحيحة" });

//     const token = jwt.sign(
//       { id: user.id, userType: user.userType },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     res.json({ 
//       message: "تم تسجيل الدخول", 
//       token, 
//       user: {
//         id: user.id,
//         username: user.username,
//         email: user.email,
//         userType: user.userType,
//         isVerified: user.isVerified
//       }
//     });
//   } catch (err) {
//     res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
//   }
// };

// // ✅ التحقق من البريد الإلكتروني
// exports.verifyEmail = async (req, res) => {
//   try {
//     const { token } = req.params;

//     const user = await User.findOne({
//       where: {
//         verificationToken: token,
//         verificationTokenExpires: { [Op.gt]: new Date() }
//       }
//     });

//     if (!user) {
//       return res.status(400).json({
//         message: "رمز التحقق غير صالح أو منتهي الصلاحية."
//       });
//     }

//     user.isVerified = true;
//     user.verificationToken = null;
//     user.verificationTokenExpires = null;
//     await user.save();

//     res.json({
//       message: "✅ تم التحقق من البريد الإلكتروني بنجاح! يمكنك الآن تسجيل الدخول.",
//       user: {
//         id: user.id,
//         username: user.username,
//         email: user.email,
//         isVerified: user.isVerified
//       }
//     });

//   } catch (err) {
//     console.error("تفاصيل الخطأ في التحقق:", err);
//     res.status(500).json({ message: "خطأ في السيرفر أثناء التحقق", error: err.message });
//   }
// };





// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const { User } = require("../models");
// const nodemailer = require("nodemailer");
// const crypto = require("crypto");
// require('dotenv').config();
// const { Op } = require('sequelize');

// // إعداد ناقل البريد الإلكتروني
// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: process.env.EMAIL_PORT,
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // ✅ Register (للمستخدمين userType = 1 فقط - المسافرين)
// exports.register = async (req, res) => {
//   try {
//     const { username, email, password, address, phone_number, emergency_phone_number } = req.body;

//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) {
//       return res.status(400).json({ message: "البريد موجود مسبقاً" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     // إنشاء رمز تحقق عشوائي وتاريخ انتهاء (24 ساعة)
//     const verificationToken = crypto.randomBytes(32).toString('hex');
//     const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

//     const newUser = await User.create({
//       username,
//       email,
//       password: hashedPassword,
//       userType: 1, // ⚠️ مقيدة بالرقم 1 للمسافرين فقط
//       address,
//       phone_number,
//       emergency_phone_number,
//       isVerified: false,
//       verificationToken,
//       verificationTokenExpires
//     });

//     // إرسال بريد التحقق
//     const verificationLink = `${process.env.BASE_URL}/api/auth/verify-email/${verificationToken}`;
    
//     const mailOptions = {
//       from: `"Metro System" <${process.env.EMAIL_USER}>`,
//       to: newUser.email,
//       subject: 'الرجاء التحقق من بريدك الإلكتروني - نظام المترو',
//       html: `<p>مرحبًا ${newUser.username}،</p>
//              <p>شكرًا لتسجيلك في تطبيق المترو. الرجاء النقر على الرابط أدناه لتفعيل حسابك:</p>
//              <p><a href="${verificationLink}">${verificationLink}</a></p>
//              <p>هذا الرابط سينتهي خلال 24 ساعة.</p>
//              <p>إذا لم تطلب هذا التسجيل، يمكنك تجاهل هذه الرسالة.</p>`
//     };

//     await transporter.sendMail(mailOptions);

//     res.status(201).json({
//       message: "تم إنشاء الحساب بنجاح. الرجاء التحقق من بريدك الإلكتروني لتفعيل الحساب.",
//       user: {
//         id: newUser.id,
//         username: newUser.username,
//         email: newUser.email,
//         userType: newUser.userType
//       }
//     });

//   } catch (err) {
//     console.error("تفاصيل الخطأ في التسجيل:", err);
//     res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
//   }
// };

// // ✅ Login (مع منع المستخدمين غير المفعلين - للمسافرين فقط)
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ where: { email } });
//     if (!user) return res.status(404).json({ message: "الحساب غير موجود" });

//     // ⚠️ ⚠️ ⚠️ التعديل المهم: التحقق من البريد مطلوب فقط للمسافرين (userType=1)
//     // الإداريون (userType 2,3,4,5) لا يحتاجون تحقق بريد
//     if (user.userType === 1 && !user.isVerified) {
//       return res.status(403).json({ 
//         message: "الحساب غير مفعل. الرجاء التحقق من بريدك الإلكتروني أولاً." 
//       });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(401).json({ message: "كلمة السر غير صحيحة" });

//     const token = jwt.sign(
//       { id: user.id, userType: user.userType },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     res.json({ 
//       message: "تم تسجيل الدخول", 
//       token, 
//       user: {
//         id: user.id,
//         username: user.username,
//         email: user.email,
//         userType: user.userType,
//         isVerified: user.isVerified
//       }
//     });
//   } catch (err) {
//     res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
//   }
// };

// // ✅ التحقق من البريد الإلكتروني
// exports.verifyEmail = async (req, res) => {
//   try {
//     const { token } = req.params;

//     const user = await User.findOne({
//       where: {
//         verificationToken: token,
//         verificationTokenExpires: { [Op.gt]: new Date() }
//       }
//     });

//     if (!user) {
//       return res.status(400).json({
//         message: "رمز التحقق غير صالح أو منتهي الصلاحية."
//       });
//     }

//     user.isVerified = true;
//     user.verificationToken = null;
//     user.verificationTokenExpires = null;
//     await user.save();

//     res.json({
//       message: "✅ تم التحقق من البريد الإلكتروني بنجاح! يمكنك الآن تسجيل الدخول.",
//       user: {
//         id: user.id,
//         username: user.username,
//         email: user.email,
//         isVerified: user.isVerified
//       }
//     });

//   } catch (err) {
//     console.error("تفاصيل الخطأ في التحقق:", err);
//     res.status(500).json({ message: "خطأ في السيرفر أثناء التحقق", error: err.message });
//   }
// };

// // ✅ إعادة إرسال بريد التحقق
// exports.resendVerification = async (req, res) => {
//   try {
//     const { email } = req.body;
    
//     const user = await User.findOne({ where: { email, userType: 1 } }); // للمسافرين فقط
//     if (!user) {
//       return res.status(404).json({ message: "المستخدم غير موجود أو ليس مسافراً" });
//     }
    
//     if (user.isVerified) {
//       return res.json({ message: "الحساب مفعل بالفعل" });
//     }
    
//     // إنشاء رمز جديد
//     const verificationToken = crypto.randomBytes(32).toString('hex');
//     const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
//     // تحديث المستخدم بالرمز الجديد
//     user.verificationToken = verificationToken;
//     user.verificationTokenExpires = verificationTokenExpires;
//     await user.save();
    
//     // إرسال البريد
//     const verificationLink = `${process.env.BASE_URL}/api/auth/verify-email/${verificationToken}`;
//     const mailOptions = {
//       from: `"Metro System" <${process.env.EMAIL_USER}>`,
//       to: user.email,
//       subject: 'إعادة إرسال - الرجاء التحقق من بريدك الإلكتروني',
//       html: `<p>مرحبًا ${user.username}،</p>
//              <p>هذا رابط تحقق جديد لحسابك:</p>
//              <p><a href="${verificationLink}">${verificationLink}</a></p>
//              <p>هذا الرابط سينتهي خلال 24 ساعة.</p>`
//     };
    
//     await transporter.sendMail(mailOptions);
    
//     res.json({ 
//       message: "تم إعادة إرسال بريد التحقق",
//       newTokenPreview: verificationToken.substring(0, 20) + "..."
//     });
    
//   } catch (err) {
//     res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
//   }
// };

// // ✅ فحص حالة الرمز (للتطوير)
// exports.debugToken = async (req, res) => {
//   try {
//     const { email } = req.query;
    
//     const user = await User.findOne({
//       where: { email },
//       attributes: ['id', 'email', 'userType', 'isVerified', 'verificationToken', 'verificationTokenExpires']
//     });
    
//     if (!user) {
//       return res.json({ message: "المستخدم غير موجود" });
//     }
    
//     const now = new Date();
//     const isExpired = user.verificationTokenExpires && user.verificationTokenExpires < now;
    
//     res.json({
//       user,
//       currentTime: now,
//       tokenStatus: user.verificationToken ? 
//         (isExpired ? "منتهي الصلاحية" : "ساري") : 
//         "غير موجود",
//       isExpired,
//       timeRemaining: user.verificationTokenExpires ? 
//         Math.floor((user.verificationTokenExpires - now) / (1000 * 60 * 60)) + " ساعات" : 
//         "لا يوجد تاريخ"
//     });
    
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ✅ التحقق باستخدام الرمز القصير (بديل للرابط)
// exports.verifyByCode = async (req, res) => {
//   try {
//     const { email, code } = req.body;
    
//     const user = await User.findOne({
//       where: {
//         email: email,
//         userType: 1, // للمسافرين فقط
//         verificationToken: code.toString(),
//         verificationTokenExpires: { [Op.gt]: new Date() }
//       }
//     });
    
//     if (!user) {
//       return res.status(400).json({ message: "الرمز غير صحيح أو منتهي" });
//     }
    
//     user.isVerified = true;
//     user.verificationToken = null;
//     user.verificationTokenExpires = null;
//     await user.save();
    
//     // أنشئ توكن دخول مباشرة
//     const token = jwt.sign(
//       { id: user.id, userType: user.userType },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );
    
//     res.json({
//       message: "✅ تم تفعيل الحساب بنجاح!",
//       token: token,
//       user: {
//         id: user.id,
//         username: user.username,
//         email: user.email,
//         isVerified: true
//       }
//     });
    
//   } catch (err) {
//     res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
//   }
// };

// // ✅ تسجيل دخول إداري (لا يحتاج تحقق بريد)
// exports.adminLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ 
//       where: { 
//         email,
//         userType: { [Op.in]: [2, 3, 4, 5] } // فقط الإداريين
//       } 
//     });
    
//     if (!user) {
//       return res.status(404).json({ 
//         message: "الحساب غير موجود أو ليس حساباً إدارياً" 
//       });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "كلمة السر غير صحيحة" });
//     }

//     const token = jwt.sign(
//       { id: user.id, userType: user.userType },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     res.json({ 
//       message: "تم تسجيل الدخول كإداري", 
//       token, 
//       user: {
//         id: user.id,
//         username: user.username,
//         email: user.email,
//         userType: user.userType,
//         isVerified: user.isVerified // عادة يكون true للإداريين
//       }
//     });
//   } catch (err) {
//     res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
//   }
// };


























// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const { User } = require("../models");
// const nodemailer = require("nodemailer");
// const crypto = require("crypto");
// require('dotenv').config();
// const { Op } = require('sequelize');

// // إعداد ناقل البريد الإلكتروني
// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: process.env.EMAIL_PORT,
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // ✅ Register (للمستخدمين userType = 1 فقط - المسافرين)
// const register = async (req, res) => {
//   try {
//     const { username, email, password, address, phone_number, emergency_phone_number } = req.body;

//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) {
//       return res.status(400).json({ message: "البريد موجود مسبقاً" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const verificationToken = crypto.randomBytes(32).toString('hex');
//     const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

//     const newUser = await User.create({
//       username,
//       email,
//       password: hashedPassword,
//       userType: 1,
//       address,
//       phone_number,
//       emergency_phone_number,
//       isVerified: false,
//       verificationToken,
//       verificationTokenExpires
//     });

//     // إرسال بريد التحقق
//     const verificationLink = `${process.env.BASE_URL}/api/auth/verify-email/${verificationToken}`;
    
//     const mailOptions = {
//       from: `"Metro System" <${process.env.EMAIL_USER}>`,
//       to: newUser.email,
//       subject: 'الرجاء التحقق من بريدك الإلكتروني - نظام المترو',
//       html: `<p>مرحبًا ${newUser.username}،</p>
//              <p>شكرًا لتسجيلك في تطبيق المترو. الرجاء النقر على الرابط أدناه لتفعيل حسابك:</p>
//              <p><a href="${verificationLink}">${verificationLink}</a></p>
//              <p>هذا الرابط سينتهي خلال 24 ساعة.</p>`
//     };

//     await transporter.sendMail(mailOptions);

//     res.status(201).json({
//       message: "تم إنشاء الحساب بنجاح. الرجاء التحقق من بريدك الإلكتروني لتفعيل الحساب.",
//       user: {
//         id: newUser.id,
//         username: newUser.username,
//         email: newUser.email,
//         userType: newUser.userType
//       }
//     });

//   } catch (err) {
//     console.error("تفاصيل الخطأ في التسجيل:", err);
//     res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
//   }
// };

// // ✅ Login (مع منع المستخدمين غير المفعلين - للمسافرين فقط)
// const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ where: { email } });
//     if (!user) return res.status(404).json({ message: "الحساب غير موجود" });

//     // التحقق من البريد مطلوب فقط للمسافرين
//     if (user.userType === 1 && !user.isVerified) {
//       return res.status(403).json({ 
//         message: "الحساب غير مفعل. الرجاء التحقق من بريدك الإلكتروني أولاً." 
//       });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(401).json({ message: "كلمة السر غير صحيحة" });

//     const token = jwt.sign(
//       { id: user.id, userType: user.userType },
//       "supersecretkey",
//       { expiresIn: "1d" }
//     );

//     res.json({ 
//       message: "تم تسجيل الدخول", 
//       token, 
//       user: {
//         id: user.id,
//         username: user.username,
//         email: user.email,
//         userType: user.userType,
//         isVerified: user.isVerified
//       }
//     });
//   } catch (err) {
//     res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
//   }
// };

// // ✅ التحقق من البريد الإلكتروني
// const verifyEmail = async (req, res) => {
//   try {
//     const { token } = req.params;

//     const user = await User.findOne({
//       where: {
//         verificationToken: token,
//         verificationTokenExpires: { [Op.gt]: new Date() }
//       }
//     });

//     if (!user) {
//       return res.status(400).json({
//         message: "رمز التحقق غير صالح أو منتهي الصلاحية."
//       });
//     }

//     user.isVerified = true;
//     user.verificationToken = null;
//     user.verificationTokenExpires = null;
//     await user.save();

//     res.json({
//       message: "✅ تم التحقق من البريد الإلكتروني بنجاح! يمكنك الآن تسجيل الدخول.",
//       user: {
//         id: user.id,
//         username: user.username,
//         email: user.email,
//         isVerified: user.isVerified
//       }
//     });

//   } catch (err) {
//     console.error("تفاصيل الخطأ في التحقق:", err);
//     res.status(500).json({ message: "خطأ في السيرفر أثناء التحقق", error: err.message });
//   }
// };

// // ✅ إعادة إرسال بريد التحقق
// const resendVerification = async (req, res) => {
//   try {
//     const { email } = req.body;
    
//     const user = await User.findOne({ where: { email, userType: 1 } });
//     if (!user) {
//       return res.status(404).json({ message: "المستخدم غير موجود أو ليس مسافراً" });
//     }
    
//     if (user.isVerified) {
//       return res.json({ message: "الحساب مفعل بالفعل" });
//     }
    
//     // إنشاء رمز جديد
//     const verificationToken = crypto.randomBytes(32).toString('hex');
//     const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
//     // تحديث المستخدم بالرمز الجديد
//     user.verificationToken = verificationToken;
//     user.verificationTokenExpires = verificationTokenExpires;
//     await user.save();
    
//     // إرسال البريد
//     const verificationLink = `${process.env.BASE_URL}/api/auth/verify-email/${verificationToken}`;
//     const mailOptions = {
//       from: `"Metro System" <${process.env.EMAIL_USER}>`,
//       to: user.email,
//       subject: 'إعادة إرسال - الرجاء التحقق من بريدك الإلكتروني',
//       html: `<p>مرحبًا ${user.username}،</p>
//              <p>هذا رابط تحقق جديد لحسابك:</p>
//              <p><a href="${verificationLink}">${verificationLink}</a></p>
//              <p>هذا الرابط سينتهي خلال 24 ساعة.</p>`
//     };
    
//     await transporter.sendMail(mailOptions);
    
//     res.json({ 
//       message: "تم إعادة إرسال بريد التحقق",
//       newTokenPreview: verificationToken.substring(0, 20) + "..."
//     });
    
//   } catch (err) {
//     res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
//   }
// };

// // ✅ فحص حالة الرمز (للتطوير)
// const debugToken = async (req, res) => {
//   try {
//     const { email } = req.query;
    
//     const user = await User.findOne({
//       where: { email },
//       attributes: ['id', 'email', 'userType', 'isVerified', 'verificationToken', 'verificationTokenExpires']
//     });
    
//     if (!user) {
//       return res.json({ message: "المستخدم غير موجود" });
//     }
    
//     const now = new Date();
//     const isExpired = user.verificationTokenExpires && user.verificationTokenExpires < now;
    
//     res.json({
//       user,
//       currentTime: now,
//       tokenStatus: user.verificationToken ? 
//         (isExpired ? "منتهي الصلاحية" : "ساري") : 
//         "غير موجود",
//       isExpired,
//       timeRemaining: user.verificationTokenExpires ? 
//         Math.floor((user.verificationTokenExpires - now) / (1000 * 60 * 60)) + " ساعات" : 
//         "لا يوجد تاريخ"
//     });
    
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ✅ تسجيل دخول إداري (لا يحتاج تحقق بريد)
// const adminLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ 
//       where: { 
//         email,
//         userType: { [Op.in]: [2, 3, 4, 5] }
//       } 
//     });
    
//     if (!user) {
//       return res.status(404).json({ 
//         message: "الحساب غير موجود أو ليس حساباً إدارياً" 
//       });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "كلمة السر غير صحيحة" });
//     }

//     const token = jwt.sign(
//       { id: user.id, userType: user.userType },
//       "supersecretkey",
//       { expiresIn: "1d" }
//     );

//     res.json({ 
//       message: "تم تسجيل الدخول كإداري", 
//       token, 
//       user: {
//         id: user.id,
//         username: user.username,
//         email: user.email,
//         userType: user.userType,
//         isVerified: user.isVerified
//       }
//     });
//   } catch (err) {
//     res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
//   }
// };

// // ✅ التحقق باستخدام الرمز القصير (بديل للرابط)
// const verifyByCode = async (req, res) => {
//   try {
//     const { email, code } = req.body;
    
//     const user = await User.findOne({
//       where: {
//         email: email,
//         userType: 1,
//         verificationToken: code.toString(),
//         verificationTokenExpires: { [Op.gt]: new Date() }
//       }
//     });
    
//     if (!user) {
//       return res.status(400).json({ message: "الرمز غير صحيح أو منتهي" });
//     }
    
//     user.isVerified = true;
//     user.verificationToken = null;
//     user.verificationTokenExpires = null;
//     await user.save();
    
//     const token = jwt.sign(
//       { id: user.id, userType: user.userType },
//       "supersecretkey",
//       { expiresIn: "7d" }
//     );
    
//     res.json({
//       message: "✅ تم تفعيل الحساب بنجاح!",
//       token: token,
//       user: {
//         id: user.id,
//         username: user.username,
//         email: user.email,
//         isVerified: true
//       }
//     });
    
//   } catch (err) {
//     res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
//   }
// };

// // 🔧 تصدير جميع الدوال
// module.exports = {
//   register,
//   login,
//   verifyEmail,
//   resendVerification,
//   debugToken,
//   verifyByCode,
//   adminLogin
// };











// controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require('dotenv').config();
const { Op } = require('sequelize');

// إعداد ناقل البريد الإلكتروني
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Register (للمستخدمين userType = 1 فقط - المسافرين)
const register = async (req, res) => {
  try {
    const { username, email, password, address, phone_number, emergency_phone_number } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "البريد موجود مسبقاً" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      userType: 1,
      address,
      phone_number,
      emergency_phone_number,
      isVerified: false,
      verificationToken,
      verificationTokenExpires
    });

    // إرسال بريد التحقق
    const verificationLink = `${process.env.BASE_URL}/api/auth/verify-email/${verificationToken}`;
    
    const mailOptions = {
      from: `"Metro System" <${process.env.EMAIL_USER}>`,
      to: newUser.email,
      subject: 'الرجاء التحقق من بريدك الإلكتروني - نظام المترو',
      html: `<p>مرحبًا ${newUser.username}،</p>
             <p>شكرًا لتسجيلك في تطبيق المترو. الرجاء النقر على الرابط أدناه لتفعيل حسابك:</p>
             <p><a href="${verificationLink}">${verificationLink}</a></p>
             <p>هذا الرابط سينتهي خلال 24 ساعة.</p>`
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      success: true,
      message: "تم إنشاء الحساب بنجاح. الرجاء التحقق من بريدك الإلكتروني لتفعيل الحساب.",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        userType: newUser.userType
      }
    });

  } catch (err) {
    console.error("تفاصيل الخطأ في التسجيل:", err);
    res.status(500).json({ 
      success: false,
      message: "خطأ في السيرفر", 
      error: err.message 
    });
  }
};

// ✅ Login (مع منع المستخدمين غير المفعلين - للمسافرين فقط)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "الحساب غير موجود" 
      });
    }

    // التحقق من البريد مطلوب فقط للمسافرين
    if (user.userType === 1 && !user.isVerified) {
      return res.status(403).json({ 
        success: false,
        message: "الحساب غير مفعل. الرجاء التحقق من بريدك الإلكتروني أولاً." 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: "كلمة السر غير صحيحة" 
      });
    }

    // ✅ تأكد من إضافة userType في التوكن
    const token = jwt.sign(
      { 
        id: user.id, 
        userType: user.userType,
        username: user.username,
        email: user.email
      },
      "supersecretkey",
      { expiresIn: "1d" }
    );

    res.json({ 
      success: true,
      message: "تم تسجيل الدخول", 
      token, 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        userType: user.userType,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: "خطأ في السيرفر", 
      error: err.message 
    });
  }
};

// ✅ التحقق من البريد الإلكتروني
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      where: {
        verificationToken: token,
        verificationTokenExpires: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "رمز التحقق غير صالح أو منتهي الصلاحية."
      });
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    res.json({
      success: true,
      message: "✅ تم التحقق من البريد الإلكتروني بنجاح! يمكنك الآن تسجيل الدخول.",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified
      }
    });

  } catch (err) {
    console.error("تفاصيل الخطأ في التحقق:", err);
    res.status(500).json({ 
      success: false,
      message: "خطأ في السيرفر أثناء التحقق", 
      error: err.message 
    });
  }
};

// ✅ إعادة إرسال بريد التحقق
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ where: { email, userType: 1 } });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "المستخدم غير موجود أو ليس مسافراً" 
      });
    }
    
    if (user.isVerified) {
      return res.json({ 
        success: true,
        message: "الحساب مفعل بالفعل" 
      });
    }
    
    // إنشاء رمز جديد
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    // تحديث المستخدم بالرمز الجديد
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();
    
    // إرسال البريد
    const verificationLink = `${process.env.BASE_URL}/api/auth/verify-email/${verificationToken}`;
    const mailOptions = {
      from: `"Metro System" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'إعادة إرسال - الرجاء التحقق من بريدك الإلكتروني',
      html: `<p>مرحبًا ${user.username}،</p>
             <p>هذا رابط تحقق جديد لحسابك:</p>
             <p><a href="${verificationLink}">${verificationLink}</a></p>
             <p>هذا الرابط سينتهي خلال 24 ساعة.</p>`
    };
    
    await transporter.sendMail(mailOptions);
    
    res.json({ 
      success: true,
      message: "تم إعادة إرسال بريد التحقق",
      newTokenPreview: verificationToken.substring(0, 20) + "..."
    });
    
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: "خطأ في السيرفر", 
      error: err.message 
    });
  }
};

// ✅ فحص حالة الرمز (للتطوير)
const debugToken = async (req, res) => {
  try {
    const { email } = req.query;
    
    const user = await User.findOne({
      where: { email },
      attributes: ['id', 'email', 'userType', 'isVerified', 'verificationToken', 'verificationTokenExpires']
    });
    
    if (!user) {
      return res.json({ 
        success: false,
        message: "المستخدم غير موجود" 
      });
    }
    
    const now = new Date();
    const isExpired = user.verificationTokenExpires && user.verificationTokenExpires < now;
    
    res.json({
      success: true,
      user,
      currentTime: now,
      tokenStatus: user.verificationToken ? 
        (isExpired ? "منتهي الصلاحية" : "ساري") : 
        "غير موجود",
      isExpired,
      timeRemaining: user.verificationTokenExpires ? 
        Math.floor((user.verificationTokenExpires - now) / (1000 * 60 * 60)) + " ساعات" : 
        "لا يوجد تاريخ"
    });
    
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

// ✅ تسجيل دخول إداري (لا يحتاج تحقق بريد)
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ 
      where: { 
        email,
        userType: { [Op.in]: [2, 3, 4, 5] }
      } 
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "الحساب غير موجود أو ليس حساباً إدارياً" 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: "كلمة السر غير صحيحة" 
      });
    }

    // ✅ تأكد من إضافة userType في التوكن
    const token = jwt.sign(
      { 
        id: user.id, 
        userType: user.userType,
        username: user.username,
        email: user.email
      },
      "supersecretkey",
      { expiresIn: "1d" }
    );

    res.json({ 
      success: true,
      message: "تم تسجيل الدخول كإداري", 
      token, 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        userType: user.userType,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: "خطأ في السيرفر", 
      error: err.message 
    });
  }
};

// ✅ التحقق باستخدام الرمز القصير (بديل للرابط)
const verifyByCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    const user = await User.findOne({
      where: {
        email: email,
        userType: 1,
        verificationToken: code.toString(),
        verificationTokenExpires: { [Op.gt]: new Date() }
      }
    });
    
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: "الرمز غير صحيح أو منتهي" 
      });
    }
    
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();
    
    const token = jwt.sign(
      { 
        id: user.id, 
        userType: user.userType,
        username: user.username,
        email: user.email
      },
      "supersecretkey",
      { expiresIn: "7d" }
    );
    
    res.json({
      success: true,
      message: "✅ تم تفعيل الحساب بنجاح!",
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isVerified: true
      }
    });
    
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: "خطأ في السيرفر", 
      error: err.message 
    });
  }
};

// 🔧 تصدير جميع الدوال
module.exports = {
  register,
  login,
  verifyEmail,
  resendVerification,
  debugToken,
  verifyByCode,
  adminLogin
};