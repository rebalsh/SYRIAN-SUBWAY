// // controllers/ticketController.js
// const { Ticket, Trip, Line, Station, User, Train, LineStation, sequelize } = require("../models");
// const { Op } = require("sequelize");
// const QRCode = require('qrcode');

// // ✅ جلب الخطوط المتاحة للمسافرين مع الأسعار
// exports.getAvailableLines = async (req, res) => {
//   try {
//     const lines = await Line.findAll({
//       attributes: ['id', 'line_name', 'price'],
//       include: [{
//         model: Station,
//         through: { 
//           attributes: ["station_order"] 
//         },
//         attributes: ["id", "name", "location"]
//       }],
//       order: [
//         ['line_name', 'ASC']
//       ]
//     });

//     res.json({
//       message: "تم جلب الخطوط المتاحة بنجاح",
//       lines: lines
//     });

//   } catch (err) {
//     console.error("Error in getAvailableLines:", err);
//     res.status(500).json({ 
//       message: "خطأ في جلب الخطوط", 
//       error: err.message 
//     });
//   }
// };

// // ✅ جلب الرحلات المتاحة لخط معين وتاريخ معين
// exports.getAvailableTrips = async (req, res) => {
//   try {
//     const { line_id, date } = req.query;

//     if (!line_id || !date) {
//       return res.status(400).json({ 
//         message: "يرجى إدخال معرف الخط والتاريخ" 
//       });
//     }

//     // تحويل التاريخ فقط إلى نطاق زمني
//     const selectedDate = new Date(date);
//     const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
//     const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

//     // جلب الرحلات المتاحة للخط والتاريخ المطلوب
//     const trips = await Trip.findAll({
//       where: {
//         line_id,
//         start_time: {
//           [Op.between]: [startOfDay, endOfDay]
//         },
//         status: "on"
//       },
//       include: [
//         {
//           model: Line,
//           attributes: ['id', 'line_name', 'price']
//         },
//         {
//           model: Train,
//           attributes: ['id', 'version_number', 'capacity', 'status']
//         },
//         {
//           model: User,
//           as: "driver",
//           attributes: ['id', 'username']
//         }
//       ],
//       order: [['start_time', 'ASC']]
//     });

//     // حساب الأماكن المتاحة لكل رحلة
//     const tripsWithAvailability = await Promise.all(
//       trips.map(async (trip) => {
//         // حساب عدد التذاكر المحجوزة لهذه الرحلة
//         const bookedTickets = await Ticket.sum('quantity', {
//           where: { 
//             trip_id: trip.id,
//             status: { [Op.in]: ['pending', 'confirmed'] }
//           }
//         });

//         const availableSeats = trip.Train.capacity - (bookedTickets || 0);

//         return {
//           id: trip.id,
//           start_time: trip.start_time,
//           end_time: trip.end_time,
//           passenger_count: trip.passenger_count,
//           status: trip.status,
//           available_seats: availableSeats,
//           is_available: availableSeats > 0,
//           Line: trip.Line,
//           Train: trip.Train,
//           driver: trip.driver
//         };
//       })
//     );

//     res.json({
//       message: "تم جلب الرحلات المتاحة بنجاح",
//       trips: tripsWithAvailability
//     });

//   } catch (err) {
//     console.error("Error in getAvailableTrips:", err);
//     res.status(500).json({ 
//       message: "خطأ في جلب الرحلات", 
//       error: err.message 
//     });
//   }
// };

// // ✅ حساب السعر بناءً على المحطات
// exports.calculatePrice = async (req, res) => {
//   try {
//     const { line_id, from_station_id, to_station_id, quantity = 1 } = req.body;

//     if (!line_id || !from_station_id || !to_station_id) {
//       return res.status(400).json({ 
//         message: "يرجى إدخال معرف الخط والمحطات" 
//       });
//     }

//     // جلب الخط والسعر
//     const line = await Line.findByPk(line_id, {
//       include: [{
//         model: Station,
//         through: { attributes: ["station_order"] }
//       }]
//     });

//     if (!line) {
//       return res.status(404).json({ message: "الخط غير موجود" });
//     }

//     // التحقق من وجود المحطات في الخط
//     const fromStation = await line.getStations({ where: { id: from_station_id } });
//     const toStation = await line.getStations({ where: { id: to_station_id } });

//     if (fromStation.length === 0 || toStation.length === 0) {
//       return res.status(400).json({ 
//         message: "إحدى المحطات غير موجودة في هذا الخط" 
//       });
//     }

//     // حساب السعر
//     const basePrice = parseFloat(line.price);
//     const totalPrice = basePrice * parseInt(quantity);

//     res.json({
//       message: "تم حساب السعر بنجاح",
//       price_details: {
//         base_price: basePrice,
//         quantity: parseInt(quantity),
//         total_price: totalPrice,
//         from_station: fromStation[0].name,
//         to_station: toStation[0].name,
//         line_name: line.line_name
//       }
//     });

//   } catch (err) {
//     console.error("Error in calculatePrice:", err);
//     res.status(500).json({ 
//       message: "خطأ في حساب السعر", 
//       error: err.message 
//     });
//   }
// };

// // ✅ حجز التذاكر
// exports.bookTickets = async (req, res) => {
//   const transaction = await sequelize.transaction();
  
//   try {
//     const user_id = req.user.id;
//     const { trip_id, line_id, from_station_id, to_station_id, quantity = 1 } = req.body;

//     // التحقق من البيانات
//     if (!trip_id || !line_id || !from_station_id || !to_station_id) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: "جميع الحقول مطلوبة: trip_id, line_id, from_station_id, to_station_id" 
//       });
//     }

//     if (quantity < 1 || quantity > 10) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: "عدد التذاكر يجب أن يكون بين 1 و 10" 
//       });
//     }

//     // التحقق من وجود الرحلة والخط
//     const trip = await Trip.findByPk(trip_id, {
//       include: [
//         { model: Line },
//         { model: Train }
//       ],
//       transaction
//     });

//     if (!trip) {
//       await transaction.rollback();
//       return res.status(404).json({ message: "الرحلة غير موجودة" });
//     }

