// const { Ticket, Trip, Line, Station, User, Train, sequelize } = require("../models");
// const { Op } = require("sequelize");
// const QRCode = require('qrcode');

// // ✅ 1. جلب الرحلات العادية المتاحة (غير الشهرية وغير المولدة تلقائياً)
// exports.getAvailableRegularTrips = async (req, res) => {
//   try {
//     const { date, line_id, from_station_id, to_station_id } = req.query;

//     // التحقق من التاريخ
//     if (!date) {
//       return res.status(400).json({ 
//         success: false,
//         message: "التاريخ مطلوب (YYYY-MM-DD)" 
//       });
//     }

//     // بناء التاريخ
//     const selectedDate = new Date(date);
//     const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
//     const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

//     // بناء فلتر الرحلات العادية
//     let whereClause = {
//       is_auto_generated: false, // ليست مولدة تلقائياً
//       is_base_trip: true,       // رحلات أساسية (ليس دورية)
//       start_time: {
//         [Op.between]: [startOfDay, endOfDay]
//       },
//       status: "on" // مفعلة فقط
//     };

//     // فلترة حسب الخط
//     if (line_id) {
//       whereClause.line_id = line_id;
//     }

//     // جلب الرحلات
//     const trips = await Trip.findAll({
//       where: whereClause,
//       include: [
//         {
//           model: Line,
//           attributes: ['id', 'line_name', 'price'],
//           include: [{
//             model: Station,
//             through: { attributes: ["station_order"] },
//             attributes: ["id", "name", "location"]
//           }]
//         },
//         {
//           model: Train,
//           attributes: ['id', 'version_number', 'capacity', 'status']
//         },
//         {
//           model: User,
//           as: "driver",
//           attributes: ['id', 'username', 'phone_number']
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

//         // جلب محطات الخط
//         const lineStations = await trip.Line.getStations({
//           order: [['LineStation.station_order', 'ASC']],
//           attributes: ['id', 'name']
//         });

//         // التحقق من المحطات إذا تم إرسالها
//         let isValidRoute = true;
//         let fromStationOrder = -1;
//         let toStationOrder = -1;

//         if (from_station_id && to_station_id) {
//           fromStationOrder = lineStations.findIndex(s => s.id == from_station_id);
//           toStationOrder = lineStations.findIndex(s => s.id == to_station_id);
          
//           isValidRoute = fromStationOrder >= 0 && toStationOrder >= 0 && toStationOrder > fromStationOrder;
//         }

//         return {
//           id: trip.id,
//           start_time: trip.start_time,
//           end_time: trip.end_time,
//           passenger_count: trip.passenger_count,
//           status: trip.status,
//           available_seats: availableSeats,
//           is_available: availableSeats > 0,
//           is_valid_route: isValidRoute,
//           line_stations: lineStations,
//           from_station_order: fromStationOrder,
//           to_station_order: toStationOrder,
//           Line: trip.Line,
//           Train: trip.Train,
//           driver: trip.driver
//         };
//       })
//     );

//     // فلترة الرحلات حسب المحطات إذا تم إرسالها
//     let filteredTrips = tripsWithAvailability;
//     if (from_station_id && to_station_id) {
//       filteredTrips = tripsWithAvailability.filter(trip => trip.is_valid_route);
//     }

//     res.json({
//       success: true,
//       message: "تم جلب الرحلات العادية المتاحة بنجاح",
//       trips: filteredTrips,
//       count: filteredTrips.length,
//       filters: {
//         date: date,
//         line_id: line_id || "جميع الخطوط",
//         from_station_id: from_station_id || "غير محدد",
//         to_station_id: to_station_id || "غير محدد"
//       }
//     });

//   } catch (err) {
//     console.error("Error in getAvailableRegularTrips:", err);
//     res.status(500).json({ 
//       success: false,
//       message: "خطأ في جلب الرحلات المتاحة", 
//       error: err.message 
//     });
//   }
// };

// // ✅ 2. حساب سعر التذكرة العادية
// exports.calculateRegularPrice = async (req, res) => {
//   try {
//     const { trip_id, from_station_id, to_station_id, quantity = 1 } = req.body;

//     // التحقق من البيانات
//     if (!trip_id || !from_station_id || !to_station_id) {
//       return res.status(400).json({ 
//         success: false,
//         message: "جميع الحقول مطلوبة: trip_id, from_station_id, to_station_id" 
//       });
//     }

//     if (quantity < 1 || quantity > 10) {
//       return res.status(400).json({ 
//         success: false,
//         message: "عدد التذاكر يجب أن يكون بين 1 و 10" 
//       });
//     }

//     // جلب الرحلة مع الخط والمحطات
//     const trip = await Trip.findByPk(trip_id, {
//       include: [
//         {
//           model: Line,
//           attributes: ['id', 'line_name', 'price'],
//           include: [{
//             model: Station,
//             through: { attributes: ["station_order"] },
//             attributes: ["id", "name"]
//           }]
//         }
//       ]
//     });

//     if (!trip) {
//       return res.status(404).json({ 
//         success: false,
//         message: "الرحلة غير موجودة" 
//       });
//     }

