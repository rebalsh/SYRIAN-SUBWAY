


// const { Fault, Train, User, WorkOrder, Station } = require("../models");

// // ✅ الإبلاغ عن عطل جديد (للسائقين فقط - userType = 5)
// exports.reportFault = async (req, res) => {
//   try {
//     const { description, train_id } = req.body;
//     const driver_id = req.user.id;

//     // التحقق من البيانات المطلوبة
//     if (!description || !train_id) {
//       return res.status(400).json({ 
//         message: "جميع الحقول مطلوبة: description, train_id" 
//       });
//     }

//     // التحقق من وجود القطار
//     const train = await Train.findByPk(train_id);
//     if (!train) {
//       return res.status(404).json({ message: "القطار غير موجود" });
//     }

//     // التحقق من أن المستخدم سائق
//     if (req.user.userType !== 5) {
//       return res.status(403).json({ 
//         message: "صلاحيات غير كافية. فقط السائقون يمكنهم الإبلاغ عن الأعطال" 
//       });
//     }

//     // إنشاء العطل الجديد
//     const newFault = await Fault.create({
//       description,
//       train_id: parseInt(train_id),
//       driver_id: parseInt(driver_id),
//       status: "reported",
//       report_time: new Date()
//     });

//     // تحديث حالة القطار إلى "off"
//     await train.update({ status: "off" });

//     res.status(201).json({ 
//       message: "تم الإبلاغ عن العطل بنجاح وتم تعطيل القطار",
//       fault: newFault 
//     });

//   } catch (err) {
//     console.error("Error reporting fault:", err);
//     res.status(500).json({ 
//       message: "خطأ في السيرفر", 
//       error: err.message 
//     });
//   }
// };

// // ✅ الحصول على جميع الأعطال (للفنيين والمشرفين)
// exports.getAllFaults = async (req, res) => {
//   try {
//     const faults = await Fault.findAll({
//       include: [
//         {
//           model: Train,
//           attributes: ['id', 'version_number', 'status']
//         },
//         {
//           model: User,
//           as: 'driver',
//           attributes: ['id', 'email', 'userType'] // استخدام الحقول الموجودة فقط
//         },
//         {
//           model: User,
//           as: 'technician',
//           attributes: ['id', 'email', 'userType'] // استخدام الحقول الموجودة فقط
//         }
//       ],
//       order: [['report_time', 'DESC']]
//     });

//     res.json({ 
//       message: "تم جلب الأعطال بنجاح", 
//       faults: faults 
//     });

//   } catch (err) {
//     console.error("Error fetching faults:", err);
//     res.status(500).json({ 
//       message: "خطأ في السيرفر", 
//       error: err.message 
//     });
//   }
// };

// // ✅ الحصول على أعطال محطة محددة (للفنيين - userType = 4)
// exports.getStationFaults = async (req, res) => {
//   try {
//     const technician_id = req.user.id;

//     // الحصول على بيانات الفني
//     const technician = await User.findByPk(technician_id);
    
//     if (!technician) {
//       return res.status(404).json({ 
//         message: "المستخدم غير موجود" 
//       });
//     }

//     const faults = await Fault.findAll({
//       include: [
//         {
//           model: Train,
//           attributes: ['id', 'version_number', 'status']
//         },
//         {
//           model: User,
//           as: 'driver',
//           attributes: ['id', 'email', 'userType'] // استخدام الحقول الموجودة فقط
//         }
//       ],
//       where: {
//         status: "reported"
//       },
//       order: [['report_time', 'DESC']]
//     });

//     res.json({ 
//       message: "تم جلب الأعطال بنجاح",
//       faults: faults 
//     });

//   } catch (err) {
//     console.error("Error fetching station faults:", err);
//     res.status(500).json({ 
//       message: "خطأ في السيرفر", 
//       error: err.message 
//     });
//   }
// };

// // ✅ تحديث حالة العطل
// exports.updateFaultStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status, technician_id } = req.body;

//     const fault = await Fault.findByPk(id);
//     if (!fault) {
//       return res.status(404).json({ message: "العطل غير موجود" });
//     }

