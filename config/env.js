require("dotenv").config();

module.exports = {
    MONGO_URI: process.env.MONGO_URI,
    SECRET_KEY: process.env.SECRET_KEY,
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASSwORD: process.env.EMAIL_PASSwORD,
    AWS_S3_ACCESS_KEY: process.env.AWS_S3_ACCESS_KEY,
    AWS_S3_SECRET_ACCESS_KEY: process.env.AWS_S3_SECRET_ACCESS_KEY,
    AWS_S3_REGION: process.env.AWS_S3_REGION,
    AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
    OPEN_AI_URL: process.env.OPEN_AI_URL,
    OPEN_AI_KEY: process.env.OPEN_AI_KEY,
    AWS_SNS_ACCESS_KEY: process.env.AWS_SNS_ACCESS_KEY,
    AWS_SNS_SECRET_KEY: process.env.AWS_SNS_SECRET_KEY,
    AWS_SNS_REGION: process.env.AWS_SNS_REGION,

}
