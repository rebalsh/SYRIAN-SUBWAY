// controllers/ticketController.js
const { Ticket, Trip, Line, Station, User, Train, LineStation, sequelize } = require("../models");
const { Op } = require("sequelize");
const QRCode = require('qrcode');

// ✅ جلب الخطوط المتاحة للمسافرين مع الأسعار
exports.getAvailableLines = async (req, res) => {
  try {
    const lines = await Line.findAll({
      attributes: ['id', 'line_name', 'price'],
      include: [{
        model: Station,
        through: { 
          attributes: ["station_order"] 
        },
        attributes: ["id", "name", "location"]
      }],
      order: [
        ['line_name', 'ASC']
      ]
    });

    res.json({
      message: "تم جلب الخطوط المتاحة بنجاح",
      lines: lines
    });

  } catch (err) {
    console.error("Error in getAvailableLines:", err);
    res.status(500).json({ 
      message: "خطأ في جلب الخطوط", 
      error: err.message 
    });
  }
};

// ✅ جلب الرحلات المتاحة لخط معين وتاريخ معين
exports.getAvailableTrips = async (req, res) => {
  try {
    const { line_id, date } = req.query;

    if (!line_id || !date) {
      return res.status(400).json({ 
        message: "يرجى إدخال معرف الخط والتاريخ" 
      });
    }

    // تحويل التاريخ فقط إلى نطاق زمني
    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

    // جلب الرحلات المتاحة للخط والتاريخ المطلوب
    const trips = await Trip.findAll({
      where: {
        line_id,
        start_time: {
          [Op.between]: [startOfDay, endOfDay]
        },
        status: "on"
      },
      include: [
        {
          model: Line,
          attributes: ['id', 'line_name', 'price']
        },
        {
          model: Train,
          attributes: ['id', 'version_number', 'capacity', 'status']
        },
        {
          model: User,
          as: "driver",
          attributes: ['id', 'username']
        }
      ],
      order: [['start_time', 'ASC']]
    });

    // حساب الأماكن المتاحة لكل رحلة
    const tripsWithAvailability = await Promise.all(
      trips.map(async (trip) => {
        // حساب عدد التذاكر المحجوزة لهذه الرحلة
        const bookedTickets = await Ticket.sum('quantity', {
          where: { 
            trip_id: trip.id,
            status: { [Op.in]: ['pending', 'confirmed'] }
          }
        });

        const availableSeats = trip.Train.capacity - (bookedTickets || 0);

        return {
          id: trip.id,
          start_time: trip.start_time,
          end_time: trip.end_time,
          passenger_count: trip.passenger_count,
          status: trip.status,
          available_seats: availableSeats,
          is_available: availableSeats > 0,
          Line: trip.Line,
          Train: trip.Train,
          driver: trip.driver
        };
      })
    );

    res.json({
      message: "تم جلب الرحلات المتاحة بنجاح",
      trips: tripsWithAvailability
    });

  } catch (err) {
    console.error("Error in getAvailableTrips:", err);
    res.status(500).json({ 
      message: "خطأ في جلب الرحلات", 
      error: err.message 
    });
  }
};

// ✅ حساب السعر بناءً على المحطات
exports.calculatePrice = async (req, res) => {
  try {
    const { line_id, from_station_id, to_station_id, quantity = 1 } = req.body;

    if (!line_id || !from_station_id || !to_station_id) {
      return res.status(400).json({ 
        message: "يرجى إدخال معرف الخط والمحطات" 
      });
    }

    // جلب الخط والسعر
    const line = await Line.findByPk(line_id, {
      include: [{
        model: Station,
        through: { attributes: ["station_order"] }
      }]
    });

    if (!line) {
      return res.status(404).json({ message: "الخط غير موجود" });
    }

    // التحقق من وجود المحطات في الخط
    const fromStation = await line.getStations({ where: { id: from_station_id } });
    const toStation = await line.getStations({ where: { id: to_station_id } });

    if (fromStation.length === 0 || toStation.length === 0) {
      return res.status(400).json({ 
        message: "إحدى المحطات غير موجودة في هذا الخط" 
      });
    }

    // حساب السعر
    const basePrice = parseFloat(line.price);
    const totalPrice = basePrice * parseInt(quantity);

    res.json({
      message: "تم حساب السعر بنجاح",
      price_details: {
        base_price: basePrice,
        quantity: parseInt(quantity),
        total_price: totalPrice,
        from_station: fromStation[0].name,
        to_station: toStation[0].name,
        line_name: line.line_name
      }
    });

  } catch (err) {
    console.error("Error in calculatePrice:", err);
    res.status(500).json({ 
      message: "خطأ في حساب السعر", 
      error: err.message 
    });
  }
};

