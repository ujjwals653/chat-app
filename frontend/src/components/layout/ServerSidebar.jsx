import { useState } from 'react';
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Logo from '@/../public/logo.png'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ServerSidebar = () => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handlePlusClick = (e) => {
    e.stopPropagation();
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 2000);
  };

  // Dummy server data
  const servers = [
    { id: '1', name: 'General', initial: 'G' },
    { id: '2', name: 'Gaming', initial: 'G' },
    { id: '3', name: 'Movies', initial: 'M' },
    { id: '4', name: 'Development', initial: 'D' },
    { id: '5', name: 'Music', initial: 'M' },
  ];

  return (
    <div className="w-17 h-full flex flex-col items-center py-3 bg-gray-950">

      {/* Logo Button */}
      <div className="flex items-center justify-center h-13 w-13 ml-1">
        <img src={Logo} alt='L' className='object-fill'/>
      </div>

      <Separator className="w-10 my-2 bg-gray-800" />

      <ScrollArea className="flex-1 w-full">
        <div className="flex flex-col items-center gap-3 px-3 py-2">
          {servers.map((server) => (
            <Button 
              key={server.id}
              variant="ghost" 
              className="h-12 w-12 rounded-full bg-gray-700 hover:bg-indigo-600 transition"
            >
              <span className="text-white text-xl font-normal">{server.initial}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>

      <div className="mt-auto">
        <TooltipProvider>
          <Tooltip open={showTooltip}>
            <TooltipTrigger onClick={handlePlusClick}>
              <Button variant="ghost" size="icon" className="rounded-full text-green-500 hover:bg-gray-800">
                <PlusCircle size={24} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Coming not so soon</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default ServerSidebar;
