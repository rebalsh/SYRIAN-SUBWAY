
// ***************************************************************************



// const db = require("../models");
// const Trip = db.Trip;
// const Line = db.Line;
// const Train = db.Train;
// const User = db.User;
// const Station = db.Station;
// const LineStation = db.LineStation;
// const Notification = db.Notification;
// const sequelize = db.sequelize;
// const Op = db.Sequelize.Op;

// // ✅ إنشاء رحلة جديدة (للسوبر أدمن userType=2 والمشرف userType=3 فقط)
// exports.createTrip = async (req, res) => {
//   const transaction = await sequelize.transaction();
  
//   try {
//     const { start_time, end_time, line_id, train_id, driver_id, passenger_count = 0, status = "off" } = req.body;

//     // التحقق من البيانات المطلوبة
//     if (!start_time || !end_time || !line_id || !train_id || !driver_id) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: "جميع الحقول مطلوبة: start_time, end_time, line_id, train_id, driver_id" 
//       });
//     }

//     // التحقق من صحة التواريخ
//     const startTime = new Date(start_time);
//     const endTime = new Date(end_time);
    
//     if (startTime >= endTime) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: "وقت البدء يجب أن يكون قبل وقت الانتهاء" 
//       });
//     }

//     // التحقق من وجود الخط
//     const line = await Line.findByPk(line_id, { transaction });
//     if (!line) {
//       await transaction.rollback();
//       return res.status(404).json({ message: "الخط غير موجود" });
//     }

//     // التحقق من وجود القطار
//     const train = await Train.findByPk(train_id, { transaction });
//     if (!train) {
//       await transaction.rollback();
//       return res.status(404).json({ message: "القطار غير موجود" });
//     }

//     // ✅ التصحيح: التحقق من وجود السائق وأنه من النوع الصحيح (userType = 5) للسائقين
//     const driver = await User.findOne({
//       where: { 
//         id: driver_id,
//         userType: 5 // ✅ تغيير من 4 إلى 5
//       },
//       transaction
//     });
    
//     if (!driver) {
//       await transaction.rollback();
//       return res.status(404).json({ message: "السائق غير موجود أو ليس من النوع الصحيح (يجب أن يكون userType = 5)" });
//     }

//     // ✅ التحقق من أن القطار متاح (ليس في رحلة أخرى في نفس الوقت)
//     const conflictingTrainTrip = await Trip.findOne({
//       where: {
//         train_id,
//         [Op.or]: [
//           {
//             start_time: { [Op.lt]: endTime },
//             end_time: { [Op.gt]: startTime }
//           }
//         ]
//       },
//       transaction
//     });

//     if (conflictingTrainTrip) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: "القطار مشغول في رحلة أخرى خلال هذا الوقت" 
//       });
//     }

//     // ✅ التحقق من أن السائق متاح (ليس في رحلة أخرى في نفس الوقت)
//     const conflictingDriverTrip = await Trip.findOne({
//       where: {
//         driver_id,
//         [Op.or]: [
//           {
//             start_time: { [Op.lt]: endTime },
//             end_time: { [Op.gt]: startTime }
//           }
//         ]
//       },
//       transaction
//     });

//     if (conflictingDriverTrip) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: "السائق مشغول في رحلة أخرى خلال هذا الوقت" 
//       });
//     }

//     // التحقق من الحالة
//     if (status && !["on", "off"].includes(status)) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: "الحالة يجب أن تكون 'on' أو 'off'" 
//       });
//     }

//     // إنشاء الرحلة
//     const newTrip = await Trip.create({
//       start_time: startTime,
//       end_time: endTime,
//       line_id,
//       train_id,
//       driver_id,
//       passenger_count: parseInt(passenger_count),
//       status
//     }, { transaction });

//     // ✅ إرسال إشعار للسائق عن الرحلة الجديدة
//     try {
//       await Notification.create({
//         user_id: driver_id,
//         title: "رحلة جديدة مخصصة لك",
//         message: `تم تعيينك كسائق لرحلة جديدة تبدأ في ${startTime.toLocaleString()} على الخط ${line.line_name}`,
//         type: "trip_assignment",
//         is_read: false
//       }, { transaction });
//     } catch (notificationError) {
//       console.log("ملاحظة: لم يتم إرسال الإشعار للسائق", notificationError);
//       // لا نوقف العملية إذا فشل الإشعار
//     }

//     await transaction.commit();

//     // جلب الرحلة مع بياناتها الكاملة
//     const tripWithDetails = await Trip.findOne({
//       where: { id: newTrip.id },
//       include: [
//         {
//           model: Line,
//           attributes: ["id", "line_name"],
//           include: [{
//             model: Station,
//             through: { 
//               attributes: ["station_order"] 
//             },
//             attributes: ["id", "name", "location"]
//           }]
//         },
//         {
//           model: Train,
//           attributes: ["id", "version_number", "capacity", "status"]
//         },
//         {
//           model: User,
//           as: "driver",
//           attributes: ["id", "username", "email"]
//         }
//       ]
//     });

//     res.status(201).json({
//       message: "تم إنشاء الرحلة بنجاح وإرسال إشعار للسائق",
//       trip: tripWithDetails
//     });

//   } catch (err) {
//     await transaction.rollback();
//     console.error("Error creating trip:", err);
//     res.status(500).json({ 
//       message: "خطأ في إنشاء الرحلة", 
//       error: err.message 
//     });
//   }
// };

// // ✅ جلب جميع الرحلات
// exports.getAllTrips = async (req, res) => {
//   try {
//     const { status, line_id, train_id, driver_id, date } = req.query;
    
//     let whereClause = {};
    
//     // فلترة حسب الحالة
//     if (status && ["on", "off"].includes(status)) {
//       whereClause.status = status;
//     }
    
//     // فلترة حسب الخط
//     if (line_id) {
//       whereClause.line_id = line_id;
//     }

//     // فلترة حسب القطار
//     if (train_id) {
//       whereClause.train_id = train_id;
//     }

//     // فلترة حسب السائق
//     if (driver_id) {
//       whereClause.driver_id = driver_id;
//     }
    
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

//     const trips = await Trip.findAll({
//       where: whereClause,
//       include: [
//         {
//           model: Line,
//           attributes: ["id", "line_name"],
//           include: [{
//             model: Station,
//             through: { attributes: ["station_order"] },
//             attributes: ["id", "name", "location"]
//           }]
//         },
//         {
//           model: Train,
//           attributes: ["id", "version_number", "capacity", "status"]
//         },
//         {
//           model: User,
//           as: "driver",
//           attributes: ["id", "username", "email"]
//         }
//       ],
//       order: [["start_time", "ASC"]]
//     });

//     res.json({
//       message: "تم جلب الرحلات بنجاح",
//       trips: trips,
//       count: trips.length
//     });

//   } catch (err) {
//     console.error("Error fetching trips:", err);
//     res.status(500).json({ 
//       message: "خطأ في جلب الرحلات", 
//       error: err.message 
//     });
//   }
// };

// // ✅ جلب رحلة محددة
// exports.getTripById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const trip = await Trip.findOne({
//       where: { id },
//       include: [
//         {
//           model: Line,
//           attributes: ["id", "line_name"],
//           include: [{
//             model: Station,
//             through: { 
//               attributes: ["station_order"] 
//             },
//             attributes: ["id", "name", "location"]
//           }]
//         },
//         {
//           model: Train,
//           attributes: ["id", "version_number", "capacity", "status"]
//         },
//         {
//           model: User,
//           as: "driver",
//           attributes: ["id", "username", "email", "phone_number"]
//         }
//       ]
//     });

