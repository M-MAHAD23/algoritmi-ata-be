const mongoose = require("mongoose");

// Define Quiz Schema
const Quiz = mongoose.Schema(
    {
        batchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Batch",
            required: true
        },
        quizzerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        quizTopic: {
            type: String,
            required: true,
        },
        quizName: {
            type: String,
            required: true,
        },
        quizDescription: {
            type: String,
            required: true,
        },
        quizIssued: {
            type: String,
            required: true,
        },
        quizDead: {
            type: String,
            required: true,
        },
        quizSubmitters: [
            {
                studentId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                },
                submissionId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "QuizSubmitter",
                    required: true
                }
            }
        ],
        quizNonSubmitters: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "User",
            required: true,
        },
        quizHint: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "QuizHint",
            default: [],
        },
        isEnable: { type: Boolean, default: true },
        isActive: { type: Boolean, default: true },
        deletedAt: { type: String, default: null },
    },
    {
        timestamps: true,
    }
);

// Create Quiz Model
module.exports = {
    Quiz: mongoose.model("Quiz", Quiz),
};
