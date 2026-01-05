const express = require("express");
const router = express.Router();

// ✅ استيراد الميدل وير كما هي
const protect = require("../middleware/authMiddleware");

// ✅ استيراد الكنترولر
const regularTicketController = require("../controllers/regularTicketController");

// ✅ استخدم protect مباشرة كدالة
router.get("/available-trips", protect, regularTicketController.getAvailableRegularTrips);
router.post("/calculate-price", protect, regularTicketController.calculateRegularPrice);
router.post("/book", protect, regularTicketController.bookRegularTicket);
router.get("/my-tickets", protect, regularTicketController.getMyRegularTickets);
router.post("/activate", protect, regularTicketController.activateRegularTicket);
router.post("/validate", protect, regularTicketController.validateRegularTicket);
router.post("/use", protect, regularTicketController.useRegularTicket);
router.post("/cancel", protect, regularTicketController.cancelRegularTicket);

module.exports = router;