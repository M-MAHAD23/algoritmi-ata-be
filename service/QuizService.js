const fs = require("fs");
const path = require("path");
const AWS = require("aws-sdk");
const mongoose = require("mongoose");
const { Quiz } = require("../model/QuizModel");
const { Batch } = require("../model/BatchModel");
const { QuizHint } = require("../model/QuizHintModel");
const { QuizSubmitter } = require("../model/QuizSubmitterModel");
const { AWS_S3_ACCESS_KEY, AWS_S3_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET_NAME, OPEN_AI_URL, OPEN_AI_KEY } = require("../config/env");

// Setup AWS S3
const s3 = new AWS.S3({
    accessKeyId: AWS_S3_ACCESS_KEY,
    secretAccessKey: AWS_S3_SECRET_ACCESS_KEY,
    region: AWS_REGION,
});

// Service For Folder Contnet Fetch from S3
const fetchFilesFromS3Folder = async (quizId, currentFileUrl) => {
    try {
        const folderPath = `ata/${quizId}/`;
        const currentFileKey = currentFileUrl.split(`${process.env.AWS_S3_BUCKET_NAME}/`)[1];

        // List all objects in the folder
        const listParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Prefix: folderPath,
        };

        const listedObjects = await s3.listObjectsV2(listParams).promise();

        // Filter and fetch content of all files with ContentType 'text/plain', excluding the current file
        const fileContents = await Promise.all(
            listedObjects.Contents
                .filter((file) => file.Key !== currentFileKey)
                .map(async (file) => {
                    // Get metadata to check ContentType
                    const headParams = {
                        Bucket: process.env.AWS_S3_BUCKET_NAME,
                        Key: file.Key,
                    };
                    const fileMetadata = await s3.headObject(headParams).promise();

                    // Only fetch content if ContentType is 'text/plain'
                    if (fileMetadata.ContentType === 'text/plain') {
                        const getParams = {
                            Bucket: process.env.AWS_S3_BUCKET_NAME,
                            Key: file.Key,
                        };
                        const fileData = await s3.getObject(getParams).promise();
                        return {
                            key: file.Key,
                            content: fileData.Body.toString("utf-8"), // File content as string
                        };
                    }
                    return null; // Skip files that don't match 'text/plain'
                })
        );

        // Remove any null entries from the results
        const validFileContents = fileContents.filter((file) => file !== null);
        return validFileContents; // Array of { key, content } objects for 'text/plain' files only
    } catch (error) {
        console.error("Error fetching files from S3:", error.message);
        throw error;
    }
};

// Service For File Contnet Fetch from S3
const fetchFileFromS3 = async (s3Url) => {
    try {
        // Extract the key from the s3Url
        const bucketName = process.env.AWS_S3_BUCKET_NAME;
        const fileKey = s3Url.split(`${bucketName}/`)[1]; // Extracts key after the bucket name

        // Define parameters for fetching the file from S3
        const getParams = {
            Bucket: bucketName,
            Key: fileKey,
        };

        // Fetch the file content from S3
        const fileData = await s3.getObject(getParams).promise();
        const fileContent = fileData.Body.toString('utf-8'); // Convert file data to a string

        const fileContentObject = {
            key: fileKey,
            content: fileContent,
        }; // Return the file content as a string

        return fileContentObject
    } catch (error) {
        console.error("Error fetching file from S3:", error.message);
        throw error;
    }
};

// Sample similarity function (using a basic approach; for more accuracy, consider libraries like 'string-similarity')
// const calculateTextSimilarity = (text1, text2) => {
//     const words1 = text1.split(/\s+/);
//     const words2 = text2.split(/\s+/);

//     // Create a set for unique words in both texts
//     const uniqueWords = new Set([...words1, ...words2]);

//     // Count matches
//     let matchCount = 0;
//     uniqueWords.forEach((word) => {
//         if (words1.includes(word) && words2.includes(word)) {
//             matchCount++;
//         }
//     });

//     // Calculate similarity percentage
//     const similarity = (2 * matchCount) / (words1.length + words2.length);
//     return (similarity * 100).toFixed(2); // Returns similarity percentage
// };

// Function to compare newFileContent against existingFileContents
// const compareNewFileWithExisting = (newFileContent, existingFileContents) => {
//     const similarityResults = existingFileContents.map(existingFile => {
//         const similarity = calculateTextSimilarity(newFileContent.content, existingFile.content);
//         return {
//             existingFileKey: existingFile.key,
//             similarityPercentage: similarity,
//         };
//     });

//     return similarityResults[0]?.similarityPercentage || 0; // Array of similarity percentages for each existing file
// };

