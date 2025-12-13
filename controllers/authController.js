const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

// مفتاح JWT
const JWT_SECRET = "supersecretkey"; // يفضل تحطه بملف .env

// ✅ Register (للمستخدمين userType = 1)
exports.register = async (req, res) => {
  try {
    const { username, email, password, address, phone_number, emergency_phone_number } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "البريد موجود مسبقاً" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      userType: 1, // مستخدم عادي
      address,
      phone_number,
      emergency_phone_number,
    });

    res.status(201).json({ message: "تم إنشاء الحساب بنجاح", user: newUser });
  } catch (err) {
    res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
  }
};

// ✅ Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "الحساب غير موجود" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "كلمة السر غير صحيحة" });

    const token = jwt.sign(
      { id: user.id, userType: user.userType },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ message: "تم تسجيل الدخول", token, user });
  } catch (err) {
    res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
  }
};
