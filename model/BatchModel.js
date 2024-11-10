const mongoose = require("mongoose");

// Define Batch Schema
const Batch = mongoose.Schema(
    {
        batchNumber: {
            type: String,
            required: true,
        },
        batchSession: {
            type: String,
            required: true,
        },
        batchTeacher: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "User",
            default: [],
        },
        batchStudent: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "User",
            default: [],
        },
        batchAssignment: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "Assignment",
            default: [],
        },
        isEnable: { type: Boolean, default: true },
        deletedAt: { type: String, default: null },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

// Create Batch Model
module.exports = {
    Batch: mongoose.model("Batch", Batch),
};
