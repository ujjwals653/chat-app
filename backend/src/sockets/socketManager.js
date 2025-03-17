import { socketAuthMiddleware } from "../middlewares/socketAuthMiddleware.js";

export const socketManager = (io) => {
  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
      console.log(`User connected: ${socket.user.id}, (Anonymous: ${socket.user.isAnonymous})`);
    
      socket.on('send-message', (message) => {
        console.log(message);
        io.emit('receive-message', message);
      });
    
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
      });
  });
}