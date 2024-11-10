const UserController = require("../controllers/UserController");
const { adminAuthentication } = require("../middlewares/authentication");
const { requireLogin } = require("../middlewares/requireLogin");

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

// Get a single user by ID
router.post('/getUserById', UserController.getUserById);

// Update a user by ID
router.post('/updateUser', UserController.updateUser);

// Delete (soft delete) a user by ID
router.post('/deleteUser', UserController.deleteUser);

module.exports = router;
