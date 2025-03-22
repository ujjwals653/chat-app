import Message from '../models/Message.js';

export const sendMessage = async (req, res) => {
    try {
        const { username, content, channelId, isAnonymous, imageURL, messageId } = req.body;

        // Validate required fields
        if (!username || !content || !channelId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const message = new Message({ username, content, channelId, isAnonymous, imageURL, messageId });
        // Save the message to the database
        await message.save();
        res.status(201).json(message);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}

export const getMessages = async (req, res) => {
    try {
        // Get all messages from the database in ascending order of creation
        const { channel } = req.query;
        if (channel) {
            console.log(channel);
            const messages = await Message.find({ channelId: { $eq: channel } }).sort({ createdAt: 1 });
            res.status(200).json(messages);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}

export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.body;
        
        if (!messageId) {
            return res.status(400).json({ message: 'Message ID is required' });
        }

        const message = await Message.findOneAndDelete({ messageId });
        
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        res.status(200).json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}