//     // التحقق من أن الرحلة عادية وليست شهرية
//     if (trip.is_auto_generated) {
//       return res.status(400).json({ 
//         success: false,
//         message: "هذه رحلة شهرية. استخدم نظام الحجز الدوري" 
//       });
//     }

//     // التحقق من وجود المحطات في الخط
//     const lineStations = await trip.Line.getStations({
//       order: [['LineStation.station_order', 'ASC']],
//       attributes: ['id', 'name']
//     });

//     const fromStationIndex = lineStations.findIndex(s => s.id == from_station_id);
//     const toStationIndex = lineStations.findIndex(s => s.id == to_station_id);

//     if (fromStationIndex === -1 || toStationIndex === -1) {
//       return res.status(400).json({ 
//         success: false,
//         message: "إحدى المحطات غير موجودة في هذا الخط" 
//       });
//     }

//     if (toStationIndex <= fromStationIndex) {
//       return res.status(400).json({ 
//         success: false,
//         message: "محطة الوصول يجب أن تكون بعد محطة الانطلاق" 
//       });
//     }

//     // حساب السعر بناءً على السعر الثابت للخط
//     const basePrice = parseFloat(trip.Line.price);
//     const totalPrice = basePrice * parseInt(quantity);

//     // جلب أسماء المحطات
//     const fromStation = lineStations[fromStationIndex];
//     const toStation = lineStations[toStationIndex];

//     res.json({
//       success: true,
//       message: "تم حساب السعر بنجاح",
//       price_details: {
//         trip_id: trip.id,
//         trip_time: trip.start_time,
//         line_name: trip.Line.line_name,
//         from_station: {
//           id: fromStation.id,
//           name: fromStation.name,
//           order: fromStationIndex + 1
//         },
//         to_station: {
//           id: toStation.id,
//           name: toStation.name,
//           order: toStationIndex + 1
//         },
//         base_price: basePrice,
//         quantity: parseInt(quantity),
//         total_price: totalPrice,
//         stations_passed: toStationIndex - fromStationIndex,
//         estimated_travel_time: `${(toStationIndex - fromStationIndex) * 5} دقيقة` // تقدير 5 دقائق لكل محطة
//       }
//     });

//   } catch (err) {
//     console.error("Error in calculateRegularPrice:", err);
//     res.status(500).json({ 
//       success: false,
//       message: "خطأ في حساب السعر", 
//       error: err.message 
//     });
//   }
// };

// // ✅ 3. حجز التذكرة العادية (بدون خصم)
// exports.bookRegularTicket = async (req, res) => {
//   const transaction = await sequelize.transaction();
  
//   try {
//     const user_id = req.user.id;
//     const { trip_id, from_station_id, to_station_id, quantity = 1 } = req.body;

//     // التحقق من البيانات
//     if (!trip_id || !from_station_id || !to_station_id) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         success: false,
//         message: "جميع الحقول مطلوبة: trip_id, from_station_id, to_station_id" 
//       });
//     }

//     if (quantity < 1 || quantity > 10) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         success: false,
//         message: "عدد التذاكر يجب أن يكون بين 1 و 10" 
//       });
//     }

//     // جلب الرحلة مع الخط والقطار
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
//       return res.status(404).json({ 
//         success: false,
//         message: "الرحلة غير موجودة" 
//       });
//     }

//     // التحقق من أن الرحلة عادية
//     if (trip.is_auto_generated) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         success: false,
//         message: "هذه رحلة شهرية. استخدم نظام الحجز الدوري" 
//       });
//     }

//     // التحقق من أن الرحلة مفعلة
//     if (trip.status !== "on") {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         success: false,
//         message: `الرحلة غير متاحة حالياً. الحالة: ${trip.status}` 
//       });
//     }

//     // التحقق من وجود المحطات
//     const fromStation = await Station.findByPk(from_station_id, { transaction });
//     const toStation = await Station.findByPk(to_station_id, { transaction });

//     if (!fromStation || !toStation) {
//       await transaction.rollback();
//       return res.status(404).json({ 
//         success: false,
//         message: "إحدى المحطات غير موجودة" 
//       });
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
//         success: false,
//         message: `لا توجد مقاعد كافية. المقاعد المتاحة: ${availableSeats}` 
//       });
//     }

//     // حساب السعر
//     const basePrice = parseFloat(trip.Line.price);
//     const totalPrice = basePrice * quantity;

//     // إنشاء رقم تذكرة فريد
//     const ticketNumber = `REGULAR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

//     // إنشاء التذكرة العادية
//     const ticket = await Ticket.create({
//       user_id,
//       trip_id,
//       line_id: trip.line_id,
//       from_station_id,
//       to_station_id,
//       purchase_date: new Date(),
//       price: basePrice,
//       quantity,
//       total_price: totalPrice,
//       original_price: totalPrice,
//       status: "pending",
//       ticket_number: ticketNumber,
//       discount_type: "none",
//       discount_percentage: 0,
//       is_periodic_ticket: false,
//       is_weekly_pass: false,
//       is_monthly_pass: false
//     }, { transaction });

//     // إنشاء رقم تجميعي للتذاكر (مشابه للدورية لكن للتذكرة العادية الواحدة)
//     const regular_ticket_group = `REGULAR-GROUP-${Date.now()}-${ticket.id}`;

