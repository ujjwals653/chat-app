import { useEffect, useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Hash, Volume2, Settings, PlusCircle, Crown, User } from "lucide-react";
import { useUserCon } from '../contexts/UserContext';
import { UserButton } from '@clerk/clerk-react';
import { useChannel } from '../contexts/ChannelContext';
import AgoraRTC from 'agora-rtc-react';
import axios from 'axios';

const ChannelSidebar = () => {
  // Dummy channel data
  const textChannels = [
    { id: '1', name: 'welcome', type: 'text' },
    { id: '2', name: 'general', type: 'text' },
    { id: '3', name: 'feedback', type: 'text' },
  ];
  
  const voiceChannels = [
    { id: '1', name: 'General', type: 'voice' },
    { id: '2', name: 'Gaming', type: 'voice' },
  ];

  const audioTracks = { localaudiotrack : null, remoteAudioTracks: {} };
  const [ joinedUsers, setJoinedUsers ] = useState([]);
  const { selectedChannel, setSelectedChannel } = useChannel();
  const [ selectedVoiceCh, setSelectedVoiceCh ] = useState(voiceChannels[0].name);
  const [ joined, setJoined ] = useState(false);
  const [ token, setToken ] = useState('');
  const { user } = useUserCon();
  const rtcClient = AgoraRTC.createClient({mode: 'rtc', codec: 'vp8'});

  useEffect(() => {
    if (textChannels.length > 0) {
      setSelectedChannel(textChannels[0]);
    }
  }, []);
  // Agora config
  const joinChannel = async (channelName) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/agora`, { channelName, username: user.username, imageUrl: user.imageUrl });
      const { token, uid, imageUrl } = res.data;
      const appId = import.meta.env.VITE_AGORA_APP_ID;
      console.warn('Voice data: ', res.data);
      const joinRes = await rtcClient.join(appId, channelName, token, uid);

      audioTracks.localaudiotrack = await AgoraRTC.createMicrophoneAudioTrack();
      rtcClient.publish(audioTracks.localaudiotrack);

      setSelectedVoiceCh(channelName);
      setJoined(true);
      
      // Pass current user's data when joining
      handleUserJoined({
        uid,
        username: user.username,
        imageUrl,
      });

      rtcClient.on('user-joined', (userData) => {
        handleUserJoined(userData, imageUrl);
      });
      rtcClient.on('user-published', handleUserPublished);
      rtcClient.on('user-left', handleUserLeft);

    } catch (error) {
      console.error("Error getting token: ", error);
    }
  }

  const leaveChannel = () => {
    if (audioTracks.localaudiotrack) {
      audioTracks.localaudiotrack.stop();
      audioTracks.localaudiotrack.close();
    }
    rtcClient.unpublish();
    rtcClient.leave().then(() => {
      rtcClient.removeAllListeners(); // Remove all event listeners
      setJoined(false);
      setJoinedUsers(prev => prev.filter(u => u.uid !== user.id)); // Ensure user exists before filtering
      setSelectedVoiceCh(null); // Reset selected voice channel
    }).catch(error => {
      console.error("Error leaving channel: ", error);
    });
  }

  const handleUserJoined = async (userData, imageUrl) => {
    console.log('User joined voice channel: ', userData);
    setJoinedUsers(prev => {
      // Avoid duplicates by checking if user already exists
      const exists = prev.some(u => u.uid === userData.uid);
      if (!exists) {
        return [...prev, { ...userData, imageUrl }];
      }
      return prev.map(u => u.uid === userData.uid ? { ...u, ...userData } : u); // Update user data without overwriting imageUrl
    });
  }

  const handleUserPublished = async (userData, mediaType) => {
    await rtcClient.subscribe(userData, mediaType);

    if (mediaType === 'audio') {
      audioTracks.remoteAudioTracks[userData.uid] = [userData.audioTrack];
      userData.audioTrack.play();
    }
    setJoinedUsers(prev => {
      // Avoid duplicates by checking if user already exists
      const exists = prev.some(u => u.uid === userData.uid);
      if (!exists) {
        return [...prev, userData];
      }
      return prev;
    });
  }

  const handleUserLeft = async (userData) => {
    delete audioTracks.remoteAudioTracks[userData.uid];
    setJoinedUsers(prev => prev.filter(u => u.uid !== userData.uid));
  }
  
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
              <PlusCircle size={16} className="cursor-pointer hover:text-white hover:bg-gray-400" />
            </div>
            
            {textChannels.map((channel) => (
              <div 
                key={channel.id}
                className={`flex items-center px-2 py-1 rounded cursor-pointer 
                  ${selectedChannel.id === channel.id 
                    ? 'bg-gray-700 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                onClick={() => setSelectedChannel({ id: channel.id, name: channel.name })}
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
                  <PlusCircle size={16} className="cursor-pointer hover:text-white hover:bg-gray-700" />
                </div>
                
                {voiceChannels.map((channel) => (
                  <div 
                    key={channel.id} 
                    className={`flex flex-col rounded cursor-pointer group
                      ${joined && channel.name !== selectedVoiceCh 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:text-white hover:bg-gray-700'}`}
                    onClick={() => !joined && joinChannel(channel.name)}
                  >
                  <div className={`flex items-center px-2 py-1 text-gray-400 
                    ${joined && channel.name !== selectedVoiceCh ? '' : 'group-hover:text-white'}`}>
                    <Volume2 size={18} className="mr-1" />
                    <span className="truncate">{channel.name}</span>
                    {joined && channel.name === selectedVoiceCh && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          leaveChannel();
                        }}
                        className="ml-auto text-sm mt-1 text-gray-400 hover:text-red-500 cursor-pointer"
                      >
                        Leave
                      </button>
                    )}
                  </div>
                  {joined && selectedVoiceCh === channel.name && joinedUsers.map((user) => (
                    <div key={user.uid} className='flex items-center px-4 py-1 text-sm text-gray-400 group-hover:text-white'>
                    <img 
                      src={user.imageUrl} 
                      alt={user.username}
                      className="w-6 h-6 rounded-full mr-2"
                    />
                    <span className="truncate">{user.uid}</span>
                    </div>
                  ))}
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
