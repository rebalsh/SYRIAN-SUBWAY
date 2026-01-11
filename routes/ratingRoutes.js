const express = require("express");
const router = express.Router();
const ratingController = require("../controllers/ratingController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// جميع الراوتس تتطلب مصادقة
router.use(authMiddleware);

// 🔹 التحقق من إمكانية التقييم (للمسافرين فقط)
router.get("/check/:trip_id", ratingController.checkRatingEligibility);

// 🔹 إضافة تقييم لرحلة (للمسافرين فقط)
router.post("/:trip_id", ratingController.addRating);

// 🔹 جلب تقييمات رحلة معينة (الجميع يمكنهم المشاهدة)
router.get("/trip/:trip_id", ratingController.getTripRatings);

// 🔹 جلب تقييمي لرحلة معينة (للمسافرين فقط)
router.get("/my-rating/:trip_id", ratingController.getMyRatingForTrip);

// 🔹 تحديث تقييمي لرحلة (للمسافرين فقط)
router.put("/:trip_id", ratingController.updateRating);

// 🔹 حذف تقييمي لرحلة (للمسافرين فقط)
router.delete("/:trip_id", ratingController.deleteRating);

// 🔹 جلب رحلاتي التي يمكنني تقييمها (للمسافرين فقط)
router.get("/rateable-trips/my", ratingController.getRateableTrips);

// 🔹 جلب إحصائيات التقييمات (للإداريين والمشرفين فقط)
router.get("/stats/:trip_id", ratingController.getTripRatingStats);

module.exports = router;