//     if (!trip) {
//       return res.status(404).json({ message: "الرحلة غير موجودة" });
//     }

//     res.json({
//       message: "تم جلب الرحلة بنجاح",
//       trip: trip
//     });

//   } catch (err) {
//     console.error("Error fetching trip:", err);
//     res.status(500).json({ 
//       message: "خطأ في جلب الرحلة", 
//       error: err.message 
//     });
//   }
// };

// // ✅ تحديث رحلة (للسوبر أدمن userType=2 والمشرف userType=3 فقط)
// exports.updateTrip = async (req, res) => {
//   const transaction = await sequelize.transaction();
  
//   try {
//     const { id } = req.params;
//     const { start_time, end_time, line_id, train_id, driver_id, passenger_count, status } = req.body;

//     const trip = await Trip.findByPk(id, { transaction });
//     if (!trip) {
//       await transaction.rollback();
//       return res.status(404).json({ message: "الرحلة غير موجودة" });
//     }

//     // التحقق من صحة التواريخ إذا تم تحديثها
//     if (start_time && end_time) {
//       const startTime = new Date(start_time);
//       const endTime = new Date(end_time);
      
//       if (startTime >= endTime) {
//         await transaction.rollback();
//         return res.status(400).json({ 
//           message: "وقت البدء يجب أن يكون قبل وقت الانتهاء" 
//         });
//       }
//     }

//     // التحقق من وجود الخط إذا تم تحديثه
//     if (line_id) {
//       const line = await Line.findByPk(line_id, { transaction });
//       if (!line) {
//         await transaction.rollback();
//         return res.status(404).json({ message: "الخط غير موجود" });
//       }
//     }

//     // التحقق من وجود القطار إذا تم تحديثه
//     if (train_id) {
//       const train = await Train.findByPk(train_id, { transaction });
//       if (!train) {
//         await transaction.rollback();
//         return res.status(404).json({ message: "القطار غير موجود" });
//       }
//     }

//     // ✅ التصحيح: التحقق من وجود السائق إذا تم تحديثه (userType = 5)
//     if (driver_id) {
//       const driver = await User.findOne({
//         where: { 
//           id: driver_id,
//           userType: 5 // ✅ تغيير من 4 إلى 5
//         },
//         transaction
//       });
      
//       if (!driver) {
//         await transaction.rollback();
//         return res.status(404).json({ message: "السائق غير موجود أو ليس من النوع الصحيح (يجب أن يكون userType = 5)" });
//       }
//     }

//     // التحقق من تعارض الرحلات إذا تم تغيير القطار أو السائق أو الوقت
//     const startTime = start_time ? new Date(start_time) : trip.start_time;
//     const endTime = end_time ? new Date(end_time) : trip.end_time;
//     const checkTrainId = train_id || trip.train_id;
//     const checkDriverId = driver_id || trip.driver_id;

//     if (checkTrainId !== trip.train_id || checkDriverId !== trip.driver_id || start_time || end_time) {
//       const conflictingTrip = await Trip.findOne({
//         where: {
//           id: { [Op.ne]: id },
//           [Op.or]: [
//             {
//               train_id: checkTrainId,
//               [Op.or]: [
//                 {
//                   start_time: { [Op.lt]: endTime },
//                   end_time: { [Op.gt]: startTime }
//                 }
//               ]
//             },
//             {
//               driver_id: checkDriverId,
//               [Op.or]: [
//                 {
//                   start_time: { [Op.lt]: endTime },
//                   end_time: { [Op.gt]: startTime }
//                 }
//               ]
//             }
//           ]
//         },
//         transaction
//       });

//       if (conflictingTrip) {
//         await transaction.rollback();
//         return res.status(400).json({ 
//           message: "تعارض في المواعيد: القطار أو السائق مشغول في رحلة أخرى خلال هذا الوقت" 
//         });
//       }
//     }

//     // التحقق من الحالة إذا تم تحديثها
//     if (status && !["on", "off"].includes(status)) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: "الحالة يجب أن تكون 'on' أو 'off'" 
//       });
//     }

//     // ✅ إرسال إشعار إذا تم تغيير السائق
//     let notificationSent = false;
//     if (driver_id && driver_id !== trip.driver_id) {
//       try {
//         await Notification.create({
//           user_id: driver_id,
//           title: "تم تعيينك في رحلة جديدة",
//           message: `تم تعيينك كسائق لرحلة تبدأ في ${startTime.toLocaleString()}`,
//           type: "trip_update",
//           is_read: false
//         }, { transaction });
//         notificationSent = true;
//       } catch (notificationError) {
//         console.log("ملاحظة: لم يتم إرسال الإشعار للسائق", notificationError);
//       }
//     }

//     // تحديث البيانات
//     await trip.update({
//       ...(start_time && { start_time: new Date(start_time) }),
//       ...(end_time && { end_time: new Date(end_time) }),
//       ...(line_id && { line_id }),
//       ...(train_id && { train_id }),
//       ...(driver_id && { driver_id }),
//       ...(passenger_count && { passenger_count: parseInt(passenger_count) }),
//       ...(status && { status })
//     }, { transaction });

//     await transaction.commit();

//     // جلب الرحلة المحدثة
//     const updatedTrip = await Trip.findOne({
//       where: { id },
//       include: [
//         {
//           model: Line,
//           attributes: ["id", "line_name"],
//           include: [{
//             model: Station,
//             through: { 
//               attributes: ["station_order"] 
//             },
//             attributes: ["id", "name", "location"]
//           }]
//         },
//         {
//           model: Train,
//           attributes: ["id", "version_number", "capacity", "status"]
//         },
//         {
//           model: User,
//           as: "driver",
//           attributes: ["id", "username", "email"]
//         }
//       ]
//     });

//     const responseMessage = notificationSent 
//       ? "تم تحديث الرحلة بنجاح وإرسال إشعار للسائق الجديد"
//       : "تم تحديث الرحلة بنجاح";

//     res.json({
//       message: responseMessage,
//       trip: updatedTrip
//     });

//   } catch (err) {
//     await transaction.rollback();
//     console.error("Error updating trip:", err);
//     res.status(500).json({ 
//       message: "خطأ في تحديث الرحلة", 
//       error: err.message 
//     });
//   }
// };

// // ✅ حذف رحلة (للسوبر أدمن userType=2 فقط)
// exports.deleteTrip = async (req, res) => {
//   const transaction = await sequelize.transaction();
  
//   try {
//     const { id } = req.params;

//     const trip = await Trip.findByPk(id, { 
//       include: [{
//         model: User,
//         as: "driver",
//         attributes: ["id", "username"]
//       }],
//       transaction 
//     });
    
//     if (!trip) {
//       await transaction.rollback();
//       return res.status(404).json({ message: "الرحلة غير موجودة" });
//     }

//     // ✅ إرسال إشعار للسائق بإلغاء الرحلة
//     try {
//       await Notification.create({
//         user_id: trip.driver_id,
//         title: "تم إلغاء الرحلة",
//         message: `تم إلغاء الرحلة التي كانت مقررة في ${trip.start_time.toLocaleString()}`,
//         type: "trip_cancellation",
//         is_read: false
//       }, { transaction });
//     } catch (notificationError) {
//       console.log("ملاحظة: لم يتم إرسال إشعار الإلغاء للسائق", notificationError);
//     }

//     await trip.destroy({ transaction });
//     await transaction.commit();