//     await ticket.update({
//       periodic_ticket_number: regular_ticket_group // نستخدم نفس الحقل لكن للتجميع
//     }, { transaction });

//     await transaction.commit();

//     res.status(201).json({
//       success: true,
//       message: "تم حجز التذكرة العادية بنجاح. يرجى إكمال عملية الدفع",
//       ticket: {
//         id: ticket.id,
//         ticket_number: ticket.ticket_number,
//         regular_ticket_group: regular_ticket_group,
//         quantity: ticket.quantity,
//         total_price: ticket.total_price,
//         status: ticket.status,
//         trip_details: {
//           trip_id: trip.id,
//           start_time: trip.start_time,
//           line_name: trip.Line.line_name,
//           from_station: fromStation.name,
//           to_station: toStation.name
//         }
//       },
//       payment_required: true,
//       next_step: {
//         description: "استخدم regular_ticket_group لإكمال عملية الدفع",
//         endpoint: "POST /api/payments/create-session",
//         body: { 
//           regular_ticket_group: regular_ticket_group,
//           ticket_id: ticket.id // يمكنك استخدام ticket_id أيضاً
//         }
//       }
//     });

//   } catch (err) {
//     await transaction.rollback();
//     console.error("Error in bookRegularTicket:", err);
//     res.status(500).json({ 
//       success: false,
//       message: "خطأ في حجز التذكرة العادية", 
//       error: err.message 
//     });
//   }
// };

// // ✅ 4. جلب التذاكر العادية للمستخدم
// exports.getMyRegularTickets = async (req, res) => {
//   try {
//     const user_id = req.user.id;
//     const { status, date } = req.query;

//     let whereClause = {
//       user_id,
//       is_periodic_ticket: false // تذاكر عادية فقط
//     };

//     // فلترة حسب الحالة
//     if (status && ['pending', 'confirmed', 'used', 'cancelled'].includes(status)) {
//       whereClause.status = status;
//     }

//     // فلترة حسب التاريخ
//     if (date) {
//       const filterDate = new Date(date);
//       const nextDay = new Date(filterDate);
//       nextDay.setDate(nextDay.getDate() + 1);
      
//       whereClause.purchase_date = {
//         [Op.gte]: filterDate,
//         [Op.lt]: nextDay
//       };
//     }

//     const tickets = await Ticket.findAll({
//       where: whereClause,
//       include: [
//         {
//           model: Trip,
//           attributes: ['id', 'start_time', 'end_time', 'status'],
//           include: [
//             {
//               model: Line,
//               attributes: ['id', 'line_name']
//             },
//             {
//               model: Train,
//               attributes: ['id', 'version_number']
//             },
//             {
//               model: User,
//               as: "driver",
//               attributes: ['id', 'username']
//             }
//           ]
//         },
//         {
//           model: Station,
//           as: "from_station",
//           attributes: ['id', 'name', 'location']
//         },
//         {
//           model: Station,
//           as: "to_station",
//           attributes: ['id', 'name', 'location']
//         }
//       ],
//       order: [['purchase_date', 'DESC']]
//     });

//     // حساب الإحصائيات
//     const stats = {
//       total_tickets: tickets.length,
//       pending_tickets: tickets.filter(t => t.status === 'pending').length,
//       confirmed_tickets: tickets.filter(t => t.status === 'confirmed').length,
//       used_tickets: tickets.filter(t => t.status === 'used').length,
//       cancelled_tickets: tickets.filter(t => t.status === 'cancelled').length,
//       total_spent: tickets.reduce((sum, t) => sum + parseFloat(t.total_price), 0)
//     };

//     res.json({
//       success: true,
//       message: "تم جلب التذاكر العادية بنجاح",
//       tickets: tickets,
//       count: tickets.length,
//       stats: stats
//     });

//   } catch (err) {
//     console.error("Error in getMyRegularTickets:", err);
//     res.status(500).json({ 
//       success: false,
//       message: "خطأ في جلب التذاكر العادية", 
//       error: err.message 
//     });
//   }
// };

// // ✅ 5. تفعيل التذكرة العادية (بعد الدفع الناجح)
// exports.activateRegularTicket = async (req, res) => {
//   const transaction = await sequelize.transaction();
  
//   try {
//     const { regular_ticket_group, ticket_id } = req.body;

//     if (!regular_ticket_group && !ticket_id) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         success: false,
//         message: "يرجى إرسال regular_ticket_group أو ticket_id" 
//       });
//     }

//     // البحث عن التذكرة
//     let ticket;
//     if (regular_ticket_group) {
//       ticket = await Ticket.findOne({
//         where: {
//           periodic_ticket_number: regular_ticket_group,
//           is_periodic_ticket: false
//         },
//         transaction
//       });
//     } else {
//       ticket = await Ticket.findByPk(ticket_id, { transaction });
//     }

//     if (!ticket) {
//       await transaction.rollback();
//       return res.status(404).json({ 
//         success: false,
//         message: "التذكرة غير موجودة" 
//       });
//     }

