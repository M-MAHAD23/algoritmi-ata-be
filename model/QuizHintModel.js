const mongoose = require("mongoose");

// Define QuizHint Schema
const QuizHint = mongoose.Schema(
    {
        batchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Batch",
            required: true
        },
        quizId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quiz",
            required: true
        },
        description: {
            type: String,
            required: true,
        },
        hintType: {
            type: String,
            required: true,
        },
        s3Url: {
            type: String,
            default: "",
        },
        isEnable: { type: Boolean, default: true },
        isActive: { type: Boolean, default: true },
        deletedAt: { type: String, default: null },
    },
    {
        timestamps: true,
    }
);

// Create QuizHint Model
module.exports = {
    QuizHint: mongoose.model("QuizHint", QuizHint),
};
