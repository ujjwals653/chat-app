import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const { MONGODB_URI } = process.env;
console.log(MONGODB_URI);

export const connectDB = () => {
    mongoose.connect("mongodb+srv://ujjwals653:_Xvghk971273512@biscordmessages.8yxlg.mongodb.net/?retryWrites=true&w=majority&appName=BiscordMessages", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error("MongoDB connection error: ",   error));
}

// Ensures that database connections are properly closed
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown() {
    console.log('Received SIGTERM. Closing server...');

    mongoose.connection.close(() => {
    console.log('MongoDB connection closed.');
    server.close(() => {
        console.log('Server shut down.');
        process.exit(0);
        });
    });
}