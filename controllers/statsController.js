// // controllers/statsController.js - الكود الكامل بعد التعديل

// const { User, Ticket, Trip, Line, sequelize } = require("../models");
// const { Op, QueryTypes } = require("sequelize");

// // ✅ جلب إحصائيات المستخدمين (أعداد حسب النوع)
// exports.getUserStats = async (req, res) => {
//   try {
//     // التحقق من الصلاحيات - فقط userType 2 (سوبر أدمن) يمكنه الوصول
//     if (req.user.userType !== 2) {
//       return res.status(403).json({ 
//         message: "ليس لديك صلاحية للوصول إلى هذه الإحصائيات" 
//       });
//     }

//     // جلب أعداد المستخدمين حسب النوع
//     const userStats = await User.findAll({
//       attributes: [
//         'userType',
//         [sequelize.fn('COUNT', sequelize.col('id')), 'count']
//       ],
//       where: {
//         userType: { [Op.in]: [1, 3, 4, 5] } // فقط الأنواع المطلوبة
//       },
//       group: ['userType'],
//       raw: true
//     });

//     // تنسيق البيانات بشكل واضح
//     const formattedStats = {
//       total_passengers: 0,
//       total_station_admins: 0,
//       total_technicians: 0,
//       total_drivers: 0,
//       total_users: 0,
//       details: {}
//     };

//     userStats.forEach(stat => {
//       const count = parseInt(stat.count);
      
//       switch(stat.userType) {
//         case 1:
//           formattedStats.total_passengers = count;
//           formattedStats.details.passengers = count;
//           break;
//         case 3:
//           formattedStats.total_station_admins = count;
//           formattedStats.details.station_admins = count;
//           break;
//         case 4:
//           formattedStats.total_technicians = count;
//           formattedStats.details.technicians = count;
//           break;
//         case 5:
//           formattedStats.total_drivers = count;
//           formattedStats.details.drivers = count;
//           break;
//       }
      
//       formattedStats.total_users += count;
//     });

//     res.json({
//       message: "تم جلب إحصائيات المستخدمين بنجاح",
//       stats: formattedStats,
//       raw_data: userStats
//     });

//   } catch (err) {
//     console.error("Error in getUserStats:", err);
//     res.status(500).json({ 
//       message: "خطأ في جلب إحصائيات المستخدمين", 
//       error: err.message 
//     });
//   }
// };

// // ✅ جلب إحصائيات التذاكر (الشهرية والعادية)
// exports.getTicketStats = async (req, res) => {
//   try {
//     // التحقق من الصلاحيات - فقط userType 2 (سوبر أدمن) و 3 (مشرف) يمكنهم الوصول
//     if (![2, 3].includes(req.user.userType)) {
//       return res.status(403).json({ 
//         message: "ليس لديك صلاحية للوصول إلى هذه الإحصائيات" 
//       });
//     }

//     // جلب إحصائيات التذاكر الشهرية
//     const monthlyTickets = await Ticket.findAll({
//       where: {
//         is_monthly_pass: true,
//         status: 'confirmed'
//       },
//       attributes: [
//         [sequelize.fn('COUNT', sequelize.col('id')), 'total_count'],
//         [sequelize.fn('SUM', sequelize.col('quantity')), 'total_quantity'],
//         [sequelize.fn('SUM', sequelize.col('total_price')), 'total_revenue']
//       ],
//       raw: true
//     });

//     // جلب إحصائيات التذاكر الأسبوعية
//     const weeklyTickets = await Ticket.findAll({
//       where: {
//         is_weekly_pass: true,
//         status: 'confirmed'
//       },
//       attributes: [
//         [sequelize.fn('COUNT', sequelize.col('id')), 'total_count'],
//         [sequelize.fn('SUM', sequelize.col('quantity')), 'total_quantity'],
//         [sequelize.fn('SUM', sequelize.col('total_price')), 'total_revenue']
//       ],
//       raw: true
//     });

//     // جلب إحصائيات التذاكر العادية
//     const normalTickets = await Ticket.findAll({
//       where: {
//         is_monthly_pass: false,
//         is_weekly_pass: false,
//         status: 'confirmed'
//       },
//       attributes: [
//         [sequelize.fn('COUNT', sequelize.col('id')), 'total_count'],
//         [sequelize.fn('SUM', sequelize.col('quantity')), 'total_quantity'],
//         [sequelize.fn('SUM', sequelize.col('total_price')), 'total_revenue']
//       ],
//       raw: true
//     });

