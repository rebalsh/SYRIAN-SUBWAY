
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

// // ✅ جلب السائقين المتاحين للفرونت إند
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

// // ✅ جلب الخطوط المتاحة للفرونت إند (إضافة جديدة)
// exports.getAvailableLines = async (req, res) => {
//   try {
//     const lines = await Line.findAll({
//       attributes: ['id', 'line_name'],
//       include: [{
//         model: Station,
//         through: { 
//           attributes: ["station_order"] 
//         },
//         attributes: ["id", "name", "location"]
//       }],
//       order: [['line_name', 'ASC']]
//     });

//     res.json({
//       message: "تم جلب الخطوط المتاحة بنجاح",
//       lines: lines,
//       count: lines.length
//     });
//   } catch (err) {
//     console.error("Error fetching lines:", err);
//     res.status(500).json({ 
//       message: "خطأ في جلب الخطوط", 
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

//     // التحقق من وجود السائق وأنه من النوع الصحيح (userType = 5)
//     const driver = await User.findOne({
//       where: { 
//         id: driver_id,
//         userType: 5
//       },
//       transaction
//     });
    
//     if (!driver) {
//       await transaction.rollback();
//       return res.status(404).json({ message: "السائق غير موجود أو ليس من النوع الصحيح (يجب أن يكون userType = 5)" });
//     }

//     // التحقق من أن القطار متاح (ليس في رحلة أخرى في نفس الوقت)
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

//     // التحقق من أن السائق متاح (ليس في رحلة أخرى في نفس الوقت)
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

//     // إرسال إشعار للسائق عن الرحلة الجديدة
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

//     // التحقق من وجود السائق إذا تم تحديثه (userType = 5)
//     if (driver_id) {
//       const driver = await User.findOne({
//         where: { 
//           id: driver_id,
//           userType: 5
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

//     // إرسال إشعار إذا تم تغيير السائق
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

//     // إرسال إشعار للسائق بإلغاء الرحلة
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

//     // إرسال إشعار للسائق بتغيير حالة الرحلة
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
    
//     // إذا كان المستخدم سائق (userType=5) وليس مشرف، تأكد أنه يطلب رحلاته فقط
//     if (req.user.userType === 5 && req.user.id !== parseInt(driver_id)) {
//       return res.status(403).json({ 
//         message: "غير مسموح لك بمشاهدة رحلات سائقين آخرين" 
//       });
//     }

