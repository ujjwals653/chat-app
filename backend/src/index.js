import dotenv from 'dotenv';
dotenv.config(); // Ensure this is at the very top
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
// import { Clerk } from '@clerk/clerk-sdk-node';

import messageRoutes from './routes/messageRoutes.js';
import { connectDB } from './configs/db.js';
import { socketManager }from './sockets/socketManager.js';

const app = express();

// Middleware Setup
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// API Routes
app.use('/api/messages', messageRoutes);

// Initialize Socket.IO
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  },
});

// Socket.IO Connection
socketManager(io);


// Error Handling Middleware


// Start the server 
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Socket.IO server initialized`);
});

