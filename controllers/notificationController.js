// // controllers/notificationController.js
// const { Notification, User, Ticket, Trip, Line, Station, sequelize } = require("../models");
// const { Op } = require("sequelize");

// // ✅ إرسال إشعار لمسافري رحلة محددة
// exports.sendToTripPassengers = async (req, res) => {
//   const transaction = await sequelize.transaction();
  
//   try {
//     const { trip_id, title, message, type = "trip_update" } = req.body;
//     const sender_id = req.user.id;

//     if (!trip_id || !title || !message) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: "يرجى إدخال معرف الرحلة والعنوان والرسالة" 
//       });
//     }

//     // التحقق من وجود الرحلة
//     const trip = await Trip.findByPk(trip_id, { transaction });
//     if (!trip) {
//       await transaction.rollback();
//       return res.status(404).json({ message: "الرحلة غير موجودة" });
//     }

//     // جلب جميع المسافرين في الرحلة
//     const passengers = await Ticket.findAll({
//       where: { 
//         trip_id,
//         status: { [Op.in]: ['pending', 'confirmed'] }
//       },
//       include: [{
//         model: User,
//         attributes: ['id']
//       }],
//       transaction
//     });

//     if (passengers.length === 0) {
//       await transaction.rollback();
//       return res.status(404).json({ message: "لا يوجد مسافرين في هذه الرحلة" });
//     }

//     // إرسال إشعار لكل مسافر
//     const notifications = [];
//     for (const passenger of passengers) {
//       const notification = await Notification.create({
//         user_id: passenger.user_id,
//         trip_id,
//         title,
//         message,
//         type,
//         date: new Date(),
//         is_read: false,
//         sent_to_all: false
//       }, { transaction });
      
//       notifications.push(notification);
//     }

//     await transaction.commit();

//     res.json({
//       message: `تم إرسال الإشعار لـ ${notifications.length} مسافر`,
//       trip: {
//         id: trip.id,
//         start_time: trip.start_time,
//         line_id: trip.line_id
//       },
//       notification_count: notifications.length
//     });

//   } catch (err) {
//     await transaction.rollback();
//     console.error("Error in sendToTripPassengers:", err);
//     res.status(500).json({ 
//       message: "خطأ في إرسال الإشعار", 
//       error: err.message 
//     });
//   }
// };

// // ✅ إرسال إشعار لجميع المسافرين
// exports.sendToAllPassengers = async (req, res) => {
//   const transaction = await sequelize.transaction();
  
//   try {
//     const { title, message, type = "general" } = req.body;
//     const sender_id = req.user.id;

//     if (!title || !message) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: "يرجى إدخال العنوان والرسالة" 
//       });
//     }

//     // جلب جميع المسافرين (المستخدمين من النوع 1)
//     const passengers = await User.findAll({
//       where: { userType: 1 },
//       attributes: ['id'],
//       transaction
//     });

//     if (passengers.length === 0) {
//       await transaction.rollback();
//       return res.status(404).json({ message: "لا يوجد مسافرين في النظام" });
//     }

//     // إرسال إشعار لكل مسافر
//     const notifications = [];
//     for (const passenger of passengers) {
//       const notification = await Notification.create({
//         user_id: passenger.id,
//         title,
//         message,
//         type,
//         date: new Date(),
//         is_read: false,
//         sent_to_all: true
//       }, { transaction });
      
//       notifications.push(notification);
//     }

//     await transaction.commit();

//     res.json({
//       message: `تم إرسال الإشعار لجميع المسافرين (${notifications.length})`,
//       notification_count: notifications.length
//     });

//   } catch (err) {
//     await transaction.rollback();
//     console.error("Error in sendToAllPassengers:", err);
//     res.status(500).json({ 
//       message: "خطأ في إرسال الإشعار", 
//       error: err.message 
//     });
//   }
// };

// // ✅ إرسال إشعار لمسافري رحلات يوم محدد
// exports.sendToDatePassengers = async (req, res) => {
//   const transaction = await sequelize.transaction();
  
//   try {
//     const { date, title, message, type = "trip_update" } = req.body;
//     const sender_id = req.user.id;

//     if (!date || !title || !message) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: "يرجى إدخال التاريخ والعنوان والرسالة" 
//       });
//     }

//     // تحويل التاريخ إلى نطاق زمني
//     const selectedDate = new Date(date);
//     const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
//     const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

