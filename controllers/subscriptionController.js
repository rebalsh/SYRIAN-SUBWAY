const { Ticket, Trip, Line, Station, User, Train, LineStation, sequelize } = require("../models");
const { Op } = require("sequelize");
const QRCode = require('qrcode');

// ✅ حجز بطاقة اشتراك أسبوعية/شهرية
exports.bookSubscription = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const user_id = req.user.id;
    const { 
      subscription_type,  // 'weekly' أو 'monthly'
      line_id, 
      from_station_id, 
      to_station_id, 
      preferred_time,    // "08:00" 
      start_date,
      quantity = 1
    } = req.body;

    // التحقق من البيانات
    if (!subscription_type || !line_id || !from_station_id || !to_station_id || !preferred_time || !start_date) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: "جميع الحقول مطلوبة: subscription_type, line_id, from_station_id, to_station_id, preferred_time, start_date" 
      });
    }

    if (!['weekly', 'monthly'].includes(subscription_type)) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: "نوع الاشتراك غير صحيح. القيم المسموحة: weekly, monthly" 
      });
    }

    // حساب عدد الأيام
    const subscriptionDays = subscription_type === 'weekly' ? 7 : 30;
    
    // حساب تاريخ النهاية
    const startDate = new Date(start_date);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + subscriptionDays);
    
    // جلب الخط والسعر
    const line = await Line.findByPk(line_id, { transaction });
    if (!line) {
      await transaction.rollback();
      return res.status(404).json({ message: "الخط غير موجود" });
    }
    
    // فحص المحطات
    const fromStation = await Station.findByPk(from_station_id, { transaction });
    const toStation = await Station.findByPk(to_station_id, { transaction });
    
    if (!fromStation || !toStation) {
      await transaction.rollback();
      return res.status(404).json({ message: "إحدى المحطات غير موجودة" });
    }
    
    // فحص إذا كانت المحطات موجودة في هذا الخط
    const fromLineStation = await LineStation.findOne({
      where: {
        line_id,
        station_id: from_station_id
      },
      transaction
    });
    
    const toLineStation = await LineStation.findOne({
      where: {
        line_id,
        station_id: to_station_id
      },
      transaction
    });
    
    if (!fromLineStation || !toLineStation) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: `إحدى المحطات غير موجودة في الخط المحدد` 
      });
    }
    
    // حساب السعر مع الخصم
    const basePrice = parseFloat(line.price);
    const discountPercentage = subscription_type === 'weekly' ? 20 : 30;
    const dailyPrice = basePrice * quantity * (1 - discountPercentage/100);
    const totalPrice = dailyPrice * subscriptionDays;
    
    // تجهيز الوقت المفضل
    const [hours, minutes] = preferred_time.split(':').map(Number);
    
    // 🔴 🔴 🔴 الفحص المهم: تحقق من الرحلات قبل الحجز
    const missingTrips = [];
    const availableTrips = [];
    
    for (let day = 0; day < subscriptionDays; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);
      
      // ضبط الوقت المفضل
      const tripStartTime = new Date(currentDate);
      tripStartTime.setHours(hours, minutes || 0, 0, 0);
      
      const tripEndTime = new Date(tripStartTime);
      tripEndTime.setHours(tripStartTime.getHours() + 2);
      
      // البحث عن رحلة مناسبة
      const suitableTrip = await Trip.findOne({
        where: {
          line_id,
          start_time: {
            [Op.between]: [tripStartTime, tripEndTime]
          },
          status: 'on'
        },
        transaction
      });
      
      if (suitableTrip) {
        availableTrips.push({
          date: currentDate.toISOString().split('T')[0],
          trip_id: suitableTrip.id,
          start_time: suitableTrip.start_time
        });
      } else {
        missingTrips.push(currentDate.toISOString().split('T')[0]);
      }
    }
    
    // 🔴 إذا في أيام بدون رحلات، نوقف العملية
    if (missingTrips.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        message: "لا توجد رحلات في الأيام التالية:",
        missing_days: missingTrips,
        available_days: availableTrips.length,
        total_days: subscriptionDays,
        suggestion: "يرجى اختيار وقت آخر أو تاريخ مختلف"
      });
    }
    
    // إنشاء تذكرة رئيسية
    const parentTicketNumber = `SUB-${subscription_type.toUpperCase()}-${Date.now()}`;
    
    const parentTicket = await Ticket.create({
      user_id,
      line_id,
      from_station_id,
      to_station_id,
      purchase_date: new Date(),
      price: basePrice,
      quantity,
      total_price: totalPrice,
      original_price: basePrice * quantity * subscriptionDays,
      status: "pending",
      ticket_number: parentTicketNumber,
      discount_type: subscription_type,
      discount_percentage: discountPercentage,
      subscription_type: subscription_type,
      subscription_start_date: startDate,
      subscription_end_date: endDate,
      subscription_days: subscriptionDays,
      parent_ticket_id: null
    }, { transaction });
    
    // جلب الرحلات المناسبة لكل يوم
    const createdTickets = [];
    
    for (let day = 0; day < availableTrips.length; day++) {
      const currentTrip = availableTrips[day];
      
      // إنشاء تذكرة لكل يوم
      const dailyTicketNumber = `${parentTicketNumber}-DAY${day + 1}`;
      
      const dailyTicket = await Ticket.create({
        user_id,
        trip_id: currentTrip.trip_id,
        line_id,
        from_station_id,
        to_station_id,
        purchase_date: new Date(),
        price: dailyPrice / subscriptionDays,
        quantity,
        total_price: dailyPrice / subscriptionDays,
        original_price: basePrice * quantity,
        status: "pending",
        ticket_number: dailyTicketNumber,
        discount_type: subscription_type,
        discount_percentage: discountPercentage,
        subscription_type: subscription_type,
        parent_ticket_id: parentTicket.id
      }, { transaction });
      
      createdTickets.push({
        id: dailyTicket.id,
        ticket_number: dailyTicket.ticket_number,
        trip_date: currentTrip.date,
        trip_time: preferred_time,
        status: dailyTicket.status,
        trip_id: currentTrip.trip_id
      });
    }
    
    await transaction.commit();
    
    res.status(201).json({
      message: `تم إنشاء ${createdTrips.length} تذكرة اشتراك ${subscription_type === 'weekly' ? 'أسبوعية' : 'شهرية'} بنجاح`,
      subscription: {
        parent_ticket_id: parentTicket.id,
        parent_ticket_number: parentTicket.ticket_number,
        subscription_type: parentTicket.subscription_type,
        subscription_days: parentTicket.subscription_days,
        start_date: parentTicket.subscription_start_date,
        end_date: parentTicket.subscription_end_date,
        total_price: parentTicket.total_price,
        discount_percentage: parentTicket.discount_percentage,
        original_price: parentTicket.original_price,
        saved_amount: parentTicket.original_price - parentTicket.total_price
      },
      trips_info: {
        total_days: subscriptionDays,
        available_days: availableTrips.length
      },
      tickets: createdTickets,
      count: createdTickets.length
    });
    
  } catch (err) {
    await transaction.rollback();
    console.error("Error in bookSubscription:", err);
    res.status(500).json({ 
      message: "خطأ في حجز الاشتراك", 
      error: err.message 
    });
  }
};

