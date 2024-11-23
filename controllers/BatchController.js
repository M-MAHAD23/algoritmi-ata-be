// controllers/batchController.js
const { Batch } = require('../model/BatchModel'); // Adjust the path as needed
const UserModel = require('../model/UserModel');

// Create a new Batch
exports.createBatch = async (req, res) => {
    try {
        const batch = new Batch(req.body);
        await batch.save();

        // Populate references before sending the response
        const batches = await Batch.find()
            .populate('batchTeacher')
            .populate('batchStudent')
            .populate('batchQuiz');
        res.status(201).json({ success: true, data: batches });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Get all Batches
exports.getAllBatches = async (req, res) => {
    try {

        const { userId } = req.body;

        if (userId) {
            batches = await Batch.find({ batchTeacher: { $in: [userId] } })
                .populate("batchTeacher")
                .populate("batchStudent")
                .populate("batchQuiz");
        }
        else {
            batches = await Batch.find()
                .populate('batchTeacher')
                .populate('batchStudent')
                .populate('batchQuiz');
        }

        res.status(200).json({ success: true, data: batches });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Get a single Batch by ID
exports.getBatchById = async (req, res) => {
    try {
        const { batchId } = req.body;

        const batch = await Batch.findOne({ _id: batchId })
            .populate('batchTeacher') // Populate batchTeacher
            .populate('batchStudent') // Populate batchStudent
            .populate({
                path: 'batchQuiz', // Path to populate
                match: { isActive: true }, // Only include quizzes where isActive is true
            });

        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }

        res.status(200).json({ success: true, data: batch });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Update a Batch by ID
exports.updateBatch = async (req, res) => {
    try {
        const { id, ...updateData } = req.body;
        const batch = await Batch.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
        const batches = await Batch.find()
            .populate('batchTeacher')
            .populate('batchStudent')
            .populate('batchQuiz');
        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }
        res.status(200).json({ success: true, data: batches });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Delete a Batch by ID
exports.deleteBatch = async (req, res) => {
    try {
        const batch = await Batch.findByIdAndDelete(req.body.id);
        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }
        const batches = await Batch.find()
            .populate('batchTeacher')
            .populate('batchStudent')
            .populate('batchQuiz');
        res.status(200).json({ success: true, data: batches, message: 'Batch deleted successfully' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Toggle enable/disable a Batch by ID
// Toggle enable/disable a Batch by ID
exports.toggleBatchStatus = async (req, res) => {
    try {
        const batch = await Batch.findById(req.body.batchId).populate('batchTeacher').populate('batchStudent');

        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }

        // Toggle the isEnable status
        const newIsEnableStatus = !batch.isEnable;

        // Update the batch's isEnable status
        await Batch.findByIdAndUpdate(
            req.body.batchId,
            { isEnable: newIsEnableStatus },
            { new: true } // Return the updated document
        );

        // Update the isEnable field for the batch teachers (all teachers)
        const updateStatus = newIsEnableStatus ? true : false;

        // Update each teacher's isEnable field
        if (batch.batchTeacher && batch.batchTeacher.length > 0) {
            const teacherIds = batch.batchTeacher.map(teacher => teacher._id);
            await UserModel.updateMany(
                { _id: { $in: teacherIds } },
                { isEnable: updateStatus }
            );
        }

        // Update the isEnable field for the batch students
        if (batch.batchStudent && batch.batchStudent.length > 0) {
            const studentIds = batch.batchStudent.map(student => student._id);
            await UserModel.updateMany(
                { _id: { $in: studentIds } },
                { isEnable: updateStatus }
            );
        }

        // Re-populate references
        const batches = await Batch.find()
            .populate('batchTeacher')
            .populate('batchStudent')
            .populate('batchQuiz');

        res.status(200).json({ success: true, data: batches });

    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
