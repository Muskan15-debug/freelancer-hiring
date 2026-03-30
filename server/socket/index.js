import jwt from 'jsonwebtoken';

export const setupSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);
    socket.join(`user_${socket.userId}`);

    socket.on('joinConversation', (conversationId) => {
      socket.join(`conversation_${conversationId}`);
    });

    socket.on('leaveConversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
    });

    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(`conversation_${conversationId}`).emit('userTyping', { userId: socket.userId, isTyping });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });
};