//     // جلب إجمالي التذاكر
//     const allTickets = await Ticket.findAll({
//       where: {
//         status: 'confirmed'
//       },
//       attributes: [
//         [sequelize.fn('COUNT', sequelize.col('id')), 'total_count'],
//         [sequelize.fn('SUM', sequelize.col('quantity')), 'total_quantity'],
//         [sequelize.fn('SUM', sequelize.col('total_price')), 'total_revenue']
//       ],
//       raw: true
//     });

//     // تنسيق البيانات
//     const formattedStats = {
//       monthly_tickets: {
//         count: parseInt(monthlyTickets[0]?.total_count || 0),
//         quantity: parseInt(monthlyTickets[0]?.total_quantity || 0),
//         revenue: parseFloat(monthlyTickets[0]?.total_revenue || 0).toFixed(2)
//       },
//       weekly_tickets: {
//         count: parseInt(weeklyTickets[0]?.total_count || 0),
//         quantity: parseInt(weeklyTickets[0]?.total_quantity || 0),
//         revenue: parseFloat(weeklyTickets[0]?.total_revenue || 0).toFixed(2)
//       },
//       normal_tickets: {
//         count: parseInt(normalTickets[0]?.total_count || 0),
//         quantity: parseInt(normalTickets[0]?.total_quantity || 0),
//         revenue: parseFloat(normalTickets[0]?.total_revenue || 0).toFixed(2)
//       },
//       all_tickets: {
//         count: parseInt(allTickets[0]?.total_count || 0),
//         quantity: parseInt(allTickets[0]?.total_quantity || 0),
//         revenue: parseFloat(allTickets[0]?.total_revenue || 0).toFixed(2)
//       }
//     };

//     res.json({
//       message: "تم جلب إحصائيات التذاكر بنجاح",
//       stats: formattedStats
//     });

//   } catch (err) {
//     console.error("Error in getTicketStats:", err);
//     res.status(500).json({ 
//       message: "خطأ في جلب إحصائيات التذاكر", 
//       error: err.message 
//     });
//   }
// };

// // ✅ جلب إحصائيات الرحلات
// exports.getTripStats = async (req, res) => {
//   try {
//     // التحقق من الصلاحيات - فقط userType 2 (سوبر أدمن) و 3 (مشرف) يمكنهم الوصول
//     if (![2, 3].includes(req.user.userType)) {
//       return res.status(403).json({ 
//         message: "ليس لديك صلاحية للوصول إلى هذه الإحصائيات" 
//       });
//     }

//     // جلب عدد الرحلات في كل خط
//     const tripsByLine = await Trip.findAll({
//       attributes: [
//         'line_id',
//         [sequelize.fn('COUNT', sequelize.col('id')), 'trip_count']
//       ],
//       group: ['line_id'],
//       include: [{
//         model: Line,
//         attributes: ['id', 'line_name']
//       }],
//       raw: false
//     });

//     // تنسيق بيانات الرحلات حسب الخط
//     const formattedTripsByLine = tripsByLine.map(item => ({
//       line_id: item.line_id,
//       line_name: item.Line?.line_name || 'غير معروف',
//       trip_count: parseInt(item.dataValues.trip_count)
//     }));

//     // 🔴 تصحيح الاستعلام - استخدام tr.id بدل t.id
//     const mostPopularTrips = await sequelize.query(`
//       SELECT 
//         tr.id as trip_id,
//         tr.start_time,
//         l.line_name,
//         COUNT(tk.id) as booking_count,
//         SUM(tk.quantity) as total_tickets,
//         SUM(tk.total_price) as total_revenue
//       FROM tickets tk
//       JOIN trips tr ON tk.trip_id = tr.id
//       JOIN lines l ON tr.line_id = l.id
//       WHERE tk.status = 'confirmed'
//       GROUP BY tr.id, tr.start_time, l.line_name
//       ORDER BY booking_count DESC
//       LIMIT 10
//     `, {
//       type: QueryTypes.SELECT,
//       replacements: { status: 'confirmed' }
//     });

