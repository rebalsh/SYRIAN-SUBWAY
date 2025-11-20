const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");

// تسجيل مستخدم عادي
router.post("/register", register);

// تسجيل دخول
router.post("/login", login);

module.exports = router;
    