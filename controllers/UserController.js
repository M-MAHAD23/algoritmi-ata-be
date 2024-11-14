const { uploadFiles } = require('../middlewares/uploadFiles')
const User = require('../model/UserModel')
const fs = require("fs");
const path = require("path");
const AWS = require("aws-sdk");
const mongoose = require("mongoose");
const { Quiz } = require("../model/QuizModel");
const { Batch } = require("../model/BatchModel");
const { QuizHint } = require("../model/QuizHintModel");
const { QuizSubmitter } = require("../model/QuizSubmitterModel");
const { AWS_S3_ACCESS_KEY, AWS_S3_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET_NAME, OPEN_AI_URL, OPEN_AI_KEY } = require("../config/env");
const { postSubmissionTasks, analyzeStudentQuiz } = require("../service/QuizService");

exports.getStudent__controller = async (req, res, next) => {
    try {
        const studentInfo = await User.find({ role: "Student" })
        return res.status(200).json({
            studentInfo
        })
    } catch (err) {
        console.log(err)
        return res.status(400).json({
            error: "Error occurred"
        })
    }
}


exports.getTeacher__controller = async (req, res, next) => {
    try {
        const teacherInfo = await User.find({ role: "Teacher" })
        return res.status(200).json({
            teacherInfo
        })
    } catch (err) {
        console.log(err)
        return res.status(400).json({
            error: "Error occurred"
        })
    }
}


exports.deleteTeacher__controller = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const user = await User.findOneAndDelete({ _id: userId });
        return res.status(200).json({
            user,
        });
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            error: "Something went wrong",
        });
    }
};

// Create a new user
exports.createUser = async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ success: true, data: newUser });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().populate('batchId');
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get all Teacher
exports.getAllTeachers = async (req, res) => {
    try {
        const users = await User.find({ role: "Teacher" }).populate('batchId');
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get all Students
exports.getAllStudents = async (req, res) => {
    try {
        const users = await User.find({ role: "Student" }).populate('batchId');
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get a single user by ID
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.body;
        const user = await User.findById(id).populate('batchId');
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Update a user by ID
exports.updateUser = async (req, res) => {
    try {
        const { id, ...updatedUser } = req.body;
        const user = await User.findById(id);
        let s3Url = user.image;

        // Handle file upload
        if (req.files && req.files.length > 0) {
            const file = req.files[0]; // Only one file expected
            const folderName = `ata/profiles`; // Folder path on S3
            const fileName = path.basename(file.path); // Using timestamp for unique name
            const filePath = path.isAbsolute(file.path) ? file.path : path.join(__dirname, "../assets/uploads/images", path.basename(file.path));

            // Upload file to S3
            s3Url = await new Promise((resolve, reject) => {
                s3.upload(
                    {
                        Bucket: AWS_S3_BUCKET_NAME,
                        Key: `${folderName}/${fileName}`,
                        Body: fs.createReadStream(filePath),
                        ContentType: file.mimetype,
                    },
                    (err, data) => {
                        fs.unlinkSync(filePath); // Delete the local file after upload
                        if (err) return reject(err);
                        resolve(data.Location); // S3 file URL
                    }
                );
            });
        }

        // Update the user in the database with the new data (including file URL if uploaded)
        const updatedProfile = await User.findByIdAndUpdate(id, { ...updatedUser, image: s3Url }, { new: true });
        if (!updatedProfile) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.status(200).json({ success: true, data: updatedProfile });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ success: false, error: error.message });
    }
};

// Delete (soft delete) a user by ID
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndUpdate(
            id,
            { deletedAt: new Date().toISOString(), isActive: false },
            { new: true }
        );
        if (!deletedUser) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.status(200).json({ success: true, data: deletedUser });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};