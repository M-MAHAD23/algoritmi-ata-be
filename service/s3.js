const AWS = require("aws-sdk");
const { AWS_S3_ACCESS_KEY, AWS_S3_SECRET_ACCESS_KEY, AWS_S3_REGION, AWS_S3_BUCKET_NAME } = require("../config/env");

// Setup AWS S3
const s3 = new AWS.S3({
    accessKeyId: AWS_S3_ACCESS_KEY,
    secretAccessKey: AWS_S3_SECRET_ACCESS_KEY,
    region: AWS_S3_REGION,
});

// Function to upload the file to S3
exports.uploadFileToS3 = async (folderName, fileName, fileBuffer, file) => {
    const params = {
        Bucket: AWS_S3_BUCKET_NAME, // Your S3 bucket name
        Key: `${folderName}/${fileName}`, // Folder and file name in S3
        Body: fileBuffer, // The file's buffer data
        ContentType: file.mimetype, // MIME type of the file
    };
    return s3.upload(params).promise(); // Return the promise from S3 upload
};