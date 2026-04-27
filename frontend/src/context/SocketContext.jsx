import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!user) {
      if (socket) { socket.disconnect(); setSocket(null); }
      return;
    }
    
    // Get backend URL from axios config
    const SOCKET_URL = 'https://chatterbox-backend-4v4p.onrender.com';
    
    console.log('🔌 Connecting to socket:', SOCKET_URL);
    
    const s = io(SOCKET_URL, { 
      transports: ['polling', 'websocket'], // Try polling first for mobile compatibility
      reconnection: true, 
      reconnectionDelay: 1000, 
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      timeout: 20000,
    });
    
    s.on('connect', () => {
      console.log('✅ Socket connected:', s.id);
      s.emit('user-online', user._id);
    });
    
    s.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
    });
    
    s.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });
    
    s.on('online-users', (users) => {
      console.log('👥 Online users updated:', users.length);
      setOnlineUsers(users);
    });
    
    setSocket(s);
    return () => { 
      console.log('🔌 Cleaning up socket connection');
      s.disconnect(); 
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
