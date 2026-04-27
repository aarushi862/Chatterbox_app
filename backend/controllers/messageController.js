const Message = require('../models/Message');
const { decryptMessage } = require('../utils/encryption');

// @route  GET /api/messages/:roomId
// @access Private
const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ room: roomId })
      .populate('sender', 'name avatar email')
      .sort({ createdAt: 1 })
      .limit(100);

    // Decrypt messages before sending
    const decryptedMessages = messages.map(msg => {
      const msgObj = msg.toObject();
      if (msgObj.encrypted && msgObj.iv) {
        msgObj.text = decryptMessage(msgObj.text, msgObj.iv);
      }
      return msgObj;
    });

    res.json(decryptedMessages);
  } catch (error) {
    console.error('Get messages error:', error.message);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
};

module.exports = { getMessages };
