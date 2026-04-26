const express = require('express');
const router = express.Router();
const { createRoom, getUserRooms, getOrCreateDM } = require('../controllers/roomController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createRoom);
router.get('/', protect, getUserRooms);
router.post('/dm', protect, getOrCreateDM);

module.exports = router;
