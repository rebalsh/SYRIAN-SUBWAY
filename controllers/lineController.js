// controllers/lineController.js
const { Line, Station, LineStation, sequelize } = require("../models");

// ✅ إنشاء خط جديد مع المحطات والسعر
exports.createLine = async (req, res) => {
  let transaction;
  try {
    const { line_name, price = 0.00, stations } = req.body;

    // التحقق من وجود البيانات
    if (!line_name || !stations || !Array.isArray(stations)) {
      return res.status(400).json({ 
        message: "يرجى إدخال اسم الخط وقائمة المحطات" 
      });
    }

    // التحقق من أن السعر رقم موجب
    if (price < 0) {
      return res.status(400).json({ 
        message: "السعر يجب أن يكون قيمة موجبة" 
      });
    }

    // بدء transaction
    transaction = await sequelize.transaction();

    // 1. إنشاء الخط الجديد
    const newLine = await Line.create({ 
      line_name,
      price: parseFloat(price)
    }, { transaction });

    // 2. معالجة المحطات
    for (let i = 0; i < stations.length; i++) {
      const stationData = stations[i];
      const { name, location, station_order } = stationData;

      // التحقق من البيانات المطلوبة للمحطة
      if (!name || !location) {
        await transaction.rollback();
        return res.status(400).json({ 
          message: `يرجى إدخال اسم وموقع المحطة رقم ${i + 1}` 
        });
      }

      let station;

      // البحث عن محطة موجودة بنفس الاسم أو إنشاء محطة جديدة
      const existingStation = await Station.findOne({
        where: { name },
        transaction
      });

      if (existingStation) {
        station = existingStation;
      } else {
        station = await Station.create({
          name,
          location
        }, { transaction });
      }

      // 3. ربط المحطة بالخط
      await LineStation.create({
        line_id: newLine.id,
        station_id: station.id,
        station_order: station_order || i + 1
      }, { transaction });
    }

    // تأكيد العملية
    await transaction.commit();

    // 4. جلب الخط مع محطاته بعد الإنشاء
    const lineWithStations = await Line.findOne({
      where: { id: newLine.id },
      include: [{
        model: Station,
        through: { attributes: ["station_order"] },
        attributes: ["id", "name", "location"]
      }],
      order: [
        [Station, LineStation, "station_order", "ASC"]
      ]
    });

    res.status(201).json({
      message: "تم إنشاء الخط والمحطات بنجاح",
      line: lineWithStations
    });

  } catch (err) {
    if (transaction) await transaction.rollback();
    res.status(500).json({ 
      message: "خطأ في إنشاء الخط والمحطات", 
      error: err.message 
    });
  }
};

// ✅ جلب جميع الخطوط مع محطاتها (مع مراعاة نوع المستخدم)
exports.getAllLines = async (req, res) => {
  try {
    const userType = req.user.userType; // نوع المستخدم من التوكن
    
    // تحديد الحقول التي سيتم إرجاعها بناءً على نوع المستخدم
    const attributes = ["id", "line_name"];
    if (userType === 1) { // مسافر فقط
      attributes.push("price");
    }

    const lines = await Line.findAll({
      attributes: attributes,
      include: [{
        model: Station,
        through: { 
          attributes: ["station_order"]
        },
        attributes: ["id", "name", "location"]
      }],
      order: [
        ["id", "ASC"],
        [Station, LineStation, "station_order", "ASC"]
      ]
    });

    res.json({
      message: "تم جلب الخطوط بنجاح",
      lines: lines,
      userType: userType // إرجاع نوع المستخدم للتوضيح
    });

  } catch (err) {
    res.status(500).json({ 
      message: "خطأ في جلب الخطوط", 
      error: err.message 
    });
  }
};

