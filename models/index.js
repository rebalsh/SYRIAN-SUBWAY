// const { Sequelize } = require("sequelize");

// // إنشاء اتصال مع قاعدة البيانات
// const sequelize = new Sequelize("metro_db", "root", "", {
//   host: "127.0.0.1",
//   dialect: "mysql",
// });

// // استدعاء جميع المودلات وربطها بـ sequelize
// const User = require("./User")(sequelize);
// const DelayLog = require("./DelayLog")(sequelize);
// const DriverAssignment = require("./DriverAssignment")(sequelize);
// const Fault = require("./Fault")(sequelize);
// const Line = require("./Line")(sequelize);
// const LineStation = require("./LineStation")(sequelize);
// const Notification = require("./Notification")(sequelize);
// const Payment = require("./Payment")(sequelize);
// const Rating = require("./Rating")(sequelize);
// const Station = require("./Station")(sequelize);
// const Ticket = require("./Ticket")(sequelize);
// const Train = require("./Train")(sequelize);
// const TrainLocation = require("./TrainLocation")(sequelize);
// const Trip = require("./Trip")(sequelize);
// const TripStopTime = require("./TripStopTime")(sequelize);
// const WorkOrder = require("./WorkOrder")(sequelize);

// // جمع المودلات
// const models = {
//   User,
//   DelayLog,
//   DriverAssignment,
//   Fault,
//   Line,
//   LineStation,
//   Notification,
//   Payment,
//   Rating,
//   Station,
//   Ticket,
//   Train,
//   TrainLocation,
//   Trip,
//   TripStopTime,
//   WorkOrder
// };

// module.exports = {
//   sequelize,
//   ...models
// };

// ✅ الصحيح - استدعاء واحد فقط


// ***************************************************************************************************************************

// const { Sequelize, Op } = require("sequelize");

// // إنشاء اتصال مع قاعدة البيانات
// const sequelize = new Sequelize("metro_db", "root", "", {
//   host: "127.0.0.1",
//   dialect: "mysql",
// });

// // استدعاء جميع المودلات وربطها بـ sequelize
// const User = require("./User")(sequelize);
// const DelayLog = require("./DelayLog")(sequelize);
// const DriverAssignment = require("./DriverAssignment")(sequelize);
// const Fault = require("./Fault")(sequelize);
// const Line = require("./Line")(sequelize);
// const LineStation = require("./LineStation")(sequelize);
// const Notification = require("./Notification")(sequelize);
// const Payment = require("./Payment")(sequelize);
// const Rating = require("./Rating")(sequelize);
// const Station = require("./Station")(sequelize);
// const Ticket = require("./Ticket")(sequelize);
// const Train = require("./Train")(sequelize);
// const TrainLocation = require("./TrainLocation")(sequelize);
// const Trip = require("./Trip")(sequelize);
// const TripStopTime = require("./TripStopTime")(sequelize);
// const WorkOrder = require("./WorkOrder")(sequelize);

// // 🔥 تعريف العلاقات بين الجداول

// // علاقة Line مع Station (many-to-many عبر LineStation)
// Line.belongsToMany(Station, { 
//   through: LineStation, 
//   foreignKey: "line_id",
//   otherKey: "station_id"
// });
// Station.belongsToMany(Line, { 
//   through: LineStation, 
//   foreignKey: "station_id",
//   otherKey: "line_id"
// });

// // علاقة LineStation مع Line و Station
// LineStation.belongsTo(Line, { foreignKey: "line_id" });
// LineStation.belongsTo(Station, { foreignKey: "station_id" });
// Line.hasMany(LineStation, { foreignKey: "line_id" });
// Station.hasMany(LineStation, { foreignKey: "station_id" });

// // جمع المودلات
// const models = {
//   User,
//   DelayLog,
//   DriverAssignment,
//   Fault,
//   Line,
//   LineStation,
//   Notification,
//   Payment,
//   Rating,
//   Station,
//   Ticket,
//   Train,
//   TrainLocation,
//   Trip,
//   TripStopTime,
//   WorkOrder
// };

// module.exports = {
//   sequelize,
//   Op,
//   ...models
// };


// *******************************************************************************************

// const { Sequelize, Op } = require("sequelize");

// // إنشاء اتصال مع قاعدة البيانات
// const sequelize = new Sequelize("metro_db", "root", "", {
//   host: "127.0.0.1",
//   dialect: "mysql",
// });