//     // جلب إحصائيات عامة للرحلات
//       const generalTripStats = await Trip.findAll({
//       attributes: [
//         [sequelize.fn('COUNT', sequelize.col('Trip.id')), 'total_trips'],
//         [sequelize.fn('SUM', sequelize.col('Trip.passenger_count')), 'total_passengers'],
//         [sequelize.fn('SUM', sequelize.literal('CASE WHEN Trip.status = "on" THEN 1 ELSE 0 END')), 'active_trips'],
//         [sequelize.fn('SUM', sequelize.literal('CASE WHEN Trip.status = "off" THEN 1 ELSE 0 END')), 'inactive_trips']
//       ],
//       raw: true
//     });

//     res.json({
//       message: "تم جلب إحصائيات الرحلات بنجاح",
//       stats: {
//         trips_by_line: formattedTripsByLine,
//         most_popular_trips: mostPopularTrips,
//         general: {
//           total_trips: parseInt(generalTripStats[0]?.total_trips || 0),
//           total_passengers: parseInt(generalTripStats[0]?.total_passengers || 0),
//           active_trips: parseInt(generalTripStats[0]?.active_trips || 0),
//           inactive_trips: parseInt(generalTripStats[0]?.inactive_trips || 0)
//         }
//       }
//     });

//   } catch (err) {
//     console.error("Error in getTripStats:", err);
//     res.status(500).json({ 
//       message: "خطأ في جلب إحصائيات الرحلات", 
//       error: err.message 
//     });
//   }
// };

// // ✅ جلب جميع الإحصائيات في API واحدة
// exports.getAllStats = async (req, res) => {
//   try {
//     // التحقق من الصلاحيات - فقط userType 2 (سوبر أدمن) يمكنه الوصول
//     if (req.user.userType !== 2) {
//       return res.status(403).json({ 
//         message: "ليس لديك صلاحية للوصول إلى جميع الإحصائيات" 
//       });
//     }

//     // جلب إحصائيات المستخدمين
//     const userStatsQuery = User.findAll({
//       attributes: [
//         'userType',
//         [sequelize.fn('COUNT', sequelize.col('id')), 'count']
//       ],
//       where: {
//         userType: { [Op.in]: [1, 3, 4, 5] }
//       },
//       group: ['userType'],
//       raw: true
//     });

//     // جلب إحصائيات التذاكر
//     const monthlyTicketsQuery = Ticket.findAll({
//       where: {
//         is_monthly_pass: true,
//         status: 'confirmed'
//       },
//       attributes: [
//         [sequelize.fn('COUNT', sequelize.col('id')), 'total_count'],
//         [sequelize.fn('SUM', sequelize.col('quantity')), 'total_quantity'],
//         [sequelize.fn('SUM', sequelize.col('total_price')), 'total_revenue']
//       ],
//       raw: true
//     });

//     const weeklyTicketsQuery = Ticket.findAll({
//       where: {
//         is_weekly_pass: true,
//         status: 'confirmed'
//       },
//       attributes: [
//         [sequelize.fn('COUNT', sequelize.col('id')), 'total_count'],
//         [sequelize.fn('SUM', sequelize.col('quantity')), 'total_quantity'],
//         [sequelize.fn('SUM', sequelize.col('total_price')), 'total_revenue']
//       ],
//       raw: true
//     });

//     const normalTicketsQuery = Ticket.findAll({
//       where: {
//         is_monthly_pass: false,
//         is_weekly_pass: false,
//         status: 'confirmed'
//       },
//       attributes: [
//         [sequelize.fn('COUNT', sequelize.col('id')), 'total_count'],
//         [sequelize.fn('SUM', sequelize.col('quantity')), 'total_quantity'],
//         [sequelize.fn('SUM', sequelize.col('total_price')), 'total_revenue']
//       ],
//       raw: true
//     });

//     const allTicketsQuery = Ticket.findAll({
//       where: {
//         status: 'confirmed'
//       },
//       attributes: [
//         [sequelize.fn('COUNT', sequelize.col('id')), 'total_count'],
//         [sequelize.fn('SUM', sequelize.col('quantity')), 'total_quantity'],
//         [sequelize.fn('SUM', sequelize.col('total_price')), 'total_revenue']
//       ],
//       raw: true
//     });

