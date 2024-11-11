// controllers/batchController.js
const { Batch } = require('../model/BatchModel'); // Adjust the path as needed

// Create a new Batch
exports.createBatch = async (req, res) => {
    try {
        const batch = new Batch(req.body);
        await batch.save();

        // Populate references before sending the response
        const batches = await Batch.find()
            .populate('batchTeacher')
            .populate('batchStudent')
            .populate('batchAssignment');
        res.status(201).json({ success: true, data: batches });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Get all Batches
exports.getAllBatches = async (req, res) => {
    try {
        const batches = await Batch.find()
            .populate('batchTeacher')
            .populate('batchStudent')
            .populate('batchAssignment');
        res.status(200).json({ success: true, data: batches });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Get a single Batch by ID
exports.getBatchById = async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id);
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
            .populate('batchAssignment');
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
            .populate('batchAssignment');
        res.status(200).json({ success: true, data: batches, message: 'Batch deleted successfully' });
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
        await Batch.findByIdAndUpdate(
            req.params.id,
            { isEnable: !batch.isEnable }, // Toggle the isEnable field
            { new: true } // Return the updated document
        );

        // Populate references
        const batches = await Batch.find()
            .populate('batchTeacher')
            .populate('batchStudent')
            .populate('batchAssignment');

        res.status(200).json({ success: true, data: batches });

    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
