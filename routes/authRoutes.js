const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

// Auth routes
router.post("/register", authController.register);
router.post("/verify-two-factor", authController.verifyTwoFactorCode);
router.post("/login", authController.login);
router.post("/verify-email-code", authController.verifyEmailCode);

module.exports = router;