//     // التحقق من توفر المقاعد
//     const bookedTickets = await Ticket.sum('quantity', {
//       where: { 
//         trip_id,
//         status: { [Op.in]: ['pending', 'confirmed'] }
//       },
//       transaction
//     });

//     const availableSeats = trip.Train.capacity - (bookedTickets || 0);

//     if (availableSeats < quantity) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: `لا توجد مقاعد كافية. المقاعد المتاحة: ${availableSeats}` 
//       });
//     }

//     // حساب السعر الإجمالي
//     const basePrice = parseFloat(trip.Line.price);
//     const totalPrice = basePrice * quantity;

//     // إنشاء رقم تذكرة فريد
//     const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

//     // إنشاء التذكرة
//     const ticket = await Ticket.create({
//       user_id,
//       trip_id,
//       line_id,
//       from_station_id,
//       to_station_id,
//       purchase_date: new Date(),
//       price: basePrice,
//       quantity,
//       total_price: totalPrice,
//       status: "pending",
//       ticket_number: ticketNumber
//     }, { transaction });

//     await transaction.commit();

//     res.status(201).json({
//       message: "تم حجز التذاكر بنجاح. يرجى إكمال عملية الدفع",
//       ticket: {
//         id: ticket.id,
//         ticket_number: ticket.ticket_number,
//         quantity: ticket.quantity,
//         total_price: ticket.total_price,
//         status: ticket.status
//       },
//       payment_required: true
//     });

//   } catch (err) {
//     await transaction.rollback();
//     console.error("Error in bookTickets:", err);
//     res.status(500).json({ 
//       message: "خطأ في حجز التذاكر", 
//       error: err.message 
//     });
//   }
// };

// // ✅ تأكيد الحجز بعد الدفع الناجح
// exports.confirmBooking = async (req, res) => {
//   const transaction = await sequelize.transaction();
  
//   try {
//     const { ticket_id, payment_reference } = req.body;

//     const ticket = await Ticket.findByPk(ticket_id, { transaction });
    
//     if (!ticket) {
//       await transaction.rollback();
//       return res.status(404).json({ message: "التذكرة غير موجودة" });
//     }

//     if (ticket.status !== "pending") {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: "التذكرة ليست في حالة انتظار الدفع" 
//       });
//     }

//     // إنشاء QR Code
//     const qrData = JSON.stringify({
//       ticket_id: ticket.id,
//       ticket_number: ticket.ticket_number,
//       user_id: ticket.user_id,
//       trip_id: ticket.trip_id,
//       from_station_id: ticket.from_station_id,
//       to_station_id: ticket.to_station_id,
//       quantity: ticket.quantity
//     });

//     const qrCode = await QRCode.toDataURL(qrData);

//     // تحديث التذكرة
//     await ticket.update({
//       status: "confirmed",
//       qr_code: qrCode
//     }, { transaction });

//     await transaction.commit();

//     // جلب بيانات التذكرة المحدثة
//     const confirmedTicket = await Ticket.findByPk(ticket_id, {
//       include: [
//         {
//           model: Trip,
//           include: [
//             { model: Line },
//             { model: Train },
//             { 
//               model: User, 
//               as: "driver",
//               attributes: ['username']
//             }
//           ]
//         },
//         {
//           model: Station,
//           as: "from_station",
//           attributes: ['name', 'location']
//         },
//         {
//           model: Station,
//           as: "to_station", 
//           attributes: ['name', 'location']
//         }
//       ]
//     });

//     res.json({
//       message: "تم تأكيد الحجز بنجاح",
//       ticket: confirmedTicket
//     });

//   } catch (err) {
//     await transaction.rollback();
//     console.error("Error in confirmBooking:", err);
//     res.status(500).json({ 
//       message: "خطأ في تأكيد الحجز", 
//       error: err.message 
//     });
//   }
// };

// // ✅ جلب تذاكر المستخدم
// exports.getUserTickets = async (req, res) => {
//   try {
//     const user_id = req.user.id;

//     const tickets = await Ticket.findAll({
//       where: { user_id },
//       include: [
//         {
//           model: Trip,
//           include: [
//             { model: Line, attributes: ['line_name'] },
//             { model: Train, attributes: ['version_number'] },
//             { 
//               model: User, 
//               as: "driver",
//               attributes: ['username']
//             }
//           ]
//         },
//         {
//           model: Station,
//           as: "from_station",
//           attributes: ['name', 'location']
//         },
//         {
//           model: Station,
//           as: "to_station",
//           attributes: ['name', 'location']
//         }
//       ],
//       order: [['purchase_date', 'DESC']]
//     });

//     res.json({
//       message: "تم جلب التذاكر بنجاح",
//       tickets: tickets,
//       count: tickets.length
//     });

//   } catch (err) {
//     console.error("Error in getUserTickets:", err);
//     res.status(500).json({ 
//       message: "خطأ في جلب التذاكر", 
//       error: err.message 
//     });
//   }
// };

// // ✅ إلغاء الحجز
// exports.cancelBooking = async (req, res) => {
//   const transaction = await sequelize.transaction();
  
//   try {
//     const { ticket_id } = req.params;
//     const user_id = req.user.id;

//     const ticket = await Ticket.findOne({
//       where: { 
//         id: ticket_id,
//         user_id 
//       },
//       transaction
//     });

//     if (!ticket) {
//       await transaction.rollback();
//       return res.status(404).json({ message: "التذكرة غير موجودة" });
//     }

//     if (ticket.status === "used") {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: "لا يمكن إلغاء تذكرة مستخدمة" 
//       });
//     }

//     await ticket.update({
//       status: "cancelled"
//     }, { transaction });

//     await transaction.commit();

//     res.json({
//       message: "تم إلغاء الحجز بنجاح",
//       ticket: {
//         id: ticket.id,
//         ticket_number: ticket.ticket_number,
//         status: ticket.status
//       }
//     });

//   } catch (err) {
//     await transaction.rollback();
//     console.error("Error in cancelBooking:", err);
//     res.status(500).json({ 
//       message: "خطأ في إلغاء الحجز", 
//       error: err.message 
//     });
//   }
// };