//     // جلب إحصائيات الرحلات
//     const tripsByLineQuery = Trip.findAll({
//       attributes: [
//         'line_id',
//         [sequelize.fn('COUNT', sequelize.col('id')), 'trip_count']
//       ],
//       group: ['line_id'],
//       include: [{
//         model: Line,
//         attributes: ['id', 'line_name']
//       }],
//       raw: false
//     });

//     const generalTripStatsQuery = Trip.findAll({
//       attributes: [
//         [sequelize.fn('COUNT', sequelize.col('id')), 'total_trips'],
//         [sequelize.fn('SUM', sequelize.col('passenger_count')), 'total_passengers'],
//         [sequelize.fn('SUM', sequelize.literal('CASE WHEN status = "on" THEN 1 ELSE 0 END')), 'active_trips'],
//         [sequelize.fn('SUM', sequelize.literal('CASE WHEN status = "off" THEN 1 ELSE 0 END')), 'inactive_trips']
//       ],
//       raw: true
//     });

//     // تنفيذ جميع الاستعلامات في نفس الوقت
//     const [
//       userStats,
//       monthlyTickets,
//       weeklyTickets,
//       normalTickets,
//       allTickets,
//       tripsByLine,
//       generalTripStats
//     ] = await Promise.all([
//       userStatsQuery,
//       monthlyTicketsQuery,
//       weeklyTicketsQuery,
//       normalTicketsQuery,
//       allTicketsQuery,
//       tripsByLineQuery,
//       generalTripStatsQuery
//     ]);

//     // تنسيق إحصائيات المستخدمين
//     const userStatsFormatted = {
//       total_passengers: 0,
//       total_station_admins: 0,
//       total_technicians: 0,
//       total_drivers: 0,
//       total_users: 0,
//       details: {}
//     };

//     userStats.forEach(stat => {
//       const count = parseInt(stat.count);
      
//       switch(stat.userType) {
//         case 1:
//           userStatsFormatted.total_passengers = count;
//           userStatsFormatted.details.passengers = count;
//           break;
//         case 3:
//           userStatsFormatted.total_station_admins = count;
//           userStatsFormatted.details.station_admins = count;
//           break;
//         case 4:
//           userStatsFormatted.total_technicians = count;
//           userStatsFormatted.details.technicians = count;
//           break;
//         case 5:
//           userStatsFormatted.total_drivers = count;
//           userStatsFormatted.details.drivers = count;
//           break;
//       }
      
//       userStatsFormatted.total_users += count;
//     });

//     // تنسيق إحصائيات التذاكر
//     const ticketStatsFormatted = {
//       monthly_tickets: {
//         count: parseInt(monthlyTickets[0]?.total_count || 0),
//         quantity: parseInt(monthlyTickets[0]?.total_quantity || 0),
//         revenue: parseFloat(monthlyTickets[0]?.total_revenue || 0).toFixed(2)
//       },
//       weekly_tickets: {
//         count: parseInt(weeklyTickets[0]?.total_count || 0),
//         quantity: parseInt(weeklyTickets[0]?.total_quantity || 0),
//         revenue: parseFloat(weeklyTickets[0]?.total_revenue || 0).toFixed(2)
//       },
//       normal_tickets: {
//         count: parseInt(normalTickets[0]?.total_count || 0),
//         quantity: parseInt(normalTickets[0]?.total_quantity || 0),
//         revenue: parseFloat(normalTickets[0]?.total_revenue || 0).toFixed(2)
//       },
//       all_tickets: {
//         count: parseInt(allTickets[0]?.total_count || 0),
//         quantity: parseInt(allTickets[0]?.total_quantity || 0),
//         revenue: parseFloat(allTickets[0]?.total_revenue || 0).toFixed(2)
//       }
//     };

//     // تنسيق بيانات الرحلات حسب الخط
//     const tripsByLineFormatted = tripsByLine.map(item => ({
//       line_id: item.line_id,
//       line_name: item.Line?.line_name || 'غير معروف',
//       trip_count: parseInt(item.dataValues.trip_count)
//     }));

