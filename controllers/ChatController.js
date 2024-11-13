const fs = require('fs');
const path = require('path');
const { Chat } = require("../model/ChatModel");
const { prompt } = require('../service/AiService');

// Create a new chat
exports.createChat = async (req, res) => {
    try {
        const { chatName, chatOwner, chat } = req.body;
        const newChat = await Chat.create({ chatName, chatOwner, chat });
        const liveChat = await prompt(chat);
        console.log(liveChat);
        const updatedChat = await Chat.findOneAndUpdate(
            {
                _id: newChat._id
            },
            {
                chat: liveChat
            },
            {
                new: true
            }
        );
        res.status(201).json(updatedChat);
    } catch (error) {
        res.status(500).json({ message: "Error creating chat", error });
    }
};

// Get all chats
exports.getAllChats = async (req, res) => {
    try {
        const chats = await Chat.find({ isActive: true });
        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ message: "Error fetching chats", error });
    }
};

// Get all chats by User's ID
exports.getAllChatsByUserId = async (req, res) => {
    try {
        const userChats = await Chat.find({ chatOwner: req.body.userId, isActive: true });
        res.status(200).json(userChats);
    } catch (error) {
        res.status(500).json({ message: "Error fetching chat", error });
    }
};

// Get a single chat by ID
exports.getChatById = async (req, res) => {
    try {
        const chat = await Chat.findById(req.body.id);
        if (!chat || !chat.isActive) {
            return res.status(404).json({ message: "Chat not found" });
        }
        res.status(200).json(chat);
    } catch (error) {
        res.status(500).json({ message: "Error fetching chat", error });
    }
};

// Update a chat by ID
exports.updateChatById = async (req, res) => {
    try {
        const { id, message, chatName } = req.body;
        if (chatName) {
            await Chat.findByIdAndUpdate(
                id,
                {
                    chatName: chatName
                },
                { new: true }
            );
        }
        const updatedChat = await Chat.findByIdAndUpdate(
            id,
            {
                $push: { chat: message[0] },
            },
            { new: true }
        );
        if (!updatedChat || !updatedChat.isActive) {
            return res.status(404).json({ message: "Chat not found" });
        }

        const liveChat = await prompt(updatedChat.chat);
        const updatedChatLive = await Chat.findOneAndUpdate(
            { _id: updatedChat._id },
            { chat: liveChat },
            { new: true }
        );

        res.status(200).json(updatedChatLive);
    } catch (error) {
        res.status(500).json({ message: "Error updating chat", error: error.message });
    }
};

// Delete a chat by ID (soft delete)
exports.deleteChatById = async (req, res) => {
    try {
        const chat = await Chat.findByIdAndUpdate(
            req.body.id,
            { isActive: false, deletedAt: new Date().toISOString() },
            { new: true }
        );
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }
        res.status(200).json({ message: "Chat deleted successfully", chat });
    } catch (error) {
        res.status(500).json({ message: "Error deleting chat", error });
    }
};
