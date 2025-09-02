import { io, Socket } from 'socket.io-client';

interface ChatMessage {
  _id: string;
  sessionId: string;
  senderId: string;
  senderEmail: string;
  senderRole: 'student' | 'mentor';
  message: string;
  messageType: 'text' | 'system';
  createdAt: string;
  readBy: Array<{
    userId: string;
    readAt: string;
  }>;
}

interface OnlineUser {
  userId: string;
  role: 'student' | 'mentor';
  email: string;
  socketId: string;
}

interface SessionInfo {
  _id: string;
  sessionId: string;
  sessionTypeName: string;
  duration: number;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  student: {
    _id: string;
    name: string;
    email: string;
  };
  mentor: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
}

interface SessionTime {
  start: Date;
  end: Date;
  current: Date;
}

export interface SocketEvents {
  // Connection events
  'session-joined': (data: { sessionId: string; message: string; sessionInfo: SessionInfo; sessionTime: SessionTime }) => void;
  'access-denied': (data: { message: string; sessionTime?: SessionTime }) => void;
  'error': (data: { message: string }) => void;

  // Message events
  'new-message': (message: ChatMessage) => void;
  'message-read': (data: { messageId: string; readBy: { userId: string; email: string; role: string; readAt: string } }) => void;

  // User status events
  'user-online': (user: { userId: string; role: string; email: string; name?: string }) => void;
  'user-offline': (user: { userId: string; role: string; email: string; name?: string }) => void;
  'online-users': (data: { users: OnlineUser[] }) => void;

  // Typing events
  'user-typing': (user: { userId: string; email: string; role: string; name?: string }) => void;
  'user-stopped-typing': (user: { userId: string; email: string; role: string; name?: string }) => void;

  // Connection health
  'pong': () => void;
}

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;
  private currentSessionId: string | null = null;

  // Initialize socket connection
  connect(token: string): Promise<Socket> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve(this.socket);
        return;
      }

      this.token = token;
      const serverUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

      this.socket = io(serverUrl, {
        auth: {
          token: token
        },
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000
      });

      this.socket.on('connect', () => {
        console.log('Socket connected successfully');
        resolve(this.socket!);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });
    });
  }

  // Join a session chat room
  joinSession(sessionId: string): void {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    this.currentSessionId = sessionId;
    this.socket.emit('join-session', { sessionId });
  }

  // Leave current session
  leaveSession(): void {
    if (this.socket?.connected && this.currentSessionId) {
      this.socket.emit('leave-session');
      this.currentSessionId = null;
    }
  }

  // Send a message
  sendMessage(sessionId: string, message: string): void {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('send-message', { sessionId, message });
  }

  // Send typing indicators
  startTyping(sessionId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('typing-start', { sessionId });
    }
  }

  stopTyping(sessionId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('typing-stop', { sessionId });
    }
  }

  // Mark message as read
  markMessageRead(messageId: string, sessionId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('mark-message-read', { messageId, sessionId });
    }
  }

  // Event listeners
  on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
    if (this.socket) {
      this.socket.on(event as string, callback as any);
    }
  }

  off<K extends keyof SocketEvents>(event: K, callback?: SocketEvents[K]): void {
    if (this.socket) {
      this.socket.off(event as string, callback as any);
    }
  }

  // Disconnect socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentSessionId = null;
    }
  }

  // Get connection status
  get isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get current session ID
  get sessionId(): string | null {
    return this.currentSessionId;
  }

  // Ping server for connection health check
  ping(): void {
    if (this.socket?.connected) {
      this.socket.emit('ping');
    }
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;