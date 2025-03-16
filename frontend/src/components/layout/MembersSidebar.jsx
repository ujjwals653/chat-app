import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Crown, CircleUser } from "lucide-react";

const MembersSidebar = () => {
  // Dummy members data with roles
  const members = [
    { id: '1', name: 'JohnDoe', role: 'owner', status: 'online' },
    { id: '2', name: 'JaneSmith', role: 'admin', status: 'online' },
    { id: '3', name: 'MikeBrown', role: 'mod', status: 'idle' },
    { id: '4', name: 'SarahWilson', role: 'member', status: 'dnd' },
    { id: '5', name: 'AlexJohnson', role: 'member', status: 'offline' },
    { id: '6', name: 'EmilyDavis', role: 'member', status: 'online' },
    { id: '7', name: 'ChrisThomas', role: 'member', status: 'online' },
    { id: '8', name: 'RachelGreen', role: 'member', status: 'idle' },
  ];

  // Group members by role
  const roles = {
    owner: { title: 'Owner', members: members.filter(m => m.role === 'owner') },
    admin: { title: 'Admins', members: members.filter(m => m.role === 'admin') },
    mod: { title: 'Moderators', members: members.filter(m => m.role === 'mod') },
    member: { title: 'Members', members: members.filter(m => m.role === 'member') },
  };

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
        <h3 className="text-xs font-semibold uppercase text-gray-400 px-2">Members — {members.length}</h3>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="px-2 pb-4">
          {Object.entries(roles).map(([roleKey, roleData]) => (
            roleData.members.length > 0 && (
              <div key={roleKey} className="mb-4">
                <h4 className="text-xs uppercase font-semibold text-gray-400 px-2 mb-1">
                  {roleData.title} — {roleData.members.length}
                </h4>
                
                {roleData.members.map((member) => (
                  <div 
                    key={member.id}
                    className="flex items-center px-2 py-1 rounded cursor-pointer hover:bg-gray-700"
                  >
                    <div className="relative mr-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                        <span className="text-white text-sm">{member.name.substring(0, 1)}</span>
                      </div>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${statusColor[member.status]}`}></div>
                    </div>
                    <span className="text-gray-300 truncate">{member.name}</span>
                    {member.role === 'owner' && <Crown size={14} className="ml-1 text-yellow-500" />}
                  </div>
                ))}
              </div>
            )
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MembersSidebar;