// ****************************************************************************************************************************************************************************















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
      ticket_number: ticketNumber,
      discount_type: "none",
      discount_percentage: 0,
      original_price: totalPrice
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
      quantity: ticket.quantity,
      discount_type: ticket.discount_type
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

// 🔴 الإضافات الجديدة

// ✅ حجز تذكرة مع خصم أسبوعي أو شهري (وظيفة جديدة)
exports.bookTicketWithDiscount = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const user_id = req.user.id;
    const { trip_id, line_id, from_station_id, to_station_id, quantity = 1, discount_type = 'none' } = req.body;

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

    // التحقق من صحة نوع الخصم
    const validDiscountTypes = ['none', 'weekly', 'monthly'];
    if (!validDiscountTypes.includes(discount_type)) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: "نوع الخصم غير صحيح. القيم المسموحة: none, weekly, monthly" 
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

    // حساب السعر مع الخصم
    const basePrice = parseFloat(trip.Line.price);
    let discountPercentage = 0;
    let finalPrice = basePrice * quantity;

    if (discount_type === 'weekly') {
      discountPercentage = 20;
      finalPrice = basePrice * quantity * 0.8;
    } else if (discount_type === 'monthly') {
      discountPercentage = 30;
      finalPrice = basePrice * quantity * 0.7;
    }

    // إنشاء رقم تذكرة فريد
    const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // إنشاء التذكرة مع معلومات الخصم
    const ticket = await Ticket.create({
      user_id,
      trip_id,
      line_id,
      from_station_id,
      to_station_id,
      purchase_date: new Date(),
      price: basePrice,
      quantity,
      total_price: finalPrice,
      original_price: basePrice * quantity,
      status: "pending",
      ticket_number: ticketNumber,
      discount_type: discount_type,
      discount_percentage: discountPercentage,
      ...(discount_type === 'weekly' && { is_weekly_pass: true }),
      ...(discount_type === 'monthly' && { is_monthly_pass: true })
    }, { transaction });

    await transaction.commit();

    res.status(201).json({
      message: `تم حجز التذاكر بنجاح ${discountPercentage > 0 ? `بخصم ${discountPercentage}%` : ''}`,
      ticket: {
        id: ticket.id,
        ticket_number: ticket.ticket_number,
        quantity: ticket.quantity,
        original_price: ticket.original_price,
        total_price: ticket.total_price,
        discount_type: ticket.discount_type,
        discount_percentage: ticket.discount_percentage,
        status: ticket.status,
        payment_required: true
      }
    });

  } catch (err) {
    await transaction.rollback();
    console.error("Error in bookTicketWithDiscount:", err);
    res.status(500).json({ 
      message: "خطأ في حجز التذاكر", 
      error: err.message 
    });
  }
};

// ✅ جلب تقارير الخصومات (للمشرفين فقط) - وظيفة جديدة
exports.getDiscountReports = async (req, res) => {
  try {
    const { start_date, end_date, discount_type } = req.query;
    
    let whereClause = {
      discount_type: { [Op.ne]: 'none' }
    };
    
    // فلترة حسب التاريخ
    if (start_date && end_date) {
      whereClause.purchase_date = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }
    
    // فلترة حسب نوع الخصم
    if (discount_type && ['weekly', 'monthly'].includes(discount_type)) {
      whereClause.discount_type = discount_type;
    }
    
    const discountTickets = await Ticket.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email']
        },
        {
          model: Trip,
          include: [
            { model: Line, attributes: ['line_name'] }
          ]
        }
      ],
      order: [['purchase_date', 'DESC']]
    });
    
    // حساب الإحصائيات
    const stats = {
      total_tickets: discountTickets.length,
      total_revenue: 0,
      total_discount: 0,
      weekly_tickets: 0,
      monthly_tickets: 0,
      weekly_revenue: 0,
      monthly_revenue: 0
    };
    
    discountTickets.forEach(ticket => {
      stats.total_revenue += parseFloat(ticket.total_price);
      const originalPrice = ticket.original_price || (ticket.price * ticket.quantity);
      const discountAmount = originalPrice - ticket.total_price;
      stats.total_discount += discountAmount;
      
      if (ticket.discount_type === 'weekly') {
        stats.weekly_tickets++;
        stats.weekly_revenue += ticket.total_price;
      } else if (ticket.discount_type === 'monthly') {
        stats.monthly_tickets++;
        stats.monthly_revenue += ticket.total_price;
      }
    });
    
    res.json({
      message: "تم جلب تقرير الخصومات بنجاح",
      stats: stats,
      tickets: discountTickets.slice(0, 50),
      count: discountTickets.length
    });
    
  } catch (err) {
    console.error("Error in getDiscountReports:", err);
    res.status(500).json({ 
      message: "خطأ في جلب تقرير الخصومات", 
      error: err.message 
    });
  }
};














// const { Ticket, Trip, Line, Station, User, Train, LineStation, sequelize } = require("../models");
// const { Op } = require("sequelize");
// const QRCode = require('qrcode');

// // ✅ 1️⃣ جلب الخطوط المتاحة للمسافرين مع الأسعار
// exports.getAvailableLines = async (req, res) => {
//   try {
//     const lines = await Line.findAll({
//       attributes: ['id', 'line_name', 'price'],
//       include: [{
//         model: Station,
//         through: { 
//           attributes: ["station_order"] 
//         },
//         attributes: ["id", "name", "location"]
//       }],
//       order: [
//         ['line_name', 'ASC']
//       ]
//     });

//     res.json({
//       message: "تم جلب الخطوط المتاحة بنجاح",
//       lines: lines
//     });

//   } catch (err) {
//     console.error("Error in getAvailableLines:", err);
//     res.status(500).json({ 
//       message: "خطأ في جلب الخطوط", 
//       error: err.message 
//     });
//   }
// };

// // ✅ 2️⃣ جلب الرحلات المتاحة لخط معين وتاريخ معين
// exports.getAvailableTrips = async (req, res) => {
//   try {
//     const { line_id, date } = req.query;

//     if (!line_id || !date) {
//       return res.status(400).json({ 
//         message: "يرجى إدخال معرف الخط والتاريخ" 
//       });
//     }

