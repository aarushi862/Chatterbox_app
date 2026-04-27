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
    
    // Use production backend URL for socket connection
    const SOCKET_URL = import.meta.env.VITE_API_URL || 'https://chatterbox-backend-4v4p.onrender.com';
    
    const s = io(SOCKET_URL, { 
      transports: ['websocket', 'polling'],
      reconnection: true, 
      reconnectionDelay: 1000, 
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });
    
    s.on('connect', () => {
      console.log('✅ Socket connected');
      s.emit('user-online', user._id);
    });
    
    s.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });
    
    s.on('online-users', (users) => setOnlineUsers(users));
    
    setSocket(s);
    return () => { s.disconnect(); };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
