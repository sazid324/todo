"use strict";

const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async (uri) => {
	try {
		await mongoose.connect(uri);
		// eslint-disable-next-line no-console
		console.log("Connected to MongoDB...");
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error("Failed to connect to MongoDB...", err);
	}
};

module.exports = connectDB;
