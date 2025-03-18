import { Clerk } from '@clerk/clerk-sdk-node'
const clerk = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

// Function to generate anonymous user using clerk
export const createAnonymousUser = async (req, res) => {
    try {
        // 4 digit alphanumeric unique ID
        const uniqueId = Math.random().toString(36).substring(2, 6).toUpperCase();
        
        const anonUser = {
            username: `AnonUser_${uniqueId}`,
            email: `anon.${uniqueId}@biscord.com`,
            password: `Guest@${uniqueId}`,
        };

        const user = await clerk.users.createUser({
            emailAddress: [anonUser.email],
            username: anonUser.username,
            password: anonUser.password,
        })
        console.log(uniqueId);

        res.status(200).json({
            email: anonUser.email,
            userId: `anon-${user.id}`,
            password: anonUser.password,
        });
    } catch (error) {
        console.error("Error generating anon user:", error);
        res.status(500).json({error: "Failed to create Anonymous user"});
    }
}