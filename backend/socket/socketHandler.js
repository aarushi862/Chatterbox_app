const Message = require('../models/Message');

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
        const message = await Message.create({
          room: roomId,
          sender: senderId,
          text: text || '',
          imageUrl: imageUrl || '',
        });

        const populated = await Message.findById(message._id).populate(
          'sender',
          'name avatar email'
        );

        // Broadcast to all users in the room
        io.to(roomId).emit('receive-message', populated);
      } catch (error) {
        console.error('Send message error:', error.message);
        // Notify sender of failure
        socket.emit('message-error', { message: 'Failed to save message. Please try again.' });
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
