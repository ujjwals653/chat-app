import ServerSidebar from './ServerSidebar';
import ChannelSidebar from './ChannelSidebar';
import MembersSidebar from './MembersSidebar';
import ChatArea from '../chat/ChatArea';
import { UserProvider } from '../contexts/UserContext';
import { useAuth } from '@clerk/clerk-react';

const MainLayout = () => {
  const { isLoaded } = useAuth();

  if (!isLoaded) return <div>Loading...</div>;

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
