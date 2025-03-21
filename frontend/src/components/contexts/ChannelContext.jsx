import { createContext, useContext, useState } from 'react';

const ChannelContext = createContext();

export function ChannelProvider({ children }) {
    const [selectedChannel, setSelectedChannel] = useState({});

    return (
        <ChannelContext.Provider value={{ selectedChannel, setSelectedChannel }}>
            {children}
        </ChannelContext.Provider>
    );
}

export const useChannel = () => useContext(ChannelContext);
