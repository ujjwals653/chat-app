import { useEffect, useRef, useState } from 'react';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Hash, AtSign, Smile, Paperclip, Gift, Send, Menu, Users, Loader2, Trash2 } from "lucide-react";
import axios from 'axios';
import { useUserCon } from '../contexts/UserContext';
import socket from './socket';
import { useChannel } from '../contexts/ChannelContext';
import soundEffect from '../../assets/sound.mp3';

// Message component
const ChatMessage = ({ message, newMessage, currentUser }) => {
  const handleDelete = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/messages/delete`, {
        messageId: message.messageId
      });
      // Socket emit could be added here to notify other users of deletion
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  return (
    <div className={`flex py-2 px-4 hover:bg-gray-800 group relative ${newMessage ? 'animate-slide-in' : ''}`}>
      <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
        {message.imageURL ? (
          <img src={message.imageURL} alt="Message attachment" className="rounded-full" />
        ) : <span className="text-white text-sm">{message.username.substring(0, 1)}</span>}
      </div>
      <div className="flex flex-col flex-grow">
        <div className="flex items-center">
          <span className="font-medium text-indigo-300 mr-2">{message.username}</span>
          {message.username === currentUser ?
            <span className='font-light text-indigo-300 opacity-70 underline underline-offset-3 mr-2 cursor-pointer'>You</span>
            : ''}
          <span className="text-xs text-gray-400">{`Sent at ${message.updatedAt.slice(11, 16)}`}</span>
        </div>
        <p className="text-gray-200">{message.content}</p>
      </div>
      {message.username === currentUser && (
        <button 
          onClick={handleDelete}
          className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  );
};

// Loading component
const LoadingScreen = () => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
    </div>
  );
};

// Welcome component
const WelcomeScreen = ({ channelName }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <Hash size={48} className="text-indigo-500 mb-4" />
      <h1 className="text-2xl font-bold text-gray-200 mb-2">Welcome to #{channelName}!</h1>
      <p className="text-gray-400 text-center max-w-md">
        This is the start of the #{channelName} channel. Start the conversation by sending a message!
      </p>
    </div>
  );
};

const ChatArea = ({ showMembers, setShowMembers, showLeftSidebar, setShowLeftSidebar }) => {
  const {selectedChannel} = useChannel();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [timeoutSeconds, setTimeoutSeconds] = useState(0);
  const sendbtn = useRef(null);
  const scrollAreaRef = useRef(null);
  const {user} = useUserCon();
  const audioRef = useRef(new Audio(soundEffect));
  const inputRef = useRef(null);

  useEffect(() => {
    // Fetch messages from the server
    async function fetchMessages() {
      try {
        setIsLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/messages?channel=${selectedChannel.name}`);
        setMessages(res.data);
        setIsLoading(false);
        console.log(res.data);
      } catch (error) {
        console.error("Error in fetching messages: ", error);
        setIsLoading(false);
      }
    }
    fetchMessages();

    const handleMessageReceive = (message) => {
      setMessages((prev) => [...prev, { ...message, newMessage: true }]);
      audioRef.current.play().catch(e => console.log('Audio playback failed:', e));
    };

    socket.on("receive-message", handleMessageReceive);

    return () => {
        socket.off("receive-message", handleMessageReceive);
    };
  }, [selectedChannel.name]);

  // Add focus handler for keyboard events
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ignore if typing in input or timer is active
      if (document.activeElement === inputRef.current || timeoutSeconds > 0) return;
      inputRef.current?.focus();
    };

    window.addEventListener('keydown', handleKeyPress);
    // Focus input on initial load
    inputRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [timeoutSeconds]);

  // Add timeout countdown function
  const startTimeout = () => {
    setTimeoutSeconds(3);
    const interval = setInterval(() => {
      setTimeoutSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          inputRef.current?.focus(); // Focus when timer ends
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text === "" || timeoutSeconds > 0) return;

    const message = {
      username: user?.username || "Anonymous", // Fallback to "Anonymous"
      content: text,
      channelId: selectedChannel.name || ' ',
      isAnonymous: user.username.substring(0,4)=='anon' ? true : false,
      imageURL: user.imageUrl || null,
      messageId: Math.random().toString(36).substring(2, 10), // Generate random 8-character ID
    };

    // Send message to the server
    async function postMessage() {
      try {
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/messages`, message);
        socket.emit('send-message', res.data); // Emit the message after successful post to DB
        setText("");
        btnChangeColor(false);
        startTimeout(); // Start the timeout after sending
      } catch (error) {
        console.error("Error in posting message: ", error);
      }
    }
    postMessage();
  }

  // Style management funtions
  const handleChange = (e) => {
    setText(e.target.value);
    btnChangeColor(e.target.value);
  }

  const btnChangeColor = (yeorne) => {
    if (yeorne) {
      sendbtn.current.classList.add('text-gray-200');
      sendbtn.current.classList.add('bg-indigo-500');
    } else {
      sendbtn.current.classList.remove('text-gray-200');
      sendbtn.current.classList.remove('bg-indigo-500');
    }
  }

  // For handling auto-scroll
  useEffect(() => {
    const scrollToBottom = () => {
      const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: 'smooth'
        });
      }
    };

    // Scroll when messages change or when loading completes
    if (!isLoading) {
      scrollToBottom();
    }
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-full">
      {/* Channel Header */}
      <div className="h-12 border-b border-gray-800 flex items-center px-4 shadow-sm">
        {!showLeftSidebar && (
          <button
            onClick={() => setShowLeftSidebar(true)}
            className="md:hidden p-2 text-gray-400 opacity-80 hover:opacity-100 transition-opacity"
          >
            <Menu size={26} />
          </button>
        )}
        <Hash size={20} className="mr-1 text-gray-400" />
        <span className="font-bold">{selectedChannel.name}</span>
        <div className="ml-auto">
          {!showMembers && (
            <button
              onClick={() => setShowMembers(true)}
              className="lg:hidden p-2 text-gray-400 opacity-80 hover:opacity-100 transition-opacity"
            >
              <Users size={24} />
            </button>
          )}
        </div>
      </div>
      
      {/* Messages Area */}
      <ScrollArea className="flex-1 overflow-y-scroll" ref={scrollAreaRef}>
        <WelcomeScreen channelName={selectedChannel.name} />
        {isLoading ? (
          <div className="rotate-180">
            <LoadingScreen />
          </div>
        ) : (
          <div className="py-4 flex flex-col justify-end">
            {messages.map((message, i) => (
              <ChatMessage key={message.messageId} message={message} currentUser={user.username} newMessage={(i+1) === messages.length} />
            ))}
          </div>
        )}
      </ScrollArea>
      
      {/* Message Input */}
      <div className="px-4 py-4">
        <div className="relative">
          <form method='post' onSubmit={handleSubmit}>
            <Input
              ref={inputRef}
              placeholder={
                timeoutSeconds > 0
                  ? `Wait for ${timeoutSeconds} seconds before messaging again`
                  : isLoading
                  ? "Loading messages..."
                  : `Message #${selectedChannel.name}`
              }
              className="bg-gray-700 border-none text-gray-200 px-4 pr-32 py-6"
              value={text}
              onChange={(e) => handleChange(e)}
              disabled={isLoading || timeoutSeconds > 0}
            />
          </form>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2 text-gray-400">
            <div className={`rounded-full p-2 transition ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} ref={sendbtn} onClick={!isLoading ? handleSubmit : undefined}>
              <Send size={20} className="cursor-pointer hover:text-gray-200"/>
            </div>
            <Paperclip size={20} className="cursor-pointer hover:text-gray-200" />
            <Gift size={20} className="cursor-pointer hover:text-gray-200" />
            <Smile size={20} className="cursor-pointer hover:text-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
