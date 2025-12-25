// const express = require("express");
// const router = express.Router();
// const periodicTicketController = require("../controllers/periodicTicketController");
// const authMiddleware = require("../middleware/authMiddleware");
// const roleMiddleware = require("../middleware/roleMiddleware");

// // 🔹 1. جلب الرحلات الأساسية المتاحة للحجز الدوري
// router.get(
//   "/base-trips",
//   authMiddleware,
//   roleMiddleware([1]), // للمسافرين فقط
//   periodicTicketController.getBaseTripsForBooking
// );

// // 🔹 2. حساب سعر الحجز الدوري
// router.post(
//   "/calculate-price",
//   authMiddleware,
//   roleMiddleware([1]),
//   periodicTicketController.calculatePeriodicPrice
// );

// // 🔹 3. حجز تذكرة دورية (أسبوعية/شهرية)
// router.post(
//   "/book",
//   authMiddleware,
//   roleMiddleware([1]),
//   periodicTicketController.bookPeriodicTicket
// );

// // 🔹 4. تأكيد الحجز الدوري بعد الدفع
// router.post(
//   "/confirm",
//   authMiddleware,
//   roleMiddleware([1]),
//   periodicTicketController.confirmPeriodicBooking
// );

// // 🔹 5. جلب التذاكر الدورية الخاصة بي
// router.get(
//   "/my-periodic-tickets",
//   authMiddleware,
//   roleMiddleware([1]),
//   periodicTicketController.getUserPeriodicTickets
// );

// // 🔹 6. إلغاء تذكرة دورية
// router.delete(
//   "/cancel/:periodic_ticket_number",
//   authMiddleware,
//   roleMiddleware([1]),
//   periodicTicketController.cancelPeriodicBooking
// );

// // 🔹 7. تجديد تذكرة دورية
// router.post(
//   "/renew",
//   authMiddleware,
//   roleMiddleware([1]),
//   periodicTicketController.renewPeriodicTicket
// );

// // 🔹 8. التحقق من صلاحية التذكرة (للموظفين في المحطات)
// router.get(
//   "/validate",
//   authMiddleware,
//   roleMiddleware([3, 4, 5]), // مشرفين، فنيين، سائقين
//   periodicTicketController.validatePeriodicTicket
// );

// module.exports = router;



// routes/periodicTicketRoutes.js
const express = require("express");
const router = express.Router();
const periodicTicketController = require("../controllers/periodicTicketController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// 🔹 صلاحيات المسافرين فقط
const passengerOnly = roleMiddleware([1]);

// 🔹 صلاحيات الموظفين (مشرفين، فنيين، سائقين)
const staffOnly = roleMiddleware([3, 4, 5]);

// 🔹 1. جلب الرحلات الأساسية المتاحة للحجز الدوري
router.get("/base-trips",
  authMiddleware,
  passengerOnly,
  periodicTicketController.getBaseTripsForBooking
);

// 🔹 2. حساب سعر الحجز الدوري
router.post("/calculate-price",
  authMiddleware,
  passengerOnly,
  periodicTicketController.calculatePeriodicPrice
);

// 🔹 3. حجز تذكرة دورية (أسبوعية/شهرية)
router.post("/book",
  authMiddleware,
  passengerOnly,
  periodicTicketController.bookPeriodicTicket
);

// 🔹 4. تأكيد الحجز الدوري بعد الدفع
router.post("/confirm",
  authMiddleware,
  passengerOnly,
  periodicTicketController.confirmPeriodicBooking
);

// 🔹 5. جلب التذاكر الدورية الخاصة بي
router.get("/my-periodic-tickets",
  authMiddleware,
  passengerOnly,
  periodicTicketController.getUserPeriodicTickets
);

// 🔹 6. إلغاء تذكرة دورية
router.delete("/cancel/:periodic_ticket_number",
  authMiddleware,
  passengerOnly,
  periodicTicketController.cancelPeriodicBooking
);

// 🔹 7. تجديد تذكرة دورية
router.post("/renew",
  authMiddleware,
  passengerOnly,
  periodicTicketController.renewPeriodicTicket
);

// 🔹 8. التحقق من صلاحية التذكرة (للموظفين في المحطات)
router.get("/validate",
  authMiddleware,
  staffOnly,
  periodicTicketController.validatePeriodicTicket
);

module.exports = router;