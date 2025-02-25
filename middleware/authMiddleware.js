const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.protect = async (req, res, next) => {
	let token;

	// Check if auth header exists and has the token
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		token = req.headers.authorization.split(" ")[1];
	}

	if (!token) {
		return res.status(401).json({
			status: "error",
			message: "Not authorized to access this route",
		});
	}

	try {
		// Verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		// Check if user still exists
		const user = await User.findById(decoded.id);
		if (!user) {
			return res.status(401).json({
				status: "error",
				message: "The user belonging to this token no longer exists",
			});
		}

		// Grant access to protected route
		req.user = user;
		next();
	} catch {
		return res.status(401).json({
			status: "error",
			message: "Not authorized to access this route",
		});
	}
};
