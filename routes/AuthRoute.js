const {
  login__controller,
  register__controller,
  forgotPassword,
  resetPassword,

} = require("../controllers/AuthController");
const { login_validator } = require("../middlewares/loginValidator");
const registerValidator = require("../middlewares/registerValidator");
const loginValidator = require("../middlewares/loginValidator");

const router = require("express").Router();

router.post("/signup", register__controller)

router.post("/signin", loginValidator, login_validator, login__controller)

router.post("/forgotPassword", forgotPassword)

router.post("/resetPassword", resetPassword)

module.exports = router;