//     res.json({
//       message: "تم جلب جميع الإحصائيات بنجاح",
//       stats: {
//         users: userStatsFormatted,
//         tickets: ticketStatsFormatted,
//         trips: {
//           trips_by_line: tripsByLineFormatted,
//           general: {
//             total_trips: parseInt(generalTripStats[0]?.total_trips || 0),
//             total_passengers: parseInt(generalTripStats[0]?.total_passengers || 0),
//             active_trips: parseInt(generalTripStats[0]?.active_trips || 0),
//             inactive_trips: parseInt(generalTripStats[0]?.inactive_trips || 0)
//           }
//         },
//         summary: {
//           total_revenue: parseFloat(ticketStatsFormatted.all_tickets.revenue),
//           total_users: userStatsFormatted.total_users,
//           total_trips: parseInt(generalTripStats[0]?.total_trips || 0),
//           total_tickets: ticketStatsFormatted.all_tickets.quantity
//         }
//       }
//     });

//   } catch (err) {
//     console.error("Error in getAllStats:", err);
//     res.status(500).json({ 
//       message: "خطأ في جلب الإحصائيات", 
//       error: err.message 
//     });
//   }
// };


// controllers/statsController.js - الكود الكامل المصحح مع SQL صحيح

const { User, Ticket, Trip, Line, sequelize } = require("../models");
const { Op, QueryTypes } = require("sequelize");

// ✅ جلب إحصائيات المستخدمين (أعداد حسب النوع)
exports.getUserStats = async (req, res) => {
  try {
    // التحقق من الصلاحيات - فقط userType 2 (سوبر أدمن) يمكنه الوصول
    if (req.user.userType !== 2) {
      return res.status(403).json({ 
        message: "ليس لديك صلاحية للوصول إلى هذه الإحصائيات" 
      });
    }

    // جلب أعداد المستخدمين حسب النوع
    const userStats = await User.findAll({
      attributes: [
        'userType',
        [sequelize.fn('COUNT', sequelize.col('User.id')), 'count']
      ],
      where: {
        userType: { [Op.in]: [1, 3, 4, 5] }
      },
      group: ['userType'],
      raw: true
    });

    // تنسيق البيانات بشكل واضح
    const formattedStats = {
      total_passengers: 0,
      total_station_admins: 0,
      total_technicians: 0,
      total_drivers: 0,
      total_users: 0,
      details: {}
    };

    userStats.forEach(stat => {
      const count = parseInt(stat.count);
      
      switch(stat.userType) {
        case 1:
          formattedStats.total_passengers = count;
          formattedStats.details.passengers = count;
          break;
        case 3:
          formattedStats.total_station_admins = count;
          formattedStats.details.station_admins = count;
          break;
        case 4:
          formattedStats.total_technicians = count;
          formattedStats.details.technicians = count;
          break;
        case 5:
          formattedStats.total_drivers = count;
          formattedStats.details.drivers = count;
          break;
      }
      
      formattedStats.total_users += count;
    });

    res.json({
      message: "تم جلب إحصائيات المستخدمين بنجاح",
      stats: formattedStats,
      raw_data: userStats
    });

  } catch (err) {
    console.error("Error in getUserStats:", err);
    res.status(500).json({ 
      message: "خطأ في جلب إحصائيات المستخدمين", 
      error: err.message 
    });
  }
};