//     // تحويل التاريخ فقط إلى نطاق زمني
//     const selectedDate = new Date(date);
//     const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
//     const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

//     // جلب الرحلات المتاحة للخط والتاريخ المطلوب
//     const trips = await Trip.findAll({
//       where: {
//         line_id,
//         start_time: {
//           [Op.between]: [startOfDay, endOfDay]
//         },
//         status: "on"
//       },
//       include: [
//         {
//           model: Line,
//           attributes: ['id', 'line_name', 'price']
//         },
//         {
//           model: Train,
//           attributes: ['id', 'version_number', 'capacity', 'status']
//         },
//         {
//           model: User,
//           as: "driver",
//           attributes: ['id', 'username']
//         }
//       ],
//       order: [['start_time', 'ASC']]
//     });

//     // حساب الأماكن المتاحة لكل رحلة
//     const tripsWithAvailability = await Promise.all(
//       trips.map(async (trip) => {
//         // حساب عدد التذاكر المحجوزة لهذه الرحلة
//         const bookedTickets = await Ticket.sum('quantity', {
//           where: { 
//             trip_id: trip.id,
//             status: { [Op.in]: ['pending', 'confirmed'] }
//           }
//         });

//         const availableSeats = trip.Train.capacity - (bookedTickets || 0);

//         return {
//           id: trip.id,
//           start_time: trip.start_time,
//           end_time: trip.end_time,
//           passenger_count: trip.passenger_count,
//           status: trip.status,
//           available_seats: availableSeats,
//           is_available: availableSeats > 0,
//           Line: trip.Line,
//           Train: trip.Train,
//           driver: trip.driver
//         };
//       })
//     );

//     res.json({
//       message: "تم جلب الرحلات المتاحة بنجاح",
//       trips: tripsWithAvailability
//     });

//   } catch (err) {
//     console.error("Error in getAvailableTrips:", err);
//     res.status(500).json({ 
//       message: "خطأ في جلب الرحلات", 
//       error: err.message 
//     });
//   }
// };

// // ✅ 3️⃣ جلب الرحلات العادية المتاحة (مشابه للشهرية)
// exports.getAvailableRegularTrips = async (req, res) => {
//   try {
//     const { date, line_id, from_station_id, to_station_id } = req.query;
    
//     let whereClause = {
//       status: "on",
//       is_auto_generated: false,
//       start_time: { [Op.gte]: new Date() }
//     };

//     // فلترة حسب التاريخ
//     if (date) {
//       const filterDate = new Date(date);
//       const nextDay = new Date(filterDate);
//       nextDay.setDate(nextDay.getDate() + 1);
      
//       whereClause.start_time = {
//         [Op.gte]: filterDate,
//         [Op.lt]: nextDay
//       };
//     }

//     // فلترة حسب الخط
//     if (line_id) {
//       whereClause.line_id = line_id;
//     }

//     const trips = await Trip.findAll({
//       where: whereClause,
//       include: [
//         {
//           model: Line,
//           attributes: ['id', 'line_name', 'price', 'color_code']
//         },
//         {
//           model: Train,
//           attributes: ['id', 'version_number', 'capacity']
//         },
//         {
//           model: User,
//           as: "driver",
//           attributes: ['id', 'username']
//         }
//       ],
//       order: [['start_time', 'ASC']]
//     });

//     // فلترة حسب المحطات
//     let filteredTrips = trips;
//     if (from_station_id && to_station_id) {
//       filteredTrips = trips.filter(trip => {
//         const stations = trip.Line.Stations.map(s => s.id);
//         const fromIndex = stations.indexOf(parseInt(from_station_id));
//         const toIndex = stations.indexOf(parseInt(to_station_id));
//         return fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;
//       });
//     }

//     // حساب المقاعد المتاحة
//     const tripsWithAvailability = await Promise.all(
//       filteredTrips.map(async (trip) => {
//         const bookedTickets = await Ticket.sum('quantity', {
//           where: { 
//             trip_id: trip.id,
//             status: { [Op.in]: ['pending', 'confirmed'] }
//           }
//         });

//         const availableSeats = trip.Train.capacity - (bookedTickets || 0);

//         return {
//           id: trip.id,
//           start_time: trip.start_time,
//           end_time: trip.end_time,
//           passenger_count: trip.passenger_count,
//           status: trip.status,
//           available_seats: availableSeats,
//           is_available: availableSeats > 0,
//           Line: trip.Line,
//           Train: trip.Train,
//           driver: trip.driver
//         };
//       })
//     );

//     res.json({
//       message: "تم جلب الرحلات العادية المتاحة بنجاح",
//       trips: tripsWithAvailability,
//       count: tripsWithAvailability.length
//     });

//   } catch (err) {
//     console.error("Error fetching available regular trips:", err);
//     res.status(500).json({
//       message: "خطأ في جلب الرحلات المتاحة",
//       error: err.message
//     });
//   }
// };

// // ✅ 4️⃣ حساب السعر بناءً على المحطات
// exports.calculatePrice = async (req, res) => {
//   try {
//     const { line_id, from_station_id, to_station_id, quantity = 1 } = req.body;

//     if (!line_id || !from_station_id || !to_station_id) {
//       return res.status(400).json({ 
//         message: "يرجى إدخال معرف الخط والمحطات" 
//       });
//     }

//     const line = await Line.findByPk(line_id, {
//       include: [{
//         model: Station,
//         through: { attributes: ["station_order"] }
//       }]
//     });

//     if (!line) {
//       return res.status(404).json({ message: "الخط غير موجود" });
//     }

//     // التحقق من وجود المحطات في الخط
//     const fromStation = await line.getStations({ where: { id: from_station_id } });
//     const toStation = await line.getStations({ where: { id: to_station_id } });

//     if (fromStation.length === 0 || toStation.length === 0) {
//       return res.status(400).json({ 
//         message: "إحدى المحطات غير موجودة في هذا الخط" 
//       });
//     }

//     // حساب السعر
//     const basePrice = parseFloat(line.price);
//     const totalPrice = basePrice * parseInt(quantity);

