// const { WorkOrder, Fault, User, Train } = require("../models");

// // ✅ إنشاء أمر عمل جديد (تلقائي عند تعيين عطل لفني)
// exports.createWorkOrder = async (req, res) => {
//   try {
//     const { fault_id, technician_id, estimated_completion_time } = req.body;

//     // التحقق من البيانات المطلوبة
//     if (!fault_id || !technician_id) {
//       return res.status(400).json({ 
//         message: "جميع الحقول مطلوبة: fault_id, technician_id" 
//       });
//     }

//     // التحقق من وجود العطل
//     const fault = await Fault.findByPk(fault_id);
//     if (!fault) {
//       return res.status(404).json({ message: "العطل غير موجود" });
//     }

//     // التحقق من وجود الفني
//     const technician = await User.findOne({
//       where: { id: technician_id, userType: 4 }
//     });
//     if (!technician) {
//       return res.status(404).json({ message: "الفني غير موجود" });
//     }

//     // التحقق من عدم وجود أمر عمل نشط لنفس العطل
//     const existingWorkOrder = await WorkOrder.findOne({
//       where: { 
//         fault_id: fault_id,
//         status: ['pending', 'accepted']
//       }
//     });

//     if (existingWorkOrder) {
//       return res.status(400).json({ 
//         message: "يوجد أمر عمل نشط لهذا العطل مسبقاً" 
//       });
//     }

//     // إنشاء أمر العمل الجديد
//     const newWorkOrder = await WorkOrder.create({
//       fault_id: parseInt(fault_id),
//       technician_id: parseInt(technician_id),
//       status: "pending",
//       assigned_at: new Date(),
//       estimated_completion_time: estimated_completion_time || null
//     });

//     // تحديث حالة العطل إلى "assigned"
//     await fault.update({ 
//       status: "assigned",
//       technician_id: parseInt(technician_id)
//     });

//     res.status(201).json({ 
//       message: "تم إنشاء أمر العمل بنجاح", 
//       workOrder: newWorkOrder 
//     });

//   } catch (err) {
//     console.error("Error creating work order:", err);
//     res.status(500).json({ 
//       message: "خطأ في السيرفر", 
//       error: err.message 
//     });
//   }
// };

// // ✅ قبول/رفض أمر العمل (للفنيين فقط - userType = 4)
// exports.respondToWorkOrder = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;
//     const technician_id = req.user.id;

//     // التحقق من الحالة
//     if (!status || !["accepted", "rejected"].includes(status)) {
//       return res.status(400).json({ 
//         message: "الحالة يجب أن تكون: accepted أو rejected" 
//       });
//     }

//     const workOrder = await WorkOrder.findByPk(id, {
//       include: [Fault]
//     });

//     if (!workOrder) {
//       return res.status(404).json({ message: "أمر العمل غير موجود" });
//     }

//     // التحقق من أن المستخدم هو الفني المعني
//     if (workOrder.technician_id !== technician_id) {
//       return res.status(403).json({ 
//         message: "ليس لديك صلاحية للتعامل مع هذا الأمر" 
//       });
//     }

//     // تحديث أمر العمل
//     const updateData = {
//       status: status,
//       ...(status === "accepted" && { accepted_at: new Date() })
//     };

//     await workOrder.update(updateData);

//     // إذا تم رفض الأمر، إعادة حالة العطل إلى "reported"
//     if (status === "rejected") {
//       await workOrder.Fault.update({ 
//         status: "reported",
//         technician_id: null
//       });
//     }

//     res.json({ 
//       message: `تم ${status === 'accepted' ? 'قبول' : 'رفض'} أمر العمل بنجاح`, 
//       workOrder: workOrder 
//     });

//   } catch (err) {
//     console.error("Error responding to work order:", err);
//     res.status(500).json({ 
//       message: "خطأ في السيرفر", 
//       error: err.message 
//     });
//   }
// };

// // ✅ إكمال أمر العمل (للفنيين فقط)
// exports.completeWorkOrder = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const technician_id = req.user.id;

//     const workOrder = await WorkOrder.findByPk(id, {
//       include: [Fault]
//     });

//     if (!workOrder) {
//       return res.status(404).json({ message: "أمر العمل غير موجود" });
//     }

//     // التحقق من أن المستخدم هو الفني المعني
//     if (workOrder.technician_id !== technician_id) {
//       return res.status(403).json({ 
//         message: "ليس لديك صلاحية للتعامل مع هذا الأمر" 
//       });
//     }

//     // التحقق من أن الأمر مقبول
//     if (workOrder.status !== "accepted") {
//       return res.status(400).json({ 
//         message: "لا يمكن إكمال أمر عمل غير مقبول" 
//       });
//     }

