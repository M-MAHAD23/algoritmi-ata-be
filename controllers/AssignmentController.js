const { Assignment } = require('../model/AssignmentModel');
const { Batch } = require('../model/BatchModel');

// Create a new assignment
exports.createAssignment = async (req, res) => {
    try {
        const batch = await Batch.findOne(
            {
                _id: req.body.batchId,
            }
        );
        const students = batch.batchStudent;
        const assignment = new Assignment({ ...req.body, assignmentNonSubmitters: students });
        await assignment.save();

        batch.batchAssignment.push(assignment._id);
        await batch.save();

        res.status(201).json({ message: 'Assignment created successfully', data: assignment });
    } catch (error) {
        res.status(500).json({ error: 'Error creating assignment', details: error.message });
    }
};

// Get all assignments with populated studentId (full user document)
exports.getAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find().populate({
            path: 'assignmentSubmitters.studentId',  // Path to populate nested `studentId` within `assignmentSubmitters`
            model: 'User',  // Specify the model for population
        });
        res.status(200).json({ data: assignments });
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving assignments', details: error.message });
    }
};

// Get a single assignment by ID with populated studentId (full user document)
exports.getAssignmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const assignment = await Assignment.findById(id).populate({
            path: 'assignmentSubmitters.studentId',
            model: 'User',
        });
        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }
        res.status(200).json({ data: assignment });
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving assignment', details: error.message });
    }
};

// Update an assignment with populated studentId (full user document)
exports.updateAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedAssignment = await Assignment.findByIdAndUpdate(id, req.body, { new: true }).populate({
            path: 'assignmentSubmitters.studentId',
            model: 'User',
        });
        if (!updatedAssignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }
        res.status(200).json({ message: 'Assignment updated successfully', data: updatedAssignment });
    } catch (error) {
        res.status(500).json({ error: 'Error updating assignment', details: error.message });
    }
};

// Delete (soft delete) an assignment
exports.deleteAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedAssignment = await Assignment.findByIdAndUpdate(id, { deletedAt: new Date(), isActive: false }, { new: true });
        if (!deletedAssignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }
        res.status(200).json({ message: 'Assignment deleted successfully', data: deletedAssignment });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting assignment', details: error.message });
    }
};
