// const db = require("../models");
// const Trip = db.Trip;
// const Line = db.Line;
// const Train = db.Train;
// const User = db.User;
// const sequelize = db.sequelize;
// const Op = db.Sequelize.Op;

// // ✅ إنشاء رحلات أوتوماتيكية لمدة 30 يوم
// exports.generateAutoTrips = async (req, res) => {
//   const transaction = await sequelize.transaction();
  
//   try {
//     const { line_id, start_date, start_hour = 6, end_hour = 22, interval_hours = 2 } = req.body;
    
//     // التحقق من البيانات المطلوبة
//     if (!line_id || !start_date) {
//       await transaction.rollback();
//       return res.status(400).json({
//         message: "الحقول المطلوبة: line_id, start_date (التاريخ يبدأ منه)"
//       });
//     }
    
//     // التحقق من وجود الخط
//     const line = await Line.findByPk(line_id, { transaction });
//     if (!line) {
//       await transaction.rollback();
//       return res.status(404).json({ message: "الخط غير موجود" });
//     }
    
//     // جلب القطارات المتاحة
//     const trains = await Train.findAll({
//       where: { 
//         status: 'active'
//       },
//       transaction
//     });
    
//     if (trains.length === 0) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: "لا توجد قطارات نشطة" 
//       });
//     }
    
//     // جلب السائقين المتاحين
//     const drivers = await User.findAll({
//       where: { 
//         userType: 5,
//         is_active: true
//       },
//       transaction,
//       attributes: ['id']
//     });
    
//     if (drivers.length === 0) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: "لا يوجد سائقون متاحون" 
//       });
//     }
    
//     // حساب عدد الرحلات في اليوم
//     const hoursPerDay = end_hour - start_hour;
//     const tripsPerDay = Math.floor(hoursPerDay / interval_hours);
    
//     // إنشاء الرحلات لمدة 30 يوم
//     const createdTrips = [];
//     const startDate = new Date(start_date);
    
//     for (let day = 0; day < 30; day++) {
//       const currentDate = new Date(startDate);
//       currentDate.setDate(startDate.getDate() + day);
      
//       for (let tripIndex = 0; tripIndex < tripsPerDay; tripIndex++) {
//         const tripTime = new Date(currentDate);
//         tripTime.setHours(start_hour + (tripIndex * interval_hours), 0, 0, 0);
        
//         const endTime = new Date(tripTime);
//         endTime.setHours(tripTime.getHours() + 2);
        
//         // اختيار قطار وسائق بشكل دوري
//         const trainIndex = tripIndex % trains.length;
//         const driverIndex = (day * tripsPerDay + tripIndex) % drivers.length;
        
//         // التحقق من عدم وجود رحلة في نفس الوقت
//         const existingTrip = await Trip.findOne({
//           where: {
//             line_id,
//             train_id: trains[trainIndex].id,
//             start_time: {
//               [Op.between]: [tripTime, endTime]
//             }
//           },
//           transaction
//         });
        
//         if (existingTrip) {
//           continue;
//         }
        
//         const newTrip = await Trip.create({
//           start_time: tripTime,
//           end_time: endTime,
//           line_id: line_id,
//           train_id: trains[trainIndex].id,
//           driver_id: drivers[driverIndex].id,
//           passenger_count: 0,
//           status: "off",
//           is_auto_generated: true
//         }, { transaction });
        
//         createdTrips.push({
//           id: newTrip.id,
//           start_time: tripTime,
//           train_id: trains[trainIndex].id,
//           driver_id: drivers[driverIndex].id
//         });
//       }
//     }
    
//     await transaction.commit();
    
//     res.status(201).json({
//       message: `تم إنشاء ${createdTrips.length} رحلة تلقائية بنجاح لمدة 30 يوم`,
//       total_trips: createdTrips.length,
//       trips_per_day: tripsPerDay,
//       trips: createdTrips.slice(0, 10)
//     });
    
//   } catch (err) {
//     await transaction.rollback();
//     console.error("Error generating auto trips:", err);
//     res.status(500).json({
//       message: "خطأ في إنشاء الرحلات التلقائية",
//       error: err.message
//     });
//   }
// };

