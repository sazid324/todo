const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		lowercase: true,
	},
	password: {
		type: String,
		required: true,
	},
	twoFactorSecret: {
		type: String,
	},
	isTwoFactorEnabled: {
		type: Boolean,
		default: false,
	},
	googleId: {
		type: String,
	},
	googleCalendarConnected: {
		type: Boolean,
		default: false,
	},
	googleRefreshToken: {
		type: String,
	},
	otp: {
		code: String,
		expiresAt: Date,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

// Hash password before saving
userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();

	try {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		next(error);
	}
});

// Method to check password validity
userSchema.methods.isValidPassword = async function (password) {
	return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
