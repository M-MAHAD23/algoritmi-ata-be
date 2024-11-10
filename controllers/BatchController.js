// controllers/batchController.js
const { Batch } = require('../model/BatchModel'); // Adjust the path as needed

// Create a new Batch
exports.createBatch = async (req, res) => {
    try {
        const batch = new Batch(req.body);
        await batch.save();
        // Populate references before sending the response
        await batch.populate('teacher').populate('student').populate('assignment').execPopulate();
        res.status(201).json({ success: true, data: batch });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Get all Batches
exports.getAllBatches = async (req, res) => {
    try {
        const batches = await Batch.find()
            .populate('teacher')
            .populate('student')
            .populate('assignment');
        res.status(200).json({ success: true, data: batches });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Get a single Batch by ID
exports.getBatchById = async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id)
            .populate('teacher')
            .populate('student')
            .populate('assignment');
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
        const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
            .populate('teacher')
            .populate('student')
            .populate('assignment');
        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }
        res.status(200).json({ success: true, data: batch });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Delete a Batch by ID
exports.deleteBatch = async (req, res) => {
    try {
        const batch = await Batch.findByIdAndDelete(req.params.id);
        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }
        res.status(200).json({ success: true, data: null, message: 'Batch deleted successfully' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Toggle enable/disable a Batch by ID
exports.toggleBatchStatus = async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id);
        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }

        // Toggle the isEnable status
        const updatedBatch = await Batch.findByIdAndUpdate(
            req.params.id,
            { isEnable: !batch.isEnable }, // Toggle the isEnable field
            { new: true } // Return the updated document
        ).populate('teacher').populate('student').populate('assignment'); // Populate references

        res.status(200).json({ success: true, data: updatedBatch });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
