// routes/batchRoutes.js
const router = require("express").Router();
const BatchController = require('../controllers/BatchController');

// Create a new Batch
router.post('/createBatch', BatchController.createBatch);

// Get all Batches
router.post('/getAllBatches', BatchController.getAllBatches);

// Get a Batch by ID
router.post('/getBatchById', BatchController.getBatchById);

// Update a Batch by ID
router.post('/updateBatch', BatchController.updateBatch);

// Delete a Batch by ID
router.post('/deleteBatch', BatchController.deleteBatch);

// Toggle enable/disable a Batch
router.post('/toggle/toggleBatchStatus', BatchController.toggleBatchStatus);

module.exports = router;