// ✅ جلب إحصائيات التذاكر (الشهرية والعادية)
exports.getTicketStats = async (req, res) => {
  try {
    // التحقق من الصلاحيات - فقط userType 2 (سوبر أدمن) و 3 (مشرف) يمكنهم الوصول
    if (![2, 3].includes(req.user.userType)) {
      return res.status(403).json({ 
        message: "ليس لديك صلاحية للوصول إلى هذه الإحصائيات" 
      });
    }

    // جلب إحصائيات التذاكر الشهرية
    const monthlyTickets = await Ticket.findAll({
      where: {
        is_monthly_pass: true,
        status: 'confirmed'
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('Ticket.id')), 'total_count'],
        [sequelize.fn('SUM', sequelize.col('Ticket.quantity')), 'total_quantity'],
        [sequelize.fn('SUM', sequelize.col('Ticket.total_price')), 'total_revenue']
      ],
      raw: true
    });

    // جلب إحصائيات التذاكر الأسبوعية
    const weeklyTickets = await Ticket.findAll({
      where: {
        is_weekly_pass: true,
        status: 'confirmed'
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('Ticket.id')), 'total_count'],
        [sequelize.fn('SUM', sequelize.col('Ticket.quantity')), 'total_quantity'],
        [sequelize.fn('SUM', sequelize.col('Ticket.total_price')), 'total_revenue']
      ],
      raw: true
    });

    // جلب إحصائيات التذاكر العادية
    const normalTickets = await Ticket.findAll({
      where: {
        is_monthly_pass: false,
        is_weekly_pass: false,
        status: 'confirmed'
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('Ticket.id')), 'total_count'],
        [sequelize.fn('SUM', sequelize.col('Ticket.quantity')), 'total_quantity'],
        [sequelize.fn('SUM', sequelize.col('Ticket.total_price')), 'total_revenue']
      ],
      raw: true
    });

    // جلب إجمالي التذاكر
    const allTickets = await Ticket.findAll({
      where: {
        status: 'confirmed'
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('Ticket.id')), 'total_count'],
        [sequelize.fn('SUM', sequelize.col('Ticket.quantity')), 'total_quantity'],
        [sequelize.fn('SUM', sequelize.col('Ticket.total_price')), 'total_revenue']
      ],
      raw: true
    });

    // تنسيق البيانات
    const formattedStats = {
      monthly_tickets: {
        count: parseInt(monthlyTickets[0]?.total_count || 0),
        quantity: parseInt(monthlyTickets[0]?.total_quantity || 0),
        revenue: parseFloat(monthlyTickets[0]?.total_revenue || 0).toFixed(2)
      },
      weekly_tickets: {
        count: parseInt(weeklyTickets[0]?.total_count || 0),
        quantity: parseInt(weeklyTickets[0]?.total_quantity || 0),
        revenue: parseFloat(weeklyTickets[0]?.total_revenue || 0).toFixed(2)
      },
      normal_tickets: {
        count: parseInt(normalTickets[0]?.total_count || 0),
        quantity: parseInt(normalTickets[0]?.total_quantity || 0),
        revenue: parseFloat(normalTickets[0]?.total_revenue || 0).toFixed(2)
      },
      all_tickets: {
        count: parseInt(allTickets[0]?.total_count || 0),
        quantity: parseInt(allTickets[0]?.total_quantity || 0),
        revenue: parseFloat(allTickets[0]?.total_revenue || 0).toFixed(2)
      }
    };

    res.json({
      message: "تم جلب إحصائيات التذاكر بنجاح",
      stats: formattedStats
    });

  } catch (err) {
    console.error("Error in getTicketStats:", err);
    res.status(500).json({ 
      message: "خطأ في جلب إحصائيات التذاكر", 
      error: err.message 
    });
  }
};