// // ✅ إدارة جداول الرحلات (تمكين/تعطيل أوقات محددة)
// exports.manageTripSchedule = async (req, res) => {
//   const transaction = await sequelize.transaction();
  
//   try {
//     const { line_id, disabled_times = [], enabled_times = [], action_date } = req.body;
    
//     if (!line_id || !action_date) {
//       await transaction.rollback();
//       return res.status(400).json({
//         message: "الحقول المطلوبة: line_id, action_date"
//       });
//     }
    
//     const targetDate = new Date(action_date);
//     let updatedCount = 0;
    
//     // تعطيل أوقات محددة
//     if (disabled_times.length > 0) {
//       for (const timeSlot of disabled_times) {
//         const [hours, minutes] = timeSlot.split(':').map(Number);
//         const startTime = new Date(targetDate);
//         startTime.setHours(hours, minutes || 0, 0, 0);
        
//         await Trip.update(
//           { status: 'off', is_disabled: true },
//           {
//             where: {
//               line_id,
//               start_time: {
//                 [Op.gte]: startTime,
//                 [Op.lt]: new Date(startTime.getTime() + 2 * 60 * 60 * 1000)
//               },
//               is_auto_generated: true
//             },
//             transaction
//           }
//         );
        
//         updatedCount++;
//       }
//     }
    
//     // تمكين أوقات محددة
//     if (enabled_times.length > 0) {
//       for (const timeSlot of enabled_times) {
//         const [hours, minutes] = timeSlot.split(':').map(Number);
//         const startTime = new Date(targetDate);
//         startTime.setHours(hours, minutes || 0, 0, 0);
        
//         await Trip.update(
//           { status: 'on', is_disabled: false },
//           {
//             where: {
//               line_id,
//               start_time: {
//                 [Op.gte]: startTime,
//                 [Op.lt]: new Date(startTime.getTime() + 2 * 60 * 60 * 1000)
//               },
//               is_auto_generated: true
//             },
//             transaction
//           }
//         );
        
//         updatedCount++;
//       }
//     }
    
//     await transaction.commit();
    
//     res.json({
//       message: "تم تحديث جدول الرحلات بنجاح",
//       updated_count: updatedCount,
//       disabled_times,
//       enabled_times
//     });
    
//   } catch (err) {
//     await transaction.rollback();
//     console.error("Error managing trip schedule:", err);
//     res.status(500).json({
//       message: "خطأ في إدارة جدول الرحلات",
//       error: err.message
//     });
//   }
// };

// // ✅ جلب التقويم الشهري للرحلات
// exports.getMonthlyCalendar = async (req, res) => {
//   try {
//     const { month, year, line_id } = req.query;
    
//     const currentDate = new Date();
//     const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth();
//     const targetYear = year ? parseInt(year) : currentDate.getFullYear();
    
//     // حساب أول وآخر يوم من الشهر
//     const firstDay = new Date(targetYear, targetMonth, 1);
//     const lastDay = new Date(targetYear, targetMonth + 1, 0);
    
//     let whereClause = {
//       start_time: {
//         [Op.between]: [firstDay, lastDay]
//       }
//     };
    
//     if (line_id) {
//       whereClause.line_id = line_id;
//     }
    
//     const trips = await Trip.findAll({
//       where: whereClause,
//       attributes: [
//         'id',
//         'start_time',
//         'end_time',
//         'status',
//         'line_id',
//         'is_auto_generated',
//         'is_disabled'
//       ],
//       include: [
//         {
//           model: db.Line,
//           attributes: ['id', 'line_name']
//         }
//       ],
//       order: [['start_time', 'ASC']]
//     });
    
//     // تنظيم البيانات حسب اليوم
//     const calendar = {};
//     trips.forEach(trip => {
//       const tripDate = new Date(trip.start_time);
//       const dateKey = tripDate.toISOString().split('T')[0];
      