//     // جلب الرحلات في اليوم المحدد
//     const trips = await Trip.findAll({
//       where: {
//         start_time: {
//           [Op.between]: [startOfDay, endOfDay]
//         }
//       },
//       attributes: ['id'],
//       transaction
//     });

//     if (trips.length === 0) {
//       await transaction.rollback();
//       return res.status(404).json({ message: "لا توجد رحلات في هذا التاريخ" });
//     }

//     const tripIds = trips.map(trip => trip.id);

//     // جلب التذاكر للرحلات في هذا التاريخ
//     const tickets = await Ticket.findAll({
//       where: { 
//         trip_id: { [Op.in]: tripIds },
//         status: { [Op.in]: ['pending', 'confirmed'] }
//       },
//       include: [{
//         model: User,
//         attributes: ['id']
//       }],
//       transaction
//     });

//     if (tickets.length === 0) {
//       await transaction.rollback();
//       return res.status(404).json({ message: "لا يوجد مسافرين في رحلات هذا التاريخ" });
//     }

//     // تجنب الإشعارات المكررة لنفس المستخدم
//     const uniqueUsers = new Set();
//     const notifications = [];

//     for (const ticket of tickets) {
//       if (!uniqueUsers.has(ticket.user_id)) {
//         uniqueUsers.add(ticket.user_id);
        
//         const notification = await Notification.create({
//           user_id: ticket.user_id,
//           trip_id: ticket.trip_id,
//           title,
//           message,
//           type,
//           date: new Date(),
//           is_read: false,
//           sent_to_all: false
//         }, { transaction });
        
//         notifications.push(notification);
//       }
//     }

//     await transaction.commit();

//     res.json({
//       message: `تم إرسال الإشعار لـ ${notifications.length} مسافر في تاريخ ${date}`,
//       date: date,
//       trip_count: trips.length,
//       notification_count: notifications.length
//     });

//   } catch (err) {
//     await transaction.rollback();
//     console.error("Error in sendToDatePassengers:", err);
//     res.status(500).json({ 
//       message: "خطأ في إرسال الإشعار", 
//       error: err.message 
//     });
//   }
// };

// // ✅ جلب إشعارات المستخدم
// exports.getUserNotifications = async (req, res) => {
//   try {
//     const user_id = req.user.id;

//     const notifications = await Notification.findAll({
//       where: { 
//         [Op.or]: [
//           { user_id },
//           { sent_to_all: true }
//         ]
//       },
//       include: [
//         {
//           model: Trip,
//           attributes: ['id', 'start_time'],
//           include: [{
//             model: Line,
//             attributes: ['line_name']
//           }]
//         }
//       ],
//       order: [['created_at', 'DESC']]
//     });

//     res.json({
//       message: "تم جلب الإشعارات بنجاح",
//       notifications: notifications,
//       count: notifications.length,
//       unread_count: notifications.filter(n => !n.is_read).length
//     });

//   } catch (err) {
//     console.error("Error in getUserNotifications:", err);
//     res.status(500).json({ 
//       message: "خطأ في جلب الإشعارات", 
//       error: err.message 
//     });
//   }
// };

// // ✅ تحديث حالة الإشعار كمقروء
// exports.markAsRead = async (req, res) => {
//   try {
//     const { notification_id } = req.params;
//     const user_id = req.user.id;

//     const notification = await Notification.findOne({
//       where: { 
//         id: notification_id,
//         [Op.or]: [
//           { user_id },
//           { sent_to_all: true }
//         ]
//       }
//     });

//     if (!notification) {
//       return res.status(404).json({ message: "الإشعار غير موجود" });
//     }

//     await notification.update({
//       is_read: true
//     });

//     res.json({
//       message: "تم تحديث حالة الإشعار كمقروء",
//       notification: {
//         id: notification.id,
//         title: notification.title,
//         is_read: notification.is_read
//       }
//     });

//   } catch (err) {
//     console.error("Error in markAsRead:", err);
//     res.status(500).json({ 
//       message: "خطأ في تحديث الإشعار", 
//       error: err.message 
//     });
//   }
// };

// // ✅ جلب إحصائيات الإشعارات (للمشرفين)
// exports.getNotificationStats = async (req, res) => {
//   try {
//     const totalNotifications = await Notification.count();
//     const unreadNotifications = await Notification.count({
//       where: { is_read: false }
//     });
//     const todayNotifications = await Notification.count({
//       where: {
//         created_at: {
//           [Op.gte]: new Date().setHours(0, 0, 0, 0)
//         }
//       }
//     });

