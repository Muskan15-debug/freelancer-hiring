import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) { setSocket(null); return; }

    const newSocket = io('/', {
      auth: { token: document.cookie.split('accessToken=')[1]?.split(';')[0] || '' },
      withCredentials: true,
    });

    newSocket.on('connect', () => console.log('Socket connected'));
    newSocket.on('disconnect', () => console.log('Socket disconnected'));

    setSocket(newSocket);
    return () => newSocket.close();
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