//     // تحديث أمر العمل والعطل
//     await workOrder.update({
//       status: "completed",
//       resolved_at: new Date()
//     });

//     await workOrder.Fault.update({
//       status: "resolved"
//     });

//     // تحديث حالة القطار إلى "on"
//     const train = await Train.findByPk(workOrder.Fault.train_id);
//     if (train) {
//       await train.update({ status: "on" });
//     }

//     res.json({ 
//       message: "تم إكمال أمر العمل بنجاح وتم تفعيل القطار", 
//       workOrder: workOrder 
//     });

//   } catch (err) {
//     console.error("Error completing work order:", err);
//     res.status(500).json({ 
//       message: "خطأ في السيرفر", 
//       error: err.message 
//     });
//   }
// };

// // ✅ الحصول على أوامر العمل للفني
// exports.getTechnicianWorkOrders = async (req, res) => {
//   try {
//     const technician_id = req.user.id;

//     const workOrders = await WorkOrder.findAll({
//       where: { technician_id: technician_id },
//       include: [
//         {
//           model: Fault,
//           include: [
//             {
//               model: Train,
//               attributes: ['id', 'version_number', 'status']
//             },
//             {
//               model: User,
//               as: 'driver',
//               attributes: ['id', 'name', 'email']
//             }
//           ]
//         }
//       ],
//       order: [['assigned_at', 'DESC']]
//     });

//     res.json({ 
//       message: "تم جلب أوامر العمل بنجاح", 
//       workOrders: workOrders 
//     });

//   } catch (err) {
//     console.error("Error fetching work orders:", err);
//     res.status(500).json({ 
//       message: "خطأ في السيرفر", 
//       error: err.message 
//     });
//   }
// };

// // ✅ الحصول على جميع أوامر العمل (للمشرفين)
// exports.getAllWorkOrders = async (req, res) => {
//   try {
//     const workOrders = await WorkOrder.findAll({
//       include: [
//         {
//           model: Fault,
//           include: [
//             {
//               model: Train,
//               attributes: ['id', 'version_number', 'status']
//             },
//             {
//               model: User,
//               as: 'driver',
//               attributes: ['id', 'name', 'email']
//             }
//           ]
//         },
//         {
//           model: User,
//           as: 'technician',
//           attributes: ['id', 'name', 'email']
//         }
//       ],
//       order: [['assigned_at', 'DESC']]
//     });

//     res.json({ 
//       message: "تم جلب أوامر العمل بنجاح", 
//       workOrders: workOrders 
//     });

//   } catch (err) {
//     console.error("Error fetching work orders:", err);
//     res.status(500).json({ 
//       message: "خطأ في السيرفر", 
//       error: err.message 
//     });
//   }
// };




const { WorkOrder, Fault, User, Train } = require("../models");

// ✅ إنشاء أمر عمل جديد (تلقائي عند تعيين عطل لفني)
exports.createWorkOrder = async (req, res) => {
  try {
    const { fault_id, technician_id, estimated_completion_time } = req.body;

    // التحقق من البيانات المطلوبة
    if (!fault_id || !technician_id) {
      return res.status(400).json({ 
        message: "جميع الحقول مطلوبة: fault_id, technician_id" 
      });
    }

    // التحقق من وجود العطل
    const fault = await Fault.findByPk(fault_id);
    if (!fault) {
      return res.status(404).json({ message: "العطل غير موجود" });
    }

    // التحقق من وجود الفني
    const technician = await User.findOne({
      where: { id: technician_id, userType: 4 }
    });
    if (!technician) {
      return res.status(404).json({ message: "الفني غير موجود" });
    }

    // التحقق من عدم وجود أمر عمل نشط لنفس العطل
    const existingWorkOrder = await WorkOrder.findOne({
      where: { 
        fault_id: fault_id,
        status: ['pending', 'accepted']
      }
    });

    if (existingWorkOrder) {
      return res.status(400).json({ 
        message: "يوجد أمر عمل نشط لهذا العطل مسبقاً" 
      });
    }

    // إنشاء أمر العمل الجديد
    const newWorkOrder = await WorkOrder.create({
      fault_id: parseInt(fault_id),
      technician_id: parseInt(technician_id),
      status: "pending",
      assigned_at: new Date(),
      estimated_completion_time: estimated_completion_time || null
    });

    // تحديث حالة العطل إلى "assigned"
    await fault.update({ 
      status: "assigned",
      technician_id: parseInt(technician_id)
    });

    res.status(201).json({ 
      message: "تم إنشاء أمر العمل بنجاح", 
      workOrder: newWorkOrder 
    });

  } catch (err) {
    console.error("Error creating work order:", err);
    res.status(500).json({ 
      message: "خطأ في السيرفر", 
      error: err.message 
    });
  }
};

