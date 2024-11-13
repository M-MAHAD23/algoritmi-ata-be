// routes/AppController.js
const router = require("express").Router();
const AppController = require('../controllers/AppController');
const { uploadFiles } = require("../middlewares/uploadFiles");

// Route to submit Quiz
router.post('/submitQuiz', uploadFiles, AppController.submitQuiz);

// Route to configure ATA
router.post("/ataConfig", AppController.ataConfig);

// Route to configure ATA
router.post("/prompt", AppController.prompt);

module.exports = router;