//     if (ticket.status !== 'pending') {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         success: false,
//         message: `التذكرة ليست قيد الانتظار. الحالة الحالية: ${ticket.status}` 
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
//       quantity: ticket.quantity,
//       purchase_date: ticket.purchase_date,
//       total_price: ticket.total_price
//     });

//     const qrCode = await QRCode.toDataURL(qrData);

//     // تحديث التذكرة
//     await ticket.update({
//       status: "confirmed",
//       qr_code: qrCode,
//       confirmed_at: new Date(),
//       payment_reference: `regular_payment_${Date.now()}`
//     }, { transaction });

//     // جلب بيانات التذكرة المحدثة
//     const updatedTicket = await Ticket.findByPk(ticket.id, {
//       include: [
//         {
//           model: Trip,
//           include: [
//             {
//               model: Line,
//               attributes: ['line_name']
//             },
//             {
//               model: Train,
//               attributes: ['version_number']
//             },
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
//           attributes: ['name']
//         },
//         {
//           model: Station,
//           as: "to_station",
//           attributes: ['name']
//         }
//       ],
//       transaction
//     });

//     await transaction.commit();

//     res.json({
//       success: true,
//       message: "✅ تم تفعيل التذكرة العادية بنجاح!",
//       ticket: {
//         id: updatedTicket.id,
//         ticket_number: updatedTicket.ticket_number,
//         status: updatedTicket.status,
//         has_qr: !!updatedTicket.qr_code,
//         trip_details: {
//           line: updatedTicket.Trip.Line.line_name,
//           start_time: updatedTicket.Trip.start_time,
//           from_station: updatedTicket.from_station.name,
//           to_station: updatedTicket.to_station.name,
//           driver: updatedTicket.Trip.driver?.username || "غير محدد"
//         },
//         qr_code: updatedTicket.qr_code
//       },
//       next_steps: [
//         "استخدم QR Code للصعود إلى القطار",
//         "احفظ QR Code للتحقق منه عند الدخول"
//       ]
//     });

//   } catch (err) {
//     await transaction.rollback();
//     console.error("Error in activateRegularTicket:", err);
//     res.status(500).json({ 
//       success: false,
//       message: "خطأ في تفعيل التذكرة العادية", 
//       error: err.message 
//     });
//   }
// };

// // ✅ 6. التحقق من صلاحية التذكرة العادية
// exports.validateRegularTicket = async (req, res) => {
//   try {
//     const { ticket_number } = req.body;

//     if (!ticket_number) {
//       return res.status(400).json({ 
//         success: false,
//         message: "رقم التذكرة مطلوب" 
//       });
//     }

//     const ticket = await Ticket.findOne({
//       where: { 
//         ticket_number: ticket_number,
//         is_periodic_ticket: false
//       },
//       include: [
//         {
//           model: Trip,
//           attributes: ['id', 'start_time', 'end_time', 'status'],
//           include: [
//             {
//               model: Line,
//               attributes: ['line_name']
//             }
//           ]
//         },
//         {
//           model: Station,
//           as: "from_station",
//           attributes: ['name']
//         },
//         {
//           model: Station,
//           as: "to_station",
//           attributes: ['name']
//         }
//       ]
//     });

//     if (!ticket) {
//       return res.status(404).json({ 
//         success: false,
//         message: "التذكرة غير موجودة" 
//       });
//     }

//     // التحقق من الحالة
//     if (ticket.status !== 'confirmed') {
//       return res.json({
//         success: false,
//         valid: false,
//         message: "التذكرة غير مفعلة. الحالة: " + ticket.status,
//         ticket_number: ticket.ticket_number
//       });
//     }

//     // التحقق من تاريخ الرحلة (يجب أن تكون اليوم)
//     const today = new Date();
//     const tripDate = new Date(ticket.Trip.start_time);
    
//     if (today.toDateString() !== tripDate.toDateString()) {
//       return res.json({
//         success: false,
//         valid: false,
//         message: "التذكرة ليست لليوم الحالي",
//         ticket_date: tripDate.toLocaleDateString(),
//         today_date: today.toLocaleDateString()
//       });
//     }

//     // التحقق من الوقت (يجب أن تكون قبل ساعة من انتهاء الرحلة)
//     const tripEndTime = new Date(ticket.Trip.end_time);
//     const oneHourBeforeEnd = new Date(tripEndTime.getTime() - (60 * 60 * 1000));
    
//     if (today > tripEndTime) {
//       return res.json({
//         success: false,
//         valid: false,
//         message: "انتهت صلاحية التذكرة (الرحلة انتهت)",
//         ticket_number: ticket.ticket_number
//       });
//     }

//     if (today > oneHourBeforeEnd) {
//       return res.json({
//         success: false,
//         valid: false,
//         message: "الوقت المتبقي أقل من ساعة للرحلة",
//         ticket_number: ticket.ticket_number
//       });
//     }

//     res.json({
//       success: true,
//       valid: true,
//       message: "✅ التذكرة صالحة للاستخدام",
//       ticket: {
//         ticket_number: ticket.ticket_number,
//         status: ticket.status,
//         line: ticket.Trip.Line.line_name,
//         from_station: ticket.from_station.name,
//         to_station: ticket.to_station.name,
//         trip_time: ticket.Trip.start_time,
//         trip_status: ticket.Trip.status,
//         qr_code_exists: !!ticket.qr_code
//       }
//     });

