import Message from '../models/Message.js';

export const sendMessage = async (req, res) => {
    try {
        const { username, content } = req.body;
        const message = new Message({ username, content });
        // Save the message to the database
        await message.save();
        res.status(201).json(message);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}

export const getMessages = async (req, res) => {
    // const messages = [{ id: '1', author: 'JohnDoe', content: 'Hey everyone! How are you doing today?', time: 'Today at 10:15 AM' },
    //     { id: '2', author: 'JaneSmith', content: 'I\'m doing great! Working on my React project.', time: 'Today at 10:16 AM' },
    //     { id: '3', author: 'MikeBrown', content: 'Nice! I\'m learning Vite + React too.', time: 'Today at 10:18 AM' },
    //     { id: '4', author: 'SarahWilson', content: 'Discord clone? That sounds challenging but fun!', time: 'Today at 10:20 AM' },
    //     { id: '5', author: 'JohnDoe', content: 'Yeah, using shadcn/ui makes it much easier though!', time: 'Today at 10:22 AM' },
    // ];
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
