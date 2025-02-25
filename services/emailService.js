const nodemailer = require("nodemailer");

// Create reusable transporter
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

/**
 * Send verification code email
 * @param {string} to - Recipient email
 * @param {string} code - Verification code
 * @returns {Promise} - Email sending status
 */
exports.sendVerificationCode = async (to, code) => {
	try {
		const mailOptions = {
			from: process.env.EMAIL_USER,
			to,
			subject: "Your verification code",
			html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333;">Your Verification Code</h2>
          <p>Please use the following code to complete your authentication:</p>
          <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
            <strong>${code}</strong>
          </div>
          <p>This code will expire in 2 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `,
		};

		const info = await transporter.sendMail(mailOptions);
		return info;
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error("Email sending error:", error);
		throw new Error("Failed to send verification email");
	}
};
