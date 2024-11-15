const UserController = require("../controllers/UserController");
const { adminAuthentication } = require("../middlewares/authentication");
const { requireLogin } = require("../middlewares/requireLogin");
const { uploadFiles } = require("../middlewares/uploadFiles");

const router = require("express").Router();

router.get(
  "/student",
  requireLogin,
  adminAuthentication,
  UserController.getStudent__controller
);

router.get(
  "/teacher",
  requireLogin,
  adminAuthentication,
  UserController.getTeacher__controller
);

router.get(
  "/delete-teacher",
  requireLogin,
  adminAuthentication,
  UserController.deleteTeacher__controller
);

// Create a new user
router.post('/createUser', UserController.createUser);

// Get all users
router.post('/getAllUsers', UserController.getAllUsers);

// Get all Teachers
router.post('/getAllTeachers', UserController.getAllTeachers);

// Get all Students
router.post('/getAllStudents', UserController.getAllStudents);

// Get a single user by ID
router.post('/getUserById', UserController.getUserById);

// Update a user by ID
router.post('/updateUser', uploadFiles, UserController.updateUser);

// Delete (soft delete) a user by ID
router.post('/deleteUser', UserController.deleteUser);

// Update a user by ID
router.post('/updateNotifications', UserController.updateNotifications);

// Delete (soft delete) a user by ID
router.post('/notifications', UserController.notifications);

module.exports = router;
