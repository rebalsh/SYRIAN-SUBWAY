const { Train } = require("../models");

// ✅ إنشاء قطار جديد (للمشرف userType = 3)
exports.createTrain = async (req, res) => {
  try {
    const { version_number, capacity } = req.body;

    // التحقق من البيانات المطلوبة
    if (!version_number || !capacity) {
      return res.status(400).json({ 
        message: "جميع الحقول مطلوبة: version_number, capacity" 
      });
    }

    // التحقق من أن version_number رقم صحيح موجب
    if (isNaN(version_number) || version_number <= 0) {
      return res.status(400).json({ 
        message: "رقم الإصدار يجب أن يكون رقماً صحيحاً موجباً" 
      });
    }

    // التحقق من أن capacity رقم صحيح موجب
    if (isNaN(capacity) || capacity <= 0) {
      return res.status(400).json({ 
        message: "السعة يجب أن تكون رقماً صحيحاً موجباً" 
      });
    }

    // التحقق من عدم وجود قطار بنفس رقم الإصدار
    const existingTrain = await Train.findOne({ 
      where: { version_number } 
    });

    if (existingTrain) {
      return res.status(400).json({ 
        message: "يوجد قطار بنفس رقم الإصدار مسبقاً" 
      });
    }

    // إنشاء القطار الجديد
    const newTrain = await Train.create({
      version_number: parseInt(version_number),
      capacity: parseInt(capacity),
      status: "off"
    });

    res.status(201).json({ 
      message: "تم إنشاء القطار بنجاح", 
      train: newTrain 
    });

  } catch (err) {
    console.error("Error creating train:", err);
    res.status(500).json({ 
      message: "خطأ في السيرفر", 
      error: err.message 
    });
  }
};

// ✅ الحصول على جميع القطارات
exports.getAllTrains = async (req, res) => {
  try {
    const trains = await Train.findAll({
      order: [['id', 'DESC']]
    });

    res.json({ 
      message: "تم جلب القطارات بنجاح", 
      trains: trains 
    });

  } catch (err) {
    console.error("Error fetching trains:", err);
    res.status(500).json({ 
      message: "خطأ في السيرفر", 
      error: err.message 
    });
  }
};

// ✅ الحصول على قطار بواسطة ID
exports.getTrainById = async (req, res) => {
  try {
    const { id } = req.params;

    const train = await Train.findByPk(id);

    if (!train) {
      return res.status(404).json({ message: "القطار غير موجود" });
    }

    res.json({ 
      message: "تم جلب بيانات القطار بنجاح", 
      train: train 
    });

  } catch (err) {
    console.error("Error fetching train:", err);
    res.status(500).json({ 
      message: "خطأ في السيرفر", 
      error: err.message 
    });
  }
};

// ✅ تحديث بيانات القطار
exports.updateTrain = async (req, res) => {
  try {
    const { id } = req.params;
    const { version_number, capacity, status } = req.body;

    const train = await Train.findByPk(id);
    if (!train) {
      return res.status(404).json({ message: "القطار غير موجود" });
    }

    // التحقق من version_number إذا تم إرساله
    if (version_number && (isNaN(version_number) || version_number <= 0)) {
      return res.status(400).json({ 
        message: "رقم الإصدار يجب أن يكون رقماً صحيحاً موجباً" 
      });
    }

    // التحقق من capacity إذا تم إرساله
    if (capacity && (isNaN(capacity) || capacity <= 0)) {
      return res.status(400).json({ 
        message: "السعة يجب أن تكون رقماً صحيحاً موجباً" 
      });
    }

    // التحقق من status إذا تم إرساله
    if (status && !["on", "off"].includes(status)) {
      return res.status(400).json({ 
        message: "الحالة يجب أن تكون 'on' أو 'off'" 
      });
    }

    // التحقق من عدم وجود قطار آخر بنفس رقم الإصدار
    if (version_number && version_number !== train.version_number) {
      const existingTrain = await Train.findOne({ 
        where: { version_number } 
      });

      if (existingTrain) {
        return res.status(400).json({ 
          message: "يوجد قطار بنفس رقم الإصدار مسبقاً" 
        });
      }
    }

    // تحديث البيانات
    await train.update({
      ...(version_number && { version_number: parseInt(version_number) }),
      ...(capacity && { capacity: parseInt(capacity) }),
      ...(status && { status })
    });

    res.json({ 
      message: "تم تحديث بيانات القطار بنجاح", 
      train: train 
    });

  } catch (err) {
    console.error("Error updating train:", err);
    res.status(500).json({ 
      message: "خطأ في السيرفر", 
      error: err.message 
    });
  }
};

// ✅ حذف القطار
exports.deleteTrain = async (req, res) => {
  try {
    const { id } = req.params;

    const train = await Train.findByPk(id);
    if (!train) {
      return res.status(404).json({ message: "القطار غير موجود" });
    }

    await train.destroy();

    res.json({ 
      message: "تم حذف القطار بنجاح" 
    });

  } catch (err) {
    console.error("Error deleting train:", err);
    res.status(500).json({ 
      message: "خطأ في السيرفر", 
      error: err.message 
    });
  }
};