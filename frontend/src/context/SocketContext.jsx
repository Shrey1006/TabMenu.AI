import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? window.location.origin : 'http://localhost:5000');
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_URL;

export const SocketProvider = ({ children, role, table }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const s = io(SOCKET_URL, {
      query: { role: role || '', table: table || '' },
      transports: ['websocket', 'polling'],
    });
    setSocket(s);
    return () => s.disconnect();
  }, [role, table]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
