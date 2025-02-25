const express = require("express");
const todoController = require("../controllers/todoController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Protect all todo routes
router.use(protect);

// Todo routes
router.route("/").get(todoController.getTodos).post(todoController.createTodo);

router
	.route("/:id")
	.get(todoController.getTodo)
	.patch(todoController.updateTodo)
	.delete(todoController.deleteTodo);

module.exports = router;
