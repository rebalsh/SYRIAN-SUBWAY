const db = require("../models");
const Trip = db.Trip;
const Line = db.Line;
const Train = db.Train;
const User = db.User;
const sequelize = db.sequelize;
const Op = db.Sequelize.Op;

// ✅ 1️⃣ إنشاء رحلات أوتوماتيكية (يومية لمدة 30 يوم)
exports.generateAutoTrips = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      line_id, 
      start_date, 
      selected_time = '08:00',
      train_ids = [],
      driver_ids = [],
      passenger_count = 0,
      duration_hours = 2
    } = req.body;
    
    // التحقق من البيانات المطلوبة
    if (!line_id || !start_date || !selected_time) {
      await transaction.rollback();
      return res.status(400).json({
        message: "الحقول المطلوبة: line_id, start_date, selected_time"
      });
    }
    
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
        status: 'on'
      },
      transaction
    });
    
    if (trains.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: "القطارات المحددة غير موجودة أو غير نشطة" 
      });
    }
    
    // جلب السائقين المحددين فقط
    const drivers = await User.findAll({
      where: { 
        id: driver_ids,
        userType: 5
      },
      transaction
    });
    
    if (drivers.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: "السائقون المحددون غير موجودين (يجب أن يكون userType = 5)" 
      });
    }
    
    // تحويل الوقت المحدد إلى ساعات ودقائق
    const [hours, minutes] = selected_time.split(':').map(Number);
    
    // عدد الأيام الثابت (شهر كامل)
    const totalDays = 30;
    
    // توزيع بالتناوب بين القطارات والسائقين المحددين
    const createdTrips = [];
    let trainIndex = 0;
    let driverIndex = 0;
    
    // تاريخ البداية
    const baseDate = new Date(start_date);
    baseDate.setHours(hours, minutes || 0, 0, 0);
    
    // ⭐ حساب بداية ونهاية اليوم للتحقق
    const startOfDay = new Date(baseDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(baseDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    // ⭐ التحقق من عدم وجود رحلة أساسية في نفس اليوم والوقت
    const existingBaseTrip = await Trip.findOne({
      where: {
        line_id,
        is_base_trip: true,
        selected_time: selected_time,
        start_time: {
          [Op.between]: [startOfDay, endOfDay]
        }
      },
      transaction
    });
    
    if (existingBaseTrip) {
      await transaction.rollback();
      return res.status(400).json({
        message: `يوجد بالفعل رحلة أساسية على الساعة ${selected_time} في تاريخ ${start_date}`
      });
    }
    
    // ⭐ إنشاء رحلات لمدة 30 يوم
    for (let day = 0; day < totalDays; day++) {
      const tripDate = new Date(baseDate);
      tripDate.setDate(baseDate.getDate() + day);
      
      const tripEndTime = new Date(tripDate);
      tripEndTime.setHours(tripDate.getHours() + duration_hours);
      
      // اختيار القطار والسائق بالتناوب
      const selectedTrain = trains[trainIndex % trains.length];
      const selectedDriver = drivers[driverIndex % drivers.length];
      
      // زيادة المؤشرات
      trainIndex++;
      driverIndex++;
      
      // التحقق من عدم وجود رحلة في نفس الوقت لنفس القطار
      const existingTrip = await Trip.findOne({
        where: {
          line_id,
          train_id: selectedTrain.id,
          start_time: {
            [Op.between]: [tripDate, tripEndTime]
          }
        },
        transaction
      });
      
      if (existingTrip) {
        // ⭐ إذا كانت هناك رحلة موجودة، نتخطى هذا اليوم فقط
        continue;
      }
      
      const newTrip = await Trip.create({
        start_time: tripDate,
        end_time: tripEndTime,
        line_id: line_id,
        train_id: selectedTrain.id,
        driver_id: selectedDriver.id,
        passenger_count: passenger_count,
        status: "on",
        is_auto_generated: true,
        is_base_trip: (day === 0), // أول رحلة هي الأساسية
        selected_time: selected_time,
        duration_hours: duration_hours
      }, { transaction });
      
      createdTrips.push({
        id: newTrip.id,
        date: tripDate.toISOString().split('T')[0],
        time: selected_time,
        is_base_trip: (day === 0),
        train_id: selectedTrain.id,
        train_number: selectedTrain.version_number,
        driver_id: selectedDriver.id,
        driver_name: selectedDriver.username,
        duration: `${duration_hours} ساعات`
      });
    }
    
    await transaction.commit();
    
    // ⭐ إذا ما تم إنشاء أي رحلة بسبب التعارضات
    if (createdTrips.length === 0) {
      return res.status(400).json({
        message: "لم يتم إنشاء أي رحلة بسبب تعارض في الأوقات مع القطارات المحددة"
      });
    }
    
    res.status(201).json({
      message: `تم إنشاء ${createdTrips.length} رحلة يومية بنجاح`,
      selected_time: selected_time,
      duration_hours: duration_hours,
      total_trips: createdTrips.length,
      period: `من ${start_date} ولمدة 30 يوم`,
      base_trip: createdTrips.find(t => t.is_base_trip),
      trains_used: trains.map(t => ({ 
        id: t.id, 
        version_number: t.version_number,
        capacity: t.capacity
      })),
      drivers_used: drivers.map(d => ({ 
        id: d.id, 
        username: d.username,
        email: d.email
      })),
      trips_sample: createdTrips.slice(0, 5)
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

// ✅ 2️⃣ جلب الخطوط المتاحة
exports.getAvailableLines = async (req, res) => {
  try {
    const lines = await Line.findAll({
      attributes: ['id', 'line_name', 'color_code', 'created_at'],
      order: [['line_name', 'ASC']]
    });
    
    res.json({
      message: "تم جلب الخطوط المتاحة بنجاح",
      lines: lines,
      count: lines.length
    });
    
  } catch (err) {
    console.error("Error fetching available lines:", err);
    res.status(500).json({
      message: "خطأ في جلب الخطوط المتاحة",
      error: err.message
    });
  }
};

// ✅ 3️⃣ جلب القطارات المتاحة للاختيار
exports.getAvailableTrainsForSelection = async (req, res) => {
  try {
    const trains = await Train.findAll({
      where: { 
        status: 'on'
      },
      attributes: ['id', 'version_number', 'capacity', 'status', 'manufacturer'],
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

// ✅ 4️⃣ جلب السائقين المتاحين للاختيار
exports.getAvailableDriversForSelection = async (req, res) => {
  try {
    const drivers = await User.findAll({
      where: { 
        userType: 5
      },
      attributes: ['id', 'username', 'email', 'phone_number', 'userType', 'created_at'],
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

// ✅ 5️⃣ إدارة جدول الرحلات (تمكين/تعطيل أيام)
exports.manageTripSchedule = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      line_id, 
      action_date,
      disable_type, // 'days' أو 'times'
      disabled_items = [], // أيام أو أوقات
      enable_type, // 'days' أو 'times'
      enabled_items = [] // أيام أو أوقات
    } = req.body;
    
    if (!line_id || !action_date) {
      await transaction.rollback();
      return res.status(400).json({
        message: "الحقول المطلوبة: line_id, action_date"
      });
    }
    
    const targetDate = new Date(action_date);
    let updatedCount = 0;
    
    // 1. تعطيل أيام
    if (disable_type === 'days' && disabled_items.length > 0) {
      for (const dateStr of disabled_items) {
        const dateToDisable = new Date(dateStr);
        const startOfDay = new Date(dateToDisable);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(dateToDisable);
        endOfDay.setHours(23, 59, 59, 999);
        
        const result = await Trip.update(
          { status: 'off' },
          {
            where: {
              line_id,
              start_time: {
                [Op.between]: [startOfDay, endOfDay]
              },
              is_auto_generated: true
            },
            transaction
          }
        );
        
        updatedCount += result[0];
      }
    }
    
    // 2. تعطيل أوقات
    if (disable_type === 'times' && disabled_items.length > 0) {
      for (const timeStr of disabled_items) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const startTime = new Date(targetDate);
        startTime.setHours(hours || 0, minutes || 0, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setHours(startTime.getHours() + 2);
        
        const result = await Trip.update(
          { status: 'off' },
          {
            where: {
              line_id,
              start_time: {
                [Op.between]: [startTime, endTime]
              },
              is_auto_generated: true
            },
            transaction
          }
        );
        
        updatedCount += result[0];
      }
    }
    
    // 3. تمكين أيام
    if (enable_type === 'days' && enabled_items.length > 0) {
      for (const dateStr of enabled_items) {
        const dateToEnable = new Date(dateStr);
        const startOfDay = new Date(dateToEnable);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(dateToEnable);
        endOfDay.setHours(23, 59, 59, 999);
        
        const result = await Trip.update(
          { status: 'on' },
          {
            where: {
              line_id,
              start_time: {
                [Op.between]: [startOfDay, endOfDay]
              },
              is_auto_generated: true
            },
            transaction
          }
        );
        
        updatedCount += result[0];
      }
    }
    
    // 4. تمكين أوقات
    if (enable_type === 'times' && enabled_items.length > 0) {
      for (const timeStr of enabled_items) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const startTime = new Date(targetDate);
        startTime.setHours(hours || 0, minutes || 0, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setHours(startTime.getHours() + 2);
        
        const result = await Trip.update(
          { status: 'on' },
          {
            where: {
              line_id,
              start_time: {
                [Op.between]: [startTime, endTime]
              },
              is_auto_generated: true
            },
            transaction
          }
        );
        
        updatedCount += result[0];
      }
    }
    
    await transaction.commit();
    
    res.json({
      message: "تم تحديث جدول الرحلات بنجاح",
      updated_count: updatedCount,
      disabled_type: disable_type,
      disabled_items: disabled_items,
      enabled_type: enable_type,
      enabled_items: enabled_items
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

// ✅ 6️⃣ جلب التقويم الشهري للرحلات (الرحلات الأساسية فقط)
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
      },
      is_base_trip: true // فقط الرحلات الأساسية
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
        'passenger_count',
        'selected_time',
        'duration_hours'
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
      order: [['selected_time', 'ASC'], ['start_time', 'ASC']]
    });
    
    // تنظيم البيانات حسب الوقت
    const calendarByTime = {};
    
    trips.forEach(trip => {
      const timeKey = trip.selected_time;
      const dateKey = trip.start_time.toISOString().split('T')[0];
      
      if (!calendarByTime[timeKey]) {
        calendarByTime[timeKey] = {
          time: timeKey,
          duration_hours: trip.duration_hours,
          total_trips: 0,
          trips_by_date: {}
        };
      }
      
      if (!calendarByTime[timeKey].trips_by_date[dateKey]) {
        calendarByTime[timeKey].trips_by_date[dateKey] = [];
      }
      
      calendarByTime[timeKey].total_trips++;
      calendarByTime[timeKey].trips_by_date[dateKey].push({
        id: trip.id,
        start_time: trip.start_time,
        status: trip.status,
        passenger_count: trip.passenger_count,
        train_number: trip.Train ? trip.Train.version_number : 'غير معروف',
        driver_name: trip.driver ? trip.driver.username : 'غير معروف',
        line_name: trip.Line ? trip.Line.line_name : 'غير معروف'
      });
    });
    
    // تحويل إلى مصفوفة مرتبة
    const calendarArray = Object.values(calendarByTime).sort((a, b) => {
      return a.time.localeCompare(b.time);
    });
    
    res.json({
      message: "تم جلب تقويم الرحلات الأساسية الشهري",
      month: targetMonth + 1,
      year: targetYear,
      total_base_trips: trips.length,
      calendar: calendarArray
    });
    
  } catch (err) {
    console.error("Error fetching monthly calendar:", err);
    res.status(500).json({
      message: "خطأ في جلب التقويم الشهري",
      error: err.message
    });
  }
};

// ✅ 7️⃣ جلب إحصائيات الرحلات الأوتوماتيكية
exports.getAutoTripsStats = async (req, res) => {
  try {
    const { start_date, end_date, line_id } = req.query;
    
    let whereClause = {
      is_auto_generated: true,
      is_base_trip: true // فقط الأساسية
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
        'line_id',
        'train_id',
        'driver_id',
        'passenger_count',
        'selected_time',
        'duration_hours'
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
      total_base_trips: trips.length,
      active_trips: trips.filter(t => t.status === 'on').length,
      cancelled_trips: trips.filter(t => t.status === 'cancelled').length,
      delayed_trips: trips.filter(t => t.status === 'delayed').length,
      total_passengers: trips.reduce((sum, t) => sum + (t.passenger_count || 0), 0),
      average_duration: trips.length > 0 ? 
        (trips.reduce((sum, t) => sum + (t.duration_hours || 2), 0) / trips.length).toFixed(1) : 0
    };
    
    // تجميع حسب الوقت
    const tripsByTime = {};
    trips.forEach(trip => {
      const timeKey = trip.selected_time;
      if (!tripsByTime[timeKey]) {
        tripsByTime[timeKey] = {
          time: timeKey,
          total: 0,
          active: 0,
          passengers: 0
        };
      }
      tripsByTime[timeKey].total++;
      if (trip.status === 'on') tripsByTime[timeKey].active++;
      tripsByTime[timeKey].passengers += (trip.passenger_count || 0);
    });
    
    // تجميع حسب الشهر
    const tripsByMonth = {};
    trips.forEach(trip => {
      const monthKey = trip.start_time.toISOString().slice(0, 7); // YYYY-MM
      if (!tripsByMonth[monthKey]) {
        tripsByMonth[monthKey] = {
          month: monthKey,
          total: 0,
          active: 0
        };
      }
      tripsByMonth[monthKey].total++;
      if (trip.status === 'on') tripsByMonth[monthKey].active++;
    });
    
    res.json({
      message: "تم جلب إحصائيات الرحلات الأساسية بنجاح",
      stats: stats,
      trips_by_time: tripsByTime,
      trips_by_month: tripsByMonth,
      recent_base_trips: trips.slice(0, 10)
    });
    
  } catch (err) {
    console.error("Error fetching auto trips stats:", err);
    res.status(500).json({
      message: "خطأ في جلب إحصائيات الرحلات",
      error: err.message
    });
  }
};

// ✅ 8️⃣ حذف الرحلات الأوتوماتيكية لفترة محددة
exports.deleteAutoTrips = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { start_date, end_date, line_id, selected_time } = req.body;
    
    if (!start_date || !end_date) {
      await transaction.rollback();
      return res.status(400).json({
        message: "الحقول المطلوبة: start_date, end_date"
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
    
    if (selected_time) {
      whereClause.selected_time = selected_time;
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
      },
      selected_time: selected_time || 'جميع الأوقات'
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

// ✅ 9️⃣ البحث عن الرحلات الأساسية المتاحة للتاريخ المحدد
exports.checkAvailableSlots = async (req, res) => {
  try {
    const { line_id, date, selected_time } = req.query;
    
    if (!date) {
      return res.status(400).json({
        message: "الحقل المطلوب: date"
      });
    }
    
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    let whereClause = {
      is_base_trip: true,
      start_time: {
        [Op.between]: [startOfDay, endOfDay]
      }
    };
    
    if (line_id) {
      whereClause.line_id = line_id;
    }
    
    if (selected_time) {
      whereClause.selected_time = selected_time;
    }
    
    const existingTrips = await Trip.findAll({
      where: whereClause,
      attributes: ['id', 'selected_time', 'start_time', 'line_id'],
      include: [
        {
          model: Line,
          attributes: ['line_name']
        }
      ]
    });
    
    // توليد قائمة الأوقات المحجوزة
    const bookedSlots = existingTrips.map(trip => ({
      time: trip.selected_time,
      date: trip.start_time.toISOString().split('T')[0],
      line_id: trip.line_id,
      line_name: trip.Line.line_name
    }));
    
    res.json({
      message: "تم جلب الأوقات المحجوزة بنجاح",
      date: date,
      booked_slots: bookedSlots,
      total_booked: bookedSlots.length,
      is_available: selected_time ? 
        !bookedSlots.some(slot => slot.time === selected_time) : 
        null
    });
    
  } catch (err) {
    console.error("Error checking available slots:", err);
    res.status(500).json({
      message: "خطأ في التحقق من الأوقات المتاحة",
      error: err.message
    });
  }
};















// const db = require("../models");
// const Trip = db.Trip;
// const Line = db.Line;
// const Train = db.Train;
// const User = db.User;
// const sequelize = db.sequelize;
// const Op = db.Sequelize.Op;

// // ✅ 1️⃣ إنشاء رحلات أوتوماتيكية مع تحديد يدوي
// exports.generateAutoTrips = async (req, res) => {
//   const transaction = await sequelize.transaction();
  
//   try {
//     const { 
//       line_id, 
//       start_date, 
//       start_hour = 6, 
//       end_hour = 22, 
//       interval_hours = 2,
//       train_ids = [],
//       driver_ids = [],
//       passenger_count = 0  // ⭐ عدد الركاب
//     } = req.body;
    
//     // التحقق من البيانات المطلوبة
//     if (!line_id || !start_date) {
//       await transaction.rollback();
//       return res.status(400).json({
//         message: "الحقول المطلوبة: line_id, start_date"
//       });
//     }
    
//     if (!train_ids || train_ids.length === 0) {
//       await transaction.rollback();
//       return res.status(400).json({
//         message: "يجب تحديد قائمة القطارات (train_ids)"
//       });
//     }
    
//     if (!driver_ids || driver_ids.length === 0) {
//       await transaction.rollback();
//       return res.status(400).json({
//         message: "يجب تحديد قائمة السائقين (driver_ids)"
//       });
//     }
    
//     // التحقق من وجود الخط
//     const line = await Line.findByPk(line_id, { transaction });
//     if (!line) {
//       await transaction.rollback();
//       return res.status(404).json({ message: "الخط غير موجود" });
//     }
    
//     // جلب القطارات المحددة فقط
//     const trains = await Train.findAll({
//       where: { 
//         id: train_ids,
//         status: 'on'  // ⭐ فقط القطارات النشطة
//       },
//       transaction
//     });
    
//     if (trains.length === 0) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: "القطارات المحددة غير موجودة أو غير نشطة (يجب أن تكون status = 'on')" 
//       });
//     }
    
//     // جلب السائقين المحددين فقط
//     const drivers = await User.findAll({
//       where: { 
//         id: driver_ids,
//         userType: 5
//       },
//       transaction
//     });
    
//     if (drivers.length === 0) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: "السائقون المحددون غير موجودين أو ليسوا من النوع الصحيح (userType = 5)" 
//       });
//     }
    
//     // ⭐ حساب عدد الرحلات في اليوم
//     const hoursPerDay = end_hour - start_hour;
//     const tripsPerDay = Math.floor(hoursPerDay / interval_hours);
    
//     // ⭐ توزيع بالتناوب بين القطارات والسائقين المحددين
//     const createdTrips = [];
    
//     // ⭐ نضبط التاريخ مع الساعة المحددة
//     const startDate = new Date(start_date);
//     startDate.setHours(start_hour, 0, 0, 0);
    
//     // مؤشرات منفصلة للقطارات والسائقين
//     let trainIndex = 0;
//     let driverIndex = 0;
    
//     for (let day = 0; day < 30; day++) {
//       const currentDate = new Date(startDate);
//       currentDate.setDate(startDate.getDate() + day);
      
//       // ⭐ نعيد ضبط الساعة لكل يوم
//       currentDate.setHours(start_hour, 0, 0, 0);
      
//       for (let tripIndex = 0; tripIndex < tripsPerDay; tripIndex++) {
//         const tripTime = new Date(currentDate);
//         // ⭐ يبدأ من start_hour مباشرة
//         tripTime.setHours(start_hour + (tripIndex * interval_hours), 0, 0, 0);
        
//         const endTime = new Date(tripTime);
//         endTime.setHours(tripTime.getHours() + 2);
        
//         // ⭐ اختيار القطار والسائق بالتناوب
//         const selectedTrain = trains[trainIndex % trains.length];
//         const selectedDriver = drivers[driverIndex % drivers.length];
        
//         // زيادة المؤشرات
//         trainIndex++;
//         driverIndex++;
        
//         // التحقق من عدم وجود رحلة في نفس الوقت لنفس القطار والسائق
//         const existingTrip = await Trip.findOne({
//           where: {
//             line_id,
//             [Op.or]: [
//               {
//                 train_id: selectedTrain.id,
//                 start_time: {
//                   [Op.between]: [tripTime, endTime]
//                 }
//               },
//               {
//                 driver_id: selectedDriver.id,
//                 start_time: {
//                   [Op.between]: [tripTime, endTime]
//                 }
//               }
//             ]
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
//           train_id: selectedTrain.id,
//           driver_id: selectedDriver.id,
//           passenger_count: passenger_count, // ⭐ عدد الركاب
//           status: "on", // ⭐ حالة نشطة مباشرة
//           is_auto_generated: true
//         }, { transaction });
        
//         createdTrips.push({
//           id: newTrip.id,
//           start_time: tripTime,
//           train_id: selectedTrain.id,
//           train_number: selectedTrain.version_number,
//           driver_id: selectedDriver.id,
//           driver_name: selectedDriver.username,
//           passenger_count: passenger_count // ⭐ إضافة عدد الركاب
//         });
//       }
//     }
    
//     await transaction.commit();
    
//     res.status(201).json({
//       message: `تم إنشاء ${createdTrips.length} رحلة تلقائية بنجاح لمدة 30 يوم`,
//       total_trips: createdTrips.length,
//       trips_per_day: tripsPerDay,
//       start_time: `${start_hour}:00`,
//       end_time: `${end_hour}:00`,
//       interval: `${interval_hours} ساعات`,
//       passenger_count: passenger_count, // ⭐ إضافة
//       trains_used: trains.map(t => ({ 
//         id: t.id, 
//         version_number: t.version_number,
//         capacity: t.capacity,
//         status: t.status
//       })),
//       drivers_used: drivers.map(d => ({ 
//         id: d.id, 
//         username: d.username,
//         email: d.email,
//         phone_number: d.phone_number
//       })),
//       trips_sample: createdTrips.slice(0, 10)
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

// // ✅ 2️⃣ جلب القطارات المتاحة للاختيار
// exports.getAvailableTrainsForSelection = async (req, res) => {
//   try {
//     const trains = await Train.findAll({
//       where: { 
//         status: 'on' // ⭐ فقط النشطة
//       },
//       attributes: ['id', 'version_number', 'capacity', 'status'],
//       order: [['version_number', 'ASC']]
//     });
    
//     res.json({
//       message: "تم جلب القطارات المتاحة بنجاح",
//       trains: trains,
//       count: trains.length
//     });
    
//   } catch (err) {
//     console.error("Error fetching available trains:", err);
//     res.status(500).json({
//       message: "خطأ في جلب القطارات المتاحة",
//       error: err.message
//     });
//   }
// };

// // ✅ 3️⃣ جلب السائقين المتاحين للاختيار
// exports.getAvailableDriversForSelection = async (req, res) => {
//   try {
//     const drivers = await User.findAll({
//       where: { 
//         userType: 5
//       },
//       attributes: ['id', 'username', 'email', 'phone_number', 'userType'],
//       order: [['username', 'ASC']]
//     });
    
//     res.json({
//       message: "تم جلب السائقين المتاحين بنجاح",
//       drivers: drivers,
//       count: drivers.length
//     });
    
//   } catch (err) {
//     console.error("Error fetching available drivers:", err);
//     res.status(500).json({
//       message: "خطأ في جلب السائقين المتاحين",
//       error: err.message
//     });
//   }
// };

// // ✅ 4️⃣ إدارة جدول الرحلات (تمكين/تعطيل أيام أو أوقات)
// exports.manageTripSchedule = async (req, res) => {
//   const transaction = await sequelize.transaction();
  
//   try {
//     const { 
//       line_id, 
//       action_date,
//       disable_type, // ⭐ 'days' أو 'times'
//       disabled_items = [], // ⭐ أيام أو أوقات
//       enable_type, // ⭐ 'days' أو 'times'
//       enabled_items = [] // ⭐ أيام أو أوقات
//     } = req.body;
    
//     if (!line_id || !action_date) {
//       await transaction.rollback();
//       return res.status(400).json({
//         message: "الحقول المطلوبة: line_id, action_date"
//       });
//     }
    
//     const targetDate = new Date(action_date);
//     let updatedCount = 0;
    
//     // ⭐ 1. تعطيل أيام
//     if (disable_type === 'days' && disabled_items.length > 0) {
//       for (const dateStr of disabled_items) {
//         const dateToDisable = new Date(dateStr);
//         const startOfDay = new Date(dateToDisable);
//         startOfDay.setHours(0, 0, 0, 0);
        
//         const endOfDay = new Date(dateToDisable);
//         endOfDay.setHours(23, 59, 59, 999);
        
//         const result = await Trip.update(
//           { status: 'off', is_disabled: true },
//           {
//             where: {
//               line_id,
//               start_time: {
//                 [Op.between]: [startOfDay, endOfDay]
//               },
//               is_auto_generated: true
//             },
//             transaction
//           }
//         );
        
//         updatedCount += result[0];
//       }
//     }
    
//     // ⭐ 2. تعطيل أوقات
//     if (disable_type === 'times' && disabled_items.length > 0) {
//       for (const timeStr of disabled_items) {
//         const [hours, minutes] = timeStr.split(':').map(Number);
//         const startTime = new Date(targetDate);
//         startTime.setHours(hours || 0, minutes || 0, 0, 0);
        
//         const endTime = new Date(startTime);
//         endTime.setHours(startTime.getHours() + 2);
        
//         const result = await Trip.update(
//           { status: 'off', is_disabled: true },
//           {
//             where: {
//               line_id,
//               start_time: {
//                 [Op.between]: [startTime, endTime]
//               },
//               is_auto_generated: true
//             },
//             transaction
//           }
//         );
        
//         updatedCount += result[0];
//       }
//     }
    
//     // ⭐ 3. تمكين أيام
//     if (enable_type === 'days' && enabled_items.length > 0) {
//       for (const dateStr of enabled_items) {
//         const dateToEnable = new Date(dateStr);
//         const startOfDay = new Date(dateToEnable);
//         startOfDay.setHours(0, 0, 0, 0);
        
//         const endOfDay = new Date(dateToEnable);
//         endOfDay.setHours(23, 59, 59, 999);
        
//         const result = await Trip.update(
//           { status: 'on', is_disabled: false },
//           {
//             where: {
//               line_id,
//               start_time: {
//                 [Op.between]: [startOfDay, endOfDay]
//               },
//               is_auto_generated: true
//             },
//             transaction
//           }
//         );
        
//         updatedCount += result[0];
//       }
//     }
    
//     // ⭐ 4. تمكين أوقات
//     if (enable_type === 'times' && enabled_items.length > 0) {
//       for (const timeStr of enabled_items) {
//         const [hours, minutes] = timeStr.split(':').map(Number);
//         const startTime = new Date(targetDate);
//         startTime.setHours(hours || 0, minutes || 0, 0, 0);
        
//         const endTime = new Date(startTime);
//         endTime.setHours(startTime.getHours() + 2);
        
//         const result = await Trip.update(
//           { status: 'on', is_disabled: false },
//           {
//             where: {
//               line_id,
//               start_time: {
//                 [Op.between]: [startTime, endTime]
//               },
//               is_auto_generated: true
//             },
//             transaction
//           }
//         );
        
//         updatedCount += result[0];
//       }
//     }
    
//     await transaction.commit();
    
//     res.json({
//       message: "تم تحديث جدول الرحلات بنجاح",
//       updated_count: updatedCount,
//       disabled_type: disable_type,
//       disabled_items: disabled_items,
//       enabled_type: enable_type,
//       enabled_items: enabled_items
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

// // ✅ 5️⃣ جلب التقويم الشهري للرحلات
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
//         'train_id',
//         'driver_id',
//         'is_auto_generated',
//         'is_disabled',
//         'passenger_count' // ⭐ إضافة عدد الركاب
//       ],
//       include: [
//         {
//           model: Line,
//           attributes: ['id', 'line_name']
//         },
//         {
//           model: Train,
//           attributes: ['id', 'version_number']
//         },
//         {
//           model: User,
//           as: "driver",
//           attributes: ['id', 'username']
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
//         passenger_count: trip.passenger_count, // ⭐ إضافة
//         is_auto_generated: trip.is_auto_generated,
//         is_disabled: trip.is_disabled,
//         train_number: trip.Train ? trip.Train.version_number : 'غير معروف',
//         driver_name: trip.driver ? trip.driver.username : 'غير معروف',
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

// // ✅ 6️⃣ جلب إحصائيات الرحلات الأوتوماتيكية
// exports.getAutoTripsStats = async (req, res) => {
//   try {
//     const { start_date, end_date, line_id } = req.query;
    
//     let whereClause = {
//       is_auto_generated: true
//     };
    
//     // فلترة حسب التاريخ
//     if (start_date && end_date) {
//       whereClause.start_time = {
//         [Op.between]: [new Date(start_date), new Date(end_date)]
//       };
//     }
    
//     // فلترة حسب الخط
//     if (line_id) {
//       whereClause.line_id = line_id;
//     }
    
//     const trips = await Trip.findAll({
//       where: whereClause,
//       attributes: [
//         'id',
//         'start_time',
//         'status',
//         'is_disabled',
//         'line_id',
//         'train_id',
//         'driver_id',
//         'passenger_count' // ⭐ إضافة
//       ],
//       include: [
//         {
//           model: Line,
//           attributes: ['line_name']
//         },
//         {
//           model: Train,
//           attributes: ['version_number']
//         },
//         {
//           model: User,
//           as: "driver",
//           attributes: ['username']
//         }
//       ],
//       order: [['start_time', 'DESC']]
//     });
    
//     // حساب الإحصائيات
//     const stats = {
//       total_trips: trips.length,
//       active_trips: trips.filter(t => t.status === 'on').length,
//       disabled_trips: trips.filter(t => t.is_disabled).length,
//       trips_by_status: {
//         on: trips.filter(t => t.status === 'on').length,
//         off: trips.filter(t => t.status === 'off').length
//       },
//       trains_count: [...new Set(trips.map(t => t.train_id))].length,
//       drivers_count: [...new Set(trips.map(t => t.driver_id))].length,
//       total_passengers: trips.reduce((sum, t) => sum + (t.passenger_count || 0), 0) // ⭐ إضافة
//     };
    
//     // تجميع حسب الخط
//     const tripsByLine = {};
//     trips.forEach(trip => {
//       const lineName = trip.Line ? trip.Line.line_name : 'غير معروف';
//       if (!tripsByLine[lineName]) {
//         tripsByLine[lineName] = {
//           total: 0,
//           active: 0,
//           disabled: 0,
//           passengers: 0
//         };
//       }
//       tripsByLine[lineName].total++;
//       if (trip.status === 'on') tripsByLine[lineName].active++;
//       if (trip.is_disabled) tripsByLine[lineName].disabled++;
//       tripsByLine[lineName].passengers += (trip.passenger_count || 0);
//     });
    
//     res.json({
//       message: "تم جلب إحصائيات الرحلات الأوتوماتيكية بنجاح",
//       stats: stats,
//       trips_by_line: tripsByLine,
//       recent_trips: trips.slice(0, 20)
//     });
    
//   } catch (err) {
//     console.error("Error fetching auto trips stats:", err);
//     res.status(500).json({
//       message: "خطأ في جلب إحصائيات الرحلات",
//       error: err.message
//     });
//   }
// };

// // ✅ 7️⃣ حذف الرحلات الأوتوماتيكية لفترة محددة
// exports.deleteAutoTrips = async (req, res) => {
//   const transaction = await sequelize.transaction();
  
//   try {
//     const { start_date, end_date, line_id } = req.body;
    
//     if (!start_date || !end_date) {
//       await transaction.rollback();
//       return res.status(400).json({
//         message: "الحقول المطلوبة: start_date, end_date"
//       });
//     }
    
//     const startDate = new Date(start_date);
//     const endDate = new Date(end_date);
    
//     let whereClause = {
//       is_auto_generated: true,
//       start_time: {
//         [Op.between]: [startDate, endDate]
//       }
//     };
    
//     if (line_id) {
//       whereClause.line_id = line_id;
//     }
    
//     // حساب عدد الرحلات المراد حذفها
//     const tripsCount = await Trip.count({
//       where: whereClause,
//       transaction
//     });
    
//     if (tripsCount === 0) {
//       await transaction.rollback();
//       return res.status(404).json({
//         message: "لا توجد رحلات أوتوماتيكية في الفترة المحددة"
//       });
//     }
    
//     // حذف الرحلات
//     await Trip.destroy({
//       where: whereClause,
//       transaction
//     });
    
//     await transaction.commit();
    
//     res.json({
//       message: `تم حذف ${tripsCount} رحلة أوتوماتيكية بنجاح`,
//       deleted_count: tripsCount,
//       period: {
//         start_date: start_date,
//         end_date: end_date
//       }
//     });
    
//   } catch (err) {
//     await transaction.rollback();
//     console.error("Error deleting auto trips:", err);
//     res.status(500).json({
//       message: "خطأ في حذف الرحلات الأوتوماتيكية",
//       error: err.message
//     });
//   }
// };


// *************************************************************************************************************




// const db = require("../models");
// const Trip = db.Trip;
// const Line = db.Line;
// const Train = db.Train;
// const User = db.User;
// const sequelize = db.sequelize;
// const Op = db.Sequelize.Op;

// // ✅ إنشاء رحلات أوتوماتيكية مع تحديد يدوي للقطارات والسائقين
// exports.generateAutoTrips = async (req, res) => {
//   const transaction = await sequelize.transaction();
  
//   try {
//     const { 
//       line_id, 
//       start_date, 
//       start_hour = 6, 
//       end_hour = 22, 
//       interval_hours = 2,
//       train_ids = [],      // قائمة معرفات القطارات
//       driver_ids = []      // قائمة معرفات السائقين
//     } = req.body;
    
//     // التحقق من البيانات المطلوبة
//     if (!line_id || !start_date) {
//       await transaction.rollback();
//       return res.status(400).json({
//         message: "الحقول المطلوبة: line_id, start_date (التاريخ يبدأ منه)"
//       });
//     }
    
//     // التحقق من وجود train_ids و driver_ids
//     if (!train_ids || train_ids.length === 0) {
//       await transaction.rollback();
//       return res.status(400).json({
//         message: "يجب تحديد قائمة القطارات (train_ids)"
//       });
//     }
    
//     if (!driver_ids || driver_ids.length === 0) {
//       await transaction.rollback();
//       return res.status(400).json({
//         message: "يجب تحديد قائمة السائقين (driver_ids)"
//       });
//     }
    
//     // التحقق من وجود الخط
//     const line = await Line.findByPk(line_id, { transaction });
//     if (!line) {
//       await transaction.rollback();
//       return res.status(404).json({ message: "الخط غير موجود" });
//     }
    
//     // جلب القطارات المحددة فقط
//     const trains = await Train.findAll({
//       where: { 
//         id: train_ids,
//         status: 'on'  // موديلك يستخدم 'on' بدلاً من 'active'
//       },
//       transaction
//     });
    
//     if (trains.length === 0) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: "القطارات المحددة غير موجودة أو غير نشطة (يجب أن تكون status = 'on')" 
//       });
//     }
    
//     // جلب السائقين المحددين فقط
//     const drivers = await User.findAll({
//       where: { 
//         id: driver_ids,
//         userType: 5  // موديلك لا يحتوي على is_active
//       },
//       transaction
//     });
    
//     if (drivers.length === 0) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: "السائقون المحددون غير موجودين أو ليسوا من النوع الصحيح (userType = 5)" 
//       });
//     }
    
//     // حساب عدد الرحلات في اليوم
//     const hoursPerDay = end_hour - start_hour;
//     const tripsPerDay = Math.floor(hoursPerDay / interval_hours);
    
//     // توزيع بالتناوب بين القطارات والسائقين المحددين
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
        
//         // اختيار بالتناوب من القوائم المحددة
//         const trainIndex = tripIndex % trains.length;
//         const driverIndex = tripIndex % drivers.length;
        
//         // التحقق من عدم وجود رحلة في نفس الوقت لنفس القطار والسائق
//         const existingTrip = await Trip.findOne({
//           where: {
//             line_id,
//             [Op.or]: [
//               {
//                 train_id: trains[trainIndex].id,
//                 start_time: {
//                   [Op.between]: [tripTime, endTime]
//                 }
//               },
//               {
//                 driver_id: drivers[driverIndex].id,
//                 start_time: {
//                   [Op.between]: [tripTime, endTime]
//                 }
//               }
//             ]
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
//           train_number: trains[trainIndex].version_number,
//           driver_id: drivers[driverIndex].id,
//           driver_name: drivers[driverIndex].username
//         });
//       }
//     }
    
//     await transaction.commit();
    
//     res.status(201).json({
//       message: `تم إنشاء ${createdTrips.length} رحلة تلقائية بنجاح لمدة 30 يوم`,
//       total_trips: createdTrips.length,
//       trips_per_day: tripsPerDay,
//       trains_used: trains.map(t => ({ 
//         id: t.id, 
//         version_number: t.version_number,
//         capacity: t.capacity,
//         status: t.status
//       })),
//       drivers_used: drivers.map(d => ({ 
//         id: d.id, 
//         username: d.username,
//         email: d.email,
//         phone_number: d.phone_number
//       })),
//       trips_sample: createdTrips.slice(0, 10)
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

// // ✅ جلب القطارات المتاحة للاختيار
// exports.getAvailableTrainsForSelection = async (req, res) => {
//   try {
//     const trains = await Train.findAll({
//       where: { 
//         status: 'on'
//       },
//       attributes: ['id', 'version_number', 'capacity', 'status'],
//       order: [['version_number', 'ASC']]
//     });
    
//     res.json({
//       message: "تم جلب القطارات المتاحة بنجاح",
//       trains: trains,
//       count: trains.length
//     });
    
//   } catch (err) {
//     console.error("Error fetching available trains:", err);
//     res.status(500).json({
//       message: "خطأ في جلب القطارات المتاحة",
//       error: err.message
//     });
//   }
// };

// // ✅ جلب السائقين المتاحين للاختيار
// exports.getAvailableDriversForSelection = async (req, res) => {
//   try {
//     const drivers = await User.findAll({
//       where: { 
//         userType: 5
//       },
//       attributes: ['id', 'username', 'email', 'phone_number', 'userType'],
//       order: [['username', 'ASC']]
//     });
    
//     res.json({
//       message: "تم جلب السائقين المتاحين بنجاح",
//       drivers: drivers,
//       count: drivers.length
//     });
    
//   } catch (err) {
//     console.error("Error fetching available drivers:", err);
//     res.status(500).json({
//       message: "خطأ في جلب السائقين المتاحين",
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
//         'train_id',
//         'driver_id',
//         'is_auto_generated',
//         'is_disabled'
//       ],
//       include: [
//         {
//           model: Line,
//           attributes: ['id', 'line_name']
//         },
//         {
//           model: Train,
//           attributes: ['id', 'version_number']
//         },
//         {
//           model: User,
//           as: "driver",
//           attributes: ['id', 'username']
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
//         is_disabled: trip.is_disabled,
//         train_number: trip.Train ? trip.Train.version_number : 'غير معروف',
//         driver_name: trip.driver ? trip.driver.username : 'غير معروف',
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

// // ✅ جلب إحصائيات الرحلات الأوتوماتيكية
// exports.getAutoTripsStats = async (req, res) => {
//   try {
//     const { start_date, end_date, line_id } = req.query;
    
//     let whereClause = {
//       is_auto_generated: true
//     };
    
//     // فلترة حسب التاريخ
//     if (start_date && end_date) {
//       whereClause.start_time = {
//         [Op.between]: [new Date(start_date), new Date(end_date)]
//       };
//     }
    
//     // فلترة حسب الخط
//     if (line_id) {
//       whereClause.line_id = line_id;
//     }
    
//     const trips = await Trip.findAll({
//       where: whereClause,
//       attributes: [
//         'id',
//         'start_time',
//         'status',
//         'is_disabled',
//         'line_id',
//         'train_id',
//         'driver_id'
//       ],
//       include: [
//         {
//           model: Line,
//           attributes: ['line_name']
//         },
//         {
//           model: Train,
//           attributes: ['version_number']
//         },
//         {
//           model: User,
//           as: "driver",
//           attributes: ['username']
//         }
//       ],
//       order: [['start_time', 'DESC']]
//     });
    
//     // حساب الإحصائيات
//     const stats = {
//       total_trips: trips.length,
//       active_trips: trips.filter(t => t.status === 'on').length,
//       disabled_trips: trips.filter(t => t.is_disabled).length,
//       trips_by_status: {
//         on: trips.filter(t => t.status === 'on').length,
//         off: trips.filter(t => t.status === 'off').length
//       },
//       trains_count: [...new Set(trips.map(t => t.train_id))].length,
//       drivers_count: [...new Set(trips.map(t => t.driver_id))].length
//     };
    
//     // تجميع حسب الخط
//     const tripsByLine = {};
//     trips.forEach(trip => {
//       const lineName = trip.Line ? trip.Line.line_name : 'غير معروف';
//       if (!tripsByLine[lineName]) {
//         tripsByLine[lineName] = {
//           total: 0,
//           active: 0,
//           disabled: 0
//         };
//       }
//       tripsByLine[lineName].total++;
//       if (trip.status === 'on') tripsByLine[lineName].active++;
//       if (trip.is_disabled) tripsByLine[lineName].disabled++;
//     });
    
//     res.json({
//       message: "تم جلب إحصائيات الرحلات الأوتوماتيكية بنجاح",
//       stats: stats,
//       trips_by_line: tripsByLine,
//       recent_trips: trips.slice(0, 20)
//     });
    
//   } catch (err) {
//     console.error("Error fetching auto trips stats:", err);
//     res.status(500).json({
//       message: "خطأ في جلب إحصائيات الرحلات",
//       error: err.message
//     });
//   }
// };

// // ✅ حذف الرحلات الأوتوماتيكية لفترة محددة
// exports.deleteAutoTrips = async (req, res) => {
//   const transaction = await sequelize.transaction();
  
//   try {
//     const { start_date, end_date, line_id, confirm = false } = req.body;
    
//     if (!confirm) {
//       await transaction.rollback();
//       return res.status(400).json({
//         message: "يجب تأكيد العملية بوضع confirm: true"
//       });
//     }
    
//     if (!start_date || !end_date) {
//       await transaction.rollback();
//       return res.status(400).json({
//         message: "الحقول المطلوبة: start_date, end_date, confirm"
//       });
//     }
    
//     const startDate = new Date(start_date);
//     const endDate = new Date(end_date);
    
//     let whereClause = {
//       is_auto_generated: true,
//       start_time: {
//         [Op.between]: [startDate, endDate]
//       }
//     };
    
//     if (line_id) {
//       whereClause.line_id = line_id;
//     }
    
//     // حساب عدد الرحلات المراد حذفها
//     const tripsCount = await Trip.count({
//       where: whereClause,
//       transaction
//     });
    
//     if (tripsCount === 0) {
//       await transaction.rollback();
//       return res.status(404).json({
//         message: "لا توجد رحلات أوتوماتيكية في الفترة المحددة"
//       });
//     }
    
//     // حذف الرحلات
//     await Trip.destroy({
//       where: whereClause,
//       transaction
//     });
    
//     await transaction.commit();
    
//     res.json({
//       message: `تم حذف ${tripsCount} رحلة أوتوماتيكية بنجاح`,
//       deleted_count: tripsCount,
//       period: {
//         start_date: start_date,
//         end_date: end_date
//       }
//     });
    
//   } catch (err) {
//     await transaction.rollback();
//     console.error("Error deleting auto trips:", err);
//     res.status(500).json({
//       message: "خطأ في حذف الرحلات الأوتوماتيكية",
//       error: err.message
//     });
//   }
// };