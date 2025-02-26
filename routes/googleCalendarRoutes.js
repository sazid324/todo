require("dotenv").config();
const express = require("express");
const { google } = require("googleapis");

const router = express.Router();

// Set up Google OAuth2 client with credentials from environment variables
const oauth2Client = new google.auth.OAuth2(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	process.env.REDIRECT_URL
);

// Route to initiate Google OAuth2 flow
router.get("/google-auth", (req, res) => {
	const url = oauth2Client.generateAuthUrl({
		access_type: "offline",
		scope: "https://www.googleapis.com/auth/calendar.readonly",
	});
	res.redirect(url);
});

// Route to handle the OAuth2 callback
router.get("/redirect", (req, res) => {
	const code = req.query.code;
	oauth2Client.getToken(code, (err, tokens) => {
		if (err) {
			// eslint-disable-next-line no-console
			console.error("Couldn't get token", err);
			res.send("Error");
			return;
		}
		oauth2Client.setCredentials(tokens);
		res.send("Successfully logged in");
	});
});

// Route to list all calendars
router.get("/calendars", (req, res) => {
	const calendar = google.calendar({ version: "v3", auth: oauth2Client });
	calendar.calendarList.list({}, (err, response) => {
		if (err) {
			// eslint-disable-next-line no-console
			console.error("Error fetching calendars", err);
			res.end("Error!");
			return;
		}
		const calendars = response.data.items;
		res.json(calendars);
	});
});

// Route to list events from a specified calendar
router.get("/events", (req, res) => {
	const calendarId = req.query.calendar ?? "primary";
	const calendar = google.calendar({ version: "v3", auth: oauth2Client });
	calendar.events.list(
		{
			calendarId,
			timeMin: new Date().toISOString(),
			maxResults: 15,
			singleEvents: true,
			orderBy: "startTime",
		},
		(err, response) => {
			if (err) {
				// eslint-disable-next-line no-console
				console.error("Can't fetch events");
				res.send("Error");
				return;
			}
			const events = response.data.items;
			res.json(events);
		}
	);
});

module.exports = router;