// // استدعاء جميع المودلات وربطها بـ sequelize
// const User = require("./User")(sequelize);
// const DelayLog = require("./DelayLog")(sequelize);
// const DriverAssignment = require("./DriverAssignment")(sequelize);
// const Fault = require("./Fault")(sequelize);
// const Line = require("./Line")(sequelize);
// const LineStation = require("./LineStation")(sequelize);
// const Notification = require("./Notification")(sequelize);
// const Payment = require("./Payment")(sequelize);
// const Rating = require("./Rating")(sequelize);
// const Station = require("./Station")(sequelize);
// const Ticket = require("./Ticket")(sequelize);
// const Train = require("./Train")(sequelize);
// const TrainLocation = require("./TrainLocation")(sequelize);
// const Trip = require("./Trip")(sequelize);
// const TripStopTime = require("./TripStopTime")(sequelize);
// const WorkOrder = require("./WorkOrder")(sequelize);

// // 🔥 تعريف العلاقات بين الجداول

// // 1️⃣ علاقة Line مع Station (many-to-many عبر LineStation)
// Line.belongsToMany(Station, { 
//   through: LineStation, 
//   foreignKey: "line_id",
//   otherKey: "station_id"
// });
// Station.belongsToMany(Line, { 
//   through: LineStation, 
//   foreignKey: "station_id",
//   otherKey: "line_id"
// });

// // 2️⃣ علاقة LineStation مع Line و Station
// LineStation.belongsTo(Line, { foreignKey: "line_id" });
// LineStation.belongsTo(Station, { foreignKey: "station_id" });
// Line.hasMany(LineStation, { foreignKey: "line_id" });
// Station.hasMany(LineStation, { foreignKey: "station_id" });

// // 3️⃣ علاقة Trip مع Line و Train
// Trip.belongsTo(Line, { foreignKey: "line_id" });
// Trip.belongsTo(Train, { foreignKey: "train_id" });
// Line.hasMany(Trip, { foreignKey: "line_id" });
// Train.hasMany(Trip, { foreignKey: "train_id" });

// // جمع المودلات
// const models = {
//   User,
//   DelayLog,
//   DriverAssignment,
//   Fault,
//   Line,
//   LineStation,
//   Notification,
//   Payment,
//   Rating,
//   Station,
//   Ticket,
//   Train,
//   TrainLocation,
//   Trip,
//   TripStopTime,
//   WorkOrder
// };

// module.exports = {
//   sequelize,
//   Op,
//   ...models
// };
// **************************************************************************************************

// const { Sequelize, Op } = require("sequelize");

// // إنشاء اتصال مع قاعدة البيانات
// const sequelize = new Sequelize("metro_db", "root", "", {
//   host: "127.0.0.1",
//   dialect: "mysql",
// });

// // استدعاء جميع المودلات وربطها بـ sequelize
// const User = require("./User")(sequelize);
// const DelayLog = require("./DelayLog")(sequelize);
// const DriverAssignment = require("./DriverAssignment")(sequelize);
// const Fault = require("./Fault")(sequelize);
// const Line = require("./Line")(sequelize);
// const LineStation = require("./LineStation")(sequelize);
// const Notification = require("./Notification")(sequelize);
// const Payment = require("./Payment")(sequelize);
// const Rating = require("./Rating")(sequelize);
// const Station = require("./Station")(sequelize);
// const Ticket = require("./Ticket")(sequelize);
// const Train = require("./Train")(sequelize);
// const TrainLocation = require("./TrainLocation")(sequelize);
// const Trip = require("./Trip")(sequelize);
// const TripStopTime = require("./TripStopTime")(sequelize);
// const WorkOrder = require("./WorkOrder")(sequelize);

// // 🔥 تعريف العلاقات بين الجداول

// // 1️⃣ علاقة Line مع Station (many-to-many عبر LineStation)
// Line.belongsToMany(Station, { 
//   through: LineStation, 
//   foreignKey: "line_id",
//   otherKey: "station_id"
// });
// Station.belongsToMany(Line, { 
//   through: LineStation, 
//   foreignKey: "station_id",
//   otherKey: "line_id"
// });

// // 2️⃣ علاقة LineStation مع Line و Station
// LineStation.belongsTo(Line, { foreignKey: "line_id" });
// LineStation.belongsTo(Station, { foreignKey: "station_id" });
// Line.hasMany(LineStation, { foreignKey: "line_id" });
// Station.hasMany(LineStation, { foreignKey: "station_id" });