// ✅ جلب إحصائيات الرحلات
exports.getTripStats = async (req, res) => {
  try {
    // التحقق من الصلاحيات - فقط userType 2 (سوبر أدمن) و 3 (مشرف) يمكنهم الوصول
    if (![2, 3].includes(req.user.userType)) {
      return res.status(403).json({ 
        message: "ليس لديك صلاحية للوصول إلى هذه الإحصائيات" 
      });
    }

    // 🔴 جلب عدد الرحلات في كل خط - باستخدام Sequelize بدون JOIN معقد
    const tripsByLine = await Trip.findAll({
      attributes: [
        'line_id',
        [sequelize.fn('COUNT', sequelize.col('Trip.id')), 'trip_count']
      ],
      group: ['line_id'],
      raw: true
    });

    // جلب أسماء الخطوط
    const lines = await Line.findAll({
      attributes: ['id', 'line_name'],
      raw: true
    });

    // دمج البيانات
    const formattedTripsByLine = tripsByLine.map(trip => {
      const line = lines.find(l => l.id === trip.line_id);
      return {
        line_id: trip.line_id,
        line_name: line?.line_name || 'غير معروف',
        trip_count: parseInt(trip.trip_count)
      };
    });

    // 🔴 جلب أكثر الرحلات طلباً - باستخدام SQL مع علامات الرفع المناسبة
    const mostPopularTrips = await sequelize.query(
      `SELECT 
        tr.id as trip_id,
        tr.start_time,
        l.line_name,
        COUNT(tk.id) as booking_count,
        SUM(tk.quantity) as total_tickets,
        SUM(tk.total_price) as total_revenue
      FROM tickets tk
      JOIN trips tr ON tk.trip_id = tr.id
      JOIN \`lines\` l ON tr.line_id = l.id
      WHERE tk.status = 'confirmed'
      GROUP BY tr.id, tr.start_time, l.line_name
      ORDER BY booking_count DESC
      LIMIT 10`,
      {
        type: QueryTypes.SELECT
      }
    );

    // 🔴 جلب إحصائيات عامة للرحلات باستخدام Sequelize بسيط
    const generalTripStats = await Trip.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('Trip.id')), 'total_trips'],
        [sequelize.fn('SUM', sequelize.col('Trip.passenger_count')), 'total_passengers'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN Trip.status = "on" THEN 1 ELSE 0 END')), 'active_trips'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN Trip.status = "off" THEN 1 ELSE 0 END')), 'inactive_trips']
      ],
      raw: true
    });

    res.json({
      message: "تم جلب إحصائيات الرحلات بنجاح",
      stats: {
        trips_by_line: formattedTripsByLine,
        most_popular_trips: mostPopularTrips,
        general: {
          total_trips: parseInt(generalTripStats[0]?.total_trips || 0),
          total_passengers: parseInt(generalTripStats[0]?.total_passengers || 0),
          active_trips: parseInt(generalTripStats[0]?.active_trips || 0),
          inactive_trips: parseInt(generalTripStats[0]?.inactive_trips || 0)
        }
      }
    });

  } catch (err) {
    console.error("Error in getTripStats:", err);
    res.status(500).json({ 
      message: "خطأ في جلب إحصائيات الرحلات", 
      error: err.message 
    });
  }
};

