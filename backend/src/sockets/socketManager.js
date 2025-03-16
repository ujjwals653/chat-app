
export const socketManager = (io) => {
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);
      
        socket.on('send-message', (message) => {
          console.log(message);
          io.emit('receive-message', message);
        });
      
        socket.on('disconnect', () => {
          console.log(`User disconnected: ${socket.id}`);
        });
    });
}