const calculateTextSimilarity = async (newFileContent, existingFileContents) => {
    const results = [];

    for (const file of existingFileContents) {
        const studentId = file.key.split('/').pop();

        const prompt = `
        You are a programming expert. Compare the following code snippets based purely on textual similarity, focusing on the exact words, structure, and phrasing, rather than their functionality or logic.

        Code 1 (newFileContent):
        ${newFileContent.content}

        Code 2 (existingFileContent from student ${studentId}):
        ${file.content}

        Only provide the percentage of textual similarity (0% to 100%), with no extra text or anything else.
        `;

        try {
            const response = await fetch(OPEN_AI_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${OPEN_AI_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "user", content: prompt }
                    ],
                    temperature: 0,
                    max_tokens: 50,
                    top_p: 1,
                    frequency_penalty: 0,
                    presence_penalty: 0
                })
            });

            const data = await response.json();
            const similarityPercentage = parseFloat(data.choices[0].message.content.trim().replace('%', ''));

            results.push({
                studentId,
                percentage: similarityPercentage
            });

        } catch (error) {
            console.error(`Error comparing text similarity with student ${studentId}:`, error.message);
            results.push({
                studentId,
                percentage: null,
                error: error.message
            });
        }
    }

    return results;
};

const calculateSyntaxSimilarity = async (newFileContent, existingFileContents) => {
    const results = [];

    for (const file of existingFileContents) {
        const studentId = file.key.split('/').pop();

        const prompt = `
        You are a programming expert. Compare the syntax structure of the following code snippets, focusing on code constructs, patterns, and general structure rather than the specific words or functionality.

        Code 1 (newFileContent):
        ${newFileContent.content}

        Code 2 (existingFileContent from student ${studentId}):
        ${file.content}

        Only provide the percentage of syntax similarity (0% to 100%), with no extra text or anything else.
        `;

        try {
            const response = await fetch(OPEN_AI_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${OPEN_AI_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "user", content: prompt }
                    ],
                    temperature: 0,
                    max_tokens: 50,
                    top_p: 1,
                    frequency_penalty: 0,
                    presence_penalty: 0
                })
            });

            const data = await response.json();
            const similarityPercentage = parseFloat(data.choices[0].message.content.trim().replace('%', ''));

            results.push({
                studentId,
                percentage: similarityPercentage
            });

        } catch (error) {
            console.error(`Error comparing syntax similarity with student ${studentId}:`, error.message);
            results.push({
                studentId,
                percentage: null,
                error: error.message
            });
        }
    }

    return results;
};


// Function to compare newFileContent against existingFileContents w.r.t logic
// const calculateLogicSimilarity = async (newFileContent, existingFileContents) => {

//     // Extract the content strings from the existingFileContents array
//     const existingContents = existingFileContents.map(file => file.content);

//     const prompt = `
//     You are a programming expert. Please compare the following two code snippets and provide a percentage indicating how similar the logic of the code is between the newFileContent and the existingFileContents.

//     Code 1:
//     newFileContent: ${newFileContent.content}

//     Code 2:
//     existingFileContents: ${existingContents}

//     Please provide only the percentage of logic similarity between these two code snippets (0% to 100%), no extra text or anything just percentage.
//     `;

//     try {
//         const response = await fetch(OPEN_AI_URL, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 Authorization: `Bearer ${OPEN_AI_KEY}`
//             },
//             body: JSON.stringify({
//                 model: "gpt-4o-mini",
//                 // model: "gpt-3.5-turbo-1106",
//                 messages: [
//                     { role: "system", content: [{ text: prompt, type: "text" }] },
//                 ],
//                 temperature: 0,
//                 max_tokens: 2048,
//                 top_p: 1,
//                 frequency_penalty: 0,
//                 presence_penalty: 0
//             })
//         });

//         const data = await response.json();

//         // const similarityPercentage = Number(data.choices[0].message.content.trim().replace('%', '').trim());
//         return data.choices[0].message.content.trim().replace('%', '').trim();

//     } catch (error) {
//         console.error("Error comparing logic:", error.message);
//         throw error;
//     }
// };

// Function to compare newFileContent against each entry in existingFileContents
const calculateLogicSimilarity = async (newFileContent, existingFileContents) => {
    const results = [];

    for (const file of existingFileContents) {
        // Extract the submitter ID from the last part of the key
        const studentId = file.key.split('/').pop();

        const prompt = `
        You are a programming expert. Compare the logic in the following code snippets and provide a percentage indicating their similarity.

        Code 1 (newFileContent):
        ${newFileContent.content}

        Code 2 (existingFileContent from student ${studentId}):
        ${file.content}

        Only provide the percentage of logic similarity (0% to 100%), with no extra text or anything else.
        `;

        try {
            const response = await fetch(OPEN_AI_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${OPEN_AI_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "user", content: prompt }
                    ],
                    temperature: 0,
                    max_tokens: 50,
                    top_p: 1,
                    frequency_penalty: 0,
                    presence_penalty: 0
                })
            });

            const data = await response.json();
            const similarityPercentage = parseFloat(data.choices[0].message.content.trim().replace('%', ''));

            results.push({
                studentId,
                percentage: similarityPercentage
            });

        } catch (error) {
            console.error(`Error comparing logic with student ${studentId}:`, error.message);
            results.push({
                studentId,
                percentage: null, // Indicate an error occurred for this comparison
                error: error.message
            });
        }
    }

    return results;
};