//     res.json({ 
//       message: "تم حذف الرحلة بنجاح وإرسال إشعار للسائق" 
//     });

//   } catch (err) {
//     await transaction.rollback();
//     console.error("Error deleting trip:", err);
//     res.status(500).json({ 
//       message: "خطأ في حذف الرحلة", 
//       error: err.message 
//     });
//   }
// };

// // ✅ تحديث حالة الرحلة (للسوبر أدمن userType=2 والمشرف userType=3)
// exports.updateTripStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     if (!status || !["on", "off"].includes(status)) {
//       return res.status(400).json({ 
//         message: "الحالة يجب أن تكون 'on' أو 'off'" 
//       });
//     }

//     const trip = await Trip.findByPk(id, {
//       include: [{
//         model: User,
//         as: "driver",
//         attributes: ["id", "username"]
//       }]
//     });
    
//     if (!trip) {
//       return res.status(404).json({ message: "الرحلة غير موجودة" });
//     }

//     await trip.update({ status });

//     // ✅ إرسال إشعار للسائق بتغيير حالة الرحلة
//     try {
//       const statusText = status === "on" ? "مفعلة" : "متوقفة";
//       await Notification.create({
//         user_id: trip.driver_id,
//         title: "تغيير في حالة الرحلة",
//         message: `تم تغيير حالة رحلتك إلى ${statusText}`,
//         type: "trip_status",
//         is_read: false
//       });
//     } catch (notificationError) {
//       console.log("ملاحظة: لم يتم إرسال إشعار تغيير الحالة", notificationError);
//     }

//     res.json({
//       message: "تم تحديث حالة الرحلة بنجاح",
//       trip: {
//         id: trip.id,
//         status: trip.status,
//         start_time: trip.start_time,
//         end_time: trip.end_time
//       }
//     });

//   } catch (err) {
//     console.error("Error updating trip status:", err);
//     res.status(500).json({ 
//       message: "خطأ في تحديث حالة الرحلة", 
//       error: err.message 
//     });
//   }
// };

// // ✅ جلب رحلات سائق معين
// exports.getDriverTrips = async (req, res) => {
//   try {
//     const { driver_id } = req.params;
    
//     // ✅ التصحيح: إذا كان المستخدم سائق (userType=5) وليس مشرف، تأكد أنه يطلب رحلاته فقط
//     if (req.user.userType === 5 && req.user.id !== parseInt(driver_id)) {
//       return res.status(403).json({ 
//         message: "غير مسموح لك بمشاهدة رحلات سائقين آخرين" 
//       });
//     }

//     // ✅ التحقق من أن السائق موجود ومن النوع الصحيح
//     const driver = await User.findOne({
//       where: { 
//         id: driver_id,
//         userType: 5 
//       }
//     });

//     if (!driver) {
//       return res.status(404).json({ 
//         message: "السائق غير موجود أو ليس من النوع الصحيح" 
//       });
//     }

//     const trips = await Trip.findAll({
//       where: { driver_id },
//       include: [
//         {
//           model: Line,
//           attributes: ["id", "line_name"],
//           include: [{
//             model: Station,
//             through: { attributes: ["station_order"] },
//             attributes: ["id", "name", "location"]
//           }]
//         },
//         {
//           model: Train,
//           attributes: ["id", "version_number", "capacity", "status"]
//         },
//         {
//           model: User,
//           as: "driver",
//           attributes: ["id", "username", "email"]
//         }
//       ],
//       order: [["start_time", "DESC"]]
//     });

//     res.json({
//       message: "تم جلب رحلات السائق بنجاح",
//       trips: trips,
//       count: trips.length
//     });

//   } catch (err) {
//     console.error("Error fetching driver trips:", err);
//     res.status(500).json({ 
//       message: "خطأ في جلب رحلات السائق", 
//       error: err.message 
//     });
//   }
// };

// // ✅ جلب رحلات السائق الحالي (للسائق نفسه)
// exports.getMyTrips = async (req, res) => {
//   try {
//     const driver_id = req.user.id; // ✅ السائق الحالي

//     if (req.user.userType !== 5) {
//       return res.status(403).json({ 
//         message: "هذه الخدمة مخصصة للسائقين فقط" 
//       });
//     }

//     const trips = await Trip.findAll({
//       where: { driver_id },
//       include: [
//         {
//           model: Line,
//           attributes: ["id", "line_name"],
//           include: [{
//             model: Station,
//             through: { attributes: ["station_order"] },
//             attributes: ["id", "name", "location"]
//           }]
//         },
//         {
//           model: Train,
//           attributes: ["id", "version_number", "capacity", "status"]
//         }
//       ],
//       order: [["start_time", "DESC"]]
//     });

//     res.json({
//       message: "تم جلب رحلاتك بنجاح",
//       trips: trips,
//       count: trips.length
//     });

//   } catch (err) {
//     console.error("Error fetching driver trips:", err);
//     res.status(500).json({ 
//       message: "خطأ في جلب رحلاتك", 
//       error: err.message 
//     });
//   }
// };



// ****************************************************************************************************************



// const db = require("../models");
// const Trip = db.Trip;
// const Line = db.Line;
// const Train = db.Train;
// const User = db.User;
// const Station = db.Station;
// const LineStation = db.LineStation;
// const Notification = db.Notification;
// const sequelize = db.sequelize;
// const Op = db.Sequelize.Op;

// // ✅ جلب السائقين المتاحين للفرونت إند (إضافة جديدة)
// exports.getAvailableDrivers = async (req, res) => {
//   try {
//     const drivers = await User.findAll({
//       where: { 
//         userType: 5 
//       },
//       attributes: ['id', 'username', 'email', 'phone_number'],
//       order: [['username', 'ASC']]
//     });

//     res.json({
//       message: "تم جلب السائقين المتاحين بنجاح",
//       drivers: drivers,
//       count: drivers.length
//     });
//   } catch (err) {
//     console.error("Error fetching drivers:", err);
//     res.status(500).json({ 
//       message: "خطأ في جلب السائقين", 
//       error: err.message 
//     });
//   }
// };

// // ✅ إنشاء رحلة جديدة (للسوبر أدمن userType=2 والمشرف userType=3 فقط)
// exports.createTrip = async (req, res) => {
//   const transaction = await sequelize.transaction();
  
//   try {
//     const { start_time, end_time, line_id, train_id, driver_id, passenger_count = 0, status = "off" } = req.body;

//     // التحقق من البيانات المطلوبة
//     if (!start_time || !end_time || !line_id || !train_id || !driver_id) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: "جميع الحقول مطلوبة: start_time, end_time, line_id, train_id, driver_id" 
//       });
//     }

//     // التحقق من صحة التواريخ
//     const startTime = new Date(start_time);
//     const endTime = new Date(end_time);
    
//     if (startTime >= endTime) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: "وقت البدء يجب أن يكون قبل وقت الانتهاء" 
//       });
//     }

//     // التحقق من وجود الخط
//     const line = await Line.findByPk(line_id, { transaction });
//     if (!line) {
//       await transaction.rollback();
//       return res.status(404).json({ message: "الخط غير موجود" });
//     }

//     // التحقق من وجود القطار
//     const train = await Train.findByPk(train_id, { transaction });
//     if (!train) {
//       await transaction.rollback();
//       return res.status(404).json({ message: "القطار غير موجود" });
//     }

//     // ✅ التصحيح: التحقق من وجود السائق وأنه من النوع الصحيح (userType = 5) للسائقين
//     const driver = await User.findOne({
//       where: { 
//         id: driver_id,
//         userType: 5 // ✅ تغيير من 4 إلى 5
//       },
//       transaction
//     });
    
