"use strict";

const express = require("express");
const router = express.Router();

const auth = require("./authRoutes");
const todo = require("./todoRoutes");
const calendar = require("./googleCalendarRoutes");

// Routers
router.use("/auth", auth);
router.use("/todo", todo);
router.use("/calendar", calendar);

module.exports = router;