// // 3️⃣ علاقة Trip مع Line و Train
// Trip.belongsTo(Line, { foreignKey: "line_id" });
// Trip.belongsTo(Train, { foreignKey: "train_id" });
// Line.hasMany(Trip, { foreignKey: "line_id" });
// Train.hasMany(Trip, { foreignKey: "train_id" });

// // 4️⃣ علاقة Trip مع User (السائق) - العلاقة الأساسية
// Trip.belongsTo(User, { 
//   foreignKey: "driver_id",
//   as: "driver"
// });
// User.hasMany(Trip, { 
//   foreignKey: "driver_id",
//   as: "trips"
// });

// // جمع المودلات
// const models = {
//   User,
//   DelayLog,
//   DriverAssignment,
//   Fault,
//   Line,
//   LineStation,
//   Notification,
//   Payment,
//   Rating,
//   Station,
//   Ticket,
//   Train,
//   TrainLocation,
//   Trip,
//   TripStopTime,
//   WorkOrder
// };

// module.exports = {
//   sequelize,
//   Op,
//   ...models
// };


// ********************************************************************    
// const { Sequelize, DataTypes } = require("sequelize");

// // إنشاء اتصال مع قاعدة البيانات
// const sequelize = new Sequelize("metro_db", "root", "", {
//   host: "127.0.0.1",
//   dialect: "mysql",
//   logging: false
// });

// // استدعاء جميع المودلات
// const db = {};

// db.Sequelize = Sequelize;
// db.sequelize = sequelize;

// // استيراد المودلات
// db.User = require("./User")(sequelize, DataTypes);
// db.DelayLog = require("./DelayLog")(sequelize, DataTypes);
// db.DriverAssignment = require("./DriverAssignment")(sequelize, DataTypes);
// db.Fault = require("./Fault")(sequelize, DataTypes);
// db.Line = require("./Line")(sequelize, DataTypes);
// db.LineStation = require("./LineStation")(sequelize, DataTypes);
// db.Notification = require("./Notification")(sequelize, DataTypes);
// db.Payment = require("./Payment")(sequelize, DataTypes);
// db.Rating = require("./Rating")(sequelize, DataTypes);
// db.Station = require("./Station")(sequelize, DataTypes);
// db.Ticket = require("./Ticket")(sequelize, DataTypes);
// db.Train = require("./Train")(sequelize, DataTypes);
// db.TrainLocation = require("./TrainLocation")(sequelize, DataTypes);
// db.Trip = require("./Trip")(sequelize, DataTypes);
// db.TripStopTime = require("./TripStopTime")(sequelize, DataTypes);
// db.WorkOrder = require("./WorkOrder")(sequelize, DataTypes);

// // 🔥 تعريف العلاقات بين الجداول

// // 1️⃣ علاقة Line مع Station (many-to-many عبر LineStation)
// db.Line.belongsToMany(db.Station, { 
//   through: db.LineStation, 
//   foreignKey: "line_id",
//   otherKey: "station_id"
// });
// db.Station.belongsToMany(db.Line, { 
//   through: db.LineStation, 
//   foreignKey: "station_id",
//   otherKey: "line_id"
// });

// // 2️⃣ علاقة LineStation مع Line و Station
// db.LineStation.belongsTo(db.Line, { foreignKey: "line_id" });
// db.LineStation.belongsTo(db.Station, { foreignKey: "station_id" });
// db.Line.hasMany(db.LineStation, { foreignKey: "line_id" });
// db.Station.hasMany(db.LineStation, { foreignKey: "station_id" });

// // 3️⃣ علاقة Trip مع Line و Train
// db.Trip.belongsTo(db.Line, { foreignKey: "line_id" });
// db.Trip.belongsTo(db.Train, { foreignKey: "train_id" });
// db.Line.hasMany(db.Trip, { foreignKey: "line_id" });
// db.Train.hasMany(db.Trip, { foreignKey: "train_id" });

// // 4️⃣ علاقة Trip مع User (السائق) - العلاقة الأساسية
// db.Trip.belongsTo(db.User, { 
//   foreignKey: "driver_id",
//   as: "driver"
// });
// db.User.hasMany(db.Trip, { 
//   foreignKey: "driver_id",
//   as: "trips"
// });

