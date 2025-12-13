// const { Station, Line, LineStation, Op } = require("../models");

// // ✅ إنشاء محطة جديدة (للمشرف userType=3 فقط)
// exports.createStation = async (req, res) => {
//   try {
//     const { name, location } = req.body;

//     // التحقق من البيانات
//     if (!name || !location) {
//       return res.status(400).json({ 
//         message: "يرجى إدخال اسم المحطة والموقع" 
//       });
//     }

//     // التحقق من عدم وجود محطة بنفس الاسم
//     const existingStation = await Station.findOne({ where: { name } });
//     if (existingStation) {
//       return res.status(400).json({ message: "اسم المحطة موجود مسبقاً" });
//     }

//     // إنشاء المحطة
//     const newStation = await Station.create({ name, location });

//     res.status(201).json({
//       message: "تم إنشاء المحطة بنجاح",
//       station: newStation
//     });

//   } catch (err) {
//     res.status(500).json({ 
//       message: "خطأ في إنشاء المحطة", 
//       error: err.message 
//     });
//   }
// };

// // ✅ جلب جميع المحطات (جميع المستخدمين)
// exports.getAllStations = async (req, res) => {
//   try {
//     const stations = await Station.findAll({
//       attributes: ["id", "name", "location"],
//       order: [["name", "ASC"]]
//     });

//     res.json({
//       message: "تم جلب المحطات بنجاح",
//       stations: stations,
//       count: stations.length
//     });

//   } catch (err) {
//     res.status(500).json({ 
//       message: "خطأ في جلب المحطات", 
//       error: err.message 
//     });
//   }
// };

// // ✅ جلب محطة محددة
// exports.getStationById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const station = await Station.findOne({
//       where: { id },
//       attributes: ["id", "name", "location"],
//       include: [{
//         model: Line,
//         through: { attributes: [] },
//         attributes: ["id", "line_name"]
//       }]
//     });

//     if (!station) {
//       return res.status(404).json({ message: "المحطة غير موجودة" });
//     }

//     res.json({
//       message: "تم جلب المحطة بنجاح",
//       station: station
//     });

//   } catch (err) {
//     res.status(500).json({ 
//       message: "خطأ في جلب المحطة", 
//       error: err.message 
//     });
//   }
// };

// // ✅ جلب الخطوط التي تمر بمحطة محددة
// exports.getStationLines = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const station = await Station.findByPk(id);
//     if (!station) {
//       return res.status(404).json({ message: "المحطة غير موجودة" });
//     }

//     const lines = await Line.findAll({
//       include: [{
//         model: Station,
//         where: { id },
//         through: { 
//           attributes: ["station_order", "arrival_time", "departure_time"] 
//         }
//       }]
//     });

//     res.json({
//       message: "تم جلب خطوط المحطة بنجاح",
//       station: {
//         id: station.id,
//         name: station.name,
//         location: station.location
//       },
//       lines: lines,
//       count: lines.length
//     });

//   } catch (err) {
//     res.status(500).json({ 
//       message: "خطأ في جلب خطوط المحطة", 
//       error: err.message 
//     });
//   }
// };

// // ✅ تحديث محطة (للمشرف فقط)
// exports.updateStation = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, location } = req.body;

//     const station = await Station.findByPk(id);
//     if (!station) {
//       return res.status(404).json({ message: "المحطة غير موجودة" });
//     }

//     // التحقق من عدم تكرار اسم المحطة (إذا تم تغيير الاسم)
//     if (name && name !== station.name) {
//       const existingStation = await Station.findOne({ where: { name } });
//       if (existingStation) {
//         return res.status(400).json({ message: "اسم المحطة موجود مسبقاً" });
//       }
//     }

//     // تحديث البيانات
//     await station.update({ name, location });

//     res.json({
//       message: "تم تحديث المحطة بنجاح",
//       station: station
//     });

//   } catch (err) {
//     res.status(500).json({ 
//       message: "خطأ في تحديث المحطة", 
//       error: err.message 
//     });
//   }
// };

// // ✅ حذف محطة (للمشرف فقط) - بحذر
// exports.deleteStation = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const station = await Station.findByPk(id);
//     if (!station) {
//       return res.status(404).json({ message: "المحطة غير موجودة" });
//     }

//     // التحقق إذا كانت المحطة مرتبطة بأي خطوط
//     const stationInLines = await LineStation.findOne({ where: { station_id: id } });
//     if (stationInLines) {
//       return res.status(400).json({ 
//         message: "لا يمكن حذف المحطة لأنها مرتبطة بخطوط، يرجى إزالتها من الخطوط أولاً" 
//       });
//     }

//     await station.destroy();

//     res.json({ message: "تم حذف المحطة بنجاح" });

//   } catch (err) {
//     res.status(500).json({ 
//       message: "خطأ في حذف المحطة", 
//       error: err.message 
//     });
//   }
// };