const checkCodeIntegrity = async (newFileContent) => {
    const prompt = `
    You are a programming instructor. Please analyze the following student-submitted code and provide feedback on its quality, completeness, and whether it seems like a genuine attempt. Determine if:
    - The code is empty or mostly whitespace.
    - It seems incomplete or overly simplified.
    - It lacks an executable structure (e.g., missing a main function or essential logic).
    - It contains any "tricks" or signs of low effort, such as placeholder comments, only imports, or only comments.

    Please evaluate the submission's overall quality and ethics, indicating if it seems the student tried to bypass proper submission standards. Give a response in plain language, explaining any issues with the code not more than 2 lines.

    Submitted Code:
    ${newFileContent.content}
    `;

    try {
        const response = await fetch(OPEN_AI_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPEN_AI_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "user", content: prompt }
                ],
                temperature: 0,
                max_tokens: 150,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0
            })
        });

        const data = await response.json();
        const feedback = data.choices[0].message.content.trim();

        return feedback;

    } catch (error) {
        console.error("Error analyzing code integrity:", error.message);
        return {
            status: "error",
            message: "There was an error analyzing the code. Please try again.",
            error: error.message
        };
    }
};

// Post Submission Tasks
const postSubmissionTasks = async (submissionData) => {
    const { batchId, submitterId, quizId, s3Url, submitDate, _id } = submissionData;
    try {

        // Fetch all existing file contents for the quiz
        const existingFileContents = await fetchFilesFromS3Folder(quizId, s3Url);

        // Fetch the content of the new file
        const newFileContent = await fetchFileFromS3(s3Url);

        // 1. Text Similarity Check
        const textMatched = await calculateTextSimilarity(newFileContent, existingFileContents);

        // 2. Syntax Similarity Check
        const syntaxMatched = await calculateSyntaxSimilarity(newFileContent, existingFileContents);

        // 3. Logic Similarity Check
        const logicMatched = await calculateLogicSimilarity(newFileContent, existingFileContents);

        // 4. Ethics
        const ethics = await checkCodeIntegrity(newFileContent);


        // 5. Copied from AI Check
        // const copiedFromAI = await checkForAICopy(newFileContent);

        // // Update the submission with plagiarism results
        await QuizSubmitter.updateOne(
            { _id: submissionData._id },
            { $set: { textMatched, syntaxMatched, logicMatched, ethics } }
        );

        console.log("Post submission performed successfully.");
    } catch (error) {
        await QuizSubmitter.findByIdAndDelete(_id);
        console.error("Error performing post-submission tasks:", error.message);
        throw error;
    }
};

// Post Submission Student Quiz Analysis
const analyzeStudentQuiz = async (submissionData) => {
    const { quizId, s3Url, id } = submissionData;
    try {

        // Fetch all existing file contents for the quiz
        const existingFileContents = await fetchFilesFromS3Folder(quizId, s3Url);

        // Fetch the content of the new file
        const newFileContent = await fetchFileFromS3(s3Url);

        // 1. Text Similarity Check
        const textMatched = await calculateTextSimilarity(newFileContent, existingFileContents);

        // 2. Syntax Similarity Check
        const syntaxMatched = await calculateSyntaxSimilarity(newFileContent, existingFileContents);

        // 3. Logic Similarity Check
        const logicMatched = await calculateLogicSimilarity(newFileContent, existingFileContents);

        // 4. Ethics
        const ethics = await checkCodeIntegrity(newFileContent);


        // 5. Copied from AI Check
        // const copiedFromAI = await checkForAICopy(newFileContent);

        // // Update the submission with plagiarism results
        await QuizSubmitter.updateOne(
            { _id: id },
            { $set: { textMatched, syntaxMatched, logicMatched, ethics, analyzed: true } }
        );

        return "true";
    } catch (error) {
        console.error("Error performing post-submission tasks:", error.message);
        throw error;
    }
};

module.exports = {
    fetchFilesFromS3Folder,
    fetchFileFromS3,
    calculateTextSimilarity,
    calculateSyntaxSimilarity,
    calculateLogicSimilarity,
    postSubmissionTasks,
    analyzeStudentQuiz,
}