// ✅ جلب خط محدد مع محطاته (مع مراعاة نوع المستخدم)
exports.getLineById = async (req, res) => {
  try {
    const { id } = req.params;
    const userType = req.user.userType;

    // تحديد الحقول بناءً على نوع المستخدم
    const attributes = ["id", "line_name"];
    if (userType === 1) { // مسافر فقط
      attributes.push("price");
    }

    const line = await Line.findOne({
      where: { id },
      attributes: attributes,
      include: [{
        model: Station,
        through: { 
          attributes: ["station_order"]
        },
        attributes: ["id", "name", "location"]
      }],
      order: [
        [Station, LineStation, "station_order", "ASC"]
      ]
    });

    if (!line) {
      return res.status(404).json({ message: "الخط غير موجود" });
    }

    res.json({
      message: "تم جلب الخط بنجاح",
      line: line,
      userType: userType
    });

  } catch (err) {
    res.status(500).json({ 
      message: "خطأ في جلب الخط", 
      error: err.message 
    });
  }
};

// ✅ تحديث خط مع محطاته وسعره
exports.updateLine = async (req, res) => {
  let transaction;
  try {
    const { id } = req.params;
    const { line_name, price, stations } = req.body;

    const line = await Line.findByPk(id);
    if (!line) {
      return res.status(404).json({ message: "الخط غير موجود" });
    }

    transaction = await sequelize.transaction();

    // تحديث اسم الخط والسعر
    const updateData = {};
    if (line_name) updateData.line_name = line_name;
    if (price !== undefined) {
      if (price < 0) {
        await transaction.rollback();
        return res.status(400).json({ 
          message: "السعر يجب أن يكون قيمة موجبة" 
        });
      }
      updateData.price = parseFloat(price);
    }

    if (Object.keys(updateData).length > 0) {
      await line.update(updateData, { transaction });
    }

    // إذا كانت هناك محطات جديدة، تحديثها
    if (stations && Array.isArray(stations)) {
      // حذف المحطات القديمة
      await LineStation.destroy({ 
        where: { line_id: id },
        transaction 
      });

      // إضافة المحطات الجديدة
      for (let i = 0; i < stations.length; i++) {
        const stationData = stations[i];
        const { name, location, station_order } = stationData;

        if (!name || !location) {
          await transaction.rollback();
          return res.status(400).json({ 
            message: `يرجى إدخال اسم وموقع المحطة رقم ${i + 1}` 
          });
        }

        let station;

        const existingStation = await Station.findOne({
          where: { name },
          transaction
        });

        if (existingStation) {
          station = existingStation;
        } else {
          station = await Station.create({
            name,
            location
          }, { transaction });
        }

        await LineStation.create({
          line_id: id,
          station_id: station.id,
          station_order: station_order || i + 1
        }, { transaction });
      }
    }

    await transaction.commit();

    // جلب الخط المحدث
    const updatedLine = await Line.findOne({
      where: { id },
      include: [{
        model: Station,
        through: { attributes: ["station_order"] }
      }]
    });

    res.json({
      message: "تم تحديث الخط والمحطات بنجاح",
      line: updatedLine
    });

  } catch (err) {
    if (transaction) await transaction.rollback();
    res.status(500).json({ 
      message: "خطأ في تحديث الخط", 
      error: err.message 
    });
  }
};

// ✅ جلب الأسعار للمسافرين فقط
exports.getLinePrices = async (req, res) => {
  try {
    // هذا الراوت للمسافرين فقط
    if (req.user.userType !== 1) {
      return res.status(403).json({ 
        message: "غير مسموح الوصول لهذه البيانات" 
      });
    }

    const lines = await Line.findAll({
      attributes: ["id", "line_name", "price"],
      order: [["line_name", "ASC"]]
    });

    res.json({
      message: "تم جلب أسعار الخطوط بنجاح",
      lines: lines
    });

  } catch (err) {
    res.status(500).json({ 
      message: "خطأ في جلب الأسعار", 
      error: err.message 
    });
  }
};

