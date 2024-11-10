// routes/assignmentController.js
const router = require("express").Router();
const AssignmentController = require('../controllers/AssignmentController');

// Route to create a new assignment
router.post('/createAssignment', AssignmentController.createAssignment);

// Route to get all assignments
router.post('/getAssignments', AssignmentController.getAssignments);

// Route to get a specific assignment by ID
router.post('/getAssignmentById', AssignmentController.getAssignmentById);

// Route to update a specific assignment by ID
router.post('/updateAssignment', AssignmentController.updateAssignment);

// Route to delete (soft delete) a specific assignment by ID
router.post('/deleteAssignment', AssignmentController.deleteAssignment);

module.exports = router;
