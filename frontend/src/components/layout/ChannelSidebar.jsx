import { useContext } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Hash, Volume2, Settings, PlusCircle, Crown, User } from "lucide-react";
import { useUserCon } from '../contexts/UserContext';
import { UserButton } from '@clerk/clerk-react';

const ChannelSidebar = () => {
  // Dummy channel data
  const textChannels = [
    { id: '1', name: 'general', type: 'text' },
    { id: '2', name: 'welcome', type: 'text' },
    { id: '3', name: 'random', type: 'text' },
  ];
  
  const voiceChannels = [
    { id: '1', name: 'General', type: 'voice' },
    { id: '2', name: 'Gaming', type: 'voice' },
  ];


  const { user } = useUserCon();

  return (
    <div className="w-60 h-full bg-gray-800 flex flex-col">
      {/* Server Header */}
      <div className="h-12 shadow-md flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-700">
        <h2 className="font-bold truncate">Server Name</h2>
        <Settings size={18} />
      </div>

      <ScrollArea className="flex-1">
        <div className="px-2 py-4">
          {/* Text Channels */}
          <div className="mb-2">
            <div className="flex items-center justify-between px-2 text-xs uppercase font-semibold text-gray-400 mb-1">
              <span>Text Channels</span>
              <PlusCircle size={16} className="cursor-pointer hover:text-white" />
            </div>
            
            {textChannels.map((channel) => (
              <div 
                key={channel.id}
                className="flex items-center px-2 py-1 rounded cursor-pointer text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <Hash size={18} className="mr-1" />
                <span className="truncate">{channel.name}</span>
              </div>
            ))}
          </div>

          {/* Voice Channels */}
          <div className="mb-2">
            <div className="flex items-center justify-between px-2 text-xs uppercase font-semibold text-gray-400 mb-1">
              <span>Voice Channels</span>
              <PlusCircle size={16} className="cursor-pointer hover:text-white" />
            </div>
            
            {voiceChannels.map((channel) => (
              <div 
                key={channel.id}
                className="flex items-center px-2 py-1 rounded cursor-pointer text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <Volume2 size={18} className="mr-1" />
                <span className="truncate">{channel.name}</span>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* User Area */}
      <div className="h-14 bg-gray-850 px-4 flex items-center">
          <UserButton />
        <div className="flex flex-col">
          <span className="text-sm font-medium ml-4">{user.username || "Guest"}</span>
          <span className="text-xs text-gray-400 ml-4">{`#${user.id.slice(-4)}`}</span>
        </div>
      </div>
    </div>
  );
};

export default ChannelSidebar;
