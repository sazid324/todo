const express = require("express");
const passport = require("passport");
const authController = require("../controllers/authController");

const router = express.Router();

// Auth routes
router.post("/register", authController.register);
router.post("/verify-two-factor", authController.verifyTwoFactorCode);
router.post("/login", authController.login);
router.post("/verify-email-code", authController.verifyEmailCode);

// Google OAuth routes
router.get(
	"/google",
	passport.authenticate("google", {
		scope: ["profile", "email", "https://www.googleapis.com/auth/calendar"],
		accessType: "offline",
		prompt: "consent",
	})
);

router.get(
	"/google/callback",
	passport.authenticate("google", {
		session: false,
		failureRedirect: "/login",
	}),
	authController.googleCallback
);

module.exports = router;