// ✅ جلب جميع الإحصائيات في API واحدة
exports.getAllStats = async (req, res) => {
  try {
    // التحقق من الصلاحيات - فقط userType 2 (سوبر أدمن) يمكنه الوصول
    if (req.user.userType !== 2) {
      return res.status(403).json({ 
        message: "ليس لديك صلاحية للوصول إلى جميع الإحصائيات" 
      });
    }

    // 1. إحصائيات المستخدمين باستخدام Sequelize
    const userStats = await User.findAll({
      attributes: [
        'userType',
        [sequelize.fn('COUNT', sequelize.col('User.id')), 'count']
      ],
      where: {
        userType: { [Op.in]: [1, 3, 4, 5] }
      },
      group: ['userType'],
      raw: true
    });

    // 2. إحصائيات التذاكر باستخدام Sequelize
    const monthlyTickets = await Ticket.findAll({
      where: {
        is_monthly_pass: true,
        status: 'confirmed'
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('Ticket.id')), 'total_count'],
        [sequelize.fn('SUM', sequelize.col('Ticket.quantity')), 'total_quantity'],
        [sequelize.fn('SUM', sequelize.col('Ticket.total_price')), 'total_revenue']
      ],
      raw: true
    });

    const weeklyTickets = await Ticket.findAll({
      where: {
        is_weekly_pass: true,
        status: 'confirmed'
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('Ticket.id')), 'total_count'],
        [sequelize.fn('SUM', sequelize.col('Ticket.quantity')), 'total_quantity'],
        [sequelize.fn('SUM', sequelize.col('Ticket.total_price')), 'total_revenue']
      ],
      raw: true
    });

    const normalTickets = await Ticket.findAll({
      where: {
        is_monthly_pass: false,
        is_weekly_pass: false,
        status: 'confirmed'
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('Ticket.id')), 'total_count'],
        [sequelize.fn('SUM', sequelize.col('Ticket.quantity')), 'total_quantity'],
        [sequelize.fn('SUM', sequelize.col('Ticket.total_price')), 'total_revenue']
      ],
      raw: true
    });

    const allTickets = await Ticket.findAll({
      where: {
        status: 'confirmed'
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('Ticket.id')), 'total_count'],
        [sequelize.fn('SUM', sequelize.col('Ticket.quantity')), 'total_quantity'],
        [sequelize.fn('SUM', sequelize.col('Ticket.total_price')), 'total_revenue']
      ],
      raw: true
    });

    // 3. إحصائيات الرحلات
    const tripsByLine = await Trip.findAll({
      attributes: [
        'line_id',
        [sequelize.fn('COUNT', sequelize.col('Trip.id')), 'trip_count']
      ],
      group: ['line_id'],
      raw: true
    });

    const lines = await Line.findAll({
      attributes: ['id', 'line_name'],
      raw: true
    });

    const generalTripStats = await Trip.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('Trip.id')), 'total_trips'],
        [sequelize.fn('SUM', sequelize.col('Trip.passenger_count')), 'total_passengers'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN Trip.status = "on" THEN 1 ELSE 0 END')), 'active_trips'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN Trip.status = "off" THEN 1 ELSE 0 END')), 'inactive_trips']
      ],
      raw: true
    });

    // تنسيق إحصائيات المستخدمين
    const userStatsFormatted = {
      total_passengers: 0,
      total_station_admins: 0,
      total_technicians: 0,
      total_drivers: 0,
      total_users: 0,
      details: {}
    };

    userStats.forEach(stat => {
      const count = parseInt(stat.count);
      
      switch(stat.userType) {
        case 1:
          userStatsFormatted.total_passengers = count;
          userStatsFormatted.details.passengers = count;
          break;
        case 3:
          userStatsFormatted.total_station_admins = count;
          userStatsFormatted.details.station_admins = count;
          break;
        case 4:
          userStatsFormatted.total_technicians = count;
          userStatsFormatted.details.technicians = count;
          break;
        case 5:
          userStatsFormatted.total_drivers = count;
          userStatsFormatted.details.drivers = count;
          break;
      }
      
      userStatsFormatted.total_users += count;
    });

    // تنسيق إحصائيات التذاكر
    const ticketStatsFormatted = {
      monthly_tickets: {
        count: parseInt(monthlyTickets[0]?.total_count || 0),
        quantity: parseInt(monthlyTickets[0]?.total_quantity || 0),
        revenue: parseFloat(monthlyTickets[0]?.total_revenue || 0).toFixed(2)
      },
      weekly_tickets: {
        count: parseInt(weeklyTickets[0]?.total_count || 0),
        quantity: parseInt(weeklyTickets[0]?.total_quantity || 0),
        revenue: parseFloat(weeklyTickets[0]?.total_revenue || 0).toFixed(2)
      },
      normal_tickets: {
        count: parseInt(normalTickets[0]?.total_count || 0),
        quantity: parseInt(normalTickets[0]?.total_quantity || 0),
        revenue: parseFloat(normalTickets[0]?.total_revenue || 0).toFixed(2)
      },
      all_tickets: {
        count: parseInt(allTickets[0]?.total_count || 0),
        quantity: parseInt(allTickets[0]?.total_quantity || 0),
        revenue: parseFloat(allTickets[0]?.total_revenue || 0).toFixed(2)
      }
    };

    // تنسيق بيانات الرحلات حسب الخط
    const tripsByLineFormatted = tripsByLine.map(trip => {
      const line = lines.find(l => l.id === trip.line_id);
      return {
        line_id: trip.line_id,
        line_name: line?.line_name || 'غير معروف',
        trip_count: parseInt(trip.trip_count)
      };
    });

    res.json({
      message: "تم جلب جميع الإحصائيات بنجاح",
      stats: {
        users: userStatsFormatted,
        tickets: ticketStatsFormatted,
        trips: {
          trips_by_line: tripsByLineFormatted,
          general: {
            total_trips: parseInt(generalTripStats[0]?.total_trips || 0),
            total_passengers: parseInt(generalTripStats[0]?.total_passengers || 0),
            active_trips: parseInt(generalTripStats[0]?.active_trips || 0),
            inactive_trips: parseInt(generalTripStats[0]?.inactive_trips || 0)
          }
        },
        summary: {
          total_revenue: parseFloat(ticketStatsFormatted.all_tickets.revenue),
          total_users: userStatsFormatted.total_users,
          total_trips: parseInt(generalTripStats[0]?.total_trips || 0),
          total_tickets: ticketStatsFormatted.all_tickets.quantity
        }
      }
    });

  } catch (err) {
    console.error("Error in getAllStats:", err);
    res.status(500).json({ 
      message: "خطأ في جلب الإحصائيات", 
      error: err.message 
    });
  }
};