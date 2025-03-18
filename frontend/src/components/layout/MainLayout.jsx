import ServerSidebar from './ServerSidebar';
import ChannelSidebar from './ChannelSidebar';
import MembersSidebar from './MembersSidebar';
import ChatArea from '../chat/ChatArea';
import { UserProvider } from '../contexts/UserContext';
import { useAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';

const MainLayout = () => {
  const { getToken } = useAuth();
  const [showMembers, setShowMembers] = useState(false);
  const [showLeftSidebar, setShowLeftSidebar] = useState(false);

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
      <UserProvider>
        {/* Overlays */}
        {showLeftSidebar && (
          <div
            className="absolute inset-0 bg-black opacity-50 z-40 md:hidden"
            onClick={() => setShowLeftSidebar(false)}
          />
        )}
        {showMembers && (
          <div
            className="absolute inset-0 bg-black opacity-50 z-20 lg:hidden"
            onClick={() => setShowMembers(false)}
          />
        )}

        {/* Sidebars */}
        <div className={`${showLeftSidebar ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 md:translate-x-0 fixed md:relative left-0 top-0 h-full z-50 flex bg-gray-900`}>
          <ServerSidebar />
          <ChannelSidebar />
        </div>
        <div className="flex flex-col flex-1 relative">
          <ChatArea 
            showMembers={showMembers}
            setShowMembers={setShowMembers}
            showLeftSidebar={showLeftSidebar}
            setShowLeftSidebar={setShowLeftSidebar}
          />
        </div>
        <div className={`${showMembers ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 lg:translate-x-0 fixed lg:relative right-0 top-0 h-full z-30 bg-gray-900`}>
          <MembersSidebar />
        </div>
      </UserProvider>
    </div>
  );
};

export default MainLayout;