//     res.json({
//       message: "تم جلب إحصائيات الإشعارات بنجاح",
//       stats: {
//         total_notifications: totalNotifications,
//         unread_notifications: unreadNotifications,
//         today_notifications: todayNotifications
//       }
//     });

//   } catch (err) {
//     console.error("Error in getNotificationStats:", err);
//     res.status(500).json({ 
//       message: "خطأ في جلب الإحصائيات", 
//       error: err.message 
//     });
//   }
// };





const { Notification, User, Ticket, Trip, Line, Station, sequelize } = require("../models");
const { Op } = require("sequelize");

// ✅ إنشاء معرف فريد لكل مجموعة إشعارات
const generateNotificationGroup = (userId, tripId, type) => {
  return `${userId}_${tripId}_${type}_${new Date().toISOString().split('T')[0]}`;
};

// ✅ التحقق من وجود إشعار مكرر
const checkDuplicateNotification = async (userId, tripId, title, type) => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  
  const existing = await Notification.findOne({
    where: {
      user_id: userId,
      trip_id: tripId || null,
      title: title,
      type: type,
      created_at: {
        [Op.gte]: fiveMinutesAgo
      }
    }
  });
  
  return !!existing;
};

// ✅ إرسال إشعار لمسافري رحلة محددة (بدون تكرار)
exports.sendToTripPassengers = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { trip_id, title, message, type = "trip_update" } = req.body;

    if (!trip_id || !title || !message) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: "يرجى إدخال معرف الرحلة والعنوان والرسالة" 
      });
    }

    // التحقق من وجود الرحلة
    const trip = await Trip.findByPk(trip_id, { transaction });
    if (!trip) {
      await transaction.rollback();
      return res.status(404).json({ message: "الرحلة غير موجودة" });
    }

    // جلب جميع التذاكر في الرحلة
    const tickets = await Ticket.findAll({
      where: { 
        trip_id,
        status: { [Op.in]: ['pending', 'confirmed'] }
      },
      attributes: ['id', 'user_id'],
      transaction
    });

    if (tickets.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: "لا يوجد تذاكر في هذه الرحلة" });
    }

    // تجميع المستخدمين الفريدين (تجنب التكرار)
    const userTicketMap = new Map();
    tickets.forEach(ticket => {
      if (!userTicketMap.has(ticket.user_id)) {
        userTicketMap.set(ticket.user_id, ticket.id);
      }
    });

    // إرسال إشعار واحد لكل مستخدم
    const notifications = [];
    for (const [userId, ticketId] of userTicketMap) {
      // التحقق من عدم تكرار الإشعار
      const isDuplicate = await checkDuplicateNotification(userId, trip_id, title, type);
      
      if (!isDuplicate) {
        const notificationGroup = generateNotificationGroup(userId, trip_id, type);
        
        const notification = await Notification.create({
          user_id: userId,
          trip_id,
          ticket_id: ticketId,
          title,
          message,
          type,
          user_type: 1, // مسافرين فقط
          is_read: false,
          is_broadcast: false,
          notification_group: notificationGroup
        }, { transaction });
        
        notifications.push(notification);
      }
    }

    if (notifications.length === 0) {
      await transaction.rollback();
      return res.status(200).json({ 
        message: "تم إرسال هذا الإشعار مسبقاً لجميع المسافرين" 
      });
    }

    await transaction.commit();

    res.json({
      message: `تم إرسال الإشعار لـ ${notifications.length} مسافر`,
      trip_id,
      notification_count: notifications.length,
      sent_to_users: notifications.map(n => n.user_id)
    });

  } catch (err) {
    await transaction.rollback();
    console.error("Error in sendToTripPassengers:", err);
    res.status(500).json({ 
      message: "خطأ في إرسال الإشعار", 
      error: err.message 
    });
  }
};

