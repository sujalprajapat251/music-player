const user = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");


exports.userLogin = async (req, res) => {
  try {
    let { email, password, rememberMe } = req.body;

    let checkEmailIsExist = await user.findOne({ email });

    if (!checkEmailIsExist) {
      return res.status(404).json({ status: 404, message: "Email Not found" });
    }

    let comparePassword = await bcrypt.compare(
      password,
      checkEmailIsExist.password
    );

    if (!comparePassword) {
      return res
        .status(404)
        .json({ status: 404, message: "Password Not Match" });
    }

    // Check if the plan has expired
    const currentDate = new Date();
    if (checkEmailIsExist.endDate && currentDate > checkEmailIsExist.endDate) {
      // Set planType to default if expired
      checkEmailIsExist.planType = 'Basic'; // or any default value you want
      checkEmailIsExist.endDate = null;
      checkEmailIsExist.startDate = null;
      checkEmailIsExist.Pricing = null;
      await checkEmailIsExist.save(); // Save the updated user
    }

    let accessToken = await jwt.sign(
      { _id: checkEmailIsExist._id },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );

    let refreshToken
    if (rememberMe) {
      refreshToken = jwt.sign(
        { _id: checkEmailIsExist._id },
        process.env.REFRESH_SECRET_KEY,
        { expiresIn: '15d' }
      );

      checkEmailIsExist.refreshToken = refreshToken;
      await checkEmailIsExist.save();

    }
    console.log("access", accessToken)
    console.log("refreshtoekn", refreshToken)

    return res.status(200)
      .cookie("accessToken", accessToken, { httpOnly: true, secure: false, sameSite: "Lax", maxAge: 1 * 24 * 60 * 60 * 1000 })
      .cookie("refreshToken", refreshToken, { httpOnly: true, secure: false, sameSite: "Lax", maxAge: 15 * 24 * 60 * 60 * 1000 })
      .json({
        success: true,
        message: "User Login SuccessFully...",
        user: checkEmailIsExist,
        token: accessToken,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 500, message: error.message });
  }
};

exports.refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) return res.status(404).json({ message: 'No Refresh Token' });

    // Verify token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY);
    const existingUser = await user.findById(decoded._id);

    console.log("---------------", existingUser, decoded)

    const accessToken = await jwt.sign(
      { _id: existingUser._id },
      process.env.SECRET_KEY,
      { expiresIn: '1d' }
    );

    const refreshToken1 = await jwt.sign(
      { _id: existingUser._id },
      process.env.REFRESH_SECRET_KEY,
      { expiresIn: '15d' }
    );

    existingUser.refreshToken = refreshToken1;
    await existingUser.save({ validateBeforeSave: false });

    return res.status(200)
      .cookie("accessToken", accessToken, { httpOnly: true, secure: false, sameSite: "Lax", maxAge: 1 * 24 * 60 * 60 * 1000 })
      .cookie("refreshToken", refreshToken, { httpOnly: true, secure: false, sameSite: "Lax", maxAge: 15 * 24 * 60 * 60 * 1000 })
      .json({
        status: 200,
        message: "User Login SuccessFully...",
        user: existingUser,
        token: accessToken
      });
  } catch (err) {
    return res.status(403).json({ message: 'Refresh Failed', error: err.message });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    let { uid, firstName, lastName, email, photo } = req.body;
    let checkUser = await user.findOne({ email });
    if (!checkUser) {
      checkUser = await user.create({
        uid,
        firstName, lastName,
        email,
        photo
      });
    }
    checkUser = checkUser.toObject();
    let token = await jwt.sign({ _id: checkUser._id }, process.env.SECRET_KEY, { expiresIn: "1D" })
    // checkUser.token = generateToken(checkUser._id);
    return res.status(200).json({ message: 'login successful', success: true, user: checkUser, token: token });
  } catch (error) {
    throw new Error(error);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    let { email } = req.body;

    let checkEmail = await user.findOne({ email });

    if (!checkEmail) {
      return res.status(404).json({ status: 404, message: "Email Not Found" });
    }

    const transport = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let otp = Math.floor(1000 + Math.random() * 9000);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Password",
      text: `Your code is: ${otp} `,
    };

    checkEmail.otp = otp;

    await checkEmail.save();

    transport.sendMail(mailOptions, (error) => {
      if (error) {
        console.log(error);
        return res
          .status(500)
          .json({ status: 500, success: false, message: error.message });
      }
      return res.status(200).json({
        status: 200,
        success: true,
        message: "Email Sent SuccessFully...",
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 500, message: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    let { email, otp } = req.body;
    console.log(email, otp);

    let chekcEmail = await user.findOne({ email });

    if (!chekcEmail) {
      return res.status(404).json({ status: 404, message: "Email Not Found" });
    }

    if (chekcEmail.otp != otp) {
      return res.status(404).json({ status: 404, message: "Invalid Otp" });
    }

    chekcEmail.otp = undefined;

    await chekcEmail.save();

    return res.status(200).json({
      status: 200,
      message: "Otp Verify SuccessFully...",
      user: chekcEmail,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 500, message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    let { newPassword, email } = req.body;

    let userId = await user.findOne({ email });

    if (!userId) {
      return res.status(404).json({ status: 404, message: "User Not Found" });
    }

    let salt = await bcrypt.genSalt(10);
    let hashPassword = await bcrypt.hash(newPassword, salt);

    let updatePassword = await user.findByIdAndUpdate(
      userId._id,
      { password: hashPassword },
      { new: true }
    );

    return res.json({
      status: 200,
      success: true,
      message: "Password Changed SuccessFully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 500, message: error.message });
  }
};

exports.userLogout = async (req, res) => {
  try {
    const userlogout = await user.findByIdAndUpdate(req.params.id);
  } catch (error) {
    console.log("errr logouttt", error);
  }

  return res.status(200).json({
    success: true,
    message: "User logged Out",
  });
};
