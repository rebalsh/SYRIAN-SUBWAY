// controllers/notificationController.js
const { Notification, User, Ticket, Trip, Line, Station, sequelize } = require("../models");
const { Op } = require("sequelize");

// ✅ إرسال إشعار لمسافري رحلة محددة
exports.sendToTripPassengers = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { trip_id, title, message, type = "trip_update" } = req.body;
    const sender_id = req.user.id;

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

    // جلب جميع المسافرين في الرحلة
    const passengers = await Ticket.findAll({
      where: { 
        trip_id,
        status: { [Op.in]: ['pending', 'confirmed'] }
      },
      include: [{
        model: User,
        attributes: ['id']
      }],
      transaction
    });

    if (passengers.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: "لا يوجد مسافرين في هذه الرحلة" });
    }

    // إرسال إشعار لكل مسافر
    const notifications = [];
    for (const passenger of passengers) {
      const notification = await Notification.create({
        user_id: passenger.user_id,
        trip_id,
        title,
        message,
        type,
        date: new Date(),
        is_read: false,
        sent_to_all: false
      }, { transaction });
      
      notifications.push(notification);
    }

    await transaction.commit();

    res.json({
      message: `تم إرسال الإشعار لـ ${notifications.length} مسافر`,
      trip: {
        id: trip.id,
        start_time: trip.start_time,
        line_id: trip.line_id
      },
      notification_count: notifications.length
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

// ✅ إرسال إشعار لجميع المسافرين
exports.sendToAllPassengers = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { title, message, type = "general" } = req.body;
    const sender_id = req.user.id;

    if (!title || !message) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: "يرجى إدخال العنوان والرسالة" 
      });
    }

    // جلب جميع المسافرين (المستخدمين من النوع 1)
    const passengers = await User.findAll({
      where: { userType: 1 },
      attributes: ['id'],
      transaction
    });

    if (passengers.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: "لا يوجد مسافرين في النظام" });
    }

    // إرسال إشعار لكل مسافر
    const notifications = [];
    for (const passenger of passengers) {
      const notification = await Notification.create({
        user_id: passenger.id,
        title,
        message,
        type,
        date: new Date(),
        is_read: false,
        sent_to_all: true
      }, { transaction });
      
      notifications.push(notification);
    }

    await transaction.commit();

    res.json({
      message: `تم إرسال الإشعار لجميع المسافرين (${notifications.length})`,
      notification_count: notifications.length
    });

  } catch (err) {
    await transaction.rollback();
    console.error("Error in sendToAllPassengers:", err);
    res.status(500).json({ 
      message: "خطأ في إرسال الإشعار", 
      error: err.message 
    });
  }
};

// ✅ إرسال إشعار لمسافري رحلات يوم محدد
exports.sendToDatePassengers = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { date, title, message, type = "trip_update" } = req.body;
    const sender_id = req.user.id;

    if (!date || !title || !message) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: "يرجى إدخال التاريخ والعنوان والرسالة" 
      });
    }

    // تحويل التاريخ إلى نطاق زمني
    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

    // جلب الرحلات في اليوم المحدد
    const trips = await Trip.findAll({
      where: {
        start_time: {
          [Op.between]: [startOfDay, endOfDay]
        }
      },
      attributes: ['id'],
      transaction
    });

    if (trips.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: "لا توجد رحلات في هذا التاريخ" });
    }

    const tripIds = trips.map(trip => trip.id);

    // جلب التذاكر للرحلات في هذا التاريخ
    const tickets = await Ticket.findAll({
      where: { 
        trip_id: { [Op.in]: tripIds },
        status: { [Op.in]: ['pending', 'confirmed'] }
      },
      include: [{
        model: User,
        attributes: ['id']
      }],
      transaction
    });

    if (tickets.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: "لا يوجد مسافرين في رحلات هذا التاريخ" });
    }

    // تجنب الإشعارات المكررة لنفس المستخدم
    const uniqueUsers = new Set();
    const notifications = [];

    for (const ticket of tickets) {
      if (!uniqueUsers.has(ticket.user_id)) {
        uniqueUsers.add(ticket.user_id);
        
        const notification = await Notification.create({
          user_id: ticket.user_id,
          trip_id: ticket.trip_id,
          title,
          message,
          type,
          date: new Date(),
          is_read: false,
          sent_to_all: false
        }, { transaction });
        
        notifications.push(notification);
      }
    }

    await transaction.commit();

    res.json({
      message: `تم إرسال الإشعار لـ ${notifications.length} مسافر في تاريخ ${date}`,
      date: date,
      trip_count: trips.length,
      notification_count: notifications.length
    });

  } catch (err) {
    await transaction.rollback();
    console.error("Error in sendToDatePassengers:", err);
    res.status(500).json({ 
      message: "خطأ في إرسال الإشعار", 
      error: err.message 
    });
  }
};

// ✅ جلب إشعارات المستخدم
exports.getUserNotifications = async (req, res) => {
  try {
    const user_id = req.user.id;

    const notifications = await Notification.findAll({
      where: { 
        [Op.or]: [
          { user_id },
          { sent_to_all: true }
        ]
      },
      include: [
        {
          model: Trip,
          attributes: ['id', 'start_time'],
          include: [{
            model: Line,
            attributes: ['line_name']
          }]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      message: "تم جلب الإشعارات بنجاح",
      notifications: notifications,
      count: notifications.length,
      unread_count: notifications.filter(n => !n.is_read).length
    });

  } catch (err) {
    console.error("Error in getUserNotifications:", err);
    res.status(500).json({ 
      message: "خطأ في جلب الإشعارات", 
      error: err.message 
    });
  }
};

// ✅ تحديث حالة الإشعار كمقروء
exports.markAsRead = async (req, res) => {
  try {
    const { notification_id } = req.params;
    const user_id = req.user.id;

    const notification = await Notification.findOne({
      where: { 
        id: notification_id,
        [Op.or]: [
          { user_id },
          { sent_to_all: true }
        ]
      }
    });

    if (!notification) {
      return res.status(404).json({ message: "الإشعار غير موجود" });
    }

    await notification.update({
      is_read: true
    });

    res.json({
      message: "تم تحديث حالة الإشعار كمقروء",
      notification: {
        id: notification.id,
        title: notification.title,
        is_read: notification.is_read
      }
    });

  } catch (err) {
    console.error("Error in markAsRead:", err);
    res.status(500).json({ 
      message: "خطأ في تحديث الإشعار", 
      error: err.message 
    });
  }
};

// ✅ جلب إحصائيات الإشعارات (للمشرفين)
exports.getNotificationStats = async (req, res) => {
  try {
    const totalNotifications = await Notification.count();
    const unreadNotifications = await Notification.count({
      where: { is_read: false }
    });
    const todayNotifications = await Notification.count({
      where: {
        created_at: {
          [Op.gte]: new Date().setHours(0, 0, 0, 0)
        }
      }
    });

    res.json({
      message: "تم جلب إحصائيات الإشعارات بنجاح",
      stats: {
        total_notifications: totalNotifications,
        unread_notifications: unreadNotifications,
        today_notifications: todayNotifications
      }
    });

  } catch (err) {
    console.error("Error in getNotificationStats:", err);
    res.status(500).json({ 
      message: "خطأ في جلب الإحصائيات", 
      error: err.message 
    });
  }
};