// ✅ إرسال إشعار عام (لكل المستخدمين مرة واحدة)
exports.sendToAllUsers = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { title, message, type = "general", target_user_types } = req.body;

    if (!title || !message) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: "يرجى إدخال العنوان والرسالة" 
      });
    }

    // تحديد أنواع المستخدمين المستهدفين
    const userTypes = target_user_types || [1, 2, 3, 4, 5]; // كل الأنواع إذا لم يتم تحديد

    // جلب جميع المستخدمين حسب الأنواع المحددة
    const users = await User.findAll({
      where: { 
        userType: { [Op.in]: userTypes }
      },
      attributes: ['id', 'userType'],
      transaction
    });

    if (users.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: "لا يوجد مستخدمين بهذه الأنواع" });
    }

    // إنشاء إشعار عام (بدون user_id)
    const broadcastNotification = await Notification.create({
      user_id: null, // null يعني إشعار عام
      title,
      message,
      type,
      user_type: null, // جميع الأنواع
      is_read: false,
      is_broadcast: true,
      notification_group: `broadcast_${Date.now()}`
    }, { transaction });

    await transaction.commit();

    res.json({
      message: `تم إرسال الإشعار العام لـ ${users.length} مستخدم`,
      target_user_types: userTypes,
      notification_id: broadcastNotification.id,
      is_broadcast: true
    });

  } catch (err) {
    await transaction.rollback();
    console.error("Error in sendToAllUsers:", err);
    res.status(500).json({ 
      message: "خطأ في إرسال الإشعار", 
      error: err.message 
    });
  }
};

// ✅ إرسال إشعار لنوع محدد من المستخدمين
exports.sendToUserType = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { user_type, title, message, type = "system" } = req.body;

    if (!user_type || !title || !message) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: "يرجى إدخال نوع المستخدم والعنوان والرسالة" 
      });
    }

    // جلب جميع المستخدمين من النوع المحدد
    const users = await User.findAll({
      where: { 
        userType: user_type
      },
      attributes: ['id'],
      transaction
    });

    if (users.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ 
        message: `لا يوجد مستخدمين من النوع ${user_type}` 
      });
    }

    // إرسال إشعار لكل مستخدم
    const notifications = [];
    for (const user of users) {
      const notificationGroup = `usertype_${user_type}_${Date.now()}`;
      
      const notification = await Notification.create({
        user_id: user.id,
        title,
        message,
        type,
        user_type: user_type,
        is_read: false,
        is_broadcast: false,
        notification_group: notificationGroup
      }, { transaction });
      
      notifications.push(notification);
    }

    await transaction.commit();

    res.json({
      message: `تم إرسال الإشعار لـ ${notifications.length} مستخدم من النوع ${user_type}`,
      user_type,
      notification_count: notifications.length
    });

  } catch (err) {
    await transaction.rollback();
    console.error("Error in sendToUserType:", err);
    res.status(500).json({ 
      message: "خطأ في إرسال الإشعار", 
      error: err.message 
    });
  }
};

