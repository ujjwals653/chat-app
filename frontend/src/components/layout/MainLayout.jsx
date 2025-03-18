import ServerSidebar from './ServerSidebar';
import ChannelSidebar from './ChannelSidebar';
import MembersSidebar from './MembersSidebar';
import ChatArea from '../chat/ChatArea';
import { UserProvider } from '../contexts/UserContext';
import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';

const MainLayout = () => {
  const { getToken } = useAuth();

  async function setTokentoStorage() {
    try {
      const token = await getToken();
      if (token) {
        try {
          localStorage.setItem('authToken', token);
          console.log("Token stored successfully: ", token);  
        } catch (error) {
          console.log("LocalStorage Error: ", error);
        }
      }
      
    } catch (error) {
      console.error("Error getting token: ", error);
    }
  }

  useEffect(() => {
    setTokentoStorage();
  }, [getToken]);

  return (
    <div className="flex h-screen w-full bg-gray-900 text-gray-100">
      <ServerSidebar />
      
      <UserProvider>
        <ChannelSidebar />
        <div className="flex flex-col flex-1">
          <ChatArea />
        </div>
        <MembersSidebar />
      </UserProvider>
    </div>
  );
};

export default MainLayout;