//     if (!driver) {
//       await transaction.rollback();
//       return res.status(404).json({ message: "السائق غير موجود أو ليس من النوع الصحيح (يجب أن يكون userType = 5)" });
//     }

//     // ✅ التحقق من أن القطار متاح (ليس في رحلة أخرى في نفس الوقت)
//     const conflictingTrainTrip = await Trip.findOne({
//       where: {
//         train_id,
//         [Op.or]: [
//           {
//             start_time: { [Op.lt]: endTime },
//             end_time: { [Op.gt]: startTime }
//           }
//         ]
//       },
//       transaction
//     });

//     if (conflictingTrainTrip) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: "القطار مشغول في رحلة أخرى خلال هذا الوقت" 
//       });
//     }

//     // ✅ التحقق من أن السائق متاح (ليس في رحلة أخرى في نفس الوقت)
//     const conflictingDriverTrip = await Trip.findOne({
//       where: {
//         driver_id,
//         [Op.or]: [
//           {
//             start_time: { [Op.lt]: endTime },
//             end_time: { [Op.gt]: startTime }
//           }
//         ]
//       },
//       transaction
//     });

//     if (conflictingDriverTrip) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: "السائق مشغول في رحلة أخرى خلال هذا الوقت" 
//       });
//     }

//     // التحقق من الحالة
//     if (status && !["on", "off"].includes(status)) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: "الحالة يجب أن تكون 'on' أو 'off'" 
//       });
//     }

//     // إنشاء الرحلة
//     const newTrip = await Trip.create({
//       start_time: startTime,
//       end_time: endTime,
//       line_id,
//       train_id,
//       driver_id,
//       passenger_count: parseInt(passenger_count),
//       status
//     }, { transaction });

//     // ✅ إرسال إشعار للسائق عن الرحلة الجديدة
//     try {
//       await Notification.create({
//         user_id: driver_id,
//         title: "رحلة جديدة مخصصة لك",
//         message: `تم تعيينك كسائق لرحلة جديدة تبدأ في ${startTime.toLocaleString()} على الخط ${line.line_name}`,
//         type: "trip_assignment",
//         is_read: false
//       }, { transaction });
//     } catch (notificationError) {
//       console.log("ملاحظة: لم يتم إرسال الإشعار للسائق", notificationError);
//       // لا نوقف العملية إذا فشل الإشعار
//     }

//     await transaction.commit();

//     // جلب الرحلة مع بياناتها الكاملة
//     const tripWithDetails = await Trip.findOne({
//       where: { id: newTrip.id },
//       include: [
//         {
//           model: Line,
//           attributes: ["id", "line_name"],
//           include: [{
//             model: Station,
//             through: { 
//               attributes: ["station_order"] 
//             },
//             attributes: ["id", "name", "location"]
//           }]
//         },
//         {
//           model: Train,
//           attributes: ["id", "version_number", "capacity", "status"]
//         },
//         {
//           model: User,
//           as: "driver",
//           attributes: ["id", "username", "email"]
//         }
//       ]
//     });

//     res.status(201).json({
//       message: "تم إنشاء الرحلة بنجاح وإرسال إشعار للسائق",
//       trip: tripWithDetails
//     });

//   } catch (err) {
//     await transaction.rollback();
//     console.error("Error creating trip:", err);
//     res.status(500).json({ 
//       message: "خطأ في إنشاء الرحلة", 
//       error: err.message 
//     });
//   }
// };

// // ✅ جلب جميع الرحلات
// exports.getAllTrips = async (req, res) => {
//   try {
//     const { status, line_id, train_id, driver_id, date } = req.query;
    
//     let whereClause = {};
    
//     // فلترة حسب الحالة
//     if (status && ["on", "off"].includes(status)) {
//       whereClause.status = status;
//     }
    
//     // فلترة حسب الخط
//     if (line_id) {
//       whereClause.line_id = line_id;
//     }

//     // فلترة حسب القطار
//     if (train_id) {
//       whereClause.train_id = train_id;
//     }

//     // فلترة حسب السائق
//     if (driver_id) {
//       whereClause.driver_id = driver_id;
//     }
    
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

//     const trips = await Trip.findAll({
//       where: whereClause,
//       include: [
//         {
//           model: Line,
//           attributes: ["id", "line_name"],
//           include: [{
//             model: Station,
//             through: { attributes: ["station_order"] },
//             attributes: ["id", "name", "location"]
//           }]
//         },
//         {
//           model: Train,
//           attributes: ["id", "version_number", "capacity", "status"]
//         },
//         {
//           model: User,
//           as: "driver",
//           attributes: ["id", "username", "email"]
//         }
//       ],
//       order: [["start_time", "ASC"]]
//     });

//     res.json({
//       message: "تم جلب الرحلات بنجاح",
//       trips: trips,
//       count: trips.length
//     });

//   } catch (err) {
//     console.error("Error fetching trips:", err);
//     res.status(500).json({ 
//       message: "خطأ في جلب الرحلات", 
//       error: err.message 
//     });
//   }
// };

// // ✅ جلب رحلة محددة
// exports.getTripById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const trip = await Trip.findOne({
//       where: { id },
//       include: [
//         {
//           model: Line,
//           attributes: ["id", "line_name"],
//           include: [{
//             model: Station,
//             through: { 
//               attributes: ["station_order"] 
//             },
//             attributes: ["id", "name", "location"]
//           }]
//         },
//         {
//           model: Train,
//           attributes: ["id", "version_number", "capacity", "status"]
//         },
//         {
//           model: User,
//           as: "driver",
//           attributes: ["id", "username", "email", "phone_number"]
//         }
//       ]
//     });

//     if (!trip) {
//       return res.status(404).json({ message: "الرحلة غير موجودة" });
//     }

//     res.json({
//       message: "تم جلب الرحلة بنجاح",
//       trip: trip
//     });

//   } catch (err) {
//     console.error("Error fetching trip:", err);
//     res.status(500).json({ 
//       message: "خطأ في جلب الرحلة", 
//       error: err.message 
//     });
//   }
// };

// // ✅ تحديث رحلة (للسوبر أدمن userType=2 والمشرف userType=3 فقط)
// exports.updateTrip = async (req, res) => {
//   const transaction = await sequelize.transaction();
  
//   try {
//     const { id } = req.params;
//     const { start_time, end_time, line_id, train_id, driver_id, passenger_count, status } = req.body;

//     const trip = await Trip.findByPk(id, { transaction });
//     if (!trip) {
//       await transaction.rollback();
//       return res.status(404).json({ message: "الرحلة غير موجودة" });
//     }

//     // التحقق من صحة التواريخ إذا تم تحديثها
//     if (start_time && end_time) {
//       const startTime = new Date(start_time);
//       const endTime = new Date(end_time);
      
//       if (startTime >= endTime) {
//         await transaction.rollback();
//         return res.status(400).json({ 
//           message: "وقت البدء يجب أن يكون قبل وقت الانتهاء" 
//         });
//       }
//     }

//     // التحقق من وجود الخط إذا تم تحديثه
//     if (line_id) {
//       const line = await Line.findByPk(line_id, { transaction });
//       if (!line) {
//         await transaction.rollback();
//         return res.status(404).json({ message: "الخط غير موجود" });
//       }
//     }

