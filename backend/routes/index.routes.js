const express = require('express');
const indexRoutes = express.Router()
const upload = require("../helper/uplodes");
const { removeUser, updateUser, getUserById, getAllUsers, createNewUser, resetPassword, addToWishlist, getUserWishlist, removeFromWishlist } = require('../controller/user.controller');
const { userLogin, googleLogin, forgotPassword, verifyOtp, changePassword, userLogout, refreshAccessToken } = require('../auth/auth');
const { auth } = require('../middleware/auth');
const { createSound, getAllSounds, getSoundById, updateSound, deleteSound } = require('../controller/soundController');
const { createNewFolder, getFolderByUserId, updateFolderName, deleteFolderById } = require('../controller/folderController');
const { createContact } = require('../controller/contactcontroller');
const { getAllFaqs, createFaq } = require('../controller/faqsController');
const { addTerms, getTerms } = require('../controller/termsController');
const { createCategory, getAllCategory, getCategoryById, deleteCategory, updateCategory } = require('../controller/categoryController');
const { createSubscribe, getAllSubscribe } = require('../controller/subscribeController');

// auth Routes

indexRoutes.post("/userLogin", userLogin);
indexRoutes.post('/logout/:id', userLogout);
indexRoutes.post("/google-login", googleLogin);
indexRoutes.post('/forgotPassword', forgotPassword)
indexRoutes.post('/verifyOtp', verifyOtp)
indexRoutes.post('/changePassword', changePassword)
indexRoutes.get('/refresh-token', refreshAccessToken);

// user Routes 

indexRoutes.post('/createUser', createNewUser);
indexRoutes.get('/allUsers', getAllUsers);
indexRoutes.get('/getUserById/:id', getUserById);
indexRoutes.put('/userUpdate/:id', upload.single("photo"), updateUser);
indexRoutes.delete('/deleteUser/:id', removeUser);
indexRoutes.put('/resetPassword', resetPassword);

// Wishlist Routes
indexRoutes.put('/wishlist', auth, addToWishlist);
indexRoutes.get('/getwishlist', auth, getUserWishlist);
indexRoutes.delete('/wishlist/:soundId', auth, removeFromWishlist);

// category Routes

indexRoutes.post('/createcategory', createCategory);
indexRoutes.get('/allcategory', getAllCategory);
indexRoutes.get('/getcategoryById/:id', getCategoryById);
indexRoutes.put('/updatecategory/:id', updateCategory);
indexRoutes.delete('/deletecategory/:id', deleteCategory);

// sound Routes

indexRoutes.post('/createSound', upload.fields([{ name: 'image' }, { name: 'soundfile' }]), createSound);
indexRoutes.get('/allSounds', getAllSounds);
indexRoutes.get('/getSoundById/:id', getSoundById);
indexRoutes.put('/updateSound/:id', upload.fields([{ name: 'image' }, { name: 'soundfile' }]), updateSound);
indexRoutes.delete('/deleteSound/:id', deleteSound);

// add folder Routes

indexRoutes.post('/createFolder', auth, createNewFolder);
indexRoutes.get('/getAllFolderByUserid/:userId', auth, getFolderByUserId);
indexRoutes.put('/updateFolderById/:id', auth, updateFolderName);
indexRoutes.delete('/deletefolderbyid/:id', auth, deleteFolderById);
// contact form route
indexRoutes.post('/contact', createContact);

// FAQs route
indexRoutes.post('/faqs', createFaq);
indexRoutes.get('/view/faqs', getAllFaqs);

// Terms routes
indexRoutes.post('/terms', addTerms);
indexRoutes.get('/view/terms', getTerms);

// subscribe Route

indexRoutes.post('/createsubscribe', createSubscribe);
indexRoutes.get('/allsubscribe', getAllSubscribe);

module.exports = indexRoutes