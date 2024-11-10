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
        chat: {
            type: [Object],
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

// Create Chat Model
module.exports = {
    Chat: mongoose.model("Chat", Chat),
};
