const Message = require('../models/Message');
const { encryptMessage, decryptMessage } = require('../utils/encryption');

// In-memory online users: Map<userId, socketId>
const onlineUsers = new Map();

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ─── User Online ─────────────────────────────────────────
    socket.on('user-online', (userId) => {
      if (userId) {
        onlineUsers.set(userId.toString(), socket.id);
        socket.userId = userId.toString();
        // Broadcast updated online users list to everyone
        io.emit('online-users', Array.from(onlineUsers.keys()));
        console.log(`✅ User online: ${userId} | Total online: ${onlineUsers.size}`);
      }
    });

    // ─── Join Room ───────────────────────────────────────────
    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      console.log(`👥 Socket ${socket.id} joined room: ${roomId}`);
    });

    // ─── Leave Room ──────────────────────────────────────────
    socket.on('leave-room', (roomId) => {
      socket.leave(roomId);
      console.log(`🚪 Socket ${socket.id} left room: ${roomId}`);
    });

    // ─── Send Message ─────────────────────────────────────────
    socket.on('send-message', async ({ roomId, senderId, text, imageUrl }) => {
      try {
        // Encrypt message text (End-to-End Encryption)
        const { encryptedText, iv } = encryptMessage(text);
        
        const message = await Message.create({
          room: roomId,
          sender: senderId,
          text: encryptedText || text,
          imageUrl: imageUrl || '',
          encrypted: !!encryptedText,
          iv: iv,
          readBy: [senderId], // Sender has already "read" their own message
        });

        const populated = await Message.findById(message._id).populate(
          'sender',
          'name avatar email'
        );

        // Decrypt for sending (client will handle display)
        const messageToSend = {
          ...populated.toObject(),
          text: text, // Send original text (already decrypted)
          encryptedText: encryptedText, // Also send encrypted version
        };

        // Broadcast to all users in the room
        io.to(roomId).emit('receive-message', messageToSend);
      } catch (error) {
        console.error('Send message error:', error.message);
        // Notify sender of failure
        socket.emit('message-error', { message: 'Failed to save message. Please try again.' });
      }
    });

    // ─── Mark Message as Read ────────────────────────────────
    socket.on('mark-read', async ({ messageId, userId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) return;
        
        // Add user to readBy array if not already there
        if (!message.readBy.includes(userId)) {
          message.readBy.push(userId);
          await message.save();
          
          // Notify sender that message was read
          io.to(message.room.toString()).emit('message-read', {
            messageId,
            userId,
            readBy: message.readBy,
          });
        }
      } catch (error) {
        console.error('Mark read error:', error.message);
      }
    });

    // ─── Delete Message ──────────────────────────────────────
    socket.on('delete-message', async ({ messageId, userId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) return;
        
        // Only sender can delete their own message
        if (message.sender.toString() !== userId.toString()) {
          return socket.emit('message-error', { message: 'You can only delete your own messages' });
        }
        
        await Message.findByIdAndDelete(messageId);
        
        // Notify all users in the room
        io.to(message.room.toString()).emit('message-deleted', { messageId });
      } catch (error) {
        console.error('Delete message error:', error.message);
      }
    });

    // ─── Typing Indicators ───────────────────────────────────
    socket.on('typing', ({ roomId, userName }) => {
      socket.to(roomId).emit('user-typing', userName);
    });

    socket.on('stop-typing', ({ roomId }) => {
      socket.to(roomId).emit('stop-typing');
    });

    // ─── Disconnect ──────────────────────────────────────────
    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit('online-users', Array.from(onlineUsers.keys()));
        console.log(`❌ User offline: ${socket.userId} | Total online: ${onlineUsers.size}`);
      }
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;