//     // التحقق من الحالة المسموحة
//     const allowedStatuses = ["reported", "assigned", "resolved"];
//     if (status && !allowedStatuses.includes(status)) {
//       return res.status(400).json({ 
//         message: "الحالة يجب أن تكون: reported, assigned, resolved" 
//       });
//     }

//     // إذا تم تعيين الفني، تحديث العطل
//     if (technician_id) {
//       const technician = await User.findOne({
//         where: { id: technician_id, userType: 4 }
//       });
      
//       if (!technician) {
//         return res.status(404).json({ message: "الفني غير موجود" });
//       }
//     }

//     await fault.update({
//       ...(status && { status }),
//       ...(technician_id && { technician_id: parseInt(technician_id) })
//     });

//     res.json({ 
//       message: "تم تحديث حالة العطل بنجاح", 
//       fault: fault 
//     });

//   } catch (err) {
//     console.error("Error updating fault:", err);
//     res.status(500).json({ 
//       message: "خطأ في السيرفر", 
//       error: err.message 
//     });
//   }
// };





const { Fault, Train, User, WorkOrder, Station } = require("../models");

// ✅ الإبلاغ عن عطل جديد (للسائقين فقط - userType = 5)
exports.reportFault = async (req, res) => {
  try {
    const { description, train_id } = req.body;
    const driver_id = req.user.id;

    // التحقق من البيانات المطلوبة
    if (!description || !train_id) {
      return res.status(400).json({ 
        message: "جميع الحقول مطلوبة: description, train_id" 
      });
    }

    // التحقق من وجود القطار
    const train = await Train.findByPk(train_id);
    if (!train) {
      return res.status(404).json({ message: "القطار غير موجود" });
    }

    // التحقق من أن المستخدم سائق
    if (req.user.userType !== 5) {
      return res.status(403).json({ 
        message: "صلاحيات غير كافية. فقط السائقون يمكنهم الإبلاغ عن الأعطال" 
      });
    }

    // إنشاء العطل الجديد
    const newFault = await Fault.create({
      description,
      train_id: parseInt(train_id),
      driver_id: parseInt(driver_id),
      status: "reported",
      report_time: new Date()
    });

    // تحديث حالة القطار إلى "off"
    await train.update({ status: "off" });

    res.status(201).json({ 
      message: "تم الإبلاغ عن العطل بنجاح وتم تعطيل القطار",
      fault: newFault 
    });

  } catch (err) {
    console.error("Error reporting fault:", err);
    res.status(500).json({ 
      message: "خطأ في السيرفر", 
      error: err.message 
    });
  }
};

// ✅ الحصول على جميع الأعطال (للمشرفين والسوبر أدمن)
exports.getAllFaults = async (req, res) => {
  try {
    const { status } = req.query;
    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }

    const faults = await Fault.findAll({
      where: whereClause,
      include: [
        {
          model: Train,
          attributes: ['id', 'version_number', 'status']
        },
        {
          model: User,
          as: 'driver',
          attributes: ['id', 'email', 'userType']
        },
        {
          model: User,
          as: 'technician',
          attributes: ['id', 'email', 'userType']
        }
      ],
      order: [['report_time', 'DESC']]
    });

    res.json({ 
      message: "تم جلب الأعطال بنجاح", 
      faults: faults 
    });

  } catch (err) {
    console.error("Error fetching faults:", err);
    res.status(500).json({ 
      message: "خطأ في السيرفر", 
      error: err.message 
    });
  }
};

