import React, { useEffect, useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Crown, CircleUser, Loader2 } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import axios from 'axios';
import { Separator } from '../ui/separator';
import socket from '../chat/socket';

const MembersSidebar = () => {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [offlineUsers, setOfflineUsers] = useState([]);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users`)
      .then((res) => {
        const filteredMembers = res.data.map(({ username: name, first_name: firstname = '', last_name: lastname = '', imageUrl = '' }) => {
          if (name) return {
            name,
            firstname,
            lastname,
            imageUrl,
            role: 'member',
            status: 'offline',
          };
          return null;
        }).filter(Boolean);
        setMembers(filteredMembers);
        setOfflineUsers(filteredMembers); // Initially all users are offline
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!socket.connected) {
      socket.auth = { username: localStorage.getItem('username') };
      socket.connect();
    }

    // Request current online users when component loads
    socket.emit('emit-online-users');

    // Listen for online user updates
    socket.on('update-online-users', (onlineUsers) => {
      console.log('Online users updated:', onlineUsers);
      setOnlineUsers(onlineUsers);
    });

    // Listen for connection errors
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return () => {
      socket.off('update-online-users');
      socket.off('connect_error');
    };
  }, []);

  // Update online/offline lists when status changes
  useEffect(() => {
    const updateUserLists = () => {
      const online = members.filter(member => onlineUsers.includes(member.name));
      const offline = members.filter(member => !onlineUsers.includes(member.name));
      setOfflineUsers(offline);
    };

    updateUserLists();
  }, [onlineUsers, members]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  // Status color mapping
  const statusColor = {
    online: 'bg-green-500',
    idle: 'bg-yellow-500',
    dnd: 'bg-red-500',
    offline: 'bg-gray-500',
  };

  return (
    <div className="w-60 h-full bg-gray-800 flex flex-col">
      <div className="p-3">
        <h3 className="text-xs font-semibold uppercase text-gray-400 px-2">
          Members — {members.length}
        </h3>
      </div>
      <Separator className='w-full'/>
      
      <ScrollArea className="flex-1">
        <div className="px-2 pb-4">
          {/* Online Users Section */}
          <div className="mb-4">
            <h4 className="text-xs uppercase font-semibold text-gray-400 px-2 mb-1">
              Online — {onlineUsers.length}
            </h4>
            {members
              .filter(member => onlineUsers.includes(member.name))
              .map((member) => (
                <HoverCard key={member.name} openDelay={10} closeDelay={10}>
                  <HoverCardTrigger asChild>
                    <div 
                      className="flex items-center px-2 py-1 rounded cursor-pointer hover:bg-gray-700"
                    >
                      <div className="relative mr-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                          {member.imageUrl ? <img src={member.imageUrl} alt='ProPic' className='rounded-full'/> : 
                            <span className="text-white text-sm">{member.name.substring(0, 1)}</span>
                          }
                        </div>
                        <div className={`absolute bottom-0 z-2 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${statusColor['online']}`}></div>
                      </div>
                      <span className="text-gray-300 truncate">{member.name}</span>
                      {member.role === 'owner' && <Crown size={14} className="ml-1 text-yellow-500" />}
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent 
                    className="w-85 relative bottom-[60px] p-0.5 right-[65%] border-0 animate-popup"
                    sideOffset={5}
                    align='end'
                  >
                    <div className="flex space-x-4 bg-slate-700 p-4 mr-3.5 rounded-sm">
                      <div className="relative mr-4 h-8">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                          {member.imageUrl ? <img src={member.imageUrl} alt='ProPic' className='rounded-full'/> : 
                            <span className="text-white text-sm">{member.name.substring(0, 1)}</span>
                          }
                        </div>
                        <div className={`absolute bottom-0 z-2 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${statusColor['online']}`}></div>
                      </div>
                      <div className="space-y-1 flex-1">
                        <h4 className="text-sm font-semibold">{member.name}</h4>
                        {(member.firstname || member.lastname) && (
                          <p className="text-sm text-gray-500">
                            {`${member.firstname} ${member.lastname}`.trim()}
                          </p>
                        )}
                        <p className="text-sm text-gray-400">
                          Role: {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </p>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ))}
          </div>

          {/* Offline Users Section */}
          <div className="mb-4">
            <h4 className="text-xs uppercase font-semibold text-gray-400 px-2 mb-1">
              Offline — {offlineUsers.length}
            </h4>
            {offlineUsers.map((member) => (
              <HoverCard key={member.name} openDelay={10} closeDelay={10}>
                <HoverCardTrigger asChild>
                  <div 
                    className="flex items-center px-2 py-1 rounded cursor-pointer hover:bg-gray-700"
                  >
                    <div className="relative mr-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                        {member.imageUrl ? <img src={member.imageUrl} alt='ProPic' className='rounded-full'/> : 
                          <span className="text-white text-sm">{member.name.substring(0, 1)}</span>
                        }
                      </div>
                      <div className={`absolute bottom-0 z-2 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${statusColor['offline']}`}></div>
                    </div>
                    <span className="text-gray-300 truncate">{member.name}</span>
                    {member.role === 'owner' && <Crown size={14} className="ml-1 text-yellow-500" />}
                  </div>
                </HoverCardTrigger>
                <HoverCardContent 
                  className="w-85 relative bottom-[60px] p-0.5 right-[65%] border-0 animate-popup"
                  sideOffset={5}
                  align='end'
                >
                  <div className="flex space-x-4 bg-slate-700 p-4 mr-3.5 rounded-sm">
                    <div className="relative mr-4 h-8">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                        {member.imageUrl ? <img src={member.imageUrl} alt='ProPic' className='rounded-full'/> : 
                          <span className="text-white text-sm">{member.name.substring(0, 1)}</span>
                        }
                      </div>
                      <div className={`absolute bottom-0 z-2 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${statusColor['offline']}`}></div>
                    </div>
                    <div className="space-y-1 flex-1">
                      <h4 className="text-sm font-semibold">{member.name}</h4>
                      {(member.firstname || member.lastname) && (
                        <p className="text-sm text-gray-500">
                          {`${member.firstname} ${member.lastname}`.trim()}
                        </p>
                      )}
                      <p className="text-sm text-gray-400">
                        Role: {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </p>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default MembersSidebar;
