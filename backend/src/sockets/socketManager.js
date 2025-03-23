import { socketAuthMiddleware } from "../middlewares/socketAuthMiddleware.js";

const onlineUsers = new Map();

export const socketManager = (io) => {
  // io.use(socketAuthMiddleware); // Fix this
  const voiceUsers = new Map();

  io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}, (Anonymous: ${socket.isAnonymous})`);
    
      socket.on('send-message', (message) => {
        console.log(message);
        io.emit('receive-message', message);
      });

      socket.on('user-voice-join', ({ uid, username, imageUrl, channelName } = {}) => {
        if (!uid || !username || !channelName) return;
        voiceUsers.set(username, { uid, username, imageUrl, channelName });
        const currentUsers = Array.from(voiceUsers.values());
        console.log('Voice users after join:', currentUsers);
        io.emit('user-voice-join', currentUsers);
      });

      socket.on('user-voice-left', ({ username }) => {
        if (!username) return;
        voiceUsers.delete(username);
        const currentUsers = Array.from(voiceUsers.values());
        console.log('Voice users after leave:', currentUsers);
        io.emit('user-voice-join', currentUsers);
        io.emit('user-voice-left', { username });
      });

      socket.on('disconnect', () => {
        for (const [uid, userData] of voiceUsers.entries()) {
          if (userData.socketId === socket.id) {
            voiceUsers.delete(username);
            io.emit('user-voice-left', { username });
          }
        }
        console.log(`User disconnected: ${socket.id}`);
      });
  });
};