// ✅ الحصول على الأعطال المتاحة للفني (جميع المحطات)
exports.getTechnicianFaults = async (req, res) => {
  try {
    const technician_id = req.user.id;
    const { status } = req.query;

    // التحقق من أن المستخدم فني
    if (req.user.userType !== 4) {
      return res.status(403).json({ 
        message: "صلاحيات غير كافية. فقط الفنيون يمكنهم عرض الأعطال" 
      });
    }

    // بناء شرط البحث - الفني يرى الأعطال غير المحلولة
    const whereClause = {
      status: ["reported", "assigned"]
    };

    // إذا طلب حالة محددة
    if (status) {
      whereClause.status = status;
    }

    // جلب جميع الأعطال غير المحلولة
    const faults = await Fault.findAll({
      where: whereClause,
      include: [
        {
          model: Train,
          attributes: ['id', 'version_number', 'status'] // 🔥 إزالة station_id هنا
        },
        {
          model: User,
          as: 'driver',
          attributes: ['id', 'email', 'username', 'phone_number']
        },
        {
          model: User,
          as: 'technician',
          attributes: ['id', 'email', 'username']
        }
      ],
      order: [
        ['status', 'ASC'],
        ['report_time', 'DESC']
      ]
    });

    res.json({ 
      message: "تم جلب الأعطال المتاحة للفني بنجاح",
      faults: faults 
    });

  } catch (err) {
    console.error("Error fetching technician faults:", err);
    res.status(500).json({ 
      message: "خطأ في السيرفر", 
      error: err.message 
    });
  }
};

// ✅ الحصول على الأعطال غير المعينة (للمشرفين لتعيينها للفنيين)
exports.getUnassignedFaults = async (req, res) => {
  try {
    const faults = await Fault.findAll({
      where: {
        status: "reported",
        technician_id: null
      },
      include: [
        {
          model: Train,
          attributes: ['id', 'version_number', 'status'] // 🔥 إزالة station_id هنا
        },
        {
          model: User,
          as: 'driver',
          attributes: ['id', 'email', 'userType']
        }
      ],
      order: [['report_time', 'DESC']]
    });

    res.json({ 
      message: "تم جلب الأعطال غير المعينة بنجاح", 
      faults: faults 
    });

  } catch (err) {
    console.error("Error fetching unassigned faults:", err);
    res.status(500).json({ 
      message: "خطأ في السيرفر", 
      error: err.message 
    });
  }
};

// ✅ تحديث حالة العطل
exports.updateFaultStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, technician_id } = req.body;

    const fault = await Fault.findByPk(id);
    if (!fault) {
      return res.status(404).json({ message: "العطل غير موجود" });
    }

    // التحقق من الحالة المسموحة
    const allowedStatuses = ["reported", "assigned", "resolved"];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ 
        message: "الحالة يجب أن تكون: reported, assigned, resolved" 
      });
    }

    // إذا تم تعيين الفني، تحديث العطل
    if (technician_id) {
      const technician = await User.findOne({
        where: { id: technician_id, userType: 4 }
      });
      
      if (!technician) {
        return res.status(404).json({ message: "الفني غير موجود" });
      }
    }

    await fault.update({
      ...(status && { status }),
      ...(technician_id && { technician_id: parseInt(technician_id) })
    });

    res.json({ 
      message: "تم تحديث حالة العطل بنجاح", 
      fault: fault 
    });

  } catch (err) {
    console.error("Error updating fault:", err);
    res.status(500).json({ 
      message: "خطأ في السيرفر", 
      error: err.message 
    });
  }
};

// ✅ تعيين عطل لفني محدد (للمشرفين)
exports.assignFaultToTechnician = async (req, res) => {
  try {
    const { id } = req.params;
    const { technician_id } = req.body;

    if (!technician_id) {
      return res.status(400).json({ 
        message: "معرف الفني مطلوب" 
      });
    }

    const fault = await Fault.findByPk(id);
    if (!fault) {
      return res.status(404).json({ message: "العطل غير موجود" });
    }

    // التحقق من أن العطل غير معين مسبقاً
    if (fault.technician_id) {
      return res.status(400).json({ 
        message: "هذا العطل معين بالفعل لفني" 
      });
    }

    // التحقق من وجود الفني
    const technician = await User.findOne({
      where: { id: technician_id, userType: 4 }
    });
    
    if (!technician) {
      return res.status(404).json({ message: "الفني غير موجود" });
    }

    // تحديث العطل وتعيينه للفني
    await fault.update({
      status: "assigned",
      technician_id: parseInt(technician_id)
    });

    res.json({ 
      message: "تم تعيين العطل للفني بنجاح", 
      fault: fault 
    });

  } catch (err) {
    console.error("Error assigning fault:", err);
    res.status(500).json({ 
      message: "خطأ في السيرفر", 
      error: err.message 
    });
  }
};