//     // التحقق من وجود القطار إذا تم تحديثه
//     if (train_id) {
//       const train = await Train.findByPk(train_id, { transaction });
//       if (!train) {
//         await transaction.rollback();
//         return res.status(404).json({ message: "القطار غير موجود" });
//       }
//     }

//     // ✅ التصحيح: التحقق من وجود السائق إذا تم تحديثه (userType = 5)
//     if (driver_id) {
//       const driver = await User.findOne({
//         where: { 
//           id: driver_id,
//           userType: 5 // ✅ تغيير من 4 إلى 5
//         },
//         transaction
//       });
      
//       if (!driver) {
//         await transaction.rollback();
//         return res.status(404).json({ message: "السائق غير موجود أو ليس من النوع الصحيح (يجب أن يكون userType = 5)" });
//       }
//     }

//     // التحقق من تعارض الرحلات إذا تم تغيير القطار أو السائق أو الوقت
//     const startTime = start_time ? new Date(start_time) : trip.start_time;
//     const endTime = end_time ? new Date(end_time) : trip.end_time;
//     const checkTrainId = train_id || trip.train_id;
//     const checkDriverId = driver_id || trip.driver_id;

//     if (checkTrainId !== trip.train_id || checkDriverId !== trip.driver_id || start_time || end_time) {
//       const conflictingTrip = await Trip.findOne({
//         where: {
//           id: { [Op.ne]: id },
//           [Op.or]: [
//             {
//               train_id: checkTrainId,
//               [Op.or]: [
//                 {
//                   start_time: { [Op.lt]: endTime },
//                   end_time: { [Op.gt]: startTime }
//                 }
//               ]
//             },
//             {
//               driver_id: checkDriverId,
//               [Op.or]: [
//                 {
//                   start_time: { [Op.lt]: endTime },
//                   end_time: { [Op.gt]: startTime }
//                 }
//               ]
//             }
//           ]
//         },
//         transaction
//       });

//       if (conflictingTrip) {
//         await transaction.rollback();
//         return res.status(400).json({ 
//           message: "تعارض في المواعيد: القطار أو السائق مشغول في رحلة أخرى خلال هذا الوقت" 
//         });
//       }
//     }

//     // التحقق من الحالة إذا تم تحديثها
//     if (status && !["on", "off"].includes(status)) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: "الحالة يجب أن تكون 'on' أو 'off'" 
//       });
//     }

//     // ✅ إرسال إشعار إذا تم تغيير السائق
//     let notificationSent = false;
//     if (driver_id && driver_id !== trip.driver_id) {
//       try {
//         await Notification.create({
//           user_id: driver_id,
//           title: "تم تعيينك في رحلة جديدة",
//           message: `تم تعيينك كسائق لرحلة تبدأ في ${startTime.toLocaleString()}`,
//           type: "trip_update",
//           is_read: false
//         }, { transaction });
//         notificationSent = true;
//       } catch (notificationError) {
//         console.log("ملاحظة: لم يتم إرسال الإشعار للسائق", notificationError);
//       }
//     }

//     // تحديث البيانات
//     await trip.update({
//       ...(start_time && { start_time: new Date(start_time) }),
//       ...(end_time && { end_time: new Date(end_time) }),
//       ...(line_id && { line_id }),
//       ...(train_id && { train_id }),
//       ...(driver_id && { driver_id }),
//       ...(passenger_count && { passenger_count: parseInt(passenger_count) }),
//       ...(status && { status })
//     }, { transaction });

//     await transaction.commit();

//     // جلب الرحلة المحدثة
//     const updatedTrip = await Trip.findOne({
//       where: { id },
//       include: [
//         {
//           model: Line,
//           attributes: ["id", "line_name"],
//           include: [{
//             model: Station,
//             through: { 
//               attributes: ["station_order"] 
//             },
//             attributes: ["id", "name", "location"]
//           }]
//         },
//         {
//           model: Train,
//           attributes: ["id", "version_number", "capacity", "status"]
//         },
//         {
//           model: User,
//           as: "driver",
//           attributes: ["id", "username", "email"]
//         }
//       ]
//     });

//     const responseMessage = notificationSent 
//       ? "تم تحديث الرحلة بنجاح وإرسال إشعار للسائق الجديد"
//       : "تم تحديث الرحلة بنجاح";

//     res.json({
//       message: responseMessage,
//       trip: updatedTrip
//     });

//   } catch (err) {
//     await transaction.rollback();
//     console.error("Error updating trip:", err);
//     res.status(500).json({ 
//       message: "خطأ في تحديث الرحلة", 
//       error: err.message 
//     });
//   }
// };

// // ✅ حذف رحلة (للسوبر أدمن userType=2 فقط)
// exports.deleteTrip = async (req, res) => {
//   const transaction = await sequelize.transaction();
  
//   try {
//     const { id } = req.params;

//     const trip = await Trip.findByPk(id, { 
//       include: [{
//         model: User,
//         as: "driver",
//         attributes: ["id", "username"]
//       }],
//       transaction 
//     });
    
//     if (!trip) {
//       await transaction.rollback();
//       return res.status(404).json({ message: "الرحلة غير موجودة" });
//     }

//     // ✅ إرسال إشعار للسائق بإلغاء الرحلة
//     try {
//       await Notification.create({
//         user_id: trip.driver_id,
//         title: "تم إلغاء الرحلة",
//         message: `تم إلغاء الرحلة التي كانت مقررة في ${trip.start_time.toLocaleString()}`,
//         type: "trip_cancellation",
//         is_read: false
//       }, { transaction });
//     } catch (notificationError) {
//       console.log("ملاحظة: لم يتم إرسال إشعار الإلغاء للسائق", notificationError);
//     }

//     await trip.destroy({ transaction });
//     await transaction.commit();

//     res.json({ 
//       message: "تم حذف الرحلة بنجاح وإرسال إشعار للسائق" 
//     });

//   } catch (err) {
//     await transaction.rollback();
//     console.error("Error deleting trip:", err);
//     res.status(500).json({ 
//       message: "خطأ في حذف الرحلة", 
//       error: err.message 
//     });
//   }
// };

// // ✅ تحديث حالة الرحلة (للسوبر أدمن userType=2 والمشرف userType=3)
// exports.updateTripStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     if (!status || !["on", "off"].includes(status)) {
//       return res.status(400).json({ 
//         message: "الحالة يجب أن تكون 'on' أو 'off'" 
//       });
//     }

//     const trip = await Trip.findByPk(id, {
//       include: [{
//         model: User,
//         as: "driver",
//         attributes: ["id", "username"]
//       }]
//     });
    
//     if (!trip) {
//       return res.status(404).json({ message: "الرحلة غير موجودة" });
//     }

//     await trip.update({ status });

//     // ✅ إرسال إشعار للسائق بتغيير حالة الرحلة
//     try {
//       const statusText = status === "on" ? "مفعلة" : "متوقفة";
//       await Notification.create({
//         user_id: trip.driver_id,
//         title: "تغيير في حالة الرحلة",
//         message: `تم تغيير حالة رحلتك إلى ${statusText}`,
//         type: "trip_status",
//         is_read: false
//       });
//     } catch (notificationError) {
//       console.log("ملاحظة: لم يتم إرسال إشعار تغيير الحالة", notificationError);
//     }

//     res.json({
//       message: "تم تحديث حالة الرحلة بنجاح",
//       trip: {
//         id: trip.id,
//         status: trip.status,
//         start_time: trip.start_time,
//         end_time: trip.end_time
//       }
//     });

//   } catch (err) {
//     console.error("Error updating trip status:", err);
//     res.status(500).json({ 
//       message: "خطأ في تحديث حالة الرحلة", 
//       error: err.message 
//     });
//   }
// };

