import { Clerk } from '@clerk/clerk-sdk-node'
import { configDotenv } from 'dotenv';
configDotenv();
const clerk = new Clerk({secretKey: process.env.CLERK_SECRET_KEY});

// Middleware to authenticate and identify users using Clerk
export const clerkMiddleware = async (req, res, next) => {
    try {
        // Check if session tokon exists
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No authentication token provided' });
        }

        // Verify session
        try {
            const session = await clerk.sessions.getSession(token);
            // We are setting the below items in req 
            req.user = session.userId;
            req.isAnonymous = false;
            next(); // next() is to proceed to the messageRoutes
        } catch (InnerError) {
            // If the user is Anonymous
            try {
                const session = await clerk.clients.getClient(token);
                req.isAnonymous = true;
                req.user = `anon-${session.id}`;
                next();
            } catch (error) {
                console.log("Invalid token error: ", error);
                return res.status(401).json({ error: 'Invalid authentication token', token: token });
            }
        }
    } catch (error) {
        console.log("Authentication Error: ", error);
        return res.status(500).json({ error: 'Authentication error' });
    }   
}