//       if (!calendar[dateKey]) {
//         calendar[dateKey] = {
//           date: dateKey,
//           total_trips: 0,
//           active_trips: 0,
//           disabled_trips: 0,
//           trips: []
//         };
//       }
      
//       calendar[dateKey].total_trips++;
//       if (trip.status === 'on') calendar[dateKey].active_trips++;
//       if (trip.is_disabled) calendar[dateKey].disabled_trips++;
//       calendar[dateKey].trips.push({
//         id: trip.id,
//         start_time: trip.start_time,
//         status: trip.status,
//         is_auto_generated: trip.is_auto_generated,
//         line_name: trip.Line.line_name
//       });
//     });
    
//     res.json({
//       message: "تم جلب تقويم الرحلات الشهري",
//       month: targetMonth + 1,
//       year: targetYear,
//       calendar: calendar
//     });
    
//   } catch (err) {
//     console.error("Error fetching monthly calendar:", err);
//     res.status(500).json({
//       message: "خطأ في جلب التقويم الشهري",
//       error: err.message
//     });
//   }
// };









const db = require("../models");
const Trip = db.Trip;
const Line = db.Line;
const Train = db.Train;
const User = db.User;
const sequelize = db.sequelize;
const Op = db.Sequelize.Op;

// ✅ إنشاء رحلات أوتوماتيكية مع تحديد يدوي للقطارات والسائقين
exports.generateAutoTrips = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      line_id, 
      start_date, 
      start_hour = 6, 
      end_hour = 22, 
      interval_hours = 2,
      train_ids = [],      // قائمة معرفات القطارات
      driver_ids = []      // قائمة معرفات السائقين
    } = req.body;
    
    // التحقق من البيانات المطلوبة
    if (!line_id || !start_date) {
      await transaction.rollback();
      return res.status(400).json({
        message: "الحقول المطلوبة: line_id, start_date (التاريخ يبدأ منه)"
      });
    }
    
    // التحقق من وجود train_ids و driver_ids
    if (!train_ids || train_ids.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        message: "يجب تحديد قائمة القطارات (train_ids)"
      });
    }
    
    if (!driver_ids || driver_ids.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        message: "يجب تحديد قائمة السائقين (driver_ids)"
      });
    }
    
    // التحقق من وجود الخط
    const line = await Line.findByPk(line_id, { transaction });
    if (!line) {
      await transaction.rollback();
      return res.status(404).json({ message: "الخط غير موجود" });
    }
    
    // جلب القطارات المحددة فقط
    const trains = await Train.findAll({
      where: { 
        id: train_ids,
        status: 'on'  // موديلك يستخدم 'on' بدلاً من 'active'
      },
      transaction
    });
    
    if (trains.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: "القطارات المحددة غير موجودة أو غير نشطة (يجب أن تكون status = 'on')" 
      });
    }
    
    // جلب السائقين المحددين فقط
    const drivers = await User.findAll({
      where: { 
        id: driver_ids,
        userType: 5  // موديلك لا يحتوي على is_active
      },
      transaction
    });
    
    if (drivers.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: "السائقون المحددون غير موجودين أو ليسوا من النوع الصحيح (userType = 5)" 
      });
    }
    
    // حساب عدد الرحلات في اليوم
    const hoursPerDay = end_hour - start_hour;
    const tripsPerDay = Math.floor(hoursPerDay / interval_hours);
    
    // توزيع بالتناوب بين القطارات والسائقين المحددين
    const createdTrips = [];
    const startDate = new Date(start_date);
    
    for (let day = 0; day < 30; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);
      
      for (let tripIndex = 0; tripIndex < tripsPerDay; tripIndex++) {
        const tripTime = new Date(currentDate);
        tripTime.setHours(start_hour + (tripIndex * interval_hours), 0, 0, 0);
        
        const endTime = new Date(tripTime);
        endTime.setHours(tripTime.getHours() + 2);
        
        // اختيار بالتناوب من القوائم المحددة
        const trainIndex = tripIndex % trains.length;
        const driverIndex = tripIndex % drivers.length;
        
        // التحقق من عدم وجود رحلة في نفس الوقت لنفس القطار والسائق
        const existingTrip = await Trip.findOne({
          where: {
            line_id,
            [Op.or]: [
              {
                train_id: trains[trainIndex].id,
                start_time: {
                  [Op.between]: [tripTime, endTime]
                }
              },
              {
                driver_id: drivers[driverIndex].id,
                start_time: {
                  [Op.between]: [tripTime, endTime]
                }
              }
            ]
          },
          transaction
        });
        
        if (existingTrip) {
          continue;
        }
        
        const newTrip = await Trip.create({
          start_time: tripTime,
          end_time: endTime,
          line_id: line_id,
          train_id: trains[trainIndex].id,
          driver_id: drivers[driverIndex].id,
          passenger_count: 0,
          status: "off",
          is_auto_generated: true
        }, { transaction });
        
        createdTrips.push({
          id: newTrip.id,
          start_time: tripTime,
          train_id: trains[trainIndex].id,
          train_number: trains[trainIndex].version_number,
          driver_id: drivers[driverIndex].id,
          driver_name: drivers[driverIndex].username
        });
      }
    }
    
    await transaction.commit();
    
    res.status(201).json({
      message: `تم إنشاء ${createdTrips.length} رحلة تلقائية بنجاح لمدة 30 يوم`,
      total_trips: createdTrips.length,
      trips_per_day: tripsPerDay,
      trains_used: trains.map(t => ({ 
        id: t.id, 
        version_number: t.version_number,
        capacity: t.capacity,
        status: t.status
      })),
      drivers_used: drivers.map(d => ({ 
        id: d.id, 
        username: d.username,
        email: d.email,
        phone_number: d.phone_number
      })),
      trips_sample: createdTrips.slice(0, 10)
    });
    
  } catch (err) {
    await transaction.rollback();
    console.error("Error generating auto trips:", err);
    res.status(500).json({
      message: "خطأ في إنشاء الرحلات التلقائية",
      error: err.message
    });
  }
};

