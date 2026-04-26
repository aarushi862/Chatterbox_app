const express = require('express');
const router = express.Router();
const {
  generateInvite,
  validateInvite,
  useInvite,
  getMyInvites,
} = require('../controllers/inviteController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateInvite);
router.get('/validate/:code', validateInvite);        // Public — check before register
router.post('/use/:code', protect, useInvite);        // Private — after registration
router.get('/my', protect, getMyInvites);

module.exports = router;
