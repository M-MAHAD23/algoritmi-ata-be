const mongoose = require("mongoose");

// Define QuizSubmitter Schema
const QuizSubmitter = mongoose.Schema(
    {
        batchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Batch",
            required: true
        },
        submitterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        quizId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quiz",
            required: true
        },
        s3Url: {
            type: String,
            required: true,
        },
        textMatched: [
            {
                studentId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                },
                percentage: {
                    type: Number,
                    required: true
                },
            },
        ],
        syntaxMatched: [
            {
                studentId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                },
                percentage: {
                    type: Number,
                    required: true
                },
            }
        ],
        logicMatched: [
            {
                studentId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                },
                percentage: {
                    type: Number,
                    required: true
                },
            }
        ],
        ethics: {
            type: String,
            default: "",
        },
        copiedFromAI: {
            type: Number,
            default: 0,
        },
        submitDate: {
            type: String,
            required: true,
        },
        isEnable: { type: Boolean, default: true },
        isActive: { type: Boolean, default: true },
        deletedAt: { type: String, default: null },
    },
    {
        timestamps: true,
    }
);

// Create QuizSubmitter Model
module.exports = {
    QuizSubmitter: mongoose.model("QuizSubmitter", QuizSubmitter),
};
