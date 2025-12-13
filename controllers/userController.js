// const bcrypt = require("bcryptjs");
// const { User } = require("../models");

// // ✅ إنشاء حساب إداري (من قبل السوبر أدمن)
// exports.createAdmin = async (req, res) => {
//   try {
//     const { username, email, password, userType } = req.body;

//     if (![3, 4, 5].includes(userType)) {
//       return res.status(400).json({ message: "userType غير مسموح" });
//     }

//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) {
//       return res.status(400).json({ message: "البريد مستخدم مسبقاً" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const adminUser = await User.create({
//       username,
//       email,
//       password: hashedPassword,
//       userType,
//     });

//     res.status(201).json({ message: "تم إنشاء الحساب الإداري", user: adminUser });
//   } catch (err) {
//     res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
//   }
// };


// // ✅ تحديث بيانات المستخدم الشخصية
// exports.updateProfile = async (req, res) => {
//   try {
//     const userId = req.user.id; // الـ ID من التوكن
//     const { username, address, phone_number, emergency_phone_number } = req.body;

//     // البحث عن المستخدم
//     const user = await User.findByPk(userId);
//     if (!user) {
//       return res.status(404).json({ message: "المستخدم غير موجود" });
//     }

//     // تحديث البيانات المسموح بها
//     const updatedData = {};
//     if (username) updatedData.username = username;
//     if (address) updatedData.address = address;
//     if (phone_number) updatedData.phone_number = phone_number;
//     if (emergency_phone_number) updatedData.emergency_phone_number = emergency_phone_number;

//     // تنفيذ التحديث
//     await User.update(updatedData, {
//       where: { id: userId }
//     });

//     // جلب البيانات المحدثة
//     const updatedUser = await User.findByPk(userId, {
//       attributes: { exclude: ['password'] } // استبعاد الباسوورد من الناتج
//     });

//     res.json({ message: "تم تحديث البيانات بنجاح", user: updatedUser });
//   } catch (err) {
//     res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
//   }
// };

// // ✅ تغيير كلمة المرور
// exports.changePassword = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { currentPassword, newPassword } = req.body;

//     const user = await User.findByPk(userId);
//     if (!user) {
//       return res.status(404).json({ message: "المستخدم غير موجود" });
//     }

//     // التحقق من كلمة المرور الحالية
//     const isMatch = await bcrypt.compare(currentPassword, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "كلمة المرور الحالية غير صحيحة" });
//     }

//     // تشفير كلمة المرور الجديدة
//     const hashedNewPassword = await bcrypt.hash(newPassword, 10);

//     // تحديث كلمة المرور
//     await User.update(
//       { password: hashedNewPassword },
//       { where: { id: userId } }
//     );

//     res.json({ message: "تم تغيير كلمة المرور بنجاح" });
//   } catch (err) {
//     res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
//   }
// };
  
// // ✅ الحصول على بيانات المستخدم الشخصية
// exports.getProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const user = await User.findByPk(userId, {
//       attributes: { exclude: ['password'] } // استبعاد الباسوورد
//     });

//     if (!user) {
//       return res.status(404).json({ message: "المستخدم غير موجود" });
//     }

//     res.json({ user });
//   } catch (err) {
//     res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
//   }
// };


// ******************************************************************************





// const bcrypt = require("bcryptjs");
// const { User } = require("../models");

// // ✅ إنشاء حساب إداري (من قبل السوبر أدمن)
// exports.createAdmin = async (req, res) => {
//   try {
//     const { username, email, password, userType } = req.body;

//     if (![3, 4, 5].includes(userType)) {
//       return res.status(400).json({ message: "userType غير مسموح" });
//     }

//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) {
//       return res.status(400).json({ message: "البريد مستخدم مسبقاً" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const adminUser = await User.create({
//       username,
//       email,
//       password: hashedPassword,
//       userType,
//     });

//     res.status(201).json({ message: "تم إنشاء الحساب الإداري", user: adminUser });
//   } catch (err) {
//     res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
//   }
// };

// // ✅ الحصول على المستخدمين حسب userType
// exports.getUsersByType = async (req, res) => {
//   try {
//     const { userType } = req.params;
    