// // 5️⃣ علاقة Fault مع Train و User (السائق والفني)
// db.Fault.belongsTo(db.Train, { foreignKey: "train_id" });
// db.Fault.belongsTo(db.User, { 
//   foreignKey: "driver_id",
//   as: "driver"
// });
// db.Fault.belongsTo(db.User, {
//   foreignKey: "technician_id",
//   as: "technician"
// });
// db.Train.hasMany(db.Fault, { foreignKey: "train_id" });
// db.User.hasMany(db.Fault, { 
//   foreignKey: "driver_id",
//   as: "reportedFaults"
// });
// db.User.hasMany(db.Fault, {
//   foreignKey: "technician_id",
//   as: "assignedFaults"
// });

// // 6️⃣ علاقة WorkOrder مع Fault و User (الفني)
// db.WorkOrder.belongsTo(db.Fault, { foreignKey: "fault_id" });
// db.WorkOrder.belongsTo(db.User, { 
//   foreignKey: "technician_id",
//   as: "technician"
// });
// db.Fault.hasMany(db.WorkOrder, { foreignKey: "fault_id" });
// db.User.hasMany(db.WorkOrder, { 
//   foreignKey: "technician_id",
//   as: "workOrders"
// });

// // 7️⃣ علاقة User مع Station (للمشرفين والفنيين)
// db.User.belongsTo(db.Station, { foreignKey: "station_id" });
// db.Station.hasMany(db.User, { foreignKey: "station_id" });

// // 8️⃣ 🔥 العلاقات الجديدة للتذاكر فقط
// db.Ticket.belongsTo(db.User, { foreignKey: "user_id" });
// db.Ticket.belongsTo(db.Trip, { foreignKey: "trip_id" });
// db.Ticket.belongsTo(db.Line, { foreignKey: "line_id" });
// db.Ticket.belongsTo(db.Station, { 
//   foreignKey: "from_station_id",
//   as: "from_station"
// });
// db.Ticket.belongsTo(db.Station, { 
//   foreignKey: "to_station_id",
//   as: "to_station"
// });

// db.User.hasMany(db.Ticket, { foreignKey: "user_id" });
// db.Trip.hasMany(db.Ticket, { foreignKey: "trip_id" });
// db.Line.hasMany(db.Ticket, { foreignKey: "line_id" });
// db.Station.hasMany(db.Ticket, { 
//   foreignKey: "from_station_id",
//   as: "departing_tickets"
// });
// db.Station.hasMany(db.Ticket, { 
//   foreignKey: "to_station_id", 
//   as: "arriving_tickets"
// });

// module.exports = db;





// ********************************************************************    












// const { Sequelize, DataTypes } = require("sequelize");

// // إنشاء اتصال مع قاعدة البيانات
// const sequelize = new Sequelize("metro_db", "root", "", {
//   host: "127.0.0.1",
//   dialect: "mysql",
//   logging: false
// });

// // استدعاء جميع المودلات
// const db = {};

// db.Sequelize = Sequelize;
// db.sequelize = sequelize;

// // استيراد المودلات
// db.User = require("./User")(sequelize, DataTypes);
// db.DelayLog = require("./DelayLog")(sequelize, DataTypes);
// db.DriverAssignment = require("./DriverAssignment")(sequelize, DataTypes);
// db.Fault = require("./Fault")(sequelize, DataTypes);
// db.Line = require("./Line")(sequelize, DataTypes);
// db.LineStation = require("./LineStation")(sequelize, DataTypes);
// db.Notification = require("./Notification")(sequelize, DataTypes);
// db.Payment = require("./Payment")(sequelize, DataTypes);
// db.Rating = require("./Rating")(sequelize, DataTypes);
// db.Station = require("./Station")(sequelize, DataTypes);
// db.Ticket = require("./Ticket")(sequelize, DataTypes);
// db.Train = require("./Train")(sequelize, DataTypes);
// db.TrainLocation = require("./TrainLocation")(sequelize, DataTypes);
// db.Trip = require("./Trip")(sequelize, DataTypes);
// db.TripStopTime = require("./TripStopTime")(sequelize, DataTypes);
// db.WorkOrder = require("./WorkOrder")(sequelize, DataTypes);

// // 🔥 تعريف العلاقات بين الجداول

// // 1️⃣ علاقة Line مع Station (many-to-many عبر LineStation)
// db.Line.belongsToMany(db.Station, { 
//   through: db.LineStation, 
//   foreignKey: "line_id",
//   otherKey: "station_id"
// });
// db.Station.belongsToMany(db.Line, { 
//   through: db.LineStation, 
//   foreignKey: "station_id",
//   otherKey: "line_id"
// });

