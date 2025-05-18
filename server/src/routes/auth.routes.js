const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateRegistration, validateLogin } = require('../middlewares/validation.middleware');

// Register a new user
router.post('/register', validateRegistration, authController.register);

// Login user
router.post('/login', validateLogin, authController.login);

//Logout user
router.post('/logout', authController.logout);

module.exports = router;