//     // تحقق من الصلاحيات - فقط userType 2 و 3 يمكنهم الوصول
//     if (![2, 3].includes(req.user.userType)) {
//       return res.status(403).json({ message: "ليس لديك صلاحية للوصول إلى هذه البيانات" });
//     }

//     // تحقق من أن userType المطلوب صحيح
//     const allowedTypes = [1, 3, 4, 5];
//     if (!allowedTypes.includes(parseInt(userType))) {
//       return res.status(400).json({ message: "userType غير صحيح" });
//     }

//     const users = await User.findAll({
//       where: { userType: parseInt(userType) },
//       attributes: { exclude: ['password'] } // استبعاد الباسوورد
//     });

//     res.json({ 
//       message: `تم جلب المستخدمين بنجاح (userType: ${userType})`,
//       users 
//     });
//   } catch (err) {
//     res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
//   }
// };

// // ✅ الحصول على أسماء المستخدمين فقط حسب userType
// exports.getUserNamesByType = async (req, res) => {
//   try {
//     const { userType } = req.params;
    
//     // تحقق من الصلاحيات - فقط userType 2 و 3 يمكنهم الوصول
//     if (![2, 3].includes(req.user.userType)) {
//       return res.status(403).json({ message: "ليس لديك صلاحية للوصول إلى هذه البيانات" });
//     }

//     // تحقق من أن userType المطلوب صحيح
//     const allowedTypes = [1, 3, 4, 5];
//     if (!allowedTypes.includes(parseInt(userType))) {
//       return res.status(400).json({ message: "userType غير صحيح" });
//     }

//     const users = await User.findAll({
//       where: { userType: parseInt(userType) },
//       attributes: ['id', 'username'] // فقط الاسم والرقم
//     });

//     res.json({ 
//       message: `تم جلب أسماء المستخدمين بنجاح (userType: ${userType})`,
//       users 
//     });
//   } catch (err) {
//     res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
//   }
// };

// // ✅ تحديث بيانات المستخدم الشخصية
// exports.updateProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { username, address, phone_number, emergency_phone_number } = req.body;

//     const user = await User.findByPk(userId);
//     if (!user) {
//       return res.status(404).json({ message: "المستخدم غير موجود" });
//     }

//     const updatedData = {};
//     if (username) updatedData.username = username;
//     if (address) updatedData.address = address;
//     if (phone_number) updatedData.phone_number = phone_number;
//     if (emergency_phone_number) updatedData.emergency_phone_number = emergency_phone_number;

//     await User.update(updatedData, {
//       where: { id: userId }
//     });

//     const updatedUser = await User.findByPk(userId, {
//       attributes: { exclude: ['password'] }
//     });

//     res.json({ message: "تم تحديث البيانات بنجاح", user: updatedUser });
//   } catch (err) {
//     res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
//   }
// };

// // ✅ تغيير كلمة المرور
// exports.changePassword = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { currentPassword, newPassword } = req.body;

//     const user = await User.findByPk(userId);
//     if (!user) {
//       return res.status(404).json({ message: "المستخدم غير موجود" });
//     }

//     const isMatch = await bcrypt.compare(currentPassword, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "كلمة المرور الحالية غير صحيحة" });
//     }

//     const hashedNewPassword = await bcrypt.hash(newPassword, 10);

//     await User.update(
//       { password: hashedNewPassword },
//       { where: { id: userId } }
//     );

//     res.json({ message: "تم تغيير كلمة المرور بنجاح" });
//   } catch (err) {
//     res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
//   }
// };

// // ✅ الحصول على بيانات المستخدم الشخصية
// exports.getProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const user = await User.findByPk(userId, {
//       attributes: { exclude: ['password'] }
//     });

//     if (!user) {
//       return res.status(404).json({ message: "المستخدم غير موجود" });
//     }

//     res.json({ user });
//   } catch (err) {
//     res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
//   }
// };



// ******************************************************************************






const bcrypt = require("bcryptjs");
const { User } = require("../models");

