import { useEffect, useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Hash, Volume2, Settings, PlusCircle, Crown, User, Mic, MicOff, SignalHigh } from "lucide-react";
import { useUserCon } from '../contexts/UserContext';
import { UserButton } from '@clerk/clerk-react';
import { useChannel } from '../contexts/ChannelContext';
import AgoraRTC from 'agora-rtc-react';
import axios from 'axios';
import socket from '../chat/socket';
import connectSound from '../../assets/sounds/connect.mp3';
import leaveSound from '../../assets/sounds/leave.mp3';

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

  const [ joinedUsers, setJoinedUsers ] = useState([]);
  const { selectedChannel, setSelectedChannel } = useChannel();
  const [ selectedVoiceCh, setSelectedVoiceCh ] = useState(voiceChannels[0].name);
  const [ joined, setJoined ] = useState(false);
  const { user } = useUserCon();
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioTracks, setAudioTracks] = useState({
    localTrack: null,
    remoteTracks: {},
  });
  const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  const connectAudio = new Audio(connectSound);
  const leaveAudio = new Audio(leaveSound);

  // Socket Config
  useEffect(() => {
    if (textChannels.length > 0) {
      setSelectedChannel(textChannels[0]);
    }

    const handleVoiceJoin = (remoteUsers) => {
      setJoinedUsers(remoteUsers);
    }
  
    const handleVoiceLeft = ({ username }) => {
      setAudioTracks(prev => ({
        ...prev,
        remoteTracks: Object.fromEntries(
          Object.entries(prev.remoteTracks).filter(([key]) => key !== uid.toString())
        )
      }));
      setJoinedUsers(prev => prev.filter(u => u.username !== username));
    }

    const handleVoicePublished = async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      console.log("user joined: ", user);
      if (mediaType === "audio") {
        setAudioTracks(prev => ({
          ...prev,
          remoteTracks: {
            ...prev.remoteTracks,
            [user.uid]: [user.audioTrack]
          }
        }));
        user.audioTrack.play();
      }
    }
    
    socket.on('user-voice-join', handleVoiceJoin);
    socket.on('user-voice-left', handleVoiceLeft);
    client.on("user-published", handleVoicePublished);
    client.on("user-left", handleVoiceLeft);

    return () => {
      socket.off('user-voice-join', handleVoiceJoin);
      socket.off('user-voice-left', handleVoiceLeft);
      client.off("user-published", handleVoicePublished);
      client.off("user-left", handleVoiceLeft);
    };
  }, []);

  useEffect(() => {
    if (client && audioTracks.localTrack) {
      audioTracks.localTrack.setMuted(isMuted);
    }
  }, [isMuted]);

  const joinChannel = async (channelName) => {
    try {
      setIsLoading(true);
      const appId = import.meta.env.VITE_AGORA_APP_ID;
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/agora`, { 
        channelName,
        username: user.username,
      });
      const { token, uid } = res.data;
      await client.join(appId, channelName, token, uid);
      
      const track = await AgoraRTC.createMicrophoneAudioTrack();
      setAudioTracks(prev => ({
        ...prev,
        localTrack: track
      }));
      await client.publish(track);
      
      socket.emit('user-voice-join', {
        uid: uid,
        username: user.username,
        imageUrl: user.imageUrl,
        channelName: channelName
      });
      
      setSelectedVoiceCh(channelName);
      setJoined(true);
      setIsLoading(false);
      connectAudio.play();  // Play sound when connection is complete
    } catch (error) {
      setIsLoading(false);
      console.error("Error joining channel: ", error);
      alert("Failed to join voice channel. Please check console for details.");
    }
  }

  const leaveChannel = async () => {
    try {
      if (!client || !joined) {
        console.error("Not in a channel");
        return;
      }

      if (audioTracks.localTrack) {
        audioTracks.localTrack.stop();
        audioTracks.localTrack.close();
        try {
          await client.unpublish(audioTracks.localTrack);
        } catch (err) {
          console.error("Error unpublishing:", err);
        }
      }

      try {
        await client.leave();
      } catch (err) {
        console.error("Error leaving channel:", err);
      }
      
      setAudioTracks(prev => ({
        ...prev,
        localTrack: null,
        remoteTracks: {}
      }));
      socket.emit('user-voice-left', { username: user.username });
      setJoined(false);
      setSelectedVoiceCh(null);
      leaveAudio.play();  // Play leave sound
    } catch (error) {
      console.error("Error in leaveChannel:", error);
    }
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
                        className="ml-auto text-sm mt-1 z-100 text-gray-400 hover:text-red-500 cursor-pointer"
                      >
                        Leave
                      </button>
                    )}
                  </div>
                  {joinedUsers
                    .filter(user => user.channelName === channel.name)
                    .map((user) => (
                    <div key={user.uid} className='flex items-center px-4 py-1 text-sm text-gray-400'>
                      <img 
                        src={user.imageUrl} 
                        alt={user.username}
                        className="w-6 h-6 rounded-full mr-2"
                      />
                      <span className="truncate">{user.username}</span>
                    </div>
                  ))}
                  </div>
                ))}
                </div>
              </div>
              </ScrollArea>

      {/* Voice Status */}
      {(joined || isLoading) && (
        <div className="h-12 bg-gray-850 border-t border-gray-700 px-4 flex items-center justify-between">
          <div className="flex items-center">
            <SignalHigh size={20} strokeWidth={3} className={`mr-2 mb-1 ${isLoading ? 'text-yellow-500 animate-pulse' : 'text-green-500'}`} />
            <span className={`text-sm ${isLoading ? 'text-yellow-500' : 'text-green-500'}`}>
              {isLoading ? 'Connecting...' : 'Voice Connected'}
            </span>
          </div>
          <button 
            onClick={() => setIsMuted(!isMuted)} 
            className={`text-gray-400 hover:text-white ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        </div>
      )}

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
