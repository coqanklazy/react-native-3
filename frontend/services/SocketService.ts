import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';
import { API_BASE_URL, BASE_URL } from './api';

// Lấy URL từ BASE_URL đã có sẵn trong api.ts
const SOCKET_URL = BASE_URL;

let socket: Socket | null = null;

// Registry cho các listeners thông báo
const notificationListeners = new Set<(data: any) => void>();

export const connectSocket = (token: string) => {
  if (socket?.connected) return socket;

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    console.log('🔌 [SOCKET] Connected:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('🔌 [SOCKET] Disconnected');
  });

  socket.on('connect_error', (e) => {
    console.log('🔌 [SOCKET] Error:', e.message);
  });

  // Khi có thông báo từ server, gửi tới tất cả listeners
  socket.on('notification', (data: any) => {
    console.log('🔔 [SOCKET] Notification received:', data?.title);
    notificationListeners.forEach(cb => cb(data));
  });

  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};

export const getSocket = () => socket;

// Đăng ký nhận thông báo
export const onNotification = (callback: (data: any) => void): (() => void) => {
  notificationListeners.add(callback);
  return () => {
    notificationListeners.delete(callback);
  };
};

// Export mặc định để tương thích với các component cũ nếu cần
export default {
  connect: (token?: string) => token && connectSocket(token),
  disconnect: disconnectSocket,
  on: (event: string, cb: any) => {
    if (event === 'notification') return onNotification(cb);
  }
};