// // 2️⃣ علاقة LineStation مع Line و Station
// db.LineStation.belongsTo(db.Line, { foreignKey: "line_id" });
// db.LineStation.belongsTo(db.Station, { foreignKey: "station_id" });
// db.Line.hasMany(db.LineStation, { foreignKey: "line_id" });
// db.Station.hasMany(db.LineStation, { foreignKey: "station_id" });

// // 3️⃣ علاقة Trip مع Line و Train
// db.Trip.belongsTo(db.Line, { foreignKey: "line_id" });
// db.Trip.belongsTo(db.Train, { foreignKey: "train_id" });
// db.Line.hasMany(db.Trip, { foreignKey: "line_id" });
// db.Train.hasMany(db.Trip, { foreignKey: "train_id" });

// // 4️⃣ علاقة Trip مع User (السائق) - العلاقة الأساسية
// db.Trip.belongsTo(db.User, { 
//   foreignKey: "driver_id",
//   as: "driver"
// });
// db.User.hasMany(db.Trip, { 
//   foreignKey: "driver_id",
//   as: "trips"
// });

// // 5️⃣ علاقة Fault مع Train و User (السائق والفني)
// db.Fault.belongsTo(db.Train, { foreignKey: "train_id" });
// db.Fault.belongsTo(db.User, { 
//   foreignKey: "driver_id",
//   as: "driver"
// });
// db.Fault.belongsTo(db.User, {
//   foreignKey: "technician_id",
//   as: "technician"
// });
// db.Train.hasMany(db.Fault, { foreignKey: "train_id" });
// db.User.hasMany(db.Fault, { 
//   foreignKey: "driver_id",
//   as: "reportedFaults"
// });
// db.User.hasMany(db.Fault, {
//   foreignKey: "technician_id",
//   as: "assignedFaults"
// });

// // 6️⃣ علاقة WorkOrder مع Fault و User (الفني)
// db.WorkOrder.belongsTo(db.Fault, { foreignKey: "fault_id" });
// db.WorkOrder.belongsTo(db.User, { 
//   foreignKey: "technician_id",
//   as: "technician"
// });
// db.Fault.hasMany(db.WorkOrder, { foreignKey: "fault_id" });
// db.User.hasMany(db.WorkOrder, { 
//   foreignKey: "technician_id",
//   as: "workOrders"
// });

// // 7️⃣ علاقة User مع Station (للمشرفين والفنيين)
// db.User.belongsTo(db.Station, { foreignKey: "station_id" });
// db.Station.hasMany(db.User, { foreignKey: "station_id" });

// // 8️⃣ 🔥 العلاقات الجديدة للتذاكر فقط
// db.Ticket.belongsTo(db.User, { foreignKey: "user_id" });
// db.Ticket.belongsTo(db.Trip, { foreignKey: "trip_id" });
// db.Ticket.belongsTo(db.Line, { foreignKey: "line_id" });
// db.Ticket.belongsTo(db.Station, { 
//   foreignKey: "from_station_id",
//   as: "from_station"
// });
// db.Ticket.belongsTo(db.Station, { 
//   foreignKey: "to_station_id",
//   as: "to_station"
// });

// db.User.hasMany(db.Ticket, { foreignKey: "user_id" });
// db.Trip.hasMany(db.Ticket, { foreignKey: "trip_id" });
// db.Line.hasMany(db.Ticket, { foreignKey: "line_id" });
// db.Station.hasMany(db.Ticket, { 
//   foreignKey: "from_station_id",
//   as: "departing_tickets"
// });
// db.Station.hasMany(db.Ticket, { 
//   foreignKey: "to_station_id", 
//   as: "arriving_tickets"
// });

// // 9️⃣ 🔥 علاقة Payment مع User و Ticket
// db.Payment.belongsTo(db.User, { foreignKey: "user_id" });
// db.Payment.belongsTo(db.Ticket, { foreignKey: "ticket_id" });
// db.User.hasMany(db.Payment, { foreignKey: "user_id" });
// db.Ticket.hasOne(db.Payment, { foreignKey: "ticket_id" });


// // علاقات الإشعارات
// db.Notification.belongsTo(db.User, { foreignKey: "user_id" });
// db.Notification.belongsTo(db.Trip, { foreignKey: "trip_id" });