//     res.json({
//       message: "تم حساب السعر بنجاح",
//       price_details: {
//         base_price: basePrice,
//         quantity: parseInt(quantity),
//         total_price: totalPrice,
//         from_station: fromStation[0].name,
//         to_station: toStation[0].name,
//         line_name: line.line_name
//       }
//     });

//   } catch (err) {
//     console.error("Error in calculatePrice:", err);
//     res.status(500).json({ 
//       message: "خطأ في حساب السعر", 
//       error: err.message 
//     });
//   }
// };

// // ✅ 5️⃣ حجز التذاكر
// exports.bookTickets = async (req, res) => {
//   const transaction = await sequelize.transaction();
  
//   try {
//     const user_id = req.user.id;
//     const { trip_id, line_id, from_station_id, to_station_id, quantity = 1 } = req.body;

//     if (!trip_id || !line_id || !from_station_id || !to_station_id) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: "جميع الحقول مطلوبة: trip_id, line_id, from_station_id, to_station_id" 
//       });
//     }

//     if (quantity < 1 || quantity > 10) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: "عدد التذاكر يجب أن يكون بين 1 و 10" 
//       });
//     }

//     const trip = await Trip.findByPk(trip_id, {
//       include: [
//         { model: Line },
//         { model: Train }
//       ],
//       transaction
//     });

//     if (!trip) {
//       await transaction.rollback();
//       return res.status(404).json({ message: "الرحلة غير موجودة" });
//     }

//     // التحقق من توفر المقاعد
//     const bookedTickets = await Ticket.sum('quantity', {
//       where: { 
//         trip_id,
//         status: { [Op.in]: ['pending', 'confirmed'] }
//       },
//       transaction
//     });

//     const availableSeats = trip.Train.capacity - (bookedTickets || 0);

//     if (availableSeats < quantity) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: `لا توجد مقاعد كافية. المقاعد المتاحة: ${availableSeats}` 
//       });
//     }

//     const basePrice = parseFloat(trip.Line.price);
//     const totalPrice = basePrice * quantity;
//     const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

//     const ticket = await Ticket.create({
//       user_id,
//       trip_id,
//       line_id,
//       from_station_id,
//       to_station_id,
//       purchase_date: new Date(),
//       price: basePrice,
//       quantity,
//       total_price: totalPrice,
//       status: "pending",
//       ticket_number: ticketNumber,
//       discount_type: "none",
//       discount_percentage: 0,
//       original_price: totalPrice,
//       is_periodic_ticket: false
//     }, { transaction });

//     await transaction.commit();

//     res.status(201).json({
//       message: "تم حجز التذاكر بنجاح. يرجى إكمال عملية الدفع",
//       ticket: {
//         id: ticket.id,
//         ticket_number: ticket.ticket_number,
//         quantity: ticket.quantity,
//         total_price: ticket.total_price,
//         status: ticket.status
//       },
//       payment_required: true
//     });

//   } catch (err) {
//     await transaction.rollback();
//     console.error("Error in bookTickets:", err);
//     res.status(500).json({ 
//       message: "خطأ في حجز التذاكر", 
//       error: err.message 
//     });
//   }
// };

// // ✅ 6️⃣ **حجز التذكرة العادية (الوظيفة الرئيسية - مشابه للشهرية)**
// exports.bookRegularTicket = async (req, res) => {
//   const transaction = await sequelize.transaction();
  
//   try {
//     const user_id = req.user.id;
//     const { trip_id, from_station_id, to_station_id, quantity = 1 } = req.body;

//     if (!trip_id || !from_station_id || !to_station_id) {
//       await transaction.rollback();
//       return res.status(400).json({
//         message: "الحقول المطلوبة: trip_id, from_station_id, to_station_id"
//       });
//     }

//     if (quantity < 1 || quantity > 10) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: "عدد التذاكر يجب أن يكون بين 1 و 10" 
//       });
//     }

//     const trip = await Trip.findByPk(trip_id, {
//       include: [
//         { 
//           model: Line,
//           attributes: ['id', 'line_name', 'price']
//         },
//         { 
//           model: Train,
//           attributes: ['id', 'version_number', 'capacity']
//         }
//       ],
//       transaction
//     });

//     if (!trip) {
//       await transaction.rollback();
//       return res.status(404).json({ message: "الرحلة غير موجودة" });
//     }

//     if (trip.is_auto_generated) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: "هذه رحلة شهرية، استخدم حجز التذاكر الدورية" 
//       });
//     }

//     const fromStation = await Station.findByPk(from_station_id, { transaction });
//     const toStation = await Station.findByPk(to_station_id, { transaction });

//     if (!fromStation || !toStation) {
//       await transaction.rollback();
//       return res.status(404).json({ message: "إحدى المحطات غير موجودة" });
//     }

//     // التحقق من توفر المقاعد
//     const bookedTickets = await Ticket.sum('quantity', {
//       where: { 
//         trip_id: trip_id,
//         status: { [Op.in]: ['pending', 'confirmed'] }
//       },
//       transaction
//     });

//     const availableSeats = trip.Train.capacity - (bookedTickets || 0);

//     if (availableSeats < quantity) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: `لا توجد مقاعد كافية. المقاعد المتاحة: ${availableSeats}` 
//       });
//     }

//     const basePrice = parseFloat(trip.Line.price);
//     const totalPrice = basePrice * quantity;
//     const ticketNumber = `REGULAR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

//     const newTicket = await Ticket.create({
//       user_id: user_id,
//       trip_id: trip_id,
//       line_id: trip.line_id,
//       from_station_id: from_station_id,
//       to_station_id: to_station_id,
//       quantity: quantity,
//       price: basePrice,
//       total_price: totalPrice,
//       original_price: totalPrice,
//       status: "pending",
//       ticket_number: ticketNumber,
//       purchase_date: new Date(),
//       is_periodic_ticket: false,
//       periodic_ticket_number: null,
//       discount_type: "none",
//       discount_percentage: 0,
//       is_weekly_pass: false,
//       is_monthly_pass: false
//     }, { transaction });

//     await transaction.commit();

