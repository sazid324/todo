const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const User = require("../models/userModel");
const emailService = require("../services/emailService");

// Generate JWT token
const generateToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: "30d",
	});
};

// Store email codes (in memory for simplicity - use Redis in production)
const emailCodes = {};

// Register a new user
exports.register = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({
				status: "error",
				message: "User already exists",
			});
		}

		// Generate 2FA secret
		const secret = speakeasy.generateSecret({
			name: `ToDo App:${email}`,
		});

		// Create user
		const user = await User.create({
			email,
			password,
			twoFactorSecret: secret.base32,
			isTwoFactorEnabled: true,
		});

		// Generate QR code for Google Authenticator
		const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

		res.status(201).json({
			status: "success",
			user: {
				id: user._id,
				email: user.email,
			},
			qrCodeUrl,
		});
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error(error);
		res.status(500).json({
			status: "error",
			message: "Registration failed",
		});
	}
};

// Login - Step 1: Check email and password
exports.login = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Check if user exists
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(401).json({
				status: "error",
				message: "Invalid credentials",
			});
		}

		// Check if password is correct
		const isPasswordValid = await user.isValidPassword(password);
		if (!isPasswordValid) {
			return res.status(401).json({
				status: "error",
				message: "Invalid credentials",
			});
		}

		// Generate a 6-digit code
		const code = Math.floor(100000 + Math.random() * 900000).toString();

		// Store code with timestamp (valid for 2 minutes)
		emailCodes[email] = {
			code,
			expiresAt: Date.now() + 2 * 60 * 1000, // 2 minutes
		};

		// Send code to user's email
		await emailService.sendVerificationCode(email, code);

		res.status(200).json({
			status: "success",
			message: "Verification code sent to your email",
			userId: user._id,
		});
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error(error);
		res.status(500).json({
			status: "error",
			message: "Login failed",
		});
	}
};

// Login - Step 2: Verify email code
exports.verifyEmailCode = async (req, res) => {
	try {
		const { email, code } = req.body;

		// Check if code exists and is valid
		const storedCode = emailCodes[email];
		if (!storedCode || storedCode.code !== code) {
			return res.status(401).json({
				status: "error",
				message: "Invalid verification code",
			});
		}

		// Check if code is expired
		if (Date.now() > storedCode.expiresAt) {
			delete emailCodes[email]; // Clean up expired code
			return res.status(401).json({
				status: "error",
				message: "Verification code expired",
			});
		}

		// Clean up used code
		delete emailCodes[email];

		// Code is valid, proceed to 2FA step
		const user = await User.findOne({ email });

		res.status(200).json({
			status: "success",
			message: "Email code verified successfully",
			userId: user._id,
			requiresTwoFactor: user.isTwoFactorEnabled,
		});
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error(error);
		res.status(500).json({
			status: "error",
			message: "Verification failed",
		});
	}
};

// Login - Step 3: Verify Google Authenticator code
exports.verifyTwoFactorCode = async (req, res) => {
	try {
		const { userId, twoFactorCode } = req.body;

		// Find user
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({
				status: "error",
				message: "User not found",
			});
		}

		// Verify the token against the secret
		const verified = speakeasy.totp.verify({
			secret: user.twoFactorSecret,
			encoding: "base32",
			token: twoFactorCode,
			window: 1, // Allow a 30-second window
		});

		if (!verified) {
			return res.status(401).json({
				status: "error",
				message: "Invalid authentication code",
			});
		}

		// Generate JWT token
		const token = generateToken(user._id);

		res.status(200).json({
			status: "success",
			token,
			user: {
				id: user._id,
				email: user.email,
				googleCalendarConnected: user.googleCalendarConnected,
			},
		});
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error(error);
		res.status(500).json({
			status: "error",
			message: "Authentication failed",
		});
	}
};

// Google OAuth login route handler
exports.googleCallback = (req, res) => {
	const token = generateToken(req.user._id);

	// Redirect to frontend with token
	res.redirect(`${process.env.CLIENT_URL}/auth/google-callback?token=${token}`);
};
