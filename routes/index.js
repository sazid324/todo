"use strict";

const express = require("express");
const router = express.Router();

const auth = require("./authRoutes");
const todo = require("./todoRoutes");

// Routers
router.use("/auth", auth);
router.use("/todo", todo);

module.exports = router;
