const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getAllUsers, checkEmails } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/users', protect, getAllUsers);
router.post('/check-emails', protect, checkEmails);

module.exports = router;