// **************************************************************************************************



// controllers/stationController.js
// const { Station, Line, LineStation, Op } = require("../models");

// // ✅ إنشاء محطة جديدة (للمشرف userType=3 فقط)
// exports.createStation = async (req, res) => {
//   try {
//     const { name, location } = req.body;

//     // التحقق من البيانات
//     if (!name || !location) {
//       return res.status(400).json({ 
//         message: "يرجى إدخال اسم المحطة والموقع" 
//       });
//     }

//     // التحقق من عدم وجود محطة بنفس الاسم
//     const existingStation = await Station.findOne({ where: { name } });
//     if (existingStation) {
//       return res.status(400).json({ message: "اسم المحطة موجود مسبقاً" });
//     }

//     // إنشاء المحطة
//     const newStation = await Station.create({ name, location });

//     res.status(201).json({
//       message: "تم إنشاء المحطة بنجاح",
//       station: newStation
//     });

//   } catch (err) {
//     res.status(500).json({ 
//       message: "خطأ في إنشاء المحطة", 
//       error: err.message 
//     });
//   }
// };

// // ✅ جلب جميع المحطات (جميع المستخدمين)
// exports.getAllStations = async (req, res) => {
//   try {
//     const stations = await Station.findAll({
//       attributes: ["id", "name", "location"],
//       order: [["name", "ASC"]]
//     });

//     res.json({
//       message: "تم جلب المحطات بنجاح",
//       stations: stations,
//       count: stations.length
//     });

//   } catch (err) {
//     res.status(500).json({ 
//       message: "خطأ في جلب المحطات", 
//       error: err.message 
//     });
//   }
// };

// // ✅ جلب محطة محددة
// exports.getStationById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const station = await Station.findOne({
//       where: { id },
//       attributes: ["id", "name", "location"],
//       include: [{
//         model: Line,
//         through: { attributes: [] },
//         attributes: ["id", "line_name"]
//       }]
//     });

//     if (!station) {
//       return res.status(404).json({ message: "المحطة غير موجودة" });
//     }

//     res.json({
//       message: "تم جلب المحطة بنجاح",
//       station: station
//     });

//   } catch (err) {
//     res.status(500).json({ 
//       message: "خطأ في جلب المحطة", 
//       error: err.message 
//     });
//   }
// };

// // ✅ جلب الخطوط التي تمر بمحطة محددة
// exports.getStationLines = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const station = await Station.findByPk(id);
//     if (!station) {
//       return res.status(404).json({ message: "المحطة غير موجودة" });
//     }

//     const lines = await Line.findAll({
//       include: [{
//         model: Station,
//         where: { id },
//         through: { 
//           attributes: ["station_order"] // تم التعديل: إزالة الأوقات
//         }
//       }]
//     });

//     res.json({
//       message: "تم جلب خطوط المحطة بنجاح",
//       station: {
//         id: station.id,
//         name: station.name,
//         location: station.location
//       },
//       lines: lines,
//       count: lines.length
//     });

//   } catch (err) {
//     res.status(500).json({ 
//       message: "خطأ في جلب خطوط المحطة", 
//       error: err.message 
//     });
//   }
// };

// // ✅ تحديث محطة (للمشرف فقط)
// exports.updateStation = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, location } = req.body;

//     const station = await Station.findByPk(id);
//     if (!station) {
//       return res.status(404).json({ message: "المحطة غير موجودة" });
//     }

//     // التحقق من عدم تكرار اسم المحطة (إذا تم تغيير الاسم)
//     if (name && name !== station.name) {
//       const existingStation = await Station.findOne({ where: { name } });
//       if (existingStation) {
//         return res.status(400).json({ message: "اسم المحطة موجود مسبقاً" });
//       }
//     }

//     // تحديث البيانات
//     await station.update({ name, location });

//     res.json({
//       message: "تم تحديث المحطة بنجاح",
//       station: station
//     });

//   } catch (err) {
//     res.status(500).json({ 
//       message: "خطأ في تحديث المحطة", 
//       error: err.message 
//     });
//   }
// };

// // ✅ حذف محطة (للمشرف فقط) - بحذر
// exports.deleteStation = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const station = await Station.findByPk(id);
//     if (!station) {
//       return res.status(404).json({ message: "المحطة غير موجودة" });
//     }

//     // التحقق إذا كانت المحطة مرتبطة بأي خطوط
//     const stationInLines = await LineStation.findOne({ where: { station_id: id } });
//     if (stationInLines) {
//       return res.status(400).json({ 
//         message: "لا يمكن حذف المحطة لأنها مرتبطة بخطوط، يرجى إزالتها من الخطوط أولاً" 
//       });
//     }

//     await station.destroy();

//     res.json({ message: "تم حذف المحطة بنجاح" });