//     res.status(201).json({
//       message: "تم حجز التذكرة العادية بنجاح",
//       ticket: {
//         id: newTicket.id,
//         ticket_number: newTicket.ticket_number,
//         trip_id: newTicket.trip_id,
//         from_station: fromStation.name,
//         to_station: toStation.name,
//         trip_date: trip.start_time,
//         line_name: trip.Line.line_name,
//         quantity: newTicket.quantity,
//         total_price: newTicket.total_price,
//         status: newTicket.status,
//         payment_required: true,
//         ticket_type: "regular"
//       },
//       payment_instructions: {
//         next_step: "استخدم /api/payments/create-session للدفع",
//         endpoint: "POST /api/payments/create-session",
//         body_example: {
//           ticket_id: newTicket.id
//         }
//       }
//     });

//   } catch (err) {
//     await transaction.rollback();
//     console.error("Error booking regular ticket:", err);
//     res.status(500).json({
//       message: "خطأ في حجز التذكرة العادية",
//       error: err.message
//     });
//   }
// };

// // ✅ 7️⃣ تأكيد الحجز بعد الدفع الناجح
// exports.confirmBooking = async (req, res) => {
//   const transaction = await sequelize.transaction();
  
//   try {
//     const { ticket_id, payment_reference } = req.body;

//     const ticket = await Ticket.findByPk(ticket_id, { transaction });
    
//     if (!ticket) {
//       await transaction.rollback();
//       return res.status(404).json({ message: "التذكرة غير موجودة" });
//     }

//     if (ticket.status !== "pending") {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: "التذكرة ليست في حالة انتظار الدفع" 
//       });
//     }

//     const qrData = JSON.stringify({
//       ticket_id: ticket.id,
//       ticket_number: ticket.ticket_number,
//       user_id: ticket.user_id,
//       trip_id: ticket.trip_id,
//       from_station_id: ticket.from_station_id,
//       to_station_id: ticket.to_station_id,
//       quantity: ticket.quantity,
//       ticket_type: ticket.is_periodic_ticket ? "periodic" : "regular"
//     });

//     const qrCode = await QRCode.toDataURL(qrData);

//     await ticket.update({
//       status: "confirmed",
//       qr_code: qrCode,
//       payment_reference: payment_reference || "manual_confirm",
//       confirmed_at: new Date()
//     }, { transaction });

//     await transaction.commit();

//     const confirmedTicket = await Ticket.findByPk(ticket_id, {
//       include: [
//         {
//           model: Trip,
//           include: [
//             { model: Line },
//             { model: Train },
//             { 
//               model: User, 
//               as: "driver",
//               attributes: ['username']
//             }
//           ]
//         },
//         {
//           model: Station,
//           as: "from_station",
//           attributes: ['name', 'location']
//         },
//         {
//           model: Station,
//           as: "to_station", 
//           attributes: ['name', 'location']
//         }
//       ]
//     });

//     res.json({
//       message: "تم تأكيد الحجز بنجاح",
//       ticket: confirmedTicket,
//       ticket_type: ticket.is_periodic_ticket ? "periodic" : "regular"
//     });

//   } catch (err) {
//     await transaction.rollback();
//     console.error("Error in confirmBooking:", err);
//     res.status(500).json({ 
//       message: "خطأ في تأكيد الحجز", 
//       error: err.message 
//     });
//   }
// };

// // ✅ 8️⃣ جلب تذاكر المستخدم
// exports.getUserTickets = async (req, res) => {
//   try {
//     const user_id = req.user.id;

//     const tickets = await Ticket.findAll({
//       where: { user_id },
//       include: [
//         {
//           model: Trip,
//           include: [
//             { model: Line, attributes: ['line_name'] },
//             { model: Train, attributes: ['version_number'] },
//             { 
//               model: User, 
//               as: "driver",
//               attributes: ['username']
//             }
//           ]
//         },
//         {
//           model: Station,
//           as: "from_station",
//           attributes: ['name', 'location']
//         },
//         {
//           model: Station,
//           as: "to_station",
//           attributes: ['name', 'location']
//         }
//       ],
//       order: [['purchase_date', 'DESC']]
//     });

//     res.json({
//       message: "تم جلب التذاكر بنجاح",
//       tickets: tickets,
//       count: tickets.length
//     });

//   } catch (err) {
//     console.error("Error in getUserTickets:", err);
//     res.status(500).json({ 
//       message: "خطأ في جلب التذاكر", 
//       error: err.message 
//     });
//   }
// };

// // ✅ 9️⃣ **جلب تذاكري العادية فقط**
// exports.getMyRegularTickets = async (req, res) => {
//   try {
//     const user_id = req.user.id;

//     const tickets = await Ticket.findAll({
//       where: { 
//         user_id,
//         is_periodic_ticket: false
//       },
//       include: [
//         {
//           model: Trip,
//           include: [
//             { model: Line, attributes: ['line_name', 'color_code'] },
//             { model: Train, attributes: ['version_number'] },
//             { 
//               model: User, 
//               as: "driver",
//               attributes: ['username']
//             }
//           ]
//         },
//         {
//           model: Station,
//           as: "from_station",
//           attributes: ['name', 'location']
//         },
//         {
//           model: Station,
//           as: "to_station",
//           attributes: ['name', 'location']
//         }
//       ],
//       order: [['purchase_date', 'DESC']]
//     });

//     res.json({
//       message: "تم جلب تذاكرك العادية بنجاح",
//       tickets: tickets,
//       count: tickets.length
//     });

//   } catch (err) {
//     console.error("Error in getMyRegularTickets:", err);
//     res.status(500).json({ 
//       message: "خطأ في جلب التذاكر العادية", 
//       error: err.message 
//     });
//   }
// };

// // ✅ 🔟 إلغاء الحجز
// exports.cancelBooking = async (req, res) => {
//   const transaction = await sequelize.transaction();
  
//   try {
//     const { ticket_id } = req.params;
//     const user_id = req.user.id;

//     const ticket = await Ticket.findOne({
//       where: { 
//         id: ticket_id,
//         user_id 
//       },
//       transaction
//     });

//     if (!ticket) {
//       await transaction.rollback();
//       return res.status(404).json({ message: "التذكرة غير موجودة" });
//     }

