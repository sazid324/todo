const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		trim: true,
	},
	description: {
		type: String,
		trim: true,
	},
	dueDate: {
		type: Date,
		required: true,
	},
	status: {
		type: String,
		enum: ["Pending", "In Progress", "Completed"],
		default: "Pending",
	},
	priority: {
		type: String,
		enum: ["Low", "Medium", "High"],
		default: "Medium",
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	googleEventId: {
		type: String,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
});

// Update the updatedAt field before updating
todoSchema.pre("findOneAndUpdate", function () {
	this.set({ updatedAt: new Date() });
});

const Todo = mongoose.model("Todo", todoSchema);

module.exports = Todo;