//   } catch (err) {
//     console.error("Error in validateRegularTicket:", err);
//     res.status(500).json({ 
//       success: false,
//       message: "خطأ في التحقق من التذكرة", 
//       error: err.message 
//     });
//   }
// };

// // ✅ 7. استخدام التذكرة العادية
// exports.useRegularTicket = async (req, res) => {
//   const transaction = await sequelize.transaction();
  
//   try {
//     const { ticket_number, station_id } = req.body;

//     if (!ticket_number || !station_id) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         success: false,
//         message: "رقم التذكرة ومعرف المحطة مطلوبان" 
//       });
//     }

//     const ticket = await Ticket.findOne({
//       where: { 
//         ticket_number: ticket_number,
//         is_periodic_ticket: false
//       },
//       transaction
//     });

//     if (!ticket) {
//       await transaction.rollback();
//       return res.status(404).json({ 
//         success: false,
//         message: "التذكرة غير موجودة" 
//       });
//     }

//     // التحقق من صلاحية التذكرة
//     if (ticket.status !== 'confirmed') {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         success: false,
//         message: "التذكرة غير صالحة للاستخدام. الحالة: " + ticket.status
//       });
//     }

//     // التحقق إذا كانت مستخدمة مسبقاً
//     if (ticket.used_at) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         success: false,
//         message: "التذكرة مستخدمة مسبقاً" 
//       });
//     }

//     // تحديث التذكرة كمستخدمة
//     await ticket.update({
//       used_at: new Date(),
//       status: "used"
//     }, { transaction });

//     // تسجيل الاستخدام في المحطة
//     // يمكنك إضافة جدول منفصل لسجلات الاستخدام هنا

//     await transaction.commit();

//     res.json({
//       success: true,
//       message: "✅ تم استخدام التذكرة بنجاح",
//       ticket: {
//         ticket_number: ticket.ticket_number,
//         used_at: new Date(),
//         station_id: station_id,
//         status: "used"
//       }
//     });

//   } catch (err) {
//     await transaction.rollback();
//     console.error("Error in useRegularTicket:", err);
//     res.status(500).json({ 
//       success: false,
//       message: "خطأ في استخدام التذكرة", 
//       error: err.message 
//     });
//   }
// };

// // ✅ 8. إلغاء التذكرة العادية
// exports.cancelRegularTicket = async (req, res) => {
//   const transaction = await sequelize.transaction();
  
//   try {
//     const { ticket_id } = req.body;
//     const user_id = req.user.id;

//     if (!ticket_id) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         success: false,
//         message: "معرف التذكرة مطلوب" 
//       });
//     }

//     const ticket = await Ticket.findOne({
//       where: {
//         id: ticket_id,
//         user_id: user_id,
//         is_periodic_ticket: false
//       },
//       transaction
//     });

//     if (!ticket) {
//       await transaction.rollback();
//       return res.status(404).json({ 
//         success: false,
//         message: "التذكرة غير موجودة" 
//       });
//     }

//     // يمكن الإلغاء فقط إذا كانت في حالة pending أو confirmed
//     if (!['pending', 'confirmed'].includes(ticket.status)) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         success: false,
//         message: "لا يمكن إلغاء التذكرة في حالتها الحالية: " + ticket.status
//       });
//     }

//     // التحقق من الوقت (لا يمكن الإلغاء قبل ساعة من الرحلة)
//     const trip = await Trip.findByPk(ticket.trip_id, { transaction });
//     const now = new Date();
//     const oneHourBeforeTrip = new Date(trip.start_time.getTime() - (60 * 60 * 1000));
    
//     if (now > oneHourBeforeTrip) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         success: false,
//         message: "لا يمكن إلغاء التذكرة قبل ساعة من موعد الرحلة" 
//       });
//     }

//     // إلغاء التذكرة
//     await ticket.update({
//       status: "cancelled",
//       cancelled_at: new Date()
//     }, { transaction });

//     await transaction.commit();

//     res.json({
//       success: true,
//       message: "✅ تم إلغاء التذكرة بنجاح",
//       ticket: {
//         id: ticket.id,
//         ticket_number: ticket.ticket_number,
//         status: "cancelled",
//         refund_eligible: ticket.status === 'pending' // قد يكون مؤهلاً للاسترداد
//       }
//     });

//   } catch (err) {
//     await transaction.rollback();
//     console.error("Error in cancelRegularTicket:", err);
//     res.status(500).json({ 
//       success: false,
//       message: "خطأ في إلغاء التذكرة", 
//       error: err.message 
//     });
//   }
// };



const { Ticket, Trip, Line, Station, User, Train, sequelize } = require("../models");
const { Op } = require("sequelize");
const QRCode = require('qrcode');

