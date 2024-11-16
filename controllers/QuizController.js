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
const { Notification } = require("../model/NotificationModel");

// Setup AWS S3
const s3 = new AWS.S3({
    accessKeyId: AWS_S3_ACCESS_KEY,
    secretAccessKey: AWS_S3_SECRET_ACCESS_KEY,
    region: AWS_REGION,
});

// Create a new quiz
exports.createQuiz = async (req, res) => {
    try {

        const body = {
            "batchId": "ObjectId",
            "quizzerId": "ObjectId",
            "quizName": "String",
            "quizDescription": "String",
            "quizIssued": "String",
            "quizDead": "String",
        }

        // Check if all required fields are provided
        if (!req.body.batchId || !req.body.quizzerId || !req.body.quizName || !req.body.quizDescription || !req.body.quizIssued || !req.body.quizDead) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Need Students array thats why batch is used
        const batch = await Batch.findOne(
            {
                _id: req.body.batchId
            }
        );

        const newQuiz = new Quiz({ ...req.body, quizNonSubmitters: batch?.batchStudent });
        await newQuiz.save();

        const quizes = await Quiz.find({
            batchId: req.body.batchId,
            isActive: true
        })
            .populate([
                { path: 'quizNonSubmitters' },
                { path: 'quizHint' },
                { path: 'quizSubmitters.studentId' },
                {
                    path: 'quizSubmitters.submissionId',
                    populate: [
                        { path: 'textMatched.studentId' },
                        { path: 'syntaxMatched.studentId' },
                        { path: 'logicMatched.studentId' }
                    ]
                }
            ]);

        return res.status(201).json({ message: "Quiz created successfully", data: quizes });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error" });
    }
};

// Get all quizzes
exports.getAllQuizzes = async (req, res) => {
    try {
        const quizes = await Quiz.find({
            isActive: true
        })
            .populate([
                { path: 'quizNonSubmitters' },
                { path: 'quizHint' },
                { path: 'quizSubmitters.studentId' },
                {
                    path: 'quizSubmitters.submissionId',
                    populate: [
                        { path: 'textMatched.studentId' },
                        { path: 'syntaxMatched.studentId' },
                        { path: 'logicMatched.studentId' }
                    ]
                }
            ]);

        return res.status(200).json({ message: "Quiz found successfully", data: quizes });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error" });
    }
};

// Get all quizzes
exports.getAllQuizzesByBatchId = async (req, res) => {
    try {
        const quizes = await Quiz.find({
            batchId: req.body.batchId,
            isActive: true
        })
            .populate([
                { path: 'quizNonSubmitters' },
                { path: 'quizHint' },
                { path: 'quizSubmitters.studentId' },
                {
                    path: 'quizSubmitters.submissionId',
                    populate: [
                        { path: 'textMatched.studentId' },
                        { path: 'syntaxMatched.studentId' },
                        { path: 'logicMatched.studentId' }
                    ]
                }
            ]);

        return res.status(200).json({ message: "Quiz found successfully", data: quizes });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error" });
    }
};

// Get a single quiz by ID
exports.getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.body.id)
            .populate([
                { path: 'quizNonSubmitters' },
                { path: 'quizHint' },
                { path: 'quizSubmitters.studentId' },
                {
                    path: 'quizSubmitters.submissionId',
                    populate: [
                        { path: 'textMatched.studentId' },
                        { path: 'syntaxMatched.studentId' },
                        { path: 'logicMatched.studentId' }
                    ]
                }
            ]);

        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        return res.status(200).json({ message: "Quiz found successfully", data: quiz });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error" });
    }
};

// Update a quiz by ID
exports.updateQuiz = async (req, res) => {
    try {
        const { id, ...updateQuiz } = req.body;
        const quiz = await Quiz.findByIdAndUpdate(id, updateQuiz, { new: true });

        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        const quizes = await Quiz.find({
            batchId: req.body.batchId,
            isActive: true
        })
            .populate([
                { path: 'quizNonSubmitters' },
                { path: 'quizHint' },
                { path: 'quizSubmitters.studentId' },
                {
                    path: 'quizSubmitters.submissionId',
                    populate: [
                        { path: 'textMatched.studentId' },
                        { path: 'syntaxMatched.studentId' },
                        { path: 'logicMatched.studentId' }
                    ]
                }
            ]);

        return res.status(200).json({ message: "Quiz found successfully", data: quizes });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error" });
    }
};

