const User = require('../model/UserModel')

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

// Get a single user by ID
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
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
        const { id } = req.params;
        const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
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