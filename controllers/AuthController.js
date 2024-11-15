const UserModel = require("../model/UserModel");
const bcrypt = require("bcrypt");
const controllerError = require("../utils/controllerError");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config/env");
const { Batch } = require("../model/BatchModel");

// Register User
exports.register__controller = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userInfo = await UserModel.findOne({ email: email });
    const hash = await bcrypt.hash(password, 10);

    if (userInfo && !userInfo.isRegistered && userInfo.role === "Admin") {
      const userReg = await UserModel.findOneAndUpdate(
        {
          email: email
        },
        {
          name: name,
          password: hash,
          isRegistered: true,
        }
      )
      if (!userReg) return res.status(500).json({ message: `User cannot be registered.` });
      return res.status(201).json({ message: "Account registered.", data: { user: userInfo } });
    }
    if (userInfo && !userInfo.isRegistered && (userInfo.role === "Student" || userInfo.role === "Teacher")) {
      const batch = await Batch.findById(userInfo.batchId);
      if (!batch || !batch.isEnable) {
        return res.status(400).json({
          errors: "The specified batch is not enabled or does not exist."
        });
      }
      userInfo.name = name;
      userInfo.password = hash;
      isRegistered = true,
        await userInfo.save();
      return res.status(201).json({ message: "Account registered.", data: { user: userInfo } });
    }

    return res.status(404).json({ message: "No account found.", data: null });

  } catch (error) {
    console.log(`Internal Server Error: ${error.message}`);
    res.status(500).json({ message: `Internal Server Error: ${error.message}` });
  }
};

// Login User
exports.login__controller = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const userInfo = await (await UserModel.findOne({ email }));
    if (!userInfo) return res.status(404).json({ message: "No Such User", data: null });

    if (userInfo.role !== "Admin") {
      const batch = await Batch.findById(userInfo.batchId);
      if (!batch || !batch.isEnable) {
        return res.status(400).json({
          errors: "The specified batch is not enabled or does not exist."
        });
      };
    }

    if (!userInfo) {
      return res.status(401).json({
        errors: { userExist: "User not exist Please register and then login again" },
      });
    }

    // console.log(userInfo)
    bcrypt
      .compare(password, userInfo.password)
      .then((result) => {
        if (!result) {
          return res.status(401).json({
            errors: { password: "password not matched" },
          });
        }

        userInfo.password = undefined

        const token = jwt.sign({ _id: userInfo._id, name: userInfo.userName, email: userInfo.email, role: userInfo.role }, SECRET_KEY);
        return res.status(200).json({
          userInfo,
          token,
        });
      })
      .catch((err) => {
        controllerError(err, res, "Error occurred");
      });
  } catch (error) {
    console.log(`Internal Server Error: ${error.message}`);
    res.status(500).json({ message: `Internal Server Error: ${error.message}` });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: `User not found.` });

    // Generate JWT token
    const token = jwt.sign(
      { email: user.email, id: user.id },
      config.JWT_SECRET,
      { expiresIn: '1h' }
    );

    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // Email configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Replace with your email provider
      auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS
      }
    });

    const mailOptions = {
      to: user.email,
      from: config.EMAIL_USER,
      subject: 'Password Reset',
      html: `<p>Hello ${user.firstName || ""},</p>
             <p>You requested a password reset.</p>
             <p>Click the link below to reset your password:</p>
             <a href="http://localhost:5173/resetPassword/${token}">Reset Password</a>
             <p>If you did not request this, please ignore this email.</p>`
    };

    await transporter.sendMail(mailOptions);

    return { status: 200, message: 'Reset link sent to your email' };
  } catch (error) {
    console.log(`Internal Server Error: ${error.message}`);
    res.status(500).json({ message: `Internal Server Error: ${error.message}` });
  }
}

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Find user by token and ensure the token has not expired
    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) return res.status(404).json({ message: `Token is invalid or has expired.` });

    // Hash the new password
    user.password = await bcrypt.hash(newPassword, 10);
    // Clear the reset token and expiration
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been reset' });
  } catch (error) {
    console.log(`Internal Server Error: ${error.message}`);
    res.status(500).json({ message: `Internal Server Error: ${error.message}` });
  }
};