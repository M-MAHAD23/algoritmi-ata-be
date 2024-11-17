const mongoose = require('mongoose')


const userSchema = mongoose.Schema({
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch",
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['Admin', 'Teacher', 'Student']
    },
    image: {
        type: String,
        default: ""
    },
    name: {
        type: String,
        required: true
    },
    about: {
        type: String,
        default: ""
    },
    rollId: {
        type: String,
        required: true
    },
    cnic: {
        type: String,
        required: true
    },
    contact: {
        type: [String],
        required: true
    },
    education: {
        type: [Object],
        required: true
    },
    work: {
        type: [Object],
        default: []
    },
    social: {
        type: [Object],
        default: []
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    darkMode: {
        type: Boolean,
        default: false
    },
    isRegistered: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: String, default: null },
}, { timestamps: true })

const UserModel = mongoose.model("User", userSchema)

module.exports = UserModel