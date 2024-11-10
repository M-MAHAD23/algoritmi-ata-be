const mongoose = require("mongoose");

// Define the Submitter Schema
const SubmitterSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    percentage: {
        type: String,
        required: true
    },
    marks: {
        type: Number,
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

// Define Assignment Schema
const Assignment = mongoose.Schema(
    {
        batchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Batch",
            required: true
        },
        assignerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        assignmentNumber: {
            type: String,
            required: true,
        },
        assignmentName: {
            type: String,
            required: true,
        },
        assignmentDescription: {
            type: String,
            required: true,
        },
        assignmentFilePathOrUrl: {
            type: String,
            required: true,
        },
        assignmentQuizCount: {
            type: Number,
            required: true,
        },
        assignmentIssued: {
            type: String,
            required: true,
        },
        assignmentDead: {
            type: String,
            required: true,
        },
        assignmentSubmitters: {
            type: [SubmitterSchema],
            default: [],
        },
        assignmentNonSubmitters: {
            type: [mongoose.Schema.Types.ObjectId],
            required: true,
        },
        isEnable: { type: Boolean, default: true },
        deletedAt: { type: String, default: null },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

// Create Assignment Model
module.exports = {
    Assignment: mongoose.model("Assignment", Assignment),
};
