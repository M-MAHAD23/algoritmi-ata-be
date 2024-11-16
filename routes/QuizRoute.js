const express = require("express");
const router = express.Router();
const QuizController = require("../controllers/QuizController");
const { uploadFiles } = require("../middlewares/uploadFiles");
const { uploadCode } = require("../middlewares/uploadCode");

// Route to create a new quiz
router.post("/createQuiz", QuizController.createQuiz);

// Route to get all quizzes
router.post("/getAllQuizzes", QuizController.getAllQuizzes);

// Route to get all quizzes
router.post("/getAllQuizzesByBatchId", QuizController.getAllQuizzesByBatchId);

// Route to get a quiz by ID
router.post("/getQuizById", QuizController.getQuizById);

// Route to update a quiz by ID
router.post("/updateQuiz", QuizController.updateQuiz);

// Route to delete a quiz (soft delete)
router.post("/deleteQuiz", QuizController.deleteQuiz);

// Route to Submit a Quiz
router.post("/submitQuiz", uploadCode, QuizController.submitQuiz);

// Route to create a new QuizHint
router.post("/createQuizHint", uploadFiles, QuizController.createQuizHint);

// Route to get a QuizHint by ID
router.post("/getQuizHint", QuizController.getQuizHint);

// Route to update a QuizHint by ID
router.post("/updateQuizHint", uploadFiles, QuizController.updateQuizHint);

// Route to delete a QuizHint by ID
router.post("/deleteQuizHint", QuizController.deleteQuizHint);

// Route to analyze
router.post("/analyzeQuiz", QuizController.analyzeQuiz);

// Route to get all quizzes student
router.post("/getAllQuizzesByBatchIdStudent", QuizController.getAllQuizzesByBatchIdStudent);

// Route to get student details
router.post("/submissionDetailsStudent", QuizController.submissionDetailsStudent);

module.exports = router;