//     if (ticket.status === "used") {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: "لا يمكن إلغاء تذكرة مستخدمة" 
//       });
//     }

//     if (ticket.status === "cancelled") {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: "التذكرة ملغاة بالفعل" 
//       });
//     }

//     await ticket.update({
//       status: "cancelled",
//       cancelled_at: new Date()
//     }, { transaction });

//     await transaction.commit();

//     res.json({
//       message: "تم إلغاء الحجز بنجاح",
//       ticket: {
//         id: ticket.id,
//         ticket_number: ticket.ticket_number,
//         status: ticket.status
//       }
//     });

//   } catch (err) {
//     await transaction.rollback();
//     console.error("Error in cancelBooking:", err);
//     res.status(500).json({ 
//       message: "خطأ في إلغاء الحجز", 
//       error: err.message 
//     });
//   }
// };

// // ✅ 1️⃣1️⃣ حجز تذكرة مع خصم أسبوعي أو شهري
// exports.bookTicketWithDiscount = async (req, res) => {
//   const transaction = await sequelize.transaction();
  
//   try {
//     const user_id = req.user.id;
//     const { trip_id, line_id, from_station_id, to_station_id, quantity = 1, discount_type = 'none' } = req.body;

//     if (!trip_id || !line_id || !from_station_id || !to_station_id) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: "جميع الحقول مطلوبة: trip_id, line_id, from_station_id, to_station_id" 
//       });
//     }

//     if (quantity < 1 || quantity > 10) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: "عدد التذاكر يجب أن يكون بين 1 و 10" 
//       });
//     }

//     const validDiscountTypes = ['none', 'weekly', 'monthly'];
//     if (!validDiscountTypes.includes(discount_type)) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: "نوع الخصم غير صحيح. القيم المسموحة: none, weekly, monthly" 
//       });
//     }

//     const trip = await Trip.findByPk(trip_id, {
//       include: [
//         { model: Line },
//         { model: Train }
//       ],
//       transaction
//     });

//     if (!trip) {
//       await transaction.rollback();
//       return res.status(404).json({ message: "الرحلة غير موجودة" });
//     }

//     const bookedTickets = await Ticket.sum('quantity', {
//       where: { 
//         trip_id,
//         status: { [Op.in]: ['pending', 'confirmed'] }
//       },
//       transaction
//     });

//     const availableSeats = trip.Train.capacity - (bookedTickets || 0);

//     if (availableSeats < quantity) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: `لا توجد مقاعد كافية. المقاعد المتاحة: ${availableSeats}` 
//       });
//     }

//     const basePrice = parseFloat(trip.Line.price);
//     let discountPercentage = 0;
//     let finalPrice = basePrice * quantity;

//     if (discount_type === 'weekly') {
//       discountPercentage = 20;
//       finalPrice = basePrice * quantity * 0.8;
//     } else if (discount_type === 'monthly') {
//       discountPercentage = 30;
//       finalPrice = basePrice * quantity * 0.7;
//     }

//     const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
//     const isPeriodic = (discount_type === 'weekly' || discount_type === 'monthly');

//     const ticket = await Ticket.create({
//       user_id,
//       trip_id,
//       line_id,
//       from_station_id,
//       to_station_id,
//       purchase_date: new Date(),
//       price: basePrice,
//       quantity,
//       total_price: finalPrice,
//       original_price: basePrice * quantity,
//       status: "pending",
//       ticket_number: ticketNumber,
//       discount_type: discount_type,
//       discount_percentage: discountPercentage,
//       is_periodic_ticket: isPeriodic,
//       periodic_ticket_number: isPeriodic ? `PERIODIC-${discount_type.toUpperCase()}-${Date.now()}` : null,
//       ...(discount_type === 'weekly' && { is_weekly_pass: true }),
//       ...(discount_type === 'monthly' && { is_monthly_pass: true })
//     }, { transaction });

//     await transaction.commit();

//     res.status(201).json({
//       message: `تم حجز التذاكر بنجاح ${discountPercentage > 0 ? `بخصم ${discountPercentage}%` : ''}`,
//       ticket: {
//         id: ticket.id,
//         ticket_number: ticket.ticket_number,
//         quantity: ticket.quantity,
//         original_price: ticket.original_price,
//         total_price: ticket.total_price,
//         discount_type: ticket.discount_type,
//         discount_percentage: ticket.discount_percentage,
//         status: ticket.status,
//         payment_required: true,
//         ticket_type: isPeriodic ? "periodic" : "regular"
//       }
//     });

//   } catch (err) {
//     await transaction.rollback();
//     console.error("Error in bookTicketWithDiscount:", err);
//     res.status(500).json({ 
//       message: "خطأ في حجز التذاكر", 
//       error: err.message 
//     });
//   }
// };

// // ✅ 1️⃣2️⃣ **الدفع اليدوي للتذكرة العادية**
// exports.manualConfirmRegularTicket = async (req, res) => {
//   const transaction = await sequelize.transaction();
  
//   try {
//     const user_id = req.user.id;
//     const { ticket_id } = req.body;

//     if (!ticket_id) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: "يرجى إرسال ticket_id" 
//       });
//     }

//     const ticket = await Ticket.findOne({
//       where: {
//         id: ticket_id,
//         user_id: user_id,
//         is_periodic_ticket: false
//       },
//       include: [
//         { 
//           model: Trip,
//           include: [{ model: Line }]
//         },
//         { 
//           model: Station, 
//           as: "from_station", 
//           attributes: ["name"] 
//         },
//         { 
//           model: Station, 
//           as: "to_station", 
//           attributes: ["name"] 
//         }
//       ],
//       transaction
//     });

//     if (!ticket) {
//       await transaction.rollback();
//       return res.status(404).json({ 
//         message: "لم يتم العثور على تذكرة عادية قيد الانتظار"
//       });
//     }

//     if (ticket.status !== "pending") {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: "التذكرة ليست في حالة انتظار الدفع" 
//       });
//     }

