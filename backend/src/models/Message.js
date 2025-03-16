import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    username: { type: String, required: true },
    content: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);