// db.User.hasMany(db.Notification, { foreignKey: "user_id" });
// db.Trip.hasMany(db.Notification, { foreignKey: "trip_id" });







// module.exports = db;










// const { Sequelize, DataTypes } = require("sequelize");

// // إنشاء اتصال مع قاعدة البيانات
// const sequelize = new Sequelize("metro_db", "root", "", {
//   host: "127.0.0.1",
//   dialect: "mysql",
//   logging: false
// });

// // استدعاء جميع المودلات
// const db = {};

// db.Sequelize = Sequelize;
// db.sequelize = sequelize;

// // استيراد المودلات
// db.User = require("./User")(sequelize, DataTypes);
// db.DelayLog = require("./DelayLog")(sequelize, DataTypes);
// db.DriverAssignment = require("./DriverAssignment")(sequelize, DataTypes);
// db.Fault = require("./Fault")(sequelize, DataTypes);
// db.Line = require("./Line")(sequelize, DataTypes);
// db.LineStation = require("./LineStation")(sequelize, DataTypes);
// db.Notification = require("./Notification")(sequelize, DataTypes);
// db.Payment = require("./Payment")(sequelize, DataTypes);
// db.Rating = require("./Rating")(sequelize, DataTypes);
// db.Station = require("./Station")(sequelize, DataTypes);
// db.Ticket = require("./Ticket")(sequelize, DataTypes);
// db.Train = require("./Train")(sequelize, DataTypes);
// db.TrainLocation = require("./TrainLocation")(sequelize, DataTypes);
// db.Trip = require("./Trip")(sequelize, DataTypes);
// db.TripStopTime = require("./TripStopTime")(sequelize, DataTypes);
// db.WorkOrder = require("./WorkOrder")(sequelize, DataTypes);

// // 🔥 تعريف العلاقات بين الجداول

// // 1️⃣ علاقة Line مع Station (many-to-many عبر LineStation)
// db.Line.belongsToMany(db.Station, { 
//   through: db.LineStation, 
//   foreignKey: "line_id",
//   otherKey: "station_id"
// });
// db.Station.belongsToMany(db.Line, { 
//   through: db.LineStation, 
//   foreignKey: "station_id",
//   otherKey: "line_id"
// });

// // 2️⃣ علاقة LineStation مع Line و Station
// db.LineStation.belongsTo(db.Line, { foreignKey: "line_id" });
// db.LineStation.belongsTo(db.Station, { foreignKey: "station_id" });
// db.Line.hasMany(db.LineStation, { foreignKey: "line_id" });
// db.Station.hasMany(db.LineStation, { foreignKey: "station_id" });

// // 3️⃣ علاقة Trip مع Line و Train
// db.Trip.belongsTo(db.Line, { foreignKey: "line_id" });
// db.Trip.belongsTo(db.Train, { foreignKey: "train_id" });
// db.Line.hasMany(db.Trip, { foreignKey: "line_id" });
// db.Train.hasMany(db.Trip, { foreignKey: "train_id" });

// // 4️⃣ علاقة Trip مع User (السائق) - العلاقة الأساسية
// db.Trip.belongsTo(db.User, { 
//   foreignKey: "driver_id",
//   as: "driver"
// });
// db.User.hasMany(db.Trip, { 
//   foreignKey: "driver_id",
//   as: "trips"
// });

// // 5️⃣ علاقة Fault مع Train و User (السائق والفني)
// db.Fault.belongsTo(db.Train, { foreignKey: "train_id" });
// db.Fault.belongsTo(db.User, { 
//   foreignKey: "driver_id",
//   as: "driver"
// });
// db.Fault.belongsTo(db.User, {
//   foreignKey: "technician_id",
//   as: "technician"
// });
// db.Train.hasMany(db.Fault, { foreignKey: "train_id" });
// db.User.hasMany(db.Fault, { 
//   foreignKey: "driver_id",
//   as: "reportedFaults"
// });
// db.User.hasMany(db.Fault, {
//   foreignKey: "technician_id",
//   as: "assignedFaults"
// });

// // 6️⃣ علاقة WorkOrder مع Fault و User (الفني)
// db.WorkOrder.belongsTo(db.Fault, { foreignKey: "fault_id" });
// db.WorkOrder.belongsTo(db.User, { 
//   foreignKey: "technician_id",
//   as: "technician"
// });
// db.Fault.hasMany(db.WorkOrder, { foreignKey: "fault_id" });
// db.User.hasMany(db.WorkOrder, { 
//   foreignKey: "technician_id",
//   as: "workOrders"
// });

