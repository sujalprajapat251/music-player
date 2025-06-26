const express = require('express');
const indexRoutes = express.Router()
const upload = require("../helper/uplodes");
const { removeUser, updateUser, getUserById, getAllUsers, createNewUser, resetPassword } = require('../controller/user.controller');
const { userLogin, googleLogin, forgotPassword, verifyOtp, changePassword, userLogout } = require('../auth/auth');
const { auth } = require('../middleware/auth');

// auth Routes

indexRoutes.post("/userLogin", userLogin);
indexRoutes.post('/logout/:id', userLogout);
indexRoutes.post("/google-login", googleLogin);
indexRoutes.post('/forgotPassword', forgotPassword)
indexRoutes.post('/verifyOtp', verifyOtp)
indexRoutes.post('/changePassword', changePassword)

// user Routes 

indexRoutes.post('/createUser', createNewUser);
indexRoutes.get('/allUsers', getAllUsers);
indexRoutes.get('/getUserById/:id', getUserById);
indexRoutes.put('/userUpdate/:id', upload.single("photo"), updateUser);
indexRoutes.delete('/deleteUser/:id', removeUser);
indexRoutes.put('/resetPassword', resetPassword);

module.exports = indexRoutes