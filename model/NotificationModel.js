const mongoose = require("mongoose");

// Define Notification Schema
const Notification = mongoose.Schema(
    {
        batchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Batch",
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quiz",
            required: true
        },
        message: {
            type: String,
            required: true,
        },
        isSeen: { type: Boolean, default: true },
        isActive: { type: Boolean, default: true },
        deletedAt: { type: String, default: null },
    },
    {
        timestamps: true,
    }
);

// Create Notification Model
module.exports = {
    Notification: mongoose.model("Notification", Notification),
};