// // ✅ جلب رحلات سائق معين
// exports.getDriverTrips = async (req, res) => {
//   try {
//     const { driver_id } = req.params;
    
//     // ✅ التصحيح: إذا كان المستخدم سائق (userType=5) وليس مشرف، تأكد أنه يطلب رحلاته فقط
//     if (req.user.userType === 5 && req.user.id !== parseInt(driver_id)) {
//       return res.status(403).json({ 
//         message: "غير مسموح لك بمشاهدة رحلات سائقين آخرين" 
//       });
//     }

//     // ✅ التحقق من أن السائق موجود ومن النوع الصحيح
//     const driver = await User.findOne({
//       where: { 
//         id: driver_id,
//         userType: 5 
//       }
//     });

//     if (!driver) {
//       return res.status(404).json({ 
//         message: "السائق غير موجود أو ليس من النوع الصحيح" 
//       });
//     }

//     const trips = await Trip.findAll({
//       where: { driver_id },
//       include: [
//         {
//           model: Line,
//           attributes: ["id", "line_name"],
//           include: [{
//             model: Station,
//             through: { attributes: ["station_order"] },
//             attributes: ["id", "name", "location"]
//           }]
//         },
//         {
//           model: Train,
//           attributes: ["id", "version_number", "capacity", "status"]
//         },
//         {
//           model: User,
//           as: "driver",
//           attributes: ["id", "username", "email"]
//         }
//       ],
//       order: [["start_time", "DESC"]]
//     });

//     res.json({
//       message: "تم جلب رحلات السائق بنجاح",
//       trips: trips,
//       count: trips.length
//     });

//   } catch (err) {
//     console.error("Error fetching driver trips:", err);
//     res.status(500).json({ 
//       message: "خطأ في جلب رحلات السائق", 
//       error: err.message 
//     });
//   }
// };

// // ✅ جلب رحلات السائق الحالي (للسائق نفسه)
// exports.getMyTrips = async (req, res) => {
//   try {
//     const driver_id = req.user.id; // ✅ السائق الحالي

//     if (req.user.userType !== 5) {
//       return res.status(403).json({ 
//         message: "هذه الخدمة مخصصة للسائقين فقط" 
//       });
//     }

//     const trips = await Trip.findAll({
//       where: { driver_id },
//       include: [
//         {
//           model: Line,
//           attributes: ["id", "line_name"],
//           include: [{
//             model: Station,
//             through: { attributes: ["station_order"] },
//             attributes: ["id", "name", "location"]
//           }]
//         },
//         {
//           model: Train,
//           attributes: ["id", "version_number", "capacity", "status"]
//         }
//       ],
//       order: [["start_time", "DESC"]]
//     });

//     res.json({
//       message: "تم جلب رحلاتك بنجاح",
//       trips: trips,
//       count: trips.length
//     });

//   } catch (err) {
//     console.error("Error fetching driver trips:", err);
//     res.status(500).json({ 
//       message: "خطأ في جلب رحلاتك", 
//       error: err.message 
//     });
//   }
// };


// ****************************************************************************************************************






const db = require("../models");
const Trip = db.Trip;
const Line = db.Line;
const Train = db.Train;
const User = db.User;
const Station = db.Station;
const LineStation = db.LineStation;
const Notification = db.Notification;
const sequelize = db.sequelize;
const Op = db.Sequelize.Op;

// ✅ جلب السائقين المتاحين للفرونت إند
exports.getAvailableDrivers = async (req, res) => {
  try {
    const drivers = await User.findAll({
      where: { 
        userType: 5 
      },
      attributes: ['id', 'username', 'email', 'phone_number'],
      order: [['username', 'ASC']]
    });

    res.json({
      message: "تم جلب السائقين المتاحين بنجاح",
      drivers: drivers,
      count: drivers.length
    });
  } catch (err) {
    console.error("Error fetching drivers:", err);
    res.status(500).json({ 
      message: "خطأ في جلب السائقين", 
      error: err.message 
    });
  }
};

// ✅ جلب الخطوط المتاحة للفرونت إند (إضافة جديدة)
exports.getAvailableLines = async (req, res) => {
  try {
    const lines = await Line.findAll({
      attributes: ['id', 'line_name'],
      include: [{
        model: Station,
        through: { 
          attributes: ["station_order"] 
        },
        attributes: ["id", "name", "location"]
      }],
      order: [['line_name', 'ASC']]
    });

    res.json({
      message: "تم جلب الخطوط المتاحة بنجاح",
      lines: lines,
      count: lines.length
    });
  } catch (err) {
    console.error("Error fetching lines:", err);
    res.status(500).json({ 
      message: "خطأ في جلب الخطوط", 
      error: err.message 
    });
  }
};

// ✅ إنشاء رحلة جديدة (للسوبر أدمن userType=2 والمشرف userType=3 فقط)
exports.createTrip = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { start_time, end_time, line_id, train_id, driver_id, passenger_count = 0, status = "off" } = req.body;

    // التحقق من البيانات المطلوبة
    if (!start_time || !end_time || !line_id || !train_id || !driver_id) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: "جميع الحقول مطلوبة: start_time, end_time, line_id, train_id, driver_id" 
      });
    }

    // التحقق من صحة التواريخ
    const startTime = new Date(start_time);
    const endTime = new Date(end_time);
    
    if (startTime >= endTime) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: "وقت البدء يجب أن يكون قبل وقت الانتهاء" 
      });
    }

    // التحقق من وجود الخط
    const line = await Line.findByPk(line_id, { transaction });
    if (!line) {
      await transaction.rollback();
      return res.status(404).json({ message: "الخط غير موجود" });
    }

    // التحقق من وجود القطار
    const train = await Train.findByPk(train_id, { transaction });
    if (!train) {
      await transaction.rollback();
      return res.status(404).json({ message: "القطار غير موجود" });
    }

    // التحقق من وجود السائق وأنه من النوع الصحيح (userType = 5)
    const driver = await User.findOne({
      where: { 
        id: driver_id,
        userType: 5
      },
      transaction
    });
    
    if (!driver) {
      await transaction.rollback();
      return res.status(404).json({ message: "السائق غير موجود أو ليس من النوع الصحيح (يجب أن يكون userType = 5)" });
    }

    // التحقق من أن القطار متاح (ليس في رحلة أخرى في نفس الوقت)
    const conflictingTrainTrip = await Trip.findOne({
      where: {
        train_id,
        [Op.or]: [
          {
            start_time: { [Op.lt]: endTime },
            end_time: { [Op.gt]: startTime }
          }
        ]
      },
      transaction
    });

    if (conflictingTrainTrip) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: "القطار مشغول في رحلة أخرى خلال هذا الوقت" 
      });
    }

    // التحقق من أن السائق متاح (ليس في رحلة أخرى في نفس الوقت)
    const conflictingDriverTrip = await Trip.findOne({
      where: {
        driver_id,
        [Op.or]: [
          {
            start_time: { [Op.lt]: endTime },
            end_time: { [Op.gt]: startTime }
          }
        ]
      },
      transaction
    });

    if (conflictingDriverTrip) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: "السائق مشغول في رحلة أخرى خلال هذا الوقت" 
      });
    }

    // التحقق من الحالة
    if (status && !["on", "off"].includes(status)) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: "الحالة يجب أن تكون 'on' أو 'off'" 
      });
    }

    // إنشاء الرحلة
    const newTrip = await Trip.create({
      start_time: startTime,
      end_time: endTime,
      line_id,
      train_id,
      driver_id,
      passenger_count: parseInt(passenger_count),
      status
    }, { transaction });

    // إرسال إشعار للسائق عن الرحلة الجديدة
    try {
      await Notification.create({
        user_id: driver_id,
        title: "رحلة جديدة مخصصة لك",
        message: `تم تعيينك كسائق لرحلة جديدة تبدأ في ${startTime.toLocaleString()} على الخط ${line.line_name}`,
        type: "trip_assignment",
        is_read: false
      }, { transaction });
    } catch (notificationError) {
      console.log("ملاحظة: لم يتم إرسال الإشعار للسائق", notificationError);
      // لا نوقف العملية إذا فشل الإشعار
    }

    await transaction.commit();

    // جلب الرحلة مع بياناتها الكاملة
    const tripWithDetails = await Trip.findOne({
      where: { id: newTrip.id },
      include: [
        {
          model: Line,
          attributes: ["id", "line_name"],
          include: [{
            model: Station,
            through: { 
              attributes: ["station_order"] 
            },
            attributes: ["id", "name", "location"]
          }]
        },
        {
          model: Train,
          attributes: ["id", "version_number", "capacity", "status"]
        },
        {
          model: User,
          as: "driver",
          attributes: ["id", "username", "email"]
        }
      ]
    });

    res.status(201).json({
      message: "تم إنشاء الرحلة بنجاح وإرسال إشعار للسائق",
      trip: tripWithDetails
    });

  } catch (err) {
    await transaction.rollback();
    console.error("Error creating trip:", err);
    res.status(500).json({ 
      message: "خطأ في إنشاء الرحلة", 
      error: err.message 
    });
  }
};

