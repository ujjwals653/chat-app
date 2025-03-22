import { socketAuthMiddleware } from "../middlewares/socketAuthMiddleware.js";

const onlineUsers = new Map();

export const socketManager = (io) => {
  io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    if (!username) {
      return next(new Error("Invalid username"));
    }
    socket.username = username;
    next();
  });

  io.on('connection', (socket) => {
    const username = socket.username;
    
    // Clean up any existing entries for this user
    if (onlineUsers.has(username)) {
      console.log(`Cleaning up existing session for ${username}`);
    }
    
    onlineUsers.set(username, socket.id);
    console.log(`User connected: ${username}`);
    
    // Emit updated online users list to all clients
    io.emit('update-online-users', Array.from(onlineUsers.keys()));
    
    socket.on('delete-message', ({ messageId }) => {
      console.log(`Deleting message: ${messageId}`);
      io.emit('message-deleted', { messageId });
    })

    socket.on('send-message', (message) => {
      console.log(`Message from ${username}:`, message);
      io.emit('receive-message', message);
    });

    socket.on('emit-online-users', () => {
      socket.emit('update-online-users', Array.from(onlineUsers.keys()));
    });

    socket.on('disconnect', () => {
      if (onlineUsers.get(username) === socket.id) {
        onlineUsers.delete(username);
        console.log(`User disconnected: ${username}`);
        io.emit('update-online-users', Array.from(onlineUsers.keys()));
      }
    });
  });
};