// ✅ جلب القطارات المتاحة للاختيار
exports.getAvailableTrainsForSelection = async (req, res) => {
  try {
    const trains = await Train.findAll({
      where: { 
        status: 'on'
      },
      attributes: ['id', 'version_number', 'capacity', 'status'],
      order: [['version_number', 'ASC']]
    });
    
    res.json({
      message: "تم جلب القطارات المتاحة بنجاح",
      trains: trains,
      count: trains.length
    });
    
  } catch (err) {
    console.error("Error fetching available trains:", err);
    res.status(500).json({
      message: "خطأ في جلب القطارات المتاحة",
      error: err.message
    });
  }
};

// ✅ جلب السائقين المتاحين للاختيار
exports.getAvailableDriversForSelection = async (req, res) => {
  try {
    const drivers = await User.findAll({
      where: { 
        userType: 5
      },
      attributes: ['id', 'username', 'email', 'phone_number', 'userType'],
      order: [['username', 'ASC']]
    });
    
    res.json({
      message: "تم جلب السائقين المتاحين بنجاح",
      drivers: drivers,
      count: drivers.length
    });
    
  } catch (err) {
    console.error("Error fetching available drivers:", err);
    res.status(500).json({
      message: "خطأ في جلب السائقين المتاحين",
      error: err.message
    });
  }
};

