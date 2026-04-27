const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    // Read status tracking
    readBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    // Encryption fields
    encrypted: {
      type: Boolean,
      default: true,
    },
    iv: {
      type: String, // Initialization vector for encryption
      default: '',
    },
  },
  { timestamps: true }
);

// Validate: must have text OR imageUrl
messageSchema.pre('validate', function (next) {
  if (!this.text && !this.imageUrl) {
    return next(new Error('Message must have either text or an image'));
  }
  next();
});

module.exports = mongoose.model('Message', messageSchema);