// ✅ تأكيد دفع الاشتراك
exports.confirmSubscription = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { parent_ticket_id, payment_reference } = req.body;
    
    // جلب التذكرة الرئيسية
    const parentTicket = await Ticket.findByPk(parent_ticket_id, { transaction });
    
    if (!parentTicket) {
      await transaction.rollback();
      return res.status(404).json({ message: "بطاقة الاشتراك غير موجودة" });
    }
    
    if (parentTicket.status !== "pending") {
      await transaction.rollback();
      return res.status(400).json({ 
        message: "بطاقة الاشتراك ليست في حالة انتظار الدفع" 
      });
    }
    
    // جلب جميع التذاكر اليومية المرتبطة
    const dailyTickets = await Ticket.findAll({
      where: { 
        parent_ticket_id: parentTicket.id 
      },
      transaction
    });
    
    // إنشاء QR Code فريد لكل تذكرة يومية
    for (const ticket of dailyTickets) {
      const qrData = JSON.stringify({
        ticket_id: ticket.id,
        ticket_number: ticket.ticket_number,
        user_id: ticket.user_id,
        trip_id: ticket.trip_id,
        subscription_type: ticket.subscription_type,
        trip_date: ticket.Trip?.start_time
      });
      
      const qrCode = await QRCode.toDataURL(qrData);
      
      await ticket.update({
        status: "confirmed",
        qr_code: qrCode
      }, { transaction });
    }
    
    // تحديث التذكرة الرئيسية
    await parentTicket.update({
      status: "confirmed"
    }, { transaction });
    
    await transaction.commit();
    
    res.json({
      message: "تم تأكيد دفع الاشتراك بنجاح",
      subscription: {
        id: parentTicket.id,
        ticket_number: parentTicket.ticket_number,
        subscription_type: parentTicket.subscription_type,
        total_price: parentTicket.total_price,
        status: parentTicket.status
      },
      daily_tickets_count: dailyTickets.length
    });
    
  } catch (err) {
    await transaction.rollback();
    console.error("Error in confirmSubscription:", err);
    res.status(500).json({ 
      message: "خطأ في تأكيد الاشتراك", 
      error: err.message 
    });
  }
};

// ✅ جلب اشتراكات المستخدم
exports.getUserSubscriptions = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { subscription_type } = req.query;
    
    let whereClause = { 
      user_id,
      parent_ticket_id: null,
      subscription_type: { [Op.ne]: 'none' }
    };
    
    if (subscription_type && ['weekly', 'monthly'].includes(subscription_type)) {
      whereClause.subscription_type = subscription_type;
    }
    
    const subscriptions = await Ticket.findAll({
      where: whereClause,
      include: [
        {
          model: Line,
          attributes: ['line_name']
        },
        {
          model: Station,
          as: "from_station",
          attributes: ['name']
        },
        {
          model: Station,
          as: "to_station",
          attributes: ['name']
        }
      ],
      order: [['purchase_date', 'DESC']]
    });
    
    // جلب التذاكر اليومية لكل اشتراك
    const subscriptionsWithDetails = await Promise.all(
      subscriptions.map(async (subscription) => {
        const dailyTickets = await Ticket.findAll({
          where: { parent_ticket_id: subscription.id },
          include: [
            {
              model: Trip,
              include: [
                { model: Train, attributes: ['version_number'] }
              ]
            }
          ],
          order: [['id', 'ASC']]
        });
        
        return {
          ...subscription.toJSON(),
          daily_tickets: dailyTickets.map(t => ({
            id: t.id,
            ticket_number: t.ticket_number,
            trip_date: t.Trip?.start_time,
            status: t.status,
            train_number: t.Trip?.Train?.version_number
          })),
          daily_tickets_count: dailyTickets.length
        };
      })
    );
    
    res.json({
      message: "تم جلب الاشتراكات بنجاح",
      subscriptions: subscriptionsWithDetails,
      count: subscriptions.length
    });
    
  } catch (err) {
    console.error("Error in getUserSubscriptions:", err);
    res.status(500).json({ 
      message: "خطأ في جلب الاشتراكات", 
      error: err.message 
    });
  }
};