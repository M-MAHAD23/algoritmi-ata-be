const fs = require('fs');
const path = require('path');
const { Batch } = require('../model/BatchModel');
const { Assignment } = require('../model/AssignmentModel');

// Submit assignment
exports.submitAssignment = async (req, res) => {
    try {

        const { assignmentId, studentId } = req.body;



        res.status(200).json({ message: 'Assignment Submitted successfully', data: assignment });
    } catch (error) {
        res.status(500).json({ error: 'Error submitting assignment', details: error.message });
    }
};

// ATA Config
exports.ataConfig = async (req, res) => {
    try {
        // Define the path to ataConfig.json
        const configFilePath = path.join(__dirname, '../config/ataConfig.json');

        // Read ataConfig.json and parse it
        const ataConfig = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));

        const { reset } = req.query;

        // Check if reset is true
        if (reset === "true") {
            // Replace the 'settings' section with the 'reset' section
            ataConfig.settings = ataConfig.reset;
        } else if (req.body.settings) {
            // If reset is not true, replace settings with req.body.settings (if provided)
            ataConfig.settings = req.body.settings;
        }

        // Write the updated configuration back to ataConfig.json
        fs.writeFileSync(configFilePath, JSON.stringify(ataConfig, null, 2), 'utf8');

        res.status(200).json({ message: "ATA configured successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error creating chat", error: error.message });
    }
};
