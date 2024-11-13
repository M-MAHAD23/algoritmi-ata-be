const mongoose = require("mongoose");

// Define Chat Schema
const Chat = mongoose.Schema(
    {
        chatName: {
            type: String,
            required: true,
        },
        chatOwner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: [],
        },
        chat: [
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
