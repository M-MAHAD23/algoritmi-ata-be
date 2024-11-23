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
const { AWS_S3_ACCESS_KEY, AWS_S3_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET_NAME, OPEN_AI_URL, OPEN_AI_KEY, SECRET_KEY } = require("../config/env");
const bcrypt = require("bcrypt");
const { Notification } = require('../model/NotificationModel');
const sharp = require("sharp");
sharp.cache({ files: 0 }); // Disable file caching

// Setup AWS S3
const s3 = new AWS.S3({
    accessKeyId: AWS_S3_ACCESS_KEY,
    secretAccessKey: AWS_S3_SECRET_ACCESS_KEY,
    region: AWS_REGION,
});

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

// Create a user by ID
exports.createUser = async (req, res) => {
    try {
        // Find the user by ID
        const alreadyExist = await User.findOne({ email: req.body.email });
        if (alreadyExist) return res.status(403).json({ message: "Email Already Exists." });

        // Parse the arrays from string to actual arrays
        const parsedBody = {
            email: req.body.email,
            name: req.body.name,
            rollId: req.body.rollId,
            cnic: req.body.cnic,
            role: req.body.role,
            batchId: req.body.batchId,
            password: req.body.password,
            contact: JSON.parse(req.body.contact || "[]"),
            social: JSON.parse(req.body.social || "[]"),
            education: JSON.parse(req.body.education || "[]"),
            work: JSON.parse(req.body.work || "[]"),
        };

        // Update the user in the database
        const user = new User({ ...parsedBody, image: "" });
        await user.save();

        // S3 file URL, defaulting to the existing image URL
        let s3Url = user.image;

        // Handle file upload if a new file is provided
        if (req.files) {
            const file = req.files ? req.files['files'] : null;
            const folderName = "ata/profiles"; // S3 folder
            const fileName = `${user._id}_${Date.now()}_${path.basename(file.path)}`;
            const filePath = path.isAbsolute(file.path)
                ? file.path
                : path.join(__dirname, "../assets/uploads/images", path.basename(file.path));

            try {
                // Resize the image to 1:1 ratio and save it locally
                const resizedFilePath = `${filePath}-resized.jpg`;
                await sharp(filePath)
                    .resize(500, 500, { fit: "cover" }) // Resize to 1:1 with a fixed dimension
                    .toFile(resizedFilePath);

                // Remove the original file after resizing
                fs.unlinkSync(filePath);

                // List files in S3 folder and delete matching files
                const listParams = {
                    Bucket: AWS_S3_BUCKET_NAME,
                    Prefix: `${folderName}/${user._id}_`,
                };
                const listedObjects = await s3.listObjectsV2(listParams).promise();

                for (const file of listedObjects.Contents || []) {
                    const deleteParams = { Bucket: AWS_S3_BUCKET_NAME, Key: file.Key };
                    await s3.deleteObject(deleteParams).promise();
                    console.log(`Deleted file: ${file.Key}`);
                }

                // Upload the resized file
                s3Url = await new Promise((resolve, reject) => {
                    s3.upload(
                        {
                            Bucket: AWS_S3_BUCKET_NAME,
                            Key: `${folderName}/${fileName}`,
                            Body: fs.createReadStream(resizedFilePath),
                            ContentType: "image/jpeg", // Ensures consistent file type
                        },
                        (err, data) => {
                            fs.unlinkSync(resizedFilePath); // Delete the local resized file
                            if (err) return reject(err);
                            resolve(data.Location); // S3 file URL
                        }
                    );
                });
            } catch (error) {
                console.error("File handling error:", error);
                return res.status(500).json({ success: false, error: "File upload failed" });
            }
        }

        // Update the user in the database
        const updatedProfile = await User.findByIdAndUpdate(
            user?._id,
            { image: s3Url },
            { new: true }
        );
        if (!updatedProfile) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        if (updatedProfile?.role === "Teacher") {
            await Batch.findOneAndUpdate(
                {
                    _id: updatedProfile?.batchId,
                },
                {
                    $push: {
                        batchTeacher: updatedProfile?._id,
                    },
                }
            );
        }
        if (updatedProfile.role === "Student") {
            await Batch.findOneAndUpdate(
                {
                    _id: updatedProfile?.batchId,
                },
                {
                    $push: {
                        batchStudent: updatedProfile?._id,
                    },
                }
            );
        }

        res.status(200).json({ success: true, data: updatedProfile });
    } catch (error) {
        console.error("Error in updateUser:", error);
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
        // Find the user by ID
        const user = await User.findById(req.body.id);
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        // Parse the arrays from string to actual arrays
        const parsedBody = {
            name: req.body.name,
            password: req.body.password,
            contact: JSON.parse(req.body.contact || "[]"),
            social: JSON.parse(req.body.social || "[]"),
            education: JSON.parse(req.body.education || "[]"),
            work: JSON.parse(req.body.work || "[]"),
        };

        // S3 file URL, defaulting to the existing image URL
        let s3Url = user.image;

        // Handle file upload if a new file is provided
        if (req.files) {
            const file = req.files ? req.files['files'][0] : null; // Only one file expected
            const folderName = "ata/profiles"; // S3 folder
            const fileName = `${user._id}_${Date.now()}_${path.basename(file.path)}`;
            const filePath = path.isAbsolute(file.path)
                ? file.path
                : path.join(__dirname, "../assets/uploads/images", path.basename(file.path));

            try {
                // Resize the image to 1:1 ratio and save it locally
                const resizedFilePath = `${filePath}-resized.jpg`;
                await sharp(filePath)
                    .resize(500, 500, { fit: "cover" }) // Resize to 1:1 with a fixed dimension
                    .toFile(resizedFilePath);

                // Remove the original file after resizing
                fs.unlinkSync(filePath);

                // List files in S3 folder and delete matching files
                const listParams = {
                    Bucket: AWS_S3_BUCKET_NAME,
                    Prefix: `${folderName}/${user._id}_`,
                };
                const listedObjects = await s3.listObjectsV2(listParams).promise();

                for (const file of listedObjects.Contents || []) {
                    const deleteParams = { Bucket: AWS_S3_BUCKET_NAME, Key: file.Key };
                    await s3.deleteObject(deleteParams).promise();
                    console.log(`Deleted file: ${file.Key}`);
                }

                // Upload the resized file
                s3Url = await new Promise((resolve, reject) => {
                    s3.upload(
                        {
                            Bucket: AWS_S3_BUCKET_NAME,
                            Key: `${folderName}/${fileName}`,
                            Body: fs.createReadStream(resizedFilePath),
                            ContentType: "image/jpeg", // Ensures consistent file type
                        },
                        (err, data) => {
                            fs.unlinkSync(resizedFilePath); // Delete the local resized file
                            if (err) return reject(err);
                            resolve(data.Location); // S3 file URL
                        }
                    );
                });
            } catch (error) {
                console.error("File handling error:", error);
                return res.status(500).json({ success: false, error: "File upload failed" });
            }
        }

        // Hash the password if provided
        if (req.body.password) {
            const saltRounds = 10;
            parsedBody.password = await bcrypt.hash(req.body.password, saltRounds);
        }

        // Update the user in the database
        const updatedProfile = await User.findByIdAndUpdate(
            req.body.id,
            { ...parsedBody, image: s3Url },
            { new: true }
        );

        if (!updatedProfile) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        res.status(200).json({ success: true, data: updatedProfile });
    } catch (error) {
        console.error("Error in updateUser:", error);
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

// Delete (soft delete) a user by ID
exports.updateNotifications = async (req, res) => {
    try {
        await Notification.findOneAndUpdate({ _id: req.body.id }, { isSeen: true }).exec();
        const unseenNotifications = await Notification.find({ userId: req.body.userId, isSeen: false });
        res.status(200).json({ message: "Success", data: unseenNotifications });
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve unseen notifications" });
    }
};

// Delete (soft delete) a user by ID
exports.notifications = async (req, res) => {
    try {
        const unseenNotifications = await Notification.find({ userId: req.body.userId, isSeen: false });
        res.status(200).json({ message: "Success", data: unseenNotifications });
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve unseen notifications" });
    }
};