//     // التحقق من أن السائق موجود ومن النوع الصحيح
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
//     const driver_id = req.user.id; // السائق الحالي

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
    const { 
      start_time, 
      end_time, 
      line_id, 
      train_id, 
      driver_id, 
      passenger_count = 0, 
      status = "off",
      // 🔴 الحقول الجديدة
      selected_time,
      is_base_trip = true,
      duration_hours = 2,
      is_auto_generated = false
    } = req.body;

    // 🔴 النظام الجديد: إذا أرسل selected_time، نبني start_time و end_time منه
    let startTime, endTime;
    
    if (selected_time) {
      // النظام الجديد: استخدام start_time كتاريخ فقط و selected_time كوقت
      if (!start_time) {
        await transaction.rollback();
        return res.status(400).json({ 
          message: "يجب إرسال start_time (التاريخ فقط مثل: 2024-01-20)" 
        });
      }
      
      // 🔴 معالجة التاريخ فقط (بدون وقت)
      // start_time تأتي كـ "2024-01-20" بدون وقت
      const baseDate = new Date(start_time + "T00:00:00"); // نضيف وقت افتراضي 00:00
      
      const [hours, minutes] = selected_time.split(':').map(Number);
      
      // 🔴 بناء start_time النهائي: التاريخ + الوقت المحدد
      startTime = new Date(baseDate);
      startTime.setHours(hours, minutes, 0, 0);
      
      // 🔴 حساب end_time: start_time + duration_hours
      endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + duration_hours);
      
      console.log(`✅ تم بناء: التاريخ ${start_time} + الوقت ${selected_time} = ${startTime.toISOString()}`);
      console.log(`✅ المدة: ${duration_hours} ساعة = ${endTime.toISOString()}`);
      
    } else {
      // النظام القديم: استخدام start_time و end_time مباشرة
      if (!start_time || !end_time) {
        await transaction.rollback();
        return res.status(400).json({ 
          message: "جميع الحقول مطلوبة: start_time, end_time, line_id, train_id, driver_id" 
        });
      }
      
      startTime = new Date(start_time);
      endTime = new Date(end_time);
    }
    
    // التحقق من صحة التواريخ
    if (startTime >= endTime) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: "وقت البدء يجب أن يكون قبل وقت الانتهاء" 
      });
    }

    // التحقق من البيانات المطلوبة
    if (!line_id || !train_id || !driver_id) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: "الحقول التالية مطلوبة: line_id, train_id, driver_id" 
      });
    }

    // التحقق من وجود الخط
    const line = await Line.findByPk(line_id, { transaction });
    if (!line) {
      await transaction.rollback();
      return res.status(400).json({ message: "الخط غير موجود" });
    }

    // التحقق من وجود القطار
    const train = await Train.findByPk(train_id, { transaction });
    if (!train) {
      await transaction.rollback();
      return res.status(400).json({ message: "القطار غير موجود" });
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
      return res.status(404).json({ 
        message: "السائق غير موجود أو ليس من النوع الصحيح (يجب أن يكون userType = 5)" 
      });
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
    if (status && !["on", "off", "cancelled", "delayed"].includes(status)) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: "الحالة يجب أن تكون 'on'، 'off'، 'cancelled'، أو 'delayed'" 
      });
    }

    // 🔴 بناء بيانات الرحلة مع الحقول الجديدة
    const tripData = {
      start_time: startTime,
      end_time: endTime,
      line_id,
      train_id,
      driver_id,
      passenger_count: parseInt(passenger_count),
      status,
      // 🔴 الحقول الجديدة
      is_auto_generated,
      is_base_trip,
      duration_hours: parseInt(duration_hours)
    };
    
    // 🔴 إضافة selected_time إذا تم إرساله
    if (selected_time) {
      tripData.selected_time = selected_time;
    }

    // إنشاء الرحلة
    const newTrip = await Trip.create(tripData, { transaction });

    // إرسال إشعار للسائق عن الرحلة الجديدة
    try {
      await Notification.create({
        user_id: driver_id,
        title: selected_time ? "رحلة جديدة مبرمجة" : "رحلة جديدة مخصصة لك",
        message: selected_time 
          ? `تم جدولة رحلة لك تبدأ في ${selected_time} لمدة ${duration_hours} ساعات`
          : `تم تعيينك كسائق لرحلة جديدة تبدأ في ${startTime.toLocaleString()}`,
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
      message: selected_time 
        ? "تم إنشاء الرحلة المبرمجة بنجاح" 
        : "تم إنشاء الرحلة بنجاح وإرسال إشعار للسائق",
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

// ✅ جلب جميع الرحلات (الرحلات العادية فقط - is_auto_generated = false)
exports.getAllTrips = async (req, res) => {
  try {
    const { status, line_id, train_id, driver_id, date } = req.query;
    
    // 🔴 فلترة افتراضية: الرحلات العادية فقط (غير الشهرية)
    let whereClause = {
      is_auto_generated: false
    };
    
    // فلترة حسب الحالة
    if (status && ["on", "off", "cancelled", "delayed"].includes(status)) {
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
      message: "تم جلب الرحلات العادية بنجاح",
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
    const { 
      start_time, 
      end_time, 
      line_id, 
      train_id, 
      driver_id, 
      passenger_count, 
      status,
      // 🔴 الحقول الجديدة
      selected_time,
      is_base_trip,
      duration_hours,
      is_auto_generated 
    } = req.body;

    const trip = await Trip.findByPk(id, { transaction });
    if (!trip) {
      await transaction.rollback();
      return res.status(404).json({ message: "الرحلة غير موجودة" });
    }

    // 🔴 النظام الجديد: إذا تم تحديث selected_time أو duration_hours
    let startTime = start_time ? new Date(start_time) : trip.start_time;
    let endTime = end_time ? new Date(end_time) : trip.end_time;
    
    if (selected_time || duration_hours) {
      const baseDate = start_time 
        ? new Date(start_time + "T00:00:00")  // التاريخ فقط
        : new Date(trip.start_time);
      
      if (selected_time) {
        const [hours, minutes] = selected_time.split(':').map(Number);
        startTime = new Date(baseDate);
        startTime.setHours(hours, minutes, 0, 0);
      }
      
      // تحديث end_time بناءً على duration_hours
      if (duration_hours) {
        endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + parseInt(duration_hours));
      } else if (selected_time) {
        // إذا تم تحديث selected_time فقط، نستخدم duration_hours الحالي
        endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + (trip.duration_hours || 2));
      }
    }

    // التحقق من صحة التواريخ
    if (startTime >= endTime) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: "وقت البدء يجب أن يكون قبل وقت الانتهاء" 
      });
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
        return res.status(404).json({ 
          message: "السائق غير موجود أو ليس من النوع الصحيح (يجب أن يكون userType = 5)" 
        });
      }
    }

    // التحقق من تعارض الرحلات
    const checkTrainId = train_id || trip.train_id;
    const checkDriverId = driver_id || trip.driver_id;

    if (checkTrainId !== trip.train_id || checkDriverId !== trip.driver_id || 
        startTime.getTime() !== trip.start_time.getTime() || 
        endTime.getTime() !== trip.end_time.getTime()) {
      
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
    if (status && !["on", "off", "cancelled", "delayed"].includes(status)) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: "الحالة يجب أن تكون 'on'، 'off'، 'cancelled'، أو 'delayed'" 
      });
    }

    // إرسال إشعار إذا تم تغيير السائق
    let notificationSent = false;
    if (driver_id && driver_id !== trip.driver_id) {
      try {
        await Notification.create({
          user_id: driver_id,
          title: "تم تعيينك في رحلة جديدة",
          message: selected_time 
            ? `تم تعيينك كسائق لرحلة مبرمجة تبدأ في ${selected_time}`
            : `تم تعيينك كسائق لرحلة تبدأ في ${startTime.toLocaleString()}`,
          type: "trip_update",
          is_read: false
        }, { transaction });
        notificationSent = true;
      } catch (notificationError) {
        console.log("ملاحظة: لم يتم إرسال الإشعار للسائق", notificationError);
      }
    }

    // تحديث البيانات
    const updateData = {
      ...(start_time && { start_time: new Date(start_time) }),
      ...(end_time && { end_time: new Date(end_time) }),
      ...(line_id && { line_id }),
      ...(train_id && { train_id }),
      ...(driver_id && { driver_id }),
      ...(passenger_count && { passenger_count: parseInt(passenger_count) }),
      ...(status && { status }),
      // 🔴 الحقول الجديدة
      ...(selected_time && { selected_time }),
      ...(is_base_trip !== undefined && { is_base_trip }),
      ...(duration_hours && { duration_hours: parseInt(duration_hours) }),
      ...(is_auto_generated !== undefined && { is_auto_generated })
    };

    // 🔴 إذا تم تحديث start_time/end_time من النظام الجديد
    if (selected_time || duration_hours) {
      updateData.start_time = startTime;
      updateData.end_time = endTime;
    }

    await trip.update(updateData, { transaction });

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

    if (!status || !["on", "off", "cancelled", "delayed"].includes(status)) {
      return res.status(400).json({ 
        message: "الحالة يجب أن تكون 'on'، 'off'، 'cancelled'، أو 'delayed'" 
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
      const statusText = 
        status === "on" ? "مفعلة" :
        status === "off" ? "متوقفة" :
        status === "cancelled" ? "ملغاة" : "متأخرة";
        
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