// ✅ الفني يستلم عطل (يأخذه لنفسه)
exports.technicianTakeFault = async (req, res) => {
  try {
    const { id } = req.params;
    const technician_id = req.user.id;

    const fault = await Fault.findByPk(id);
    if (!fault) {
      return res.status(404).json({ message: "العطل غير موجود" });
    }

    // التحقق من أن المستخدم فني
    if (req.user.userType !== 4) {
      return res.status(403).json({ 
        message: "صلاحيات غير كافية. فقط الفنيون يمكنهم استلام الأعطال" 
      });
    }

    // التحقق من أن العطل متاح (غير معين)
    if (fault.technician_id) {
      return res.status(400).json({ 
        message: "هذا العطل معين بالفعل لفني آخر" 
      });
    }

    // التحقق من أن العطل في حالة reported
    if (fault.status !== "reported") {
      return res.status(400).json({ 
        message: "لا يمكن استلام عطل غير متاح" 
      });
    }

    // الفني يأخذ العطل لنفسه
    await fault.update({
      status: "assigned",
      technician_id: parseInt(technician_id)
    });

    res.json({ 
      message: "تم استلام العطل بنجاح، يمكنك البدء بالإصلاح", 
      fault: fault 
    });

  } catch (err) {
    console.error("Error taking fault:", err);
    res.status(500).json({ 
      message: "خطأ في السيرفر", 
      error: err.message 
    });
  }
};

// ✅ الفني يكمل إصلاح العطل
exports.technicianCompleteFault = async (req, res) => {
  try {
    const { id } = req.params;
    const technician_id = req.user.id;

    const fault = await Fault.findByPk(id);
    if (!fault) {
      return res.status(404).json({ message: "العطل غير موجود" });
    }

    // التحقق من أن المستخدم فني
    if (req.user.userType !== 4) {
      return res.status(403).json({ 
        message: "صلاحيات غير كافية. فقط الفنيون يمكنهم إكمال الأعطال" 
      });
    }

    // التحقق من أن العطل معين لهذا الفني
    if (fault.technician_id !== technician_id) {
      return res.status(403).json({ 
        message: "هذا العطل غير معين لك" 
      });
    }

    // التحقق من أن العطل في حالة assigned
    if (fault.status !== "assigned") {
      return res.status(400).json({ 
        message: "لا يمكن إكمال عطل غير مستلم" 
      });
    }

    // تحديث حالة العطل إلى resolved
    await fault.update({
      status: "resolved"
    });

    // تحديث حالة القطار إلى "on"
    const train = await Train.findByPk(fault.train_id);
    if (train) {
      await train.update({ status: "on" });
    }

    res.json({ 
      message: "تم إكمال إصلاح العطل بنجاح وتم تفعيل القطار", 
      fault: fault 
    });

  } catch (err) {
    console.error("Error completing fault:", err);
    res.status(500).json({ 
      message: "خطأ في السيرفر", 
      error: err.message 
    });
  }
};

// ✅ الفني يرفض أو يتخلى عن عطل
exports.technicianReleaseFault = async (req, res) => {
  try {
    const { id } = req.params;
    const technician_id = req.user.id;

    const fault = await Fault.findByPk(id);
    if (!fault) {
      return res.status(404).json({ message: "العطل غير موجود" });
    }

    // التحقق من أن المستخدم فني
    if (req.user.userType !== 4) {
      return res.status(403).json({ 
        message: "صلاحيات غير كافية. فقط الفنيون يمكنهم التخلي عن الأعطال" 
      });
    }

    // التحقق من أن العطل معين لهذا الفني
    if (fault.technician_id !== technician_id) {
      return res.status(403).json({ 
        message: "هذا العطل غير معين لك" 
      });
    }

    // إعادة العطل إلى الحالة reported وإزالة الفني
    await fault.update({
      status: "reported",
      technician_id: null
    });

    res.json({ 
      message: "تم التخلي عن العطل بنجاح، العطل متاح الآن للفنيين الآخرين", 
      fault: fault 
    });

  } catch (err) {
    console.error("Error releasing fault:", err);
    res.status(500).json({ 
      message: "خطأ في السيرفر", 
      error: err.message 
    });
  }
};