// ✅ تحديث سعر خط محدد (للمسؤولين فقط)
exports.updateLinePrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;

    if (price === undefined || price < 0) {
      return res.status(400).json({ 
        message: "يرجى إدخال سعر صحيح (قيمة موجبة)" 
      });
    }

    const line = await Line.findByPk(id);
    if (!line) {
      return res.status(404).json({ message: "الخط غير موجود" });
    }

    await line.update({ price: parseFloat(price) });

    res.json({
      message: "تم تحديث سعر الخط بنجاح",
      line: {
        id: line.id,
        line_name: line.line_name,
        price: line.price
      }
    });

  } catch (err) {
    res.status(500).json({ 
      message: "خطأ في تحديث السعر", 
      error: err.message 
    });
  }
};

// الباقي من الدوال يبقى كما هو (deleteLine)
exports.deleteLine = async (req, res) => {
  try {
    const { id } = req.params;

    const line = await Line.findByPk(id);
    if (!line) {
      return res.status(404).json({ message: "الخط غير موجود" });
    }

    await LineStation.destroy({ where: { line_id: id } });
    await line.destroy();

    res.json({ message: "تم حذف الخط بنجاح" });

  } catch (err) {
    res.status(500).json({ 
      message: "خطأ في حذف الخط", 
      error: err.message 
    });
  }
};
// ******************************************************************************************

// const { Line, Station, LineStation, sequelize } = require("../models");

// // ✅ إنشاء خط جديد مع المحطات (للمسؤول userType=2 فقط)
// exports.createLine = async (req, res) => {
//   let transaction;
//   try {
//     const { line_name, stations } = req.body;

//     // التحقق من وجود البيانات
//     if (!line_name || !stations || !Array.isArray(stations)) {
//       return res.status(400).json({ 
//         message: "يرجى إدخال اسم الخط وقائمة المحطات" 
//       });
//     }

//     // بدء transaction للتأكد من نجاح العملية كاملة أو لا شيء
//     transaction = await sequelize.transaction();

//     // 1. إنشاء الخط الجديد
//     const newLine = await Line.create({ 
//       line_name 
//     }, { transaction });

//     // 2. معالجة المحطات
//     for (let i = 0; i < stations.length; i++) {
//       const stationData = stations[i];
//       const { name, location, station_order } = stationData;

//       // التحقق من البيانات المطلوبة للمحطة
//       if (!name || !location) {
//         await transaction.rollback();
//         return res.status(400).json({ 
//           message: `يرجى إدخال اسم وموقع المحطة رقم ${i + 1}` 
//         });
//       }

//       let station;

//       // البحث عن محطة موجودة بنفس الاسم أو إنشاء محطة جديدة
//       const existingStation = await Station.findOne({
//         where: { name },
//         transaction
//       });

//       if (existingStation) {
//         // استخدام المحطة الموجودة
//         station = existingStation;
//       } else {
//         // إنشاء محطة جديدة
//         station = await Station.create({
//           name,
//           location
//         }, { transaction });
//       }

//       // 3. ربط المحطة بالخط
//       await LineStation.create({
//         line_id: newLine.id,
//         station_id: station.id,
//         station_order: station_order || i + 1
//       }, { transaction });
//     }

//     // تأكيد العملية
//     await transaction.commit();

//     // 4. جلب الخط مع محطاته بعد الإنشاء
//     const lineWithStations = await Line.findOne({
//       where: { id: newLine.id },
//       include: [{
//         model: Station,
//         through: { attributes: ["station_order"] },
//         attributes: ["id", "name", "location"]
//       }],
//       order: [
//         [Station, LineStation, "station_order", "ASC"]
//       ]
//     });

//     res.status(201).json({
//       message: "تم إنشاء الخط والمحطات بنجاح",
//       line: lineWithStations
//     });

//   } catch (err) {
//     // التراجع عن العملية في حالة الخطأ
//     if (transaction) await transaction.rollback();
    
//     res.status(500).json({ 
//       message: "خطأ في إنشاء الخط والمحطات", 
//       error: err.message 
//     });
//   }
// };

