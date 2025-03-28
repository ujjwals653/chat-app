import { useEffect, useState, useRef } from 'react';
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
import muteSound from '../../assets/sounds/mute.mp3'; 
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  const audioTracksRef = useRef({
    localTrack: null,
    remoteTracks: {}
  });
  
  const [ joinedUsers, setJoinedUsers ] = useState([]);
  const { selectedChannel, setSelectedChannel } = useChannel();
  const [ selectedVoiceCh, setSelectedVoiceCh ] = useState(voiceChannels[0].name);
  const [ joined, setJoined ] = useState(false);
  const { user } = useUserCon();
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState(null);
  
  const clientRef = useRef(null);
  const connectAudio = new Audio(connectSound);
  const leaveAudio = new Audio(leaveSound);
  const muteAudio = new Audio(muteSound);
  
  const [showTextTooltip, setShowTextTooltip] = useState(false);
  const [showVoiceTooltip, setShowVoiceTooltip] = useState(false);

  const handleTextPlusClick = (e) => {
    e.stopPropagation();
    setShowTextTooltip(true);
    setTimeout(() => setShowTextTooltip(false), 2000);
  };

  const handleVoicePlusClick = (e) => {
    e.stopPropagation();
    setShowVoiceTooltip(true);
    setTimeout(() => setShowVoiceTooltip(false), 2000);
  };

  const toggleMute = async () => {
    try {
      if (!audioTracksRef.current.localTrack || !joined) return;
      
      const newMuteState = !isMuted;
      await audioTracksRef.current.localTrack.setMuted(newMuteState);
      setIsMuted(newMuteState);
      muteAudio.play();
    } catch (error) {
      console.error("Error toggling mute:", error);
    }
  };

  useEffect(() => {
    // Initialize client once
    if (!clientRef.current) {
      clientRef.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    }

    if (textChannels.length > 0) {
      setSelectedChannel(textChannels[0]);
    }

    // Socket event handlers
    const handleVoiceJoin = (remoteUsers) => {
      setJoinedUsers(remoteUsers);
    };
  
    const handleVoiceLeft = ({ username, uid }) => {
      if (uid && audioTracksRef.current.remoteTracks[uid]) {
        delete audioTracksRef.current.remoteTracks[uid];
      }
      setJoinedUsers(prev => prev.filter(u => u.username !== username));
    };

    // Set up socket listeners
    socket.on('user-voice-join', handleVoiceJoin);
    socket.on('user-voice-left', handleVoiceLeft);

    return () => {
      // Cleanup socket listeners
      socket.off('user-voice-join', handleVoiceJoin);
      socket.off('user-voice-left', handleVoiceLeft);
      
      // Make sure to leave channel on unmount
      if (joined) {
        leaveChannel();
      }
    };
  }, []);

  // Handle mute/unmute
  useEffect(() => {
    if (audioTracksRef.current.localTrack && joined) {
      audioTracksRef.current.localTrack.setMuted(isMuted);
    }
  }, [isMuted, joined]);

  // Agora event handlers
  const handleUserPublished = async (user, mediaType) => {
    try {
      await clientRef.current.subscribe(user, mediaType);
      
      if (mediaType === "audio") {
        const audioTrack = user.audioTrack;
        audioTracksRef.current.remoteTracks[user.uid] = audioTrack;
        audioTrack.play();
        audioTrack.setVolume(100); // Ensure volume is at maximum
      }
    } catch (error) {
      console.error("Error subscribing to user:", error);
    }
  };

  const handleUserLeft = async (user) => {
    if (audioTracksRef.current.remoteTracks[user.uid]) {
      delete audioTracksRef.current.remoteTracks[user.uid];
    }
  };

  const checkMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setHasMicPermission(true);
      return true;
    } catch (error) {
      console.error("Microphone permission denied:", error);
      setHasMicPermission(false);
      return false;
    }
  };

  const joinChannel = async (channelName) => {
    try {
      const hasPermission = await checkMicPermission();
      if (!hasPermission) {
        alert("Microphone permission is required to join voice channels");
        return;
      }

      setIsLoading(true);
      
      // Get a random UID to avoid conflicts
      const uid = Math.floor(Math.random() * 1000000);
      const appId = import.meta.env.VITE_AGORA_APP_ID;
      
      // Get token from server
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/agora`, { 
        channelName,
        username: user.username,
        uid: uid
      });
      const { token } = res.data;
      
      // Set up Agora event handlers
      clientRef.current.on("user-published", handleUserPublished);
      clientRef.current.on("user-left", handleUserLeft);
      
      // Join the channel
      await clientRef.current.join(appId, channelName, null, uid);
      
      // Create and publish local audio track
      const track = await AgoraRTC.createMicrophoneAudioTrack();
      audioTracksRef.current.localTrack = track;
      await clientRef.current.publish(track);
      
      // Emit socket event to notify others
      socket.emit('user-voice-join', {
        uid: uid,
        username: user.username,
        imageUrl: user.imageUrl,
        channelName: channelName
      });
      
      setSelectedVoiceCh(channelName);
      setJoined(true);
      setIsLoading(false);
      connectAudio.play();
    } catch (error) {
      setIsLoading(false);
      console.error("Error joining channel: ", error);
      alert("Failed to join voice channel. Please check console for details.");
    }
  };

  const leaveChannel = async () => {
    try {
      if (!clientRef.current || !joined) {
        console.error("Not in a channel");
        return;
      }

      // Stop and close local track
      if (audioTracksRef.current.localTrack) {
        audioTracksRef.current.localTrack.stop();
        audioTracksRef.current.localTrack.close();
        
        try {
          await clientRef.current.unpublish(audioTracksRef.current.localTrack);
        } catch (err) {
          console.error("Error unpublishing:", err);
        }
      }

      // Leave the channel
      try {
        await clientRef.current.leave();
        clientRef.current.removeAllListeners();
        
        // Reinitialize event handlers when leaving
        clientRef.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      } catch (err) {
        console.error("Error leaving channel:", err);
      }
      
      // Reset audio tracks
      audioTracksRef.current = {
        localTrack: null,
        remoteTracks: {}
      };
      
      // Notify others through socket
      socket.emit('user-voice-left', { username: user.username });
      
      setJoined(false);
      setSelectedVoiceCh(null);
      leaveAudio.play();
    } catch (error) {
      console.error("Error in leaveChannel:", error);
    }
  };
  
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
              <TooltipProvider>
                <Tooltip open={showTextTooltip}>
                  <TooltipTrigger onClick={handleTextPlusClick}>
                    <PlusCircle size={16} className="cursor-pointer rounded-full hover:text-white hover:bg-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Coming not so soon</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
              {hasMicPermission === false && (
                <span className="text-red-500 text-xs">No mic access</span>
              )}
              <TooltipProvider>
                <Tooltip open={showVoiceTooltip}>
                  <TooltipTrigger onClick={handleVoicePlusClick}>
                    <PlusCircle size={16} className="cursor-pointer rounded-full hover:text-white hover:bg-gray-700" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Coming not so soon</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
            onClick={toggleMute} 
            className={`text-gray-400 hover:text-white ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} 
              ${isMuted ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400' : ''}`}
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