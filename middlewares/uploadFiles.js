const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Define the maximum file size (in bytes) - for example, 1MB
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 1MB

// Define the path to the uploads folder
const uploadFolder = "assets/uploads/images/";

// Create the uploads folder if it doesn't exist
if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
}

// Define storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadFolder);
    },
    filename: function (req, file, cb) {
        const isoDateString = new Date().toISOString().replace(/[:.-]/g, '');
        cb(null, `${isoDateString}`);
    },
});

// File filter to validate file size and type
const fileFilter = (req, file, cb) => {
    // Add pdf and word document types to the allowed types regex
    const allowedTypes = /jpeg|gif|jpg|png|webp|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Only images, PDFs, and Word documents are allowed'), false); // Reject the file
    }
};

// Initialize multer with the storage and file filter options
const upload = multer({
    storage: storage,
    limits: { fileSize: MAX_FILE_SIZE }, // Limit each file to 1MB
    fileFilter: fileFilter,
});

// Middleware function to handle multiple files upload with error handling
const uploadFiles = (req, res, next) => {
    // Accept multiple files with the field name 'files'
    upload.fields([{ name: 'files', maxCount: 10 }])(req, res, (error) => {  // Adjust maxCount as needed
        if (error) {
            if (error instanceof multer.MulterError) {
                console.error('Multer error:', error);
                return res.status(400).json({ error: error.message });
            } else {
                console.error('Error:', error);
                return res.status(400).json({ error: error.message });
            }
        }
        next();
    });
};

module.exports = {
    uploadFiles,
};
