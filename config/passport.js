const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userModel");

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: "/api/auth/google/callback",
			scope: ["profile", "email", "https://www.googleapis.com/auth/calendar"],
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				// Check if user already exists
				let user = await User.findOne({ googleId: profile.id });

				if (user) {
					// Update refresh token if provided
					if (refreshToken) {
						user.googleRefreshToken = refreshToken;
						user.googleCalendarConnected = true;
						await user.save();
					}
					return done(null, user);
				}

				// If not, create a new user
				user = await User.create({
					email: profile.emails[0].value,
					googleId: profile.id,
					googleRefreshToken: refreshToken,
					googleCalendarConnected: true,
					// Generate a random password as it's required by our model
					// but won't be used for Google-authenticated users
					password: Math.random().toString(36).slice(-8),
				});

				return done(null, user);
			} catch (error) {
				return done(error, null);
			}
		}
	)
);