// // ✅ جلب جميع الخطوط مع محطاتها
// exports.getAllLines = async (req, res) => {
//   try {
//     const lines = await Line.findAll({
//       include: [{
//         model: Station,
//         through: { 
//           attributes: ["station_order"]
//         },
//         attributes: ["id", "name", "location"]
//       }],
//       order: [
//         ["id", "ASC"],
//         [Station, LineStation, "station_order", "ASC"]
//       ]
//     });

//     res.json({
//       message: "تم جلب الخطوط بنجاح",
//       lines: lines
//     });

//   } catch (err) {
//     res.status(500).json({ 
//       message: "خطأ في جلب الخطوط", 
//       error: err.message 
//     });
//   }
// };

// // ✅ جلب خط محدد مع محطاته
// exports.getLineById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const line = await Line.findOne({
//       where: { id },
//       include: [{
//         model: Station,
//         through: { 
//           attributes: ["station_order"]
//         },
//         attributes: ["id", "name", "location"]
//       }],
//       order: [
//         [Station, LineStation, "station_order", "ASC"]
//       ]
//     });

//     if (!line) {
//       return res.status(404).json({ message: "الخط غير موجود" });
//     }

//     res.json({
//       message: "تم جلب الخط بنجاح",
//       line: line
//     });

//   } catch (err) {
//     res.status(500).json({ 
//       message: "خطأ في جلب الخط", 
//       error: err.message 
//     });
//   }
// };

// // ✅ تحديث خط مع محطاته
// exports.updateLine = async (req, res) => {
//   let transaction;
//   try {
//     const { id } = req.params;
//     const { line_name, stations } = req.body;

//     const line = await Line.findByPk(id);
//     if (!line) {
//       return res.status(404).json({ message: "الخط غير موجود" });
//     }

//     transaction = await sequelize.transaction();

//     // تحديث اسم الخط
//     if (line_name) {
//       await line.update({ line_name }, { transaction });
//     }

//     // إذا كانت هناك محطات جديدة، تحديثها
//     if (stations && Array.isArray(stations)) {
//       // حذف المحطات القديمة
//       await LineStation.destroy({ 
//         where: { line_id: id },
//         transaction 
//       });

//       // إضافة المحطات الجديدة
//       for (let i = 0; i < stations.length; i++) {
//         const stationData = stations[i];
//         const { name, location, station_order } = stationData;

//         if (!name || !location) {
//           await transaction.rollback();
//           return res.status(400).json({ 
//             message: `يرجى إدخال اسم وموقع المحطة رقم ${i + 1}` 
//           });
//         }

//         let station;

//         // البحث عن محطة موجودة أو إنشاء جديدة
//         const existingStation = await Station.findOne({
//           where: { name },
//           transaction
//         });

//         if (existingStation) {
//           station = existingStation;
//         } else {
//           station = await Station.create({
//             name,
//             location
//           }, { transaction });
//         }

//         await LineStation.create({
//           line_id: id,
//           station_id: station.id,
//           station_order: station_order || i + 1
//         }, { transaction });
//       }
//     }

//     await transaction.commit();

//     // جلب الخط المحدث
//     const updatedLine = await Line.findOne({
//       where: { id },
//       include: [{
//         model: Station,
//         through: { attributes: ["station_order"] }
//       }]
//     });

//     res.json({
//       message: "تم تحديث الخط والمحطات بنجاح",
//       line: updatedLine
//     });

//   } catch (err) {
//     if (transaction) await transaction.rollback();
//     res.status(500).json({ 
//       message: "خطأ في تحديث الخط", 
//       error: err.message 
//     });
//   }
// };

// // ✅ حذف خط
// exports.deleteLine = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const line = await Line.findByPk(id);
//     if (!line) {
//       return res.status(404).json({ message: "الخط غير موجود" });
//     }

//     // حذف المحطات المرتبطة أولاً
//     await LineStation.destroy({ where: { line_id: id } });

//     // ثم حذف الخط
//     await line.destroy();

//     res.json({ message: "تم حذف الخط بنجاح" });

//   } catch (err) {
//     res.status(500).json({ 
//       message: "خطأ في حذف الخط", 
//       error: err.message 
//     });
//   }
// };
