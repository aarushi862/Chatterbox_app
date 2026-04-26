const Room = require('../models/Room');

// @route  POST /api/rooms
// @access Private
const createRoom = async (req, res) => {
  try {
    const { name, members } = req.body;

    if (!name || !members || members.length === 0) {
      return res.status(400).json({ message: 'Room name and members are required' });
    }

    // Check if group room name already exists
    const existing = await Room.findOne({ name, isGroupChat: true });
    if (existing) {
      return res.status(400).json({ message: 'Room already exists with this name' });
    }

    // Ensure creator is in members list
    const allMembers = [...new Set([...members, req.user._id.toString()])];

    const room = await Room.create({
      name,
      isGroupChat: true,
      members: allMembers,
      createdBy: req.user._id,
    });

    const populated = await Room.findById(room._id)
      .populate('members', '-password')
      .populate('createdBy', '-password');

    res.status(201).json(populated);
  } catch (error) {
    console.error('Create room error:', error.message);
    res.status(500).json({ message: 'Server error creating room' });
  }
};

// @route  GET /api/rooms
// @access Private
const getUserRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.user._id })
      .populate('members', '-password')
      .populate('createdBy', '-password')
      .sort({ updatedAt: -1 });

    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching rooms' });
  }
};

// @route  POST /api/rooms/dm
// @access Private — get or create a 1-on-1 DM room
const getOrCreateDM = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'Target userId is required' });
    }

    // Look for existing DM room with exactly these two members
    const existing = await Room.findOne({
      isGroupChat: false,
      members: { $all: [req.user._id, userId], $size: 2 },
    })
      .populate('members', '-password')
      .populate('createdBy', '-password');

    if (existing) return res.json(existing);

    // Create new DM room
    const room = await Room.create({
      name: '',
      isGroupChat: false,
      members: [req.user._id, userId],
      createdBy: req.user._id,
    });

    const populated = await Room.findById(room._id)
      .populate('members', '-password')
      .populate('createdBy', '-password');

    res.status(201).json(populated);
  } catch (error) {
    console.error('DM error:', error.message);
    res.status(500).json({ message: 'Server error creating DM' });
  }
};

module.exports = { createRoom, getUserRooms, getOrCreateDM };
