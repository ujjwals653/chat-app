import Message from '../models/Message.js';

export const sendMessage = async (req, res) => {
    try {
        const { username, content, channelId, isAnonymous } = req.body;

        // Validate required fields
        if (!username || !content || !channelId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const message = new Message({ username, content, channelId, isAnonymous });
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
        const messages = await Message.find().sort({ createdAt: 1 });
        console.log(messages);
        res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}