// ✅ قبول/رفض أمر العمل (للفنيين فقط - userType = 4)
exports.respondToWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const technician_id = req.user.id;

    // التحقق من الحالة
    if (!status || !["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ 
        message: "الحالة يجب أن تكون: accepted أو rejected" 
      });
    }

    const workOrder = await WorkOrder.findByPk(id, {
      include: [Fault]
    });

    if (!workOrder) {
      return res.status(404).json({ message: "أمر العمل غير موجود" });
    }

    // التحقق من أن المستخدم هو الفني المعني
    if (workOrder.technician_id !== technician_id) {
      return res.status(403).json({ 
        message: "ليس لديك صلاحية للتعامل مع هذا الأمر" 
      });
    }

    // تحديث أمر العمل
    const updateData = {
      status: status,
      ...(status === "accepted" && { accepted_at: new Date() })
    };

    await workOrder.update(updateData);

    // إذا تم رفض الأمر، إعادة حالة العطل إلى "reported"
    if (status === "rejected") {
      await workOrder.Fault.update({ 
        status: "reported",
        technician_id: null
      });
    }

    res.json({ 
      message: `تم ${status === 'accepted' ? 'قبول' : 'رفض'} أمر العمل بنجاح`, 
      workOrder: workOrder 
    });

  } catch (err) {
    console.error("Error responding to work order:", err);
    res.status(500).json({ 
      message: "خطأ في السيرفر", 
      error: err.message 
    });
  }
};

// ✅ إكمال أمر العمل (للفنيين فقط)
exports.completeWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const technician_id = req.user.id;

    const workOrder = await WorkOrder.findByPk(id, {
      include: [Fault]
    });

    if (!workOrder) {
      return res.status(404).json({ message: "أمر العمل غير موجود" });
    }

    // التحقق من أن المستخدم هو الفني المعني
    if (workOrder.technician_id !== technician_id) {
      return res.status(403).json({ 
        message: "ليس لديك صلاحية للتعامل مع هذا الأمر" 
      });
    }

    // التحقق من أن الأمر مقبول
    if (workOrder.status !== "accepted") {
      return res.status(400).json({ 
        message: "لا يمكن إكمال أمر عمل غير مقبول" 
      });
    }

    // تحديث أمر العمل والعطل
    await workOrder.update({
      status: "completed",
      resolved_at: new Date()
    });

    await workOrder.Fault.update({
      status: "resolved"
    });

    // تحديث حالة القطار إلى "on"
    const train = await Train.findByPk(workOrder.Fault.train_id);
    if (train) {
      await train.update({ status: "on" });
    }

    res.json({ 
      message: "تم إكمال أمر العمل بنجاح وتم تفعيل القطار", 
      workOrder: workOrder 
    });

  } catch (err) {
    console.error("Error completing work order:", err);
    res.status(500).json({ 
      message: "خطأ في السيرفر", 
      error: err.message 
    });
  }
};

// ✅ الحصول على أوامر العمل للفني
exports.getTechnicianWorkOrders = async (req, res) => {
  try {
    const technician_id = req.user.id;

    const workOrders = await WorkOrder.findAll({
      where: { technician_id: technician_id },
      include: [
        {
          model: Fault,
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
          ]
        }
      ],
      order: [['assigned_at', 'DESC']]
    });

    res.json({ 
      message: "تم جلب أوامر العمل بنجاح", 
      workOrders: workOrders 
    });

  } catch (err) {
    console.error("Error fetching work orders:", err);
    res.status(500).json({ 
      message: "خطأ في السيرفر", 
      error: err.message 
    });
  }
};

// ✅ الحصول على جميع أوامر العمل (للمشرفين)
exports.getAllWorkOrders = async (req, res) => {
  try {
    const workOrders = await WorkOrder.findAll({
      include: [
        {
          model: Fault,
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
          ]
        },
        {
          model: User,
          as: 'technician',
          attributes: ['id', 'email', 'userType'] // استخدام الحقول الموجودة فقط
        }
      ],
      order: [['assigned_at', 'DESC']]
    });

    res.json({ 
      message: "تم جلب أوامر العمل بنجاح", 
      workOrders: workOrders 
    });

  } catch (err) {
    console.error("Error fetching work orders:", err);
    res.status(500).json({ 
      message: "خطأ في السيرفر", 
      error: err.message 
    });
  }
};