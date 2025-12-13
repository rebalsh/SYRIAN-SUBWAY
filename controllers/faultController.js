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
//           attributes: ['id', 'name', 'email']
//         },
//         {
//           model: User,
//           as: 'technician',
//           attributes: ['id', 'name', 'email']
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

//     // الحصول على بيانات الفني والمحطة التابع لها
//     const technician = await User.findByPk(technician_id, {
//       include: [Station]
//     });

//     if (!technician || !technician.Station) {
//       return res.status(404).json({ 
//         message: "لم يتم تعيينك على أي محطة" 
//       });
//     }

//     // الحصول على الأعطال للقطارات الموجودة في محطة الفني
//     const faults = await Fault.findAll({
//       include: [
//         {
//           model: Train,
//           attributes: ['id', 'version_number', 'status']
//         },
//         {
//           model: User,
//           as: 'driver',
//           attributes: ['id', 'name', 'email']
//         }
//       ],
//       where: {
//         status: "reported"
//       },
//       order: [['report_time', 'DESC']]
//     });

//     res.json({ 
//       message: `تم جلب الأعطال لمحطة ${technician.Station.name}`,
//       station: technician.Station,
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

// ✅ الحصول على جميع الأعطال (للفنيين والمشرفين)
exports.getAllFaults = async (req, res) => {
  try {
    const faults = await Fault.findAll({
      include: [
        {
          model: Train,
          attributes: ['id', 'version_number', 'status']
        },
        {
          model: User,
          as: 'driver',
          attributes: ['id', 'email', 'userType'] // استخدام الحقول الموجودة فقط
        },
        {
          model: User,
          as: 'technician',
          attributes: ['id', 'email', 'userType'] // استخدام الحقول الموجودة فقط
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

// ✅ الحصول على أعطال محطة محددة (للفنيين - userType = 4)
exports.getStationFaults = async (req, res) => {
  try {
    const technician_id = req.user.id;

    // الحصول على بيانات الفني
    const technician = await User.findByPk(technician_id);
    
    if (!technician) {
      return res.status(404).json({ 
        message: "المستخدم غير موجود" 
      });
    }

    const faults = await Fault.findAll({
      include: [
        {
          model: Train,
          attributes: ['id', 'version_number', 'status']
        },
        {
          model: User,
          as: 'driver',
          attributes: ['id', 'email', 'userType'] // استخدام الحقول الموجودة فقط
        }
      ],
      where: {
        status: "reported"
      },
      order: [['report_time', 'DESC']]
    });

    res.json({ 
      message: "تم جلب الأعطال بنجاح",
      faults: faults 
    });

  } catch (err) {
    console.error("Error fetching station faults:", err);
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