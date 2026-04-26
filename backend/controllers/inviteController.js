const crypto = require('crypto');
const Invite = require('../models/Invite');
const User = require('../models/User');

// @route  POST /api/invite/generate
// @access Private — generate a new invite code
const generateInvite = async (req, res) => {
  try {
    const code = crypto.randomBytes(8).toString('hex'); // e.g. "a3f9c2b1d4e5f678"

    const invite = await Invite.create({
      code,
      createdBy: req.user._id,
    });

    res.status(201).json({
      code: invite.code,
      inviteUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/invite/${invite.code}`,
      expiresAt: invite.expiresAt,
    });
  } catch (error) {
    console.error('Generate invite error:', error.message);
    res.status(500).json({ message: 'Failed to generate invite link' });
  }
};

// @route  GET /api/invite/validate/:code
// @access Public — check if invite code is valid before registering
const validateInvite = async (req, res) => {
  try {
    const { code } = req.params;
    const invite = await Invite.findOne({ code }).populate('createdBy', 'name email avatar');

    if (!invite) {
      return res.status(404).json({ message: 'Invalid invite link' });
    }
    if (invite.expiresAt < new Date()) {
      return res.status(410).json({ message: 'This invite link has expired' });
    }

    res.json({
      valid: true,
      invitedBy: invite.createdBy,
      code: invite.code,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to validate invite' });
  }
};

// @route  POST /api/invite/use/:code
// @access Private — called after registration to mark invite as used
const useInvite = async (req, res) => {
  try {
    const { code } = req.params;
    const invite = await Invite.findOne({ code });

    if (!invite) return res.status(404).json({ message: 'Invalid invite code' });
    if (invite.expiresAt < new Date()) return res.status(410).json({ message: 'Invite expired' });

    // Add user to usedBy if not already present
    if (!invite.usedBy.includes(req.user._id)) {
      invite.usedBy.push(req.user._id);
      await invite.save();
    }

    res.json({ message: 'Invite used successfully', invitedBy: invite.createdBy });
  } catch (error) {
    res.status(500).json({ message: 'Failed to record invite usage' });
  }
};

// @route  GET /api/invite/my
// @access Private — get all invites created by the current user
const getMyInvites = async (req, res) => {
  try {
    const invites = await Invite.find({ createdBy: req.user._id })
      .populate('usedBy', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json(invites);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch invites' });
  }
};

module.exports = { generateInvite, validateInvite, useInvite, getMyInvites };
