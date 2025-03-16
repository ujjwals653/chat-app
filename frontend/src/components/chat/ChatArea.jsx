import { useEffect, useRef, useState } from 'react';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Hash, AtSign, Smile, Paperclip, Gift, Send } from "lucide-react";
import axios from 'axios';
import { useUserCon } from '../contexts/UserContext';
import socket from './socket';

// Message component
const ChatMessage = ({ message, newMessage }) => {
  return (
    <div className={`flex py-2 px-4 hover:bg-gray-800 ${newMessage ? 'animate-slide-in' : ''}`}>
      <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center mr-3 flex-shrink-0">
        <span className="text-white text-sm">{message.username.substring(0, 1)}</span>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center">
          <span className="font-medium text-indigo-300 mr-2">{message.username}</span>
          <span className="text-xs text-gray-400">{`Sent at ${message.updatedAt.slice(11, 16)}`}</span>
        </div>
        <p className="text-gray-200">{message.content}</p>
      </div>
    </div>
  );
};

const ChatArea = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const sendbtn = useRef(null);
  const scrollAreaRef = useRef(null);
  const {user} = useUserCon();

  useEffect(() => {
    // Fetch messages from the server
    async function fetchMessages() {
      try {
        const res = await axios.get("http://localhost:5000/api/messages");
        setMessages(res.data);
        console.log(res.data);
      } catch (error) {
        console.error("Error in fetching messages: ", error);
      }
    }
    fetchMessages();

    const handleMessageReceive = (message) => {
      setMessages((prev) => [...prev, { ...message, newMessage: true }]);
      // Scroll to bottom when a new message is received
    };

    socket.on("receive-message", handleMessageReceive);

    return () => {
        socket.off("receive-message", handleMessageReceive);
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      const viewport = document.querySelector("[data-radix-scroll-area-viewport]");
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }, 100);
  }, [messages]);

  const btnChangeColor = (yeorne) => {
    if (yeorne) {
      sendbtn.current.classList.add('text-gray-200');
      sendbtn.current.classList.add('bg-indigo-500');
    } else {
      sendbtn.current.classList.remove('text-gray-200');
      sendbtn.current.classList.remove('bg-indigo-500');
    }
  }

  const handleChange = (e) => {
    setText(e.target.value);
    btnChangeColor(e.target.value);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text === "") return;

    const message = {
      username: user.username,
      content: text,
    };
    
    async function postMessage() {
      try {
        const res = await axios.post("http://localhost:5000/api/messages", message);
        socket.emit('send-message', res.data); // Emit the message after successful post
        setText("");
        btnChangeColor(false);
      } catch (error) {
        console.error("Error in posting message: ", error);
      }
    }
    postMessage();
  }

  return (
    <div className="flex flex-col h-full">
      {/* Channel Header */}
      <div className="h-12 border-b border-gray-800 flex items-center px-4 shadow-sm">
        <Hash size={20} className="mr-2 text-gray-400" />
        <span className="font-bold">general</span>
      </div>
      
      {/* Messages Area */}
      <ScrollArea className="flex-1 rotate-180 overflow-y-scroll">
        <div className="py-4 flex flex-col justify-end rotate-180" ref={scrollAreaRef}>
          {messages.map((message, i) => (
            <ChatMessage key={message._id} message={message} newMessage={(i+1) === messages.length} />
          ))}
        </div>
        <ScrollBar orientation='vertical' />
      </ScrollArea>
      
      {/* Message Input */}
      <div className="px-4 py-4">
        <div className="relative">
          <form method='post' action='http://localhost:5000/api/messages' onSubmit={handleSubmit}>
            <Input
              placeholder="Message #general" 
              className="bg-gray-700 border-none text-gray-200 px-4 pr-32 py-6"
              value={text}
              onChange={(e) => handleChange(e)}
            />
          </form>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2 text-gray-400">
            <div className='rounded-full p-2 transition' ref={sendbtn}>
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
