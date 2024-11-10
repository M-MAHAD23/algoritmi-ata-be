const fs = require('fs');
const path = require('path');
const { Chat } = require("../model/ChatModel");

// Create a new chat
exports.createChat = async (req, res) => {
    try {
        const { chatName, chatOwner, chat } = req.body;
        const newChat = await Chat.create({ chatName, chatOwner, chat });
        res.status(201).json(newChat);
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
        const userChats = await Chat.find({ chatOwner: req.params.userId, isActive: true });
        res.status(200).json(userChats);
    } catch (error) {
        res.status(500).json({ message: "Error fetching chat", error });
    }
};

// Get a single chat by ID
exports.getChatById = async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id);
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
        const updatedChat = await Chat.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        if (!updatedChat || !updatedChat.isActive) {
            return res.status(404).json({ message: "Chat not found" });
        }
        res.status(200).json(updatedChat);
    } catch (error) {
        res.status(500).json({ message: "Error updating chat", error });
    }
};

// Delete a chat by ID (soft delete)
exports.deleteChatById = async (req, res) => {
    try {
        const chat = await Chat.findByIdAndUpdate(
            req.params.id,
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