// ✅ جلب جميع الرحلات
exports.getAllTrips = async (req, res) => {
  try {
    const { status, line_id, train_id, driver_id, date } = req.query;
    
    let whereClause = {};
    
    // فلترة حسب الحالة
    if (status && ["on", "off"].includes(status)) {
      whereClause.status = status;
    }
    
    // فلترة حسب الخط
    if (line_id) {
      whereClause.line_id = line_id;
    }

    // فلترة حسب القطار
    if (train_id) {
      whereClause.train_id = train_id;
    }

    // فلترة حسب السائق
    if (driver_id) {
      whereClause.driver_id = driver_id;
    }
    
    // فلترة حسب التاريخ
    if (date) {
      const filterDate = new Date(date);
      const nextDay = new Date(filterDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      whereClause.start_time = {
        [Op.gte]: filterDate,
        [Op.lt]: nextDay
      };
    }

    const trips = await Trip.findAll({
      where: whereClause,
      include: [
        {
          model: Line,
          attributes: ["id", "line_name"],
          include: [{
            model: Station,
            through: { attributes: ["station_order"] },
            attributes: ["id", "name", "location"]
          }]
        },
        {
          model: Train,
          attributes: ["id", "version_number", "capacity", "status"]
        },
        {
          model: User,
          as: "driver",
          attributes: ["id", "username", "email"]
        }
      ],
      order: [["start_time", "ASC"]]
    });

    res.json({
      message: "تم جلب الرحلات بنجاح",
      trips: trips,
      count: trips.length
    });

  } catch (err) {
    console.error("Error fetching trips:", err);
    res.status(500).json({ 
      message: "خطأ في جلب الرحلات", 
      error: err.message 
    });
  }
};

// ✅ جلب رحلة محددة
exports.getTripById = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findOne({
      where: { id },
      include: [
        {
          model: Line,
          attributes: ["id", "line_name"],
          include: [{
            model: Station,
            through: { 
              attributes: ["station_order"] 
            },
            attributes: ["id", "name", "location"]
          }]
        },
        {
          model: Train,
          attributes: ["id", "version_number", "capacity", "status"]
        },
        {
          model: User,
          as: "driver",
          attributes: ["id", "username", "email", "phone_number"]
        }
      ]
    });

    if (!trip) {
      return res.status(404).json({ message: "الرحلة غير موجودة" });
    }

    res.json({
      message: "تم جلب الرحلة بنجاح",
      trip: trip
    });

  } catch (err) {
    console.error("Error fetching trip:", err);
    res.status(500).json({ 
      message: "خطأ في جلب الرحلة", 
      error: err.message 
    });
  }
};

// ✅ تحديث رحلة (للسوبر أدمن userType=2 والمشرف userType=3 فقط)
exports.updateTrip = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { start_time, end_time, line_id, train_id, driver_id, passenger_count, status } = req.body;

    const trip = await Trip.findByPk(id, { transaction });
    if (!trip) {
      await transaction.rollback();
      return res.status(404).json({ message: "الرحلة غير موجودة" });
    }

    // التحقق من صحة التواريخ إذا تم تحديثها
    if (start_time && end_time) {
      const startTime = new Date(start_time);
      const endTime = new Date(end_time);
      
      if (startTime >= endTime) {
        await transaction.rollback();
        return res.status(400).json({ 
          message: "وقت البدء يجب أن يكون قبل وقت الانتهاء" 
        });
      }
    }

    // التحقق من وجود الخط إذا تم تحديثه
    if (line_id) {
      const line = await Line.findByPk(line_id, { transaction });
      if (!line) {
        await transaction.rollback();
        return res.status(404).json({ message: "الخط غير موجود" });
      }
    }

    // التحقق من وجود القطار إذا تم تحديثه
    if (train_id) {
      const train = await Train.findByPk(train_id, { transaction });
      if (!train) {
        await transaction.rollback();
        return res.status(404).json({ message: "القطار غير موجود" });
      }
    }

    // التحقق من وجود السائق إذا تم تحديثه (userType = 5)
    if (driver_id) {
      const driver = await User.findOne({
        where: { 
          id: driver_id,
          userType: 5
        },
        transaction
      });
      
      if (!driver) {
        await transaction.rollback();
        return res.status(404).json({ message: "السائق غير موجود أو ليس من النوع الصحيح (يجب أن يكون userType = 5)" });
      }
    }

    // التحقق من تعارض الرحلات إذا تم تغيير القطار أو السائق أو الوقت
    const startTime = start_time ? new Date(start_time) : trip.start_time;
    const endTime = end_time ? new Date(end_time) : trip.end_time;
    const checkTrainId = train_id || trip.train_id;
    const checkDriverId = driver_id || trip.driver_id;

    if (checkTrainId !== trip.train_id || checkDriverId !== trip.driver_id || start_time || end_time) {
      const conflictingTrip = await Trip.findOne({
        where: {
          id: { [Op.ne]: id },
          [Op.or]: [
            {
              train_id: checkTrainId,
              [Op.or]: [
                {
                  start_time: { [Op.lt]: endTime },
                  end_time: { [Op.gt]: startTime }
                }
              ]
            },
            {
              driver_id: checkDriverId,
              [Op.or]: [
                {
                  start_time: { [Op.lt]: endTime },
                  end_time: { [Op.gt]: startTime }
                }
              ]
            }
          ]
        },
        transaction
      });

      if (conflictingTrip) {
        await transaction.rollback();
        return res.status(400).json({ 
          message: "تعارض في المواعيد: القطار أو السائق مشغول في رحلة أخرى خلال هذا الوقت" 
        });
      }
    }

    // التحقق من الحالة إذا تم تحديثها
    if (status && !["on", "off"].includes(status)) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: "الحالة يجب أن تكون 'on' أو 'off'" 
      });
    }

    // إرسال إشعار إذا تم تغيير السائق
    let notificationSent = false;
    if (driver_id && driver_id !== trip.driver_id) {
      try {
        await Notification.create({
          user_id: driver_id,
          title: "تم تعيينك في رحلة جديدة",
          message: `تم تعيينك كسائق لرحلة تبدأ في ${startTime.toLocaleString()}`,
          type: "trip_update",
          is_read: false
        }, { transaction });
        notificationSent = true;
      } catch (notificationError) {
        console.log("ملاحظة: لم يتم إرسال الإشعار للسائق", notificationError);
      }
    }

    // تحديث البيانات
    await trip.update({
      ...(start_time && { start_time: new Date(start_time) }),
      ...(end_time && { end_time: new Date(end_time) }),
      ...(line_id && { line_id }),
      ...(train_id && { train_id }),
      ...(driver_id && { driver_id }),
      ...(passenger_count && { passenger_count: parseInt(passenger_count) }),
      ...(status && { status })
    }, { transaction });

    await transaction.commit();

    // جلب الرحلة المحدثة
    const updatedTrip = await Trip.findOne({
      where: { id },
      include: [
        {
          model: Line,
          attributes: ["id", "line_name"],
          include: [{
            model: Station,
            through: { 
              attributes: ["station_order"] 
            },
            attributes: ["id", "name", "location"]
          }]
        },
        {
          model: Train,
          attributes: ["id", "version_number", "capacity", "status"]
        },
        {
          model: User,
          as: "driver",
          attributes: ["id", "username", "email"]
        }
      ]
    });

    const responseMessage = notificationSent 
      ? "تم تحديث الرحلة بنجاح وإرسال إشعار للسائق الجديد"
      : "تم تحديث الرحلة بنجاح";

    res.json({
      message: responseMessage,
      trip: updatedTrip
    });

  } catch (err) {
    await transaction.rollback();
    console.error("Error updating trip:", err);
    res.status(500).json({ 
      message: "خطأ في تحديث الرحلة", 
      error: err.message 
    });
  }
};