// ✅ 1. جلب الرحلات العادية المتاحة
const getAvailableRegularTrips = async (req, res) => {
  try {
    const { date, line_id } = req.query;

    console.log("📅 Request date:", date);

    if (!date) {
      return res.status(400).json({ 
        success: false,
        message: "التاريخ مطلوب (YYYY-MM-DD)" 
      });
    }

    // 🔴 **الطريقة الصحيحة لبناء startOfDay:**
    // 1. افصل التاريخ
    const [year, month, day] = date.split('-').map(Number);
    
    // 2. أنشئ التاريخ مع التوقيت العالمي (UTC)
    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    console.log("📊 Date range (UTC):", {
      start_utc: startOfDay.toISOString(),
      end_utc: endOfDay.toISOString(),
      start_local: startOfDay.toLocaleString('ar-IQ'),
      end_local: endOfDay.toLocaleString('ar-IQ')
    });

    // 🔴 **أضف هذا للإصلاح:**
    // استخدم Op.gte و Op.lt بدلاً من Op.between
    let whereClause = {
      start_time: {
        [Op.gte]: startOfDay,
        [Op.lt]: new Date(startOfDay.getTime() + (24 * 60 * 60 * 1000)) // اليوم التالي
      },
      status: "on",
      is_auto_generated: false
    };

    if (line_id) {
      whereClause.line_id = line_id;
    }

    const trips = await Trip.findAll({
      where: whereClause,
      include: [
        {
          model: Line,
          attributes: ['id', 'line_name', 'price'],
          include: [{
            model: Station,
            through: { attributes: ["station_order"] },
            attributes: ["id", "name", "location"]
          }]
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

    if (trips.length === 0) {
      return res.json({
        success: true,
        message: `لا توجد رحلات عادية متاحة في تاريخ ${date}`,
        date: date,
        trips: [],
        count: 0
      });
    }

    const tripsWithAvailability = await Promise.all(
      trips.map(async (trip) => {
        const bookedTickets = await Ticket.sum('quantity', {
          where: { 
            trip_id: trip.id,
            status: { [Op.in]: ['pending', 'confirmed'] }
          }
        }) || 0;

        const availableSeats = trip.Train.capacity - bookedTickets;

        let lineStations = [];
        try {
          const lineWithStations = await Line.findByPk(trip.line_id, {
            include: [{
              model: Station,
              through: { attributes: ["station_order"] },
              attributes: ["id", "name", "location"]
            }]
          });
          
          if (lineWithStations && lineWithStations.Stations) {
            lineStations = lineWithStations.Stations.sort((a, b) => {
              return (a.LineStation?.station_order || 0) - (b.LineStation?.station_order || 0);
            });
          }
        } catch (error) {
          console.log("Error fetching stations:", error.message);
        }

        const tripTime = new Date(trip.start_time);
        const endTime = new Date(trip.end_time);
        
        return {
          id: trip.id,
          start_time: trip.start_time,
          end_time: trip.end_time,
          passenger_count: trip.passenger_count || 0,
          status: trip.status,
          available_seats: availableSeats,
          is_available: availableSeats > 0,
          line_stations: lineStations.map(station => ({
            id: station.id,
            name: station.name,
            location: station.location,
            order: station.LineStation?.station_order || 0
          })),
          Line: {
            id: trip.Line.id,
            line_name: trip.Line.line_name,
            price: trip.Line.price
          },
          Train: trip.Train,
          driver: trip.driver,
          departure_time: tripTime.toLocaleTimeString('ar-IQ', { 
            hour: '2-digit', 
            minute: '2-digit'
          }),
          arrival_time: endTime.toLocaleTimeString('ar-IQ', { 
            hour: '2-digit', 
            minute: '2-digit'
          }),
          duration: Math.round((endTime - tripTime) / (1000 * 60)) + ' دقيقة'
        };
      })
    );

    const availableTrips = tripsWithAvailability.filter(trip => trip.is_available);

    res.json({
      success: true,
      message: `تم العثور على ${availableTrips.length} رحلة عادية متاحة`,
      date: date,
      trips: availableTrips,
      count: availableTrips.length,
      summary: {
        total_trips: trips.length,
        available_trips: availableTrips.length
      }
    });

  } catch (err) {
    console.error("Error in getAvailableRegularTrips:", err);
    res.status(500).json({ 
      success: false,
      message: "خطأ في جلب الرحلات المتاحة", 
      error: err.message
    });
  }
};

// ✅ 2. حساب سعر التذكرة العادية
const calculateRegularPrice = async (req, res) => {
  try {
    const { trip_id, from_station_id, to_station_id, quantity = 1 } = req.body;

    if (!trip_id || !from_station_id || !to_station_id) {
      return res.status(400).json({ 
        success: false,
        message: "جميع الحقول مطلوبة: trip_id, from_station_id, to_station_id" 
      });
    }

    const trip = await Trip.findByPk(trip_id, {
      include: [
        {
          model: Line,
          attributes: ['id', 'line_name', 'price']
        }
      ]
    });

    if (!trip) {
      return res.status(404).json({ 
        success: false,
        message: "الرحلة غير موجودة" 
      });
    }

    if (trip.is_auto_generated) {
      return res.status(400).json({ 
        success: false,
        message: "هذه رحلة شهرية" 
      });
    }

    const basePrice = parseFloat(trip.Line.price);
    const totalPrice = basePrice * parseInt(quantity);

    res.json({
      success: true,
      message: "تم حساب السعر",
      price_details: {
        trip_id: trip.id,
        line_name: trip.Line.line_name,
        from_station_id: from_station_id,
        to_station_id: to_station_id,
        base_price: basePrice,
        quantity: parseInt(quantity),
        total_price: totalPrice
      }
    });

  } catch (err) {
    console.error("Error in calculateRegularPrice:", err);
    res.status(500).json({ 
      success: false,
      message: "خطأ في حساب السعر", 
      error: err.message
    });
  }
};

// ✅ 3. حجز التذكرة العادية
const bookRegularTicket = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const user_id = req.user.id;
    const { trip_id, from_station_id, to_station_id, quantity = 1 } = req.body;

    if (!trip_id || !from_station_id || !to_station_id) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false,
        message: "جميع الحقول مطلوبة" 
      });
    }

    const trip = await Trip.findByPk(trip_id, {
      include: [
        {
          model: Line,
          attributes: ['id', 'line_name', 'price']
        },
        {
          model: Train,
          attributes: ['id', 'version_number', 'capacity']
        }
      ],
      transaction
    });

    if (!trip) {
      await transaction.rollback();
      return res.status(404).json({ 
        success: false,
        message: "الرحلة غير موجودة" 
      });
    }

    if (trip.is_auto_generated) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false,
        message: "هذه رحلة شهرية" 
      });
    }

    if (trip.status !== "on") {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false,
        message: "الرحلة غير متاحة" 
      });
    }

    const fromStation = await Station.findByPk(from_station_id, { transaction });
    const toStation = await Station.findByPk(to_station_id, { transaction });

    if (!fromStation || !toStation) {
      await transaction.rollback();
      return res.status(404).json({ 
        success: false,
        message: "إحدى المحطات غير موجودة" 
      });
    }

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
        success: false,
        message: "لا توجد مقاعد كافية" 
      });
    }

    const basePrice = parseFloat(trip.Line.price);
    const totalPrice = basePrice * quantity;

    const ticketNumber = `REGULAR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const ticket = await Ticket.create({
      user_id,
      trip_id,
      line_id: trip.line_id,
      from_station_id,
      to_station_id,
      purchase_date: new Date(),
      price: basePrice,
      quantity,
      total_price: totalPrice,
      original_price: totalPrice,
      status: "pending",
      ticket_number: ticketNumber,
      discount_type: "none",
      discount_percentage: 0,
      is_periodic_ticket: false,
      is_weekly_pass: false,
      is_monthly_pass: false
    }, { transaction });

    const regular_ticket_group = `REGULAR-GROUP-${Date.now()}-${ticket.id}`;

    await ticket.update({
      periodic_ticket_number: regular_ticket_group
    }, { transaction });

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: "تم حجز التذكرة",
      ticket: {
        id: ticket.id,
        ticket_number: ticket.ticket_number,
        regular_ticket_group: regular_ticket_group,
        quantity: ticket.quantity,
        total_price: ticket.total_price,
        status: ticket.status
      },
      payment_required: true,
      next_step: {
        endpoint: "POST /api/payments/create-session",
        body: { 
          regular_ticket_group: regular_ticket_group
        }
      }
    });

  } catch (err) {
    await transaction.rollback();
    console.error("Error in bookRegularTicket:", err);
    res.status(500).json({ 
      success: false,
      message: "خطأ في الحجز", 
      error: err.message 
    });
  }
};

// ✅ 4. جلب تذاكري العادية
const getMyRegularTickets = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { status, date } = req.query;

    let whereClause = {
      user_id,
      is_periodic_ticket: false
    };

    if (status && ['pending', 'confirmed', 'used', 'cancelled'].includes(status)) {
      whereClause.status = status;
    }

    if (date) {
      const filterDate = new Date(date);
      const nextDay = new Date(filterDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      whereClause.purchase_date = {
        [Op.gte]: filterDate,
        [Op.lt]: nextDay
      };
    }

    const tickets = await Ticket.findAll({
      where: whereClause,
      include: [
        {
          model: Trip,
          attributes: ['id', 'start_time', 'end_time', 'status'],
          include: [
            {
              model: Line,
              attributes: ['id', 'line_name']
            },
            {
              model: Train,
              attributes: ['id', 'version_number']
            }
          ]
        },
        {
          model: Station,
          as: "from_station",
          attributes: ['id', 'name']
        },
        {
          model: Station,
          as: "to_station",
          attributes: ['id', 'name']
        }
      ],
      order: [['purchase_date', 'DESC']]
    });

    const stats = {
      total_tickets: tickets.length,
      pending_tickets: tickets.filter(t => t.status === 'pending').length,
      confirmed_tickets: tickets.filter(t => t.status === 'confirmed').length,
      used_tickets: tickets.filter(t => t.status === 'used').length,
      cancelled_tickets: tickets.filter(t => t.status === 'cancelled').length
    };

    res.json({
      success: true,
      message: "تم جلب التذاكر",
      tickets: tickets,
      count: tickets.length,
      stats: stats
    });

  } catch (err) {
    console.error("Error in getMyRegularTickets:", err);
    res.status(500).json({ 
      success: false,
      message: "خطأ في جلب التذاكر", 
      error: err.message 
    });
  }
};

// ✅ 5. تفعيل التذكرة العادية
const activateRegularTicket = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { regular_ticket_group } = req.body;

    if (!regular_ticket_group) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false,
        message: "رقم المجموعة مطلوب" 
      });
    }

    const ticket = await Ticket.findOne({
      where: {
        periodic_ticket_number: regular_ticket_group,
        is_periodic_ticket: false,
        status: 'pending'
      },
      transaction
    });

    if (!ticket) {
      await transaction.rollback();
      return res.status(404).json({ 
        success: false,
        message: "التذكرة غير موجودة" 
      });
    }

    const qrData = JSON.stringify({
      ticket_id: ticket.id,
      ticket_number: ticket.ticket_number,
      user_id: ticket.user_id,
      trip_id: ticket.trip_id,
      from_station_id: ticket.from_station_id,
      to_station_id: ticket.to_station_id
    });

    const qrCode = await QRCode.toDataURL(qrData);

    await ticket.update({
      status: "confirmed",
      qr_code: qrCode,
      confirmed_at: new Date(),
      payment_reference: `regular_${Date.now()}`
    }, { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: "تم تفعيل التذكرة",
      ticket: {
        id: ticket.id,
        ticket_number: ticket.ticket_number,
        status: "confirmed",
        has_qr: true
      }
    });

  } catch (err) {
    await transaction.rollback();
    console.error("Error in activateRegularTicket:", err);
    res.status(500).json({ 
      success: false,
      message: "خطأ في التفعيل", 
      error: err.message 
    });
  }
};

// ✅ 6. التحقق من التذكرة
const validateRegularTicket = async (req, res) => {
  try {
    const { ticket_number } = req.body;

    if (!ticket_number) {
      return res.status(400).json({ 
        success: false,
        message: "رقم التذكرة مطلوب" 
      });
    }

    const ticket = await Ticket.findOne({
      where: { 
        ticket_number: ticket_number,
        is_periodic_ticket: false
      },
      include: [
        {
          model: Trip,
          attributes: ['id', 'start_time', 'status']
        }
      ]
    });

    if (!ticket) {
      return res.status(404).json({ 
        success: false,
        message: "التذكرة غير موجودة" 
      });
    }

    if (ticket.status !== 'confirmed') {
      return res.json({
        success: false,
        valid: false,
        message: "التذكرة غير مفعلة"
      });
    }

    res.json({
      success: true,
      valid: true,
      message: "التذكرة صالحة",
      ticket: {
        ticket_number: ticket.ticket_number,
        status: ticket.status
      }
    });

  } catch (err) {
    console.error("Error in validateRegularTicket:", err);
    res.status(500).json({ 
      success: false,
      message: "خطأ في التحقق", 
      error: err.message 
    });
  }
};

// ✅ 7. استخدام التذكرة
const useRegularTicket = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { ticket_number } = req.body;

    if (!ticket_number) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false,
        message: "رقم التذكرة مطلوب" 
      });
    }

    const ticket = await Ticket.findOne({
      where: { 
        ticket_number: ticket_number,
        is_periodic_ticket: false
      },
      transaction
    });

    if (!ticket) {
      await transaction.rollback();
      return res.status(404).json({ 
        success: false,
        message: "التذكرة غير موجودة" 
      });
    }

    if (ticket.status !== 'confirmed') {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false,
        message: "التذكرة غير صالحة" 
      });
    }

    await ticket.update({
      used_at: new Date(),
      status: "used"
    }, { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: "تم استخدام التذكرة",
      ticket: {
        ticket_number: ticket.ticket_number,
        used_at: new Date(),
        status: "used"
      }
    });

  } catch (err) {
    await transaction.rollback();
    console.error("Error in useRegularTicket:", err);
    res.status(500).json({ 
      success: false,
      message: "خطأ في الاستخدام", 
      error: err.message 
    });
  }
};

// ✅ 8. إلغاء التذكرة
const cancelRegularTicket = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { ticket_id } = req.body;
    const user_id = req.user.id;

    if (!ticket_id) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false,
        message: "معرف التذكرة مطلوب" 
      });
    }

    const ticket = await Ticket.findOne({
      where: {
        id: ticket_id,
        user_id: user_id,
        is_periodic_ticket: false
      },
      transaction
    });

    if (!ticket) {
      await transaction.rollback();
      return res.status(404).json({ 
        success: false,
        message: "التذكرة غير موجودة" 
      });
    }

    if (!['pending', 'confirmed'].includes(ticket.status)) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false,
        message: "لا يمكن الإلغاء" 
      });
    }

    await ticket.update({
      status: "cancelled",
      cancelled_at: new Date()
    }, { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: "تم الإلغاء",
      ticket: {
        id: ticket.id,
        ticket_number: ticket.ticket_number,
        status: "cancelled"
      }
    });

  } catch (err) {
    await transaction.rollback();
    console.error("Error in cancelRegularTicket:", err);
    res.status(500).json({ 
      success: false,
      message: "خطأ في الإلغاء", 
      error: err.message 
    });
  }
};

// ✅ التصدير
module.exports = {
  getAvailableRegularTrips,
  calculateRegularPrice,
  bookRegularTicket,
  getMyRegularTickets,
  activateRegularTicket,
  validateRegularTicket,
  useRegularTicket,
  cancelRegularTicket
};