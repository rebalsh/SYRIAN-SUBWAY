// routes/ticketRoutes.js
const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticketController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// 🔹 الخطوط والرحلات المتاحة (للمسافرين فقط)
router.get("/lines", 
  authMiddleware, 
  roleMiddleware([1]),
  ticketController.getAvailableLines
);

router.get("/trips", 
  authMiddleware, 
  roleMiddleware([1]),
  ticketController.getAvailableTrips
);

// 🔹 عمليات الحجز (للمسافرين فقط)
router.post("/calculate-price",
  authMiddleware,
  roleMiddleware([1]),
  ticketController.calculatePrice
);

router.post("/book",
  authMiddleware,
  roleMiddleware([1]),
  ticketController.bookTickets
);

router.post("/confirm",
  authMiddleware,
  roleMiddleware([1]),
  ticketController.confirmBooking
);

// 🔹 إدارة التذاكر
router.get("/my-tickets",
  authMiddleware,
  roleMiddleware([1]),
  ticketController.getUserTickets
);

router.put("/cancel/:ticket_id",
  authMiddleware,
  roleMiddleware([1]),
  ticketController.cancelBooking
);

module.exports = router;