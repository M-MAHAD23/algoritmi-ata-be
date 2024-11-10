const router = require("express").Router();
const ChatController = require("../controllers/ChatController");

// Create a new chat
router.post("/createChat", ChatController.createChat);

// Get all chats
router.post("/getAllChats", ChatController.getAllChats);

// Get a single chat by User ID
router.post("/getAllChatsByUserId", ChatController.getAllChatsByUserId);

// Get a single chat by ID
router.post("/getChatById", ChatController.getChatById);

// Update a chat by ID
router.post("/updateChatById", ChatController.updateChatById);

// Delete a chat by ID (soft delete)
router.post("/deleteChatById", ChatController.deleteChatById);

module.exports = router;