// ✅ إدارة جداول الرحلات (تمكين/تعطيل أوقات محددة)
exports.manageTripSchedule = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { line_id, disabled_times = [], enabled_times = [], action_date } = req.body;
    
    if (!line_id || !action_date) {
      await transaction.rollback();
      return res.status(400).json({
        message: "الحقول المطلوبة: line_id, action_date"
      });
    }
    
    const targetDate = new Date(action_date);
    let updatedCount = 0;
    
    // تعطيل أوقات محددة
    if (disabled_times.length > 0) {
      for (const timeSlot of disabled_times) {
        const [hours, minutes] = timeSlot.split(':').map(Number);
        const startTime = new Date(targetDate);
        startTime.setHours(hours, minutes || 0, 0, 0);
        
        await Trip.update(
          { status: 'off', is_disabled: true },
          {
            where: {
              line_id,
              start_time: {
                [Op.gte]: startTime,
                [Op.lt]: new Date(startTime.getTime() + 2 * 60 * 60 * 1000)
              },
              is_auto_generated: true
            },
            transaction
          }
        );
        
        updatedCount++;
      }
    }
    
    // تمكين أوقات محددة
    if (enabled_times.length > 0) {
      for (const timeSlot of enabled_times) {
        const [hours, minutes] = timeSlot.split(':').map(Number);
        const startTime = new Date(targetDate);
        startTime.setHours(hours, minutes || 0, 0, 0);
        
        await Trip.update(
          { status: 'on', is_disabled: false },
          {
            where: {
              line_id,
              start_time: {
                [Op.gte]: startTime,
                [Op.lt]: new Date(startTime.getTime() + 2 * 60 * 60 * 1000)
              },
              is_auto_generated: true
            },
            transaction
          }
        );
        
        updatedCount++;
      }
    }
    
    await transaction.commit();
    
    res.json({
      message: "تم تحديث جدول الرحلات بنجاح",
      updated_count: updatedCount,
      disabled_times,
      enabled_times
    });
    
  } catch (err) {
    await transaction.rollback();
    console.error("Error managing trip schedule:", err);
    res.status(500).json({
      message: "خطأ في إدارة جدول الرحلات",
      error: err.message
    });
  }
};

// ✅ جلب التقويم الشهري للرحلات
exports.getMonthlyCalendar = async (req, res) => {
  try {
    const { month, year, line_id } = req.query;
    
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();
    
    // حساب أول وآخر يوم من الشهر
    const firstDay = new Date(targetYear, targetMonth, 1);
    const lastDay = new Date(targetYear, targetMonth + 1, 0);
    
    let whereClause = {
      start_time: {
        [Op.between]: [firstDay, lastDay]
      }
    };
    
    if (line_id) {
      whereClause.line_id = line_id;
    }
    
    const trips = await Trip.findAll({
      where: whereClause,
      attributes: [
        'id',
        'start_time',
        'end_time',
        'status',
        'line_id',
        'train_id',
        'driver_id',
        'is_auto_generated',
        'is_disabled'
      ],
      include: [
        {
          model: Line,
          attributes: ['id', 'line_name']
        },
        {
          model: Train,
          attributes: ['id', 'version_number']
        },
        {
          model: User,
          as: "driver",
          attributes: ['id', 'username']
        }
      ],
      order: [['start_time', 'ASC']]
    });
    
    // تنظيم البيانات حسب اليوم
    const calendar = {};
    trips.forEach(trip => {
      const tripDate = new Date(trip.start_time);
      const dateKey = tripDate.toISOString().split('T')[0];
      
      if (!calendar[dateKey]) {
        calendar[dateKey] = {
          date: dateKey,
          total_trips: 0,
          active_trips: 0,
          disabled_trips: 0,
          trips: []
        };
      }
      
      calendar[dateKey].total_trips++;
      if (trip.status === 'on') calendar[dateKey].active_trips++;
      if (trip.is_disabled) calendar[dateKey].disabled_trips++;
      calendar[dateKey].trips.push({
        id: trip.id,
        start_time: trip.start_time,
        status: trip.status,
        is_auto_generated: trip.is_auto_generated,
        is_disabled: trip.is_disabled,
        train_number: trip.Train ? trip.Train.version_number : 'غير معروف',
        driver_name: trip.driver ? trip.driver.username : 'غير معروف',
        line_name: trip.Line.line_name
      });
    });
    
    res.json({
      message: "تم جلب تقويم الرحلات الشهري",
      month: targetMonth + 1,
      year: targetYear,
      calendar: calendar
    });
    
  } catch (err) {
    console.error("Error fetching monthly calendar:", err);
    res.status(500).json({
      message: "خطأ في جلب التقويم الشهري",
      error: err.message
    });
  }
};

