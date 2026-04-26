const express = require('express');
const router = express.Router();
const { syncContacts } = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');

router.post('/sync', protect, syncContacts);

module.exports = router;
