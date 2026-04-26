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
    const s = io('http://localhost:5000', { transports: ['websocket'], reconnection: true, reconnectionDelay: 1000, reconnectionDelayMax: 5000 });
    s.on('connect', () => {
      s.emit('user-online', user._id);
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
