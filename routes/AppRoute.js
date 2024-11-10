// routes/AppController.js
const router = require("express").Router();
const AppController = require('../controllers/AppController');
const { uploadFiles } = require("../middlewares/uploadFiles");

// Route to submit assignment
router.post('/submitAssignment', uploadFiles, AppController.submitAssignment);

// Route to configure ATA
router.post("/ataConfig", AppController.ataConfig);

// Route to configure ATA
router.post("/prompt", AppController.prompt);

module.exports = router;
