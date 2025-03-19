import { Clerk } from "@clerk/clerk-sdk-node";
const clerk = new Clerk({ secretKey: 'sk_test_IkizjKYuh7qOQ7HzN1ZuNmjacHXMLWfSRfYn6lRtjC' });

export const clerkGetUsers = async (req, res) => {
  try {
    const userData = await clerk.users.getUserList({
        orderBy: '-created_at',
        limit: 10,
    })
    
    res.status(200).json(userData);
  } catch (error) {
    console.log("Error getting user data: ", error);
    res.status(404).json({ error: 'Error getting user data from'}); 
  }
};