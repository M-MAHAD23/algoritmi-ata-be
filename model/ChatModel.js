const mongoose = require("mongoose");

// Define Chat Schema
const Chat = mongoose.Schema(
    {
        batchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Batch",
            required: true
        },
        chatName: {
            type: String,
            required: true,
        },
        chatOwner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: [],
        },
        chat: {
            type: [
                {
                    role: {
                        type: String,
                        required: true,
                        enum: ["User", "Model"]
                    },
                    message: {
                        type: String,
                        required: true
                    }
                }
            ],
            default: []
        },
        isEnable: { type: Boolean, default: true },
        isActive: { type: Boolean, default: true },
        deletedAt: { type: String, default: null },
    },
    {
        timestamps: true,
    }
);

// Create Chat Model
module.exports = {
    Chat: mongoose.model("Chat", Chat),
};
