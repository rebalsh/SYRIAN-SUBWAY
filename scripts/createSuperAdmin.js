const bcrypt = require("bcryptjs");
const { sequelize, User } = require("../models");

async function createSuperAdmin() {
  try {
    await sequelize.authenticate();

    const email = "superadmin@metro.com"; // ايميل السوبر أدمن
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      console.log("⚠️ Super Admin موجود مسبقاً");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("superpassword", 10); // كلمة سر افتراضية

    await User.create({
      username: "Super Admin",
      email,
      password: hashedPassword,
      userType: 2, // سوبر أدمن
      address: "HQ Metro",
      phone_number: "0000000000",
      emergency_phone_number: "1111111111",
    });

    console.log("✅ Super Admin تم إنشاؤه بنجاح");
    process.exit(0);
  } catch (err) {
    console.error("❌ خطأ أثناء إنشاء Super Admin:", err);
    process.exit(1);
  }
}

createSuperAdmin();