// // 7️⃣ علاقة User مع Station (للمشرفين والفنيين)
// db.User.belongsTo(db.Station, { foreignKey: "station_id" });
// db.Station.hasMany(db.User, { foreignKey: "station_id" });

// // 8️⃣ 🔥 العلاقات الجديدة للتذاكر فقط
// db.Ticket.belongsTo(db.User, { foreignKey: "user_id" });
// db.Ticket.belongsTo(db.Trip, { foreignKey: "trip_id" });
// db.Ticket.belongsTo(db.Line, { foreignKey: "line_id" });
// db.Ticket.belongsTo(db.Station, { 
//   foreignKey: "from_station_id",
//   as: "from_station"
// });
// db.Ticket.belongsTo(db.Station, { 
//   foreignKey: "to_station_id",
//   as: "to_station"
// });

// db.User.hasMany(db.Ticket, { foreignKey: "user_id" });
// db.Trip.hasMany(db.Ticket, { foreignKey: "trip_id" });
// db.Line.hasMany(db.Ticket, { foreignKey: "line_id" });
// db.Station.hasMany(db.Ticket, { 
//   foreignKey: "from_station_id",
//   as: "departing_tickets"
// });
// db.Station.hasMany(db.Ticket, { 
//   foreignKey: "to_station_id", 
//   as: "arriving_tickets"
// });

// // 9️⃣ 🔥 علاقة Payment مع User و Ticket
// db.Payment.belongsTo(db.User, { foreignKey: "user_id" });
// db.Payment.belongsTo(db.Ticket, { foreignKey: "ticket_id" });
// db.User.hasMany(db.Payment, { foreignKey: "user_id" });
// db.Ticket.hasOne(db.Payment, { foreignKey: "ticket_id" });

// // علاقات الإشعارات
// db.Notification.belongsTo(db.User, { foreignKey: "user_id" });
// db.Notification.belongsTo(db.Trip, { foreignKey: "trip_id" });

// db.User.hasMany(db.Notification, { foreignKey: "user_id" });
// db.Trip.hasMany(db.Notification, { foreignKey: "trip_id" });

// module.exports = db;



const { Sequelize, DataTypes } = require("sequelize");

// إنشاء اتصال مع قاعدة البيانات
const sequelize = new Sequelize("metro_db", "root", "", {
  host: "127.0.0.1",
  dialect: "mysql",
  logging: false
});

// استدعاء جميع المودلات
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// استيراد المودلات
db.User = require("./User")(sequelize, DataTypes);
db.DelayLog = require("./DelayLog")(sequelize, DataTypes);
db.DriverAssignment = require("./DriverAssignment")(sequelize, DataTypes);
db.Fault = require("./Fault")(sequelize, DataTypes);
db.Line = require("./Line")(sequelize, DataTypes);
db.LineStation = require("./LineStation")(sequelize, DataTypes);
db.Notification = require("./Notification")(sequelize, DataTypes);
db.Payment = require("./Payment")(sequelize, DataTypes);
db.Rating = require("./Rating")(sequelize, DataTypes);
db.Station = require("./Station")(sequelize, DataTypes);
db.Ticket = require("./Ticket")(sequelize, DataTypes);
db.Train = require("./Train")(sequelize, DataTypes);
db.TrainLocation = require("./TrainLocation")(sequelize, DataTypes);
db.Trip = require("./Trip")(sequelize, DataTypes);
db.TripStopTime = require("./TripStopTime")(sequelize, DataTypes);
db.WorkOrder = require("./WorkOrder")(sequelize, DataTypes);

// 🔥 تعريف العلاقات بين الجداول

// 1️⃣ علاقة Line مع Station (many-to-many عبر LineStation)
db.Line.belongsToMany(db.Station, { 
  through: db.LineStation, 
  foreignKey: "line_id",
  otherKey: "station_id"
});
db.Station.belongsToMany(db.Line, { 
  through: db.LineStation, 
  foreignKey: "station_id",
  otherKey: "line_id"
});

// 2️⃣ علاقة LineStation مع Line و Station
db.LineStation.belongsTo(db.Line, { foreignKey: "line_id" });
db.LineStation.belongsTo(db.Station, { foreignKey: "station_id" });
db.Line.hasMany(db.LineStation, { foreignKey: "line_id" });
db.Station.hasMany(db.LineStation, { foreignKey: "station_id" });