// ✅ جلب إشعارات المستخدم الحالي (معدلة بدون sender)
exports.getUserNotifications = async (req, res) => {
  try {
    const user_id = req.user.id;
    const user_type = req.user.userType;
    const { limit = 50, offset = 0 } = req.query;

    // بناء query لجلب الإشعارات
    const whereCondition = {
      [Op.or]: [
        // إشعارات خاصة بالمستخدم
        { user_id },
        // إشعارات عامة (broadcast)
        { 
          [Op.and]: [
            { user_id: null },
            { is_broadcast: true },
            {
              [Op.or]: [
                { user_type: null }, // لكل الأنواع
                { user_type: user_type } // لنوع المستخدم الحالي
              ]
            }
          ]
        }
      ]
    };

    const notifications = await Notification.findAll({
      where: whereCondition,
      include: [
        {
          model: Trip,
          attributes: ['id', 'start_time'],
          include: [{
            model: Line,
            attributes: ['line_name']
          }]
        }
        // ❌ تم حذف include User لأن ماعندنا sender relation
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // حساب الإشعارات غير المقروءة
    const unreadCount = await Notification.count({
      where: {
        ...whereCondition,
        is_read: false
      }
    });

    res.json({
      message: "تم جلب الإشعارات بنجاح",
      notifications: notifications,
      count: notifications.length,
      unread_count: unreadCount,
      user_type: user_type
    });

  } catch (err) {
    console.error("Error in getUserNotifications:", err);
    res.status(500).json({ 
      message: "خطأ في جلب الإشعارات", 
      error: err.message 
    });
  }
};

// ✅ جلب إشعارات السائق (معدلة بدون sender)
exports.getDriverNotifications = async (req, res) => {
  try {
    const driver_id = req.user.id;
    
    // جلب إشعارات السائق (النوع 5) بالإضافة للإشعارات العامة
    const notifications = await Notification.findAll({
      where: {
        [Op.or]: [
          { user_id: driver_id },
          { 
            [Op.and]: [
              { user_type: 5 }, // إشعارات خاصة بالسائقين
              { is_broadcast: true }
            ]
          }
        ]
      },
      include: [
        {
          model: Trip,
          attributes: ['id', 'start_time', 'line_id'],
          include: [
            {
              model: Line,
              attributes: ['line_name']
            },
            {
              model: User,
              as: 'driver',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      message: "تم جلب إشعارات السائق بنجاح",
      notifications: notifications,
      driver_id: driver_id,
      count: notifications.length
    });

  } catch (err) {
    console.error("Error in getDriverNotifications:", err);
    res.status(500).json({ 
      message: "خطأ في جلب إشعارات السائق", 
      error: err.message 
    });
  }
};

// ✅ جلب إشعارات الفني (معدلة بدون sender)
exports.getTechnicianNotifications = async (req, res) => {
  try {
    const technician_id = req.user.id;
    const station_id = req.user.station_id;
    
    // جلب إشعارات خاصة بالفني
    const notifications = await Notification.findAll({
      where: {
        [Op.or]: [
          { user_id: technician_id },
          { 
            [Op.and]: [
              { user_type: 4 }, // إشعارات خاصة بالفنيين
              { is_broadcast: true }
            ]
          }
        ]
      },
      include: [
        {
          model: Station,
          attributes: ['id', 'station_name'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      message: "تم جلب إشعارات الفني بنجاح",
      notifications: notifications,
      technician_id: technician_id,
      station_id: station_id,
      count: notifications.length
    });

  } catch (err) {
    console.error("Error in getTechnicianNotifications:", err);
    res.status(500).json({ 
      message: "خطأ في جلب إشعارات الفني", 
      error: err.message 
    });
  }
};

// ✅ تحديث حالة الإشعار كمقروء
exports.markAsRead = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { notification_id } = req.params;
    const user_id = req.user.id;

    const notification = await Notification.findOne({
      where: { 
        id: notification_id,
        [Op.or]: [
          { user_id: user_id },
          { is_broadcast: true }
        ]
      },
      transaction
    });

    if (!notification) {
      await transaction.rollback();
      return res.status(404).json({ message: "الإشعار غير موجود أو ليس لديك صلاحية للوصول إليه" });
    }

    await notification.update({
      is_read: true
    }, { transaction });

    await transaction.commit();

    res.json({
      message: "تم تحديث حالة الإشعار كمقروء",
      notification: {
        id: notification.id,
        title: notification.title,
        is_read: true
      }
    });

  } catch (err) {
    await transaction.rollback();
    console.error("Error in markAsRead:", err);
    res.status(500).json({ 
      message: "خطأ في تحديث الإشعار", 
      error: err.message 
    });
  }
};

// ✅ تحديث كل الإشعارات كمقروءة
exports.markAllAsRead = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const user_id = req.user.id;

    const updatedCount = await Notification.update({
      is_read: true
    }, {
      where: { 
        user_id: user_id,
        is_read: false
      },
      transaction
    });

    await transaction.commit();

    res.json({
      message: "تم تحديث كل الإشعارات كمقروءة",
      updated_count: updatedCount[0]
    });

  } catch (err) {
    await transaction.rollback();
    console.error("Error in markAllAsRead:", err);
    res.status(500).json({ 
      message: "خطأ في تحديث الإشعارات", 
      error: err.message 
    });
  }
};

// ✅ حذف إشعار
exports.deleteNotification = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { notification_id } = req.params;
    const user_id = req.user.id;

    const notification = await Notification.findOne({
      where: { 
        id: notification_id,
        user_id: user_id // يمكن حذف الإشعارات الخاصة بالمستخدم فقط
      },
      transaction
    });

    if (!notification) {
      await transaction.rollback();
      return res.status(404).json({ message: "الإشعار غير موجود" });
    }

    await notification.destroy({ transaction });
    await transaction.commit();

    res.json({
      message: "تم حذف الإشعار بنجاح",
      deleted_id: notification_id
    });

  } catch (err) {
    await transaction.rollback();
    console.error("Error in deleteNotification:", err);
    res.status(500).json({ 
      message: "خطأ في حذف الإشعار", 
      error: err.message 
    });
  }
};