//     const qrData = JSON.stringify({
//       ticket_id: ticket.id,
//       ticket_number: ticket.ticket_number,
//       user_id: ticket.user_id,
//       trip_id: ticket.trip_id,
//       from_station: ticket.from_station.name,
//       to_station: ticket.to_station.name,
//       line_name: ticket.Trip?.Line?.line_name || "غير معروف",
//       trip_date: ticket.Trip?.start_time,
//       quantity: ticket.quantity,
//       ticket_type: "regular"
//     });
    
//     const qrCode = await QRCode.toDataURL(qrData);
    
//     await ticket.update({
//       status: "confirmed",
//       qr_code: qrCode,
//       payment_reference: `manual_confirm_regular_${Date.now()}`,
//       confirmed_at: new Date()
//     }, { transaction });

//     await transaction.commit();

//     res.json({
//       success: true,
//       message: "✅ تم تأكيد التذكرة العادية يدوياً بنجاح!",
//       summary: {
//         ticket_number: ticket.ticket_number,
//         trip_date: ticket.Trip?.start_time,
//         line: ticket.Trip?.Line?.line_name || "غير معروف",
//         from_station: ticket.from_station.name,
//         to_station: ticket.to_station.name,
//         quantity: ticket.quantity,
//         total_price: ticket.total_price,
//         status: "confirmed"
//       }
//     });

//   } catch (err) {
//     await transaction.rollback();
//     console.error("Manual Confirm Regular Ticket Error:", err);
//     res.status(500).json({
//       message: "خطأ في التأكيد اليدوي للتذكرة العادية",
//       error: err.message
//     });
//   }
// };

// // ✅ 1️⃣3️⃣ **جلب QR Code للتذكرة**
// exports.getTicketQRCode = async (req, res) => {
//   try {
//     const { ticket_id } = req.params;
//     const user_id = req.user.id;

//     const ticket = await Ticket.findOne({
//       where: { 
//         id: ticket_id,
//         user_id: user_id,
//         status: "confirmed"
//       },
//       include: [
//         {
//           model: Trip,
//           include: [{ model: Line }]
//         }
//       ]
//     });

//     if (!ticket) {
//       return res.status(404).json({ 
//         message: "التذكرة غير موجودة أو غير مؤكدة" 
//       });
//     }

//     if (!ticket.qr_code) {
//       const qrData = JSON.stringify({
//         ticket_id: ticket.id,
//         ticket_number: ticket.ticket_number,
//         user_id: ticket.user_id,
//         trip_id: ticket.trip_id,
//         from_station_id: ticket.from_station_id,
//         to_station_id: ticket.to_station_id,
//         quantity: ticket.quantity,
//         ticket_type: ticket.is_periodic_ticket ? "periodic" : "regular",
//         trip_date: ticket.Trip?.start_time
//       });
      
//       const qrCode = await QRCode.toDataURL(qrData);
      
//       await ticket.update({ qr_code: qrCode });
      
//       return res.json({
//         message: "تم إنشاء QR Code للتذكرة",
//         qr_code: qrCode,
//         ticket_info: {
//           id: ticket.id,
//           ticket_number: ticket.ticket_number,
//           trip_date: ticket.Trip?.start_time,
//           line_name: ticket.Trip?.Line?.line_name,
//           ticket_type: ticket.is_periodic_ticket ? "دورية" : "عادية"
//         }
//       });
//     }

//     res.json({
//       message: "تم جلب QR Code للتذكرة",
//       qr_code: ticket.qr_code,
//       ticket_info: {
//         id: ticket.id,
//         ticket_number: ticket.ticket_number,
//         trip_date: ticket.Trip?.start_time,
//         line_name: ticket.Trip?.Line?.line_name,
//         ticket_type: ticket.is_periodic_ticket ? "دورية" : "عادية"
//       }
//     });

//   } catch (err) {
//     console.error("Error in getTicketQRCode:", err);
//     res.status(500).json({ 
//       message: "خطأ في جلب QR Code", 
//       error: err.message 
//     });
//   }
// };

// // ✅ 1️⃣4️⃣ جلب تقارير الخصومات (للمشرفين فقط)
// exports.getDiscountReports = async (req, res) => {
//   try {
//     const { start_date, end_date, discount_type } = req.query;
    
//     let whereClause = {
//       discount_type: { [Op.ne]: 'none' }
//     };
    
//     if (start_date && end_date) {
//       whereClause.purchase_date = {
//         [Op.between]: [new Date(start_date), new Date(end_date)]
//       };
//     }
    
//     if (discount_type && ['weekly', 'monthly'].includes(discount_type)) {
//       whereClause.discount_type = discount_type;
//     }
    
//     const discountTickets = await Ticket.findAll({
//       where: whereClause,
//       include: [
//         {
//           model: User,
//           attributes: ['id', 'username', 'email']
//         },
//         {
//           model: Trip,
//           include: [
//             { model: Line, attributes: ['line_name'] }
//           ]
//         }
//       ],
//       order: [['purchase_date', 'DESC']]
//     });
    
//     const stats = {
//       total_tickets: discountTickets.length,
//       total_revenue: 0,
//       total_discount: 0,
//       weekly_tickets: 0,
//       monthly_tickets: 0,
//       weekly_revenue: 0,
//       monthly_revenue: 0
//     };
    
//     discountTickets.forEach(ticket => {
//       stats.total_revenue += parseFloat(ticket.total_price);
//       const originalPrice = ticket.original_price || (ticket.price * ticket.quantity);
//       const discountAmount = originalPrice - ticket.total_price;
//       stats.total_discount += discountAmount;
      
//       if (ticket.discount_type === 'weekly') {
//         stats.weekly_tickets++;
//         stats.weekly_revenue += ticket.total_price;
//       } else if (ticket.discount_type === 'monthly') {
//         stats.monthly_tickets++;
//         stats.monthly_revenue += ticket.total_price;
//       }
//     });
    
//     res.json({
//       message: "تم جلب تقرير الخصومات بنجاح",
//       stats: stats,
//       tickets: discountTickets.slice(0, 50),
//       count: discountTickets.length
//     });
    
//   } catch (err) {
//     console.error("Error in getDiscountReports:", err);
//     res.status(500).json({ 
//       message: "خطأ في جلب تقرير الخصومات", 
//       error: err.message 
//     });
//   }
// };