// ✅ حجز التذاكر
exports.bookTickets = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const user_id = req.user.id;
    const { trip_id, line_id, from_station_id, to_station_id, quantity = 1 } = req.body;

    // التحقق من البيانات
    if (!trip_id || !line_id || !from_station_id || !to_station_id) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: "جميع الحقول مطلوبة: trip_id, line_id, from_station_id, to_station_id" 
      });
    }

    if (quantity < 1 || quantity > 10) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: "عدد التذاكر يجب أن يكون بين 1 و 10" 
      });
    }

    // التحقق من وجود الرحلة والخط
    const trip = await Trip.findByPk(trip_id, {
      include: [
        { model: Line },
        { model: Train }
      ],
      transaction
    });

    if (!trip) {
      await transaction.rollback();
      return res.status(404).json({ message: "الرحلة غير موجودة" });
    }

    // التحقق من توفر المقاعد
    const bookedTickets = await Ticket.sum('quantity', {
      where: { 
        trip_id,
        status: { [Op.in]: ['pending', 'confirmed'] }
      },
      transaction
    });

    const availableSeats = trip.Train.capacity - (bookedTickets || 0);

    if (availableSeats < quantity) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: `لا توجد مقاعد كافية. المقاعد المتاحة: ${availableSeats}` 
      });
    }

    // حساب السعر الإجمالي
    const basePrice = parseFloat(trip.Line.price);
    const totalPrice = basePrice * quantity;

    // إنشاء رقم تذكرة فريد
    const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // إنشاء التذكرة
    const ticket = await Ticket.create({
      user_id,
      trip_id,
      line_id,
      from_station_id,
      to_station_id,
      purchase_date: new Date(),
      price: basePrice,
      quantity,
      total_price: totalPrice,
      status: "pending",
      ticket_number: ticketNumber
    }, { transaction });

    await transaction.commit();

    res.status(201).json({
      message: "تم حجز التذاكر بنجاح. يرجى إكمال عملية الدفع",
      ticket: {
        id: ticket.id,
        ticket_number: ticket.ticket_number,
        quantity: ticket.quantity,
        total_price: ticket.total_price,
        status: ticket.status
      },
      payment_required: true
    });

  } catch (err) {
    await transaction.rollback();
    console.error("Error in bookTickets:", err);
    res.status(500).json({ 
      message: "خطأ في حجز التذاكر", 
      error: err.message 
    });
  }
};

// ✅ تأكيد الحجز بعد الدفع الناجح
exports.confirmBooking = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { ticket_id, payment_reference } = req.body;

    const ticket = await Ticket.findByPk(ticket_id, { transaction });
    
    if (!ticket) {
      await transaction.rollback();
      return res.status(404).json({ message: "التذكرة غير موجودة" });
    }

    if (ticket.status !== "pending") {
      await transaction.rollback();
      return res.status(400).json({ 
        message: "التذكرة ليست في حالة انتظار الدفع" 
      });
    }

    // إنشاء QR Code
    const qrData = JSON.stringify({
      ticket_id: ticket.id,
      ticket_number: ticket.ticket_number,
      user_id: ticket.user_id,
      trip_id: ticket.trip_id,
      from_station_id: ticket.from_station_id,
      to_station_id: ticket.to_station_id,
      quantity: ticket.quantity
    });

    const qrCode = await QRCode.toDataURL(qrData);

    // تحديث التذكرة
    await ticket.update({
      status: "confirmed",
      qr_code: qrCode
    }, { transaction });

    await transaction.commit();

    // جلب بيانات التذكرة المحدثة
    const confirmedTicket = await Ticket.findByPk(ticket_id, {
      include: [
        {
          model: Trip,
          include: [
            { model: Line },
            { model: Train },
            { 
              model: User, 
              as: "driver",
              attributes: ['username']
            }
          ]
        },
        {
          model: Station,
          as: "from_station",
          attributes: ['name', 'location']
        },
        {
          model: Station,
          as: "to_station", 
          attributes: ['name', 'location']
        }
      ]
    });

    res.json({
      message: "تم تأكيد الحجز بنجاح",
      ticket: confirmedTicket
    });

  } catch (err) {
    await transaction.rollback();
    console.error("Error in confirmBooking:", err);
    res.status(500).json({ 
      message: "خطأ في تأكيد الحجز", 
      error: err.message 
    });
  }
};

// ✅ جلب تذاكر المستخدم
exports.getUserTickets = async (req, res) => {
  try {
    const user_id = req.user.id;

    const tickets = await Ticket.findAll({
      where: { user_id },
      include: [
        {
          model: Trip,
          include: [
            { model: Line, attributes: ['line_name'] },
            { model: Train, attributes: ['version_number'] },
            { 
              model: User, 
              as: "driver",
              attributes: ['username']
            }
          ]
        },
        {
          model: Station,
          as: "from_station",
          attributes: ['name', 'location']
        },
        {
          model: Station,
          as: "to_station",
          attributes: ['name', 'location']
        }
      ],
      order: [['purchase_date', 'DESC']]
    });

    res.json({
      message: "تم جلب التذاكر بنجاح",
      tickets: tickets,
      count: tickets.length
    });

  } catch (err) {
    console.error("Error in getUserTickets:", err);
    res.status(500).json({ 
      message: "خطأ في جلب التذاكر", 
      error: err.message 
    });
  }
};

// ✅ إلغاء الحجز
exports.cancelBooking = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { ticket_id } = req.params;
    const user_id = req.user.id;

    const ticket = await Ticket.findOne({
      where: { 
        id: ticket_id,
        user_id 
      },
      transaction
    });

    if (!ticket) {
      await transaction.rollback();
      return res.status(404).json({ message: "التذكرة غير موجودة" });
    }

    if (ticket.status === "used") {
      await transaction.rollback();
      return res.status(400).json({ 
        message: "لا يمكن إلغاء تذكرة مستخدمة" 
      });
    }

    await ticket.update({
      status: "cancelled"
    }, { transaction });

    await transaction.commit();

    res.json({
      message: "تم إلغاء الحجز بنجاح",
      ticket: {
        id: ticket.id,
        ticket_number: ticket.ticket_number,
        status: ticket.status
      }
    });

  } catch (err) {
    await transaction.rollback();
    console.error("Error in cancelBooking:", err);
    res.status(500).json({ 
      message: "خطأ في إلغاء الحجز", 
      error: err.message 
    });
  }
};