// ✅ إنشاء حساب إداري (من قبل السوبر أدمن)
exports.createAdmin = async (req, res) => {
  try {
    const { username, email, password, userType } = req.body;

    if (![3, 4, 5].includes(userType)) {
      return res.status(400).json({ message: "userType غير مسموح" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "البريد مستخدم مسبقاً" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = await User.create({
      username,
      email,
      password: hashedPassword,
      userType,
    });

    res.status(201).json({ message: "تم إنشاء الحساب الإداري", user: adminUser });
  } catch (err) {
    res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
  }
};

// ✅ الحصول على المستخدمين حسب userType
exports.getUsersByType = async (req, res) => {
  try {
    const { userType } = req.params;
    
    // تحقق من الصلاحيات - فقط userType 2 و 3 يمكنهم الوصول
    if (![2, 3].includes(req.user.userType)) {
      return res.status(403).json({ message: "ليس لديك صلاحية للوصول إلى هذه البيانات" });
    }

    // تحقق من أن userType المطلوب صحيح
    const allowedTypes = [1, 3, 4, 5];
    if (!allowedTypes.includes(parseInt(userType))) {
      return res.status(400).json({ message: "userType غير صحيح" });
    }

    const users = await User.findAll({
      where: { userType: parseInt(userType) },
      attributes: { exclude: ['password'] } // استبعاد الباسوورد
    });

    res.json({ 
      message: `تم جلب المستخدمين بنجاح (userType: ${userType})`,
      users 
    });
  } catch (err) {
    res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
  }
};

// ✅ الحصول على أسماء المستخدمين فقط حسب userType
exports.getUserNamesByType = async (req, res) => {
  try {
    const { userType } = req.params;
    
    // تحقق من الصلاحيات - فقط userType 2 و 3 يمكنهم الوصول
    if (![2, 3].includes(req.user.userType)) {
      return res.status(403).json({ message: "ليس لديك صلاحية للوصول إلى هذه البيانات" });
    }

    // تحقق من أن userType المطلوب صحيح
    const allowedTypes = [1, 3, 4, 5];
    if (!allowedTypes.includes(parseInt(userType))) {
      return res.status(400).json({ message: "userType غير صحيح" });
    }

    const users = await User.findAll({
      where: { userType: parseInt(userType) },
      attributes: ['id', 'username'] // فقط الاسم والرقم
    });

    res.json({ 
      message: `تم جلب أسماء المستخدمين بنجاح (userType: ${userType})`,
      users 
    });
  } catch (err) {
    res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
  }
};

// ✅ تحديث بيانات المستخدم الشخصية
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, address, phone_number, emergency_phone_number } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    const updatedData = {};
    if (username) updatedData.username = username;
    if (address) updatedData.address = address;
    if (phone_number) updatedData.phone_number = phone_number;
    if (emergency_phone_number) updatedData.emergency_phone_number = emergency_phone_number;

    await User.update(updatedData, {
      where: { id: userId }
    });

    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    res.json({ message: "تم تحديث البيانات بنجاح", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
  }
};

// ✅ تغيير كلمة المرور
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "كلمة المرور الحالية غير صحيحة" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await User.update(
      { password: hashedNewPassword },
      { where: { id: userId } }
    );

    res.json({ message: "تم تغيير كلمة المرور بنجاح" });
  } catch (err) {
    res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
  }
};

// ✅ الحصول على بيانات المستخدم الشخصية
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
  }
};

// ✅ حذف مستخدم (فقط السوبر أدمن)
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user;

    // البحث عن المستخدم المراد حذفه
    const userToDelete = await User.findByPk(userId);
    if (!userToDelete) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    // منع حذف الحسابات الإدارية (userType 2, 3)
    if ([2, 3].includes(userToDelete.userType)) {
      return res.status(403).json({ 
        message: "لا يمكن حذف الحسابات الإدارية (سوبر أدمن أو مشرف)" 
      });
    }

    // منع المستخدم من حذف نفسه
    if (parseInt(userId) === currentUser.id) {
      return res.status(403).json({ 
        message: "لا يمكن حذف حسابك الشخصي" 
      });
    }

    // تنفيذ الحذف
    await User.destroy({
      where: { id: userId }
    });

    res.json({ 
      message: "تم حذف المستخدم بنجاح",
      deletedUser: {
        id: userToDelete.id,
        username: userToDelete.username,
        email: userToDelete.email,
        userType: userToDelete.userType
      }
    });
  } catch (err) {
    res.status(500).json({ 
      message: "خطأ في السيرفر", 
      error: err.message 
    });
  }
};