// 3️⃣ علاقة Trip مع Line و Train
db.Trip.belongsTo(db.Line, { foreignKey: "line_id" });
db.Trip.belongsTo(db.Train, { foreignKey: "train_id" });
db.Line.hasMany(db.Trip, { foreignKey: "line_id" });
db.Train.hasMany(db.Trip, { foreignKey: "train_id" });

// 4️⃣ علاقة Trip مع User (السائق) - العلاقة الأساسية
db.Trip.belongsTo(db.User, { 
  foreignKey: "driver_id",
  as: "driver"
});
db.User.hasMany(db.Trip, { 
  foreignKey: "driver_id",
  as: "trips"
});

// 5️⃣ علاقة Fault مع Train و User (السائق والفني)
db.Fault.belongsTo(db.Train, { foreignKey: "train_id" });
db.Fault.belongsTo(db.User, { 
  foreignKey: "driver_id",
  as: "driver"
});
db.Fault.belongsTo(db.User, {
  foreignKey: "technician_id",
  as: "technician"
});
db.Train.hasMany(db.Fault, { foreignKey: "train_id" });
db.User.hasMany(db.Fault, { 
  foreignKey: "driver_id",
  as: "reportedFaults"
});
db.User.hasMany(db.Fault, {
  foreignKey: "technician_id",
  as: "assignedFaults"
});

// 6️⃣ علاقة WorkOrder مع Fault و User (الفني)
db.WorkOrder.belongsTo(db.Fault, { foreignKey: "fault_id" });
db.WorkOrder.belongsTo(db.User, { 
  foreignKey: "technician_id",
  as: "technician"
});
db.Fault.hasMany(db.WorkOrder, { foreignKey: "fault_id" });
db.User.hasMany(db.WorkOrder, { 
  foreignKey: "technician_id",
  as: "workOrders"
});

// 7️⃣ علاقة User مع Station (للمشرفين والفنيين)
db.User.belongsTo(db.Station, { foreignKey: "station_id" });
db.Station.hasMany(db.User, { foreignKey: "station_id" });

// 8️⃣ 🔥 العلاقات الجديدة للتذاكر فقط - مع تعطيل constraints
db.Ticket.belongsTo(db.User, { 
  foreignKey: "user_id",
  constraints: false
});
db.Ticket.belongsTo(db.Trip, { 
  foreignKey: "trip_id",
  constraints: false
});
db.Ticket.belongsTo(db.Line, { 
  foreignKey: "line_id",
  constraints: false
});
db.Ticket.belongsTo(db.Station, { 
  foreignKey: "from_station_id",
  as: "from_station",
  constraints: false
});
db.Ticket.belongsTo(db.Station, { 
  foreignKey: "to_station_id",
  as: "to_station",
  constraints: false
});

db.User.hasMany(db.Ticket, { 
  foreignKey: "user_id",
  constraints: false
});
db.Trip.hasMany(db.Ticket, { 
  foreignKey: "trip_id",
  constraints: false
});
db.Line.hasMany(db.Ticket, { 
  foreignKey: "line_id",
  constraints: false
});
db.Station.hasMany(db.Ticket, { 
  foreignKey: "from_station_id",
  as: "departing_tickets",
  constraints: false
});
db.Station.hasMany(db.Ticket, { 
  foreignKey: "to_station_id", 
  as: "arriving_tickets",
  constraints: false
});

// 9️⃣ 🔥 علاقة Payment مع User و Ticket
db.Payment.belongsTo(db.User, { 
  foreignKey: "user_id",
  constraints: false
});
db.Payment.belongsTo(db.Ticket, { 
  foreignKey: "ticket_id",
  constraints: false
});
db.User.hasMany(db.Payment, { 
  foreignKey: "user_id",
  constraints: false
});
db.Ticket.hasOne(db.Payment, { 
  foreignKey: "ticket_id",
  constraints: false
});

// علاقات الإشعارات
db.Notification.belongsTo(db.User, { 
  foreignKey: "user_id",
  constraints: false
});
db.Notification.belongsTo(db.Trip, { 
  foreignKey: "trip_id",
  constraints: false
});

db.User.hasMany(db.Notification, { 
  foreignKey: "user_id",
  constraints: false
});
db.Trip.hasMany(db.Notification, { 
  foreignKey: "trip_id",
  constraints: false
});

module.exports = db;