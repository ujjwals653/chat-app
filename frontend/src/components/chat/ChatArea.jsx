import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Hash, AtSign, Smile, Paperclip, Gift } from "lucide-react";

// Message component
const ChatMessage = ({ message }) => {
  
  return (
    <div className="flex py-2 px-4 hover:bg-gray-800">
      <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center mr-3 flex-shrink-0">
        <span className="text-white text-sm">{message.author.substring(0, 1)}</span>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center">
          <span className="font-medium text-indigo-300 mr-2">{message.author}</span>
          <span className="text-xs text-gray-400">{message.time}</span>
        </div>
        <p className="text-gray-200">{message.content}</p>
      </div>
    </div>
  );
};

const ChatArea = () => {
  // Dummy messages
  const messages = [
    { id: '1', author: 'JohnDoe', content: 'Hey everyone! How are you doing today?', time: 'Today at 10:15 AM' },
    { id: '2', author: 'JaneSmith', content: 'I\'m doing great! Working on my React project.', time: 'Today at 10:16 AM' },
    { id: '3', author: 'MikeBrown', content: 'Nice! I\'m learning Vite + React too.', time: 'Today at 10:18 AM' },
    { id: '4', author: 'SarahWilson', content: 'Discord clone? That sounds challenging but fun!', time: 'Today at 10:20 AM' },
    { id: '5', author: 'JohnDoe', content: 'Yeah, using shadcn/ui makes it much easier though!', time: 'Today at 10:22 AM' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Channel Header */}
      <div className="h-12 border-b border-gray-800 flex items-center px-4 shadow-sm">
        <Hash size={20} className="mr-2 text-gray-400" />
        <span className="font-bold">general</span>
      </div>
      
      {/* Messages Area */}
      <ScrollArea className="flex-1">
        <div className="py-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>
      </ScrollArea>
      
      {/* Message Input */}
      <div className="px-4 py-4">
        <div className="relative">
          <Input
            placeholder="Message #general" 
            className="bg-gray-700 border-none text-gray-200 px-4 pr-32 py-6"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2 text-gray-400">
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