// ✅ جلب إحصائيات الرحلات الأوتوماتيكية
exports.getAutoTripsStats = async (req, res) => {
  try {
    const { start_date, end_date, line_id } = req.query;
    
    let whereClause = {
      is_auto_generated: true
    };
    
    // فلترة حسب التاريخ
    if (start_date && end_date) {
      whereClause.start_time = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }
    
    // فلترة حسب الخط
    if (line_id) {
      whereClause.line_id = line_id;
    }
    
    const trips = await Trip.findAll({
      where: whereClause,
      attributes: [
        'id',
        'start_time',
        'status',
        'is_disabled',
        'line_id',
        'train_id',
        'driver_id'
      ],
      include: [
        {
          model: Line,
          attributes: ['line_name']
        },
        {
          model: Train,
          attributes: ['version_number']
        },
        {
          model: User,
          as: "driver",
          attributes: ['username']
        }
      ],
      order: [['start_time', 'DESC']]
    });
    
    // حساب الإحصائيات
    const stats = {
      total_trips: trips.length,
      active_trips: trips.filter(t => t.status === 'on').length,
      disabled_trips: trips.filter(t => t.is_disabled).length,
      trips_by_status: {
        on: trips.filter(t => t.status === 'on').length,
        off: trips.filter(t => t.status === 'off').length
      },
      trains_count: [...new Set(trips.map(t => t.train_id))].length,
      drivers_count: [...new Set(trips.map(t => t.driver_id))].length
    };
    
    // تجميع حسب الخط
    const tripsByLine = {};
    trips.forEach(trip => {
      const lineName = trip.Line ? trip.Line.line_name : 'غير معروف';
      if (!tripsByLine[lineName]) {
        tripsByLine[lineName] = {
          total: 0,
          active: 0,
          disabled: 0
        };
      }
      tripsByLine[lineName].total++;
      if (trip.status === 'on') tripsByLine[lineName].active++;
      if (trip.is_disabled) tripsByLine[lineName].disabled++;
    });
    
    res.json({
      message: "تم جلب إحصائيات الرحلات الأوتوماتيكية بنجاح",
      stats: stats,
      trips_by_line: tripsByLine,
      recent_trips: trips.slice(0, 20)
    });
    
  } catch (err) {
    console.error("Error fetching auto trips stats:", err);
    res.status(500).json({
      message: "خطأ في جلب إحصائيات الرحلات",
      error: err.message
    });
  }
};

// ✅ حذف الرحلات الأوتوماتيكية لفترة محددة
exports.deleteAutoTrips = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { start_date, end_date, line_id, confirm = false } = req.body;
    
    if (!confirm) {
      await transaction.rollback();
      return res.status(400).json({
        message: "يجب تأكيد العملية بوضع confirm: true"
      });
    }
    
    if (!start_date || !end_date) {
      await transaction.rollback();
      return res.status(400).json({
        message: "الحقول المطلوبة: start_date, end_date, confirm"
      });
    }
    
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    
    let whereClause = {
      is_auto_generated: true,
      start_time: {
        [Op.between]: [startDate, endDate]
      }
    };
    
    if (line_id) {
      whereClause.line_id = line_id;
    }
    
    // حساب عدد الرحلات المراد حذفها
    const tripsCount = await Trip.count({
      where: whereClause,
      transaction
    });
    
    if (tripsCount === 0) {
      await transaction.rollback();
      return res.status(404).json({
        message: "لا توجد رحلات أوتوماتيكية في الفترة المحددة"
      });
    }
    
    // حذف الرحلات
    await Trip.destroy({
      where: whereClause,
      transaction
    });
    
    await transaction.commit();
    
    res.json({
      message: `تم حذف ${tripsCount} رحلة أوتوماتيكية بنجاح`,
      deleted_count: tripsCount,
      period: {
        start_date: start_date,
        end_date: end_date
      }
    });
    
  } catch (err) {
    await transaction.rollback();
    console.error("Error deleting auto trips:", err);
    res.status(500).json({
      message: "خطأ في حذف الرحلات الأوتوماتيكية",
      error: err.message
    });
  }
};