// ✅ حذف رحلة (للسوبر أدمن userType=2 فقط)
exports.deleteTrip = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const trip = await Trip.findByPk(id, { 
      include: [{
        model: User,
        as: "driver",
        attributes: ["id", "username"]
      }],
      transaction 
    });
    
    if (!trip) {
      await transaction.rollback();
      return res.status(404).json({ message: "الرحلة غير موجودة" });
    }

    // إرسال إشعار للسائق بإلغاء الرحلة
    try {
      await Notification.create({
        user_id: trip.driver_id,
        title: "تم إلغاء الرحلة",
        message: `تم إلغاء الرحلة التي كانت مقررة في ${trip.start_time.toLocaleString()}`,
        type: "trip_cancellation",
        is_read: false
      }, { transaction });
    } catch (notificationError) {
      console.log("ملاحظة: لم يتم إرسال إشعار الإلغاء للسائق", notificationError);
    }

    await trip.destroy({ transaction });
    await transaction.commit();

    res.json({ 
      message: "تم حذف الرحلة بنجاح وإرسال إشعار للسائق" 
    });

  } catch (err) {
    await transaction.rollback();
    console.error("Error deleting trip:", err);
    res.status(500).json({ 
      message: "خطأ في حذف الرحلة", 
      error: err.message 
    });
  }
};

// ✅ تحديث حالة الرحلة (للسوبر أدمن userType=2 والمشرف userType=3)
exports.updateTripStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["on", "off"].includes(status)) {
      return res.status(400).json({ 
        message: "الحالة يجب أن تكون 'on' أو 'off'" 
      });
    }

    const trip = await Trip.findByPk(id, {
      include: [{
        model: User,
        as: "driver",
        attributes: ["id", "username"]
      }]
    });
    
    if (!trip) {
      return res.status(404).json({ message: "الرحلة غير موجودة" });
    }

    await trip.update({ status });

    // إرسال إشعار للسائق بتغيير حالة الرحلة
    try {
      const statusText = status === "on" ? "مفعلة" : "متوقفة";
      await Notification.create({
        user_id: trip.driver_id,
        title: "تغيير في حالة الرحلة",
        message: `تم تغيير حالة رحلتك إلى ${statusText}`,
        type: "trip_status",
        is_read: false
      });
    } catch (notificationError) {
      console.log("ملاحظة: لم يتم إرسال إشعار تغيير الحالة", notificationError);
    }

    res.json({
      message: "تم تحديث حالة الرحلة بنجاح",
      trip: {
        id: trip.id,
        status: trip.status,
        start_time: trip.start_time,
        end_time: trip.end_time
      }
    });

  } catch (err) {
    console.error("Error updating trip status:", err);
    res.status(500).json({ 
      message: "خطأ في تحديث حالة الرحلة", 
      error: err.message 
    });
  }
};

// ✅ جلب رحلات سائق معين
exports.getDriverTrips = async (req, res) => {
  try {
    const { driver_id } = req.params;
    
    // إذا كان المستخدم سائق (userType=5) وليس مشرف، تأكد أنه يطلب رحلاته فقط
    if (req.user.userType === 5 && req.user.id !== parseInt(driver_id)) {
      return res.status(403).json({ 
        message: "غير مسموح لك بمشاهدة رحلات سائقين آخرين" 
      });
    }

    // التحقق من أن السائق موجود ومن النوع الصحيح
    const driver = await User.findOne({
      where: { 
        id: driver_id,
        userType: 5 
      }
    });

    if (!driver) {
      return res.status(404).json({ 
        message: "السائق غير موجود أو ليس من النوع الصحيح" 
      });
    }

    const trips = await Trip.findAll({
      where: { driver_id },
      include: [
        {
          model: Line,
          attributes: ["id", "line_name"],
          include: [{
            model: Station,
            through: { attributes: ["station_order"] },
            attributes: ["id", "name", "location"]
          }]
        },
        {
          model: Train,
          attributes: ["id", "version_number", "capacity", "status"]
        },
        {
          model: User,
          as: "driver",
          attributes: ["id", "username", "email"]
        }
      ],
      order: [["start_time", "DESC"]]
    });

    res.json({
      message: "تم جلب رحلات السائق بنجاح",
      trips: trips,
      count: trips.length
    });

  } catch (err) {
    console.error("Error fetching driver trips:", err);
    res.status(500).json({ 
      message: "خطأ في جلب رحلات السائق", 
      error: err.message 
    });
  }
};

// ✅ جلب رحلات السائق الحالي (للسائق نفسه)
exports.getMyTrips = async (req, res) => {
  try {
    const driver_id = req.user.id; // السائق الحالي

    if (req.user.userType !== 5) {
      return res.status(403).json({ 
        message: "هذه الخدمة مخصصة للسائقين فقط" 
      });
    }

    const trips = await Trip.findAll({
      where: { driver_id },
      include: [
        {
          model: Line,
          attributes: ["id", "line_name"],
          include: [{
            model: Station,
            through: { attributes: ["station_order"] },
            attributes: ["id", "name", "location"]
          }]
        },
        {
          model: Train,
          attributes: ["id", "version_number", "capacity", "status"]
        }
      ],
      order: [["start_time", "DESC"]]
    });

    res.json({
      message: "تم جلب رحلاتك بنجاح",
      trips: trips,
      count: trips.length
    });

  } catch (err) {
    console.error("Error fetching driver trips:", err);
    res.status(500).json({ 
      message: "خطأ في جلب رحلاتك", 
      error: err.message 
    });
  }
};