//   } catch (err) {
//     res.status(500).json({ 
//       message: "خطأ في حذف المحطة", 
//       error: err.message 
//     });
//   }
// };

// ********************************************************************************************************************

const { Station, Line, LineStation, Op } = require("../models");

// ✅ إنشاء محطة جديدة (للمسؤول userType=2 فقط)
exports.createStation = async (req, res) => {
  try {
    const { name, location } = req.body;

    // التحقق من البيانات
    if (!name || !location) {
      return res.status(400).json({ 
        message: "يرجى إدخال اسم المحطة والموقع" 
      });
    }

    // التحقق من عدم وجود محطة بنفس الاسم
    const existingStation = await Station.findOne({ where: { name } });
    if (existingStation) {
      return res.status(400).json({ message: "اسم المحطة موجود مسبقاً" });
    }

    // إنشاء المحطة
    const newStation = await Station.create({ name, location });

    res.status(201).json({
      message: "تم إنشاء المحطة بنجاح",
      station: newStation
    });

  } catch (err) {
    res.status(500).json({ 
      message: "خطأ في إنشاء المحطة", 
      error: err.message 
    });
  }
};

// ✅ جلب جميع المحطات (جميع المستخدمين)
exports.getAllStations = async (req, res) => {
  try {
    const stations = await Station.findAll({
      attributes: ["id", "name", "location"],
      order: [["name", "ASC"]]
    });

    res.json({
      message: "تم جلب المحطات بنجاح",
      stations: stations,
      count: stations.length
    });

  } catch (err) {
    res.status(500).json({ 
      message: "خطأ في جلب المحطات", 
      error: err.message 
    });
  }
};

// ✅ جلب محطة محددة
exports.getStationById = async (req, res) => {
  try {
    const { id } = req.params;

    const station = await Station.findOne({
      where: { id },
      attributes: ["id", "name", "location"],
      include: [{
        model: Line,
        through: { attributes: [] },
        attributes: ["id", "line_name"]
      }]
    });

    if (!station) {
      return res.status(404).json({ message: "المحطة غير موجودة" });
    }

    res.json({
      message: "تم جلب المحطة بنجاح",
      station: station
    });

  } catch (err) {
    res.status(500).json({ 
      message: "خطأ في جلب المحطة", 
      error: err.message 
    });
  }
};

// ✅ جلب الخطوط التي تمر بمحطة محددة
exports.getStationLines = async (req, res) => {
  try {
    const { id } = req.params;

    const station = await Station.findByPk(id);
    if (!station) {
      return res.status(404).json({ message: "المحطة غير موجودة" });
    }

    const lines = await Line.findAll({
      include: [{
        model: Station,
        where: { id },
        through: { 
          attributes: ["station_order"]
        }
      }]
    });

    res.json({
      message: "تم جلب خطوط المحطة بنجاح",
      station: {
        id: station.id,
        name: station.name,
        location: station.location
      },
      lines: lines,
      count: lines.length
    });

  } catch (err) {
    res.status(500).json({ 
      message: "خطأ في جلب خطوط المحطة", 
      error: err.message 
    });
  }
};

// ✅ تحديث محطة (للمسؤول فقط)
exports.updateStation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location } = req.body;

    const station = await Station.findByPk(id);
    if (!station) {
      return res.status(404).json({ message: "المحطة غير موجودة" });
    }

    // التحقق من عدم تكرار اسم المحطة (إذا تم تغيير الاسم)
    if (name && name !== station.name) {
      const existingStation = await Station.findOne({ where: { name } });
      if (existingStation) {
        return res.status(400).json({ message: "اسم المحطة موجود مسبقاً" });
      }
    }

    // تحديث البيانات
    await station.update({ name, location });

    res.json({
      message: "تم تحديث المحطة بنجاح",
      station: station
    });

  } catch (err) {
    res.status(500).json({ 
      message: "خطأ في تحديث المحطة", 
      error: err.message 
    });
  }
};

// ✅ حذف محطة (للمسؤول فقط) - بحذر
exports.deleteStation = async (req, res) => {
  try {
    const { id } = req.params;

    const station = await Station.findByPk(id);
    if (!station) {
      return res.status(404).json({ message: "المحطة غير موجودة" });
    }

    // التحقق إذا كانت المحطة مرتبطة بأي خطوط
    const stationInLines = await LineStation.findOne({ where: { station_id: id } });
    if (stationInLines) {
      return res.status(400).json({ 
        message: "لا يمكن حذف المحطة لأنها مرتبطة بخطوط، يرجى إزالتها من الخطوط أولاً" 
      });
    }

    await station.destroy();

    res.json({ message: "تم حذف المحطة بنجاح" });

  } catch (err) {
    res.status(500).json({ 
      message: "خطأ في حذف المحطة", 
      error: err.message 
    });
  }
};