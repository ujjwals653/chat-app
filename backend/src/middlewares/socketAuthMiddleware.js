import { Clerk } from "@clerk/clerk-sdk-node";
import { configDotenv } from 'dotenv';
configDotenv();
const clerk = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY })

// Middleware to authenticate socket connections using Clerk
export const socketAuthMiddleware = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication token not provided'));
        }

        // Try to verify normal user first
        try {
            const session = await clerk.sessions.verifySession(token);
            socket.user = {
                id: session.userId,
                isAnonymous: false,
            };
            next();
        } catch (error) {
            // If that fails try to verify anonymous user
            try {
                const session = await clerk.client.verifyClient(token);
                socket.user = {
                    id: `AnonymousUser${session.id?.splice(-4)}`,
                    isAnonymous: true,
                };
                next();
            } catch (InnerError) {
                // If both fails
                return next(new Error('Invalid authentication token'));
            }
        }
    } catch (error) {
        console.error('Socket authentication error:', error);
        return next(new Error('Authentication error'));
    }
}