// Soft delete a quiz
exports.deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findByIdAndUpdate(req.body.id, { isActive: false, deletedAt: new Date().toISOString() }, { new: true });

        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        const quizes = await Quiz.find({
            batchId: req.body.batchId,
            isActive: true
        })
            .populate([
                { path: 'quizNonSubmitters' },
                { path: 'quizHint' },
                { path: 'quizSubmitters.studentId' },
                {
                    path: 'quizSubmitters.submissionId',
                    populate: [
                        { path: 'textMatched.studentId' },
                        { path: 'syntaxMatched.studentId' },
                        { path: 'logicMatched.studentId' }
                    ]
                }
            ]);

        return res.status(200).json({ message: "Quiz found successfully", data: quizes });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error" });
    }
};

// Soft submitQuiz a quiz
exports.submitQuiz = async (req, res) => {
    try {
        const { batchId, submitterId, quizId, submitDate } = req.body;

        const quizAlreadySubmitted = await QuizSubmitter.findOne(
            {
                submitterId: submitterId,
                quizId: quizId,
            }
        );

        if (quizAlreadySubmitted) return res.status(409).json({ message: "Quiz already submitted.", data: null });

        let s3Url = '';

        // Handle file upload
        if (req.files && req.files.length > 0) {
            const file = req.files[0]; // Only one file expected
            const folderName = `ata/${quizId}`; // Folder path on S3
            const fileName = `${submitterId}`; // Using timestamp for unique name
            const filePath = path.isAbsolute(file.path) ? file.path : path.join(__dirname, "../assets/uploads/images", path.basename(file.path));

            // Upload file to S3
            s3Url = await new Promise((resolve, reject) => {
                s3.upload(
                    {
                        Bucket: process.env.AWS_S3_BUCKET_NAME,
                        Key: `${folderName}/${fileName}`,
                        Body: fs.createReadStream(filePath),
                        ContentType: 'text/plain',
                    },
                    (err, data) => {
                        fs.unlinkSync(filePath); // Delete the local file after upload
                        if (err) return reject(err);
                        resolve(data.Location); // S3 file URL
                    }
                );
            });
        }

        // Create QuizSubmitter document
        const newQuizSubmitter = new QuizSubmitter({
            batchId,
            submitterId,
            quizId,
            s3Url,
            submitDate,
        });
        await newQuizSubmitter.save();

        await Quiz.updateOne(
            { _id: quizId },
            {
                $addToSet: {
                    quizSubmitters: {
                        studentId: submitterId,
                        submissionId: newQuizSubmitter._id,
                    }
                }
            }
        );

        await Quiz.updateOne(
            { _id: quizId },
            { $pull: { quizNonSubmitters: submitterId } }
        );

        res.status(201).json({ message: 'Quiz submitted successfully', newQuizSubmitter });
        // Call function after response
        // await postSubmissionTasks(newQuizSubmitter);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Create Quiz Hint
exports.createQuizHint = async (req, res) => {
    try {
        const { batchId, quizId, description, hintType } = req.body;
        let s3Url = ""; // To store the S3 URL of the uploaded file

        // Handle single file upload (assuming only one file will be uploaded at index[0])
        if (req.files && req.files[0]) {
            const file = req.files[0];
            const folderName = quizId.toString(); // Folder named after quizId
            const fileName = path.basename(file.path);; // Using timestamp for unique name
            const filePath = path.isAbsolute(file.path) ? file.path : path.join(__dirname, "../assets/uploads/images", path.basename(file.path)); // Path of the temporary file

            // Upload the file to S3
            const fileUploadResult = await new Promise((resolve, reject) => {
                s3.upload(
                    {
                        Bucket: AWS_S3_BUCKET_NAME,
                        Key: `ata/${folderName}/${fileName}`, // Uploading file under the quizId folder
                        Body: fs.createReadStream(filePath),
                        ContentType: file.mimetype,
                    },
                    (err, data) => {
                        fs.unlinkSync(filePath); // Remove temp file after upload
                        if (err) return reject(err);
                        resolve(data.Location); // S3 URL of the file
                    }
                );
            });

            // Set the S3 URL after successful upload
            s3Url = fileUploadResult;
        }

        // Create the QuizHint object with the uploaded file URL (if any)
        const newQuizHint = new QuizHint({
            batchId,
            quizId,
            description,
            hintType,
            s3Url, // Storing the S3 URL of the file
        });

        // Save the new QuizHint to the database
        await newQuizHint.save();

        // Update Quiz with the new QuizHint, ensuring no duplicates using $addToSet
        await Quiz.updateOne(
            { _id: quizId }, // Find the Quiz by quizId
            { $addToSet: { quizHint: newQuizHint._id } } // Add the QuizHint ID to the quizHints array if it doesn't already exist
        );

        // Respond with the newly created QuizHint
        res.status(201).json(newQuizHint);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating quiz hint." });
    }
};

// Get Quiz Hint by ID
exports.getQuizHint = async (req, res) => {
    try {
        const quizHint = await QuizHint.findById(req.params.id);
        if (!quizHint) {
            return res.status(404).json({ message: "Quiz hint not found." });
        }
        res.status(200).json(quizHint);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching quiz hint." });
    }
};

// Update Quiz Hint
exports.updateQuizHint = async (req, res) => {
    try {
        const { quizHintId, description, hintType } = req.body;
        let s3Url = ""; // New s3Url to update

        // Find the existing QuizHint by ID
        const quizHint = await QuizHint.findById(quizHintId);
        if (!quizHint) {
            return res.status(404).json({ message: "Quiz hint not found." });
        }

        // Handle file upload if a new file is provided
        if (req.files && req.files[0]) {
            const file = req.files[0];
            const folderName = quizHint.quizId.toString(); // Folder named after quizId
            const fileName = path.basename(file.path); // Using timestamp for unique name
            const filePath = path.isAbsolute(file.path) ? file.path : path.join(__dirname, "../assets/uploads/images", path.basename(file.path)); // Path of the temporary file

            // Delete the old file from S3 if it exists
            if (quizHint.s3Url) {
                const oldFileName = quizHint.s3Url.split("/").pop(); // Get the file name from the URL
                const deleteParams = {
                    Bucket: AWS_S3_BUCKET_NAME,
                    Key: `ata/${folderName}/${oldFileName}`, // Delete file in the same folder
                };
                await s3.deleteObject(deleteParams).promise(); // Remove the old file from S3
            }

            // Upload the new file to S3
            const fileUploadResult = await new Promise((resolve, reject) => {
                s3.upload(
                    {
                        Bucket: AWS_S3_BUCKET_NAME,
                        Key: `ata/${folderName}/${fileName}`, // Upload file under the quizId folder
                        Body: fs.createReadStream(filePath),
                        ContentType: file.mimetype,
                    },
                    (err, data) => {
                        fs.unlinkSync(filePath); // Remove temp file after upload
                        if (err) return reject(err);
                        resolve(data.Location); // S3 URL of the file
                    }
                );
            });

            // Set the new S3 URL after successful upload
            s3Url = fileUploadResult;
        } else {
            // If no new file is uploaded, retain the old s3Url
            s3Url = quizHint.s3Url;
        }

        // Update the QuizHint with the new details
        quizHint.description = description || quizHint.description;
        quizHint.hintType = hintType || quizHint.hintType;
        quizHint.s3Url = s3Url; // Update the s3Url (new or old)

        // Save the updated QuizHint
        await quizHint.save();

        // Respond with the updated QuizHint
        res.status(200).json(quizHint);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating quiz hint." });
    }
};

// Delete Quiz Hint
exports.deleteQuizHint = async (req, res) => {
    try {
        const quizHint = await QuizHint.findById(req.body.id);
        if (!quizHint) {
            return res.status(404).json({ message: "Quiz hint not found." });
        }

        // Delete the old file from S3 if it exists
        if (quizHint.s3Url) {
            const oldFileName = quizHint.s3Url.split("/").pop(); // Get the file name from the URL
            const deleteParams = {
                Bucket: AWS_S3_BUCKET_NAME,
                Key: `ata/${folderName}/${oldFileName}`, // Delete file in the same folder
            };
            await s3.deleteObject(deleteParams).promise(); // Remove the old file from S3
        }

        await Quiz.updateOne(
            { _id: quizHint.quizId },
            { $pull: { quizHint: req.body.id } }
        );

        await QuizHint.findByIdAndDelete(req.body.id);

        // Delete quiz hint
        await quizHint.deleteOne();
        res.status(200).json({ message: "Quiz hint deleted successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting quiz hint." });
    }
};

// Post Submission Student Quiz Analysis
exports.analyzeQuiz = async (req, res) => {
    try {
        const { batchId, quizId, s3Url, id } = req.body;

        const submissionData = {
            quizId: quizId,
            s3Url: s3Url,
            id: id
        }

        const quizSubmitter = await QuizSubmitter.findOne(
            {
                _id: id
            }
        );

        const analyzeQuiz = await analyzeStudentQuiz(submissionData);
        if (analyzeQuiz !== "true") res.status(400).json({ message: "Could not analyze the submitted quiz.", data: null });

        console.log("Post submission student quiz analysis performed successfully.");

        const quizes = await Quiz.find({
            batchId: batchId,
            isActive: true
        })
            .populate([
                { path: 'quizNonSubmitters' },
                { path: 'quizHint' },
                { path: 'quizSubmitters.studentId' },
                {
                    path: 'quizSubmitters.submissionId',
                    populate: [
                        { path: 'textMatched.studentId' },
                        { path: 'syntaxMatched.studentId' },
                        { path: 'logicMatched.studentId' }
                    ]
                }
            ]);

        const newNotification = new Notification({
            batchId,
            userId: quizSubmitter.submitterId,
            quizId,
            message: "Your quiz analyzed.",
        });

        await newNotification.save();

        res.status(200).json({ message: "Submission analyzed successfully.", data: quizes });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Error Analyzing quiz." });
    }
}

// Student
exports.getAllQuizzesByBatchIdStudent = async (req, res) => {
    try {
        // Fetch all submissions for the batch and student
        const submissions = await QuizSubmitter.find({
            batchId: req.body.batchId,
            submitterId: req.body.studentId, // Assuming studentId is passed in the request body
            isActive: true
        }).select("quizId analyzed"); // Fetch quizId and analyzed to optimize the query

        // Map quiz IDs to their analyzed status
        const submittedQuizMap = submissions.reduce((map, submission) => {
            map[submission.quizId.toString()] = { analyzed: submission.analyzed };
            return map;
        }, {});

        // Fetch all quizzes for the batch
        const quizzes = await Quiz.find({
            batchId: req.body.batchId,
            isActive: true
        })
            .populate([
                { path: "quizNonSubmitters" },
                { path: "quizHint" },
                { path: "quizSubmitters.studentId" },
                {
                    path: "quizSubmitters.submissionId",
                    populate: [
                        { path: "textMatched.studentId" },
                        { path: "syntaxMatched.studentId" },
                        { path: "logicMatched.studentId" }
                    ]
                }
            ]);

        // Get the current date
        const currentDate = new Date();

        // Categorize quizzes
        const newQuizzes = quizzes.filter(
            quiz => new Date(quiz.quizDead) > currentDate && !submittedQuizMap[quiz._id.toString()]
        );
        const lateQuizzes = quizzes.filter(
            quiz => new Date(quiz.quizDead) <= currentDate && !submittedQuizMap[quiz._id.toString()]
        );
        const submittedQuizzes = quizzes
            .filter(quiz => submittedQuizMap[quiz._id.toString()])
            .map(quiz => ({
                ...quiz.toObject(),
                analyzed: submittedQuizMap[quiz._id.toString()].analyzed
            }));

        return res.status(200).json({
            message: "Quizzes categorized successfully",
            data: {
                newQuizzes,
                lateQuizzes,
                submittedQuizzes
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error" });
    }
};

exports.submissionDetailsStudent = async (req, res) => {
    try {
        const { quizId, submitterId } = req.body;

        const submission = await QuizSubmitter.findOne(
            {
                quizId: quizId,
                submitterId: submitterId
            }
        )
            .populate([
                { path: 'submitterId' },
                { path: 'textMatched.studentId' },
                { path: 'syntaxMatched.studentId' },
                { path: 'logicMatched.studentId' }
            ])


        return res.status(200).json({ message: "Submission Found.", data: submission })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error" });
    }
}
