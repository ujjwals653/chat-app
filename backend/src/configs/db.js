import mongoose from 'mongoose';

export const connectDB = () => {
    mongoose.connect(process.env.MONGO_URI, {
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