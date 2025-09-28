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

// Admin notification interface
export interface Notification {
  _id: string;
  type: 'company_registration' | 'mentor_registration' | 'application_submitted' | 'application_approved' | 'application_rejected' | 'system' | 'session_booked';
  title: string;
  message: string;
  entityId?: string;
  createdAt: string;
  isRead?: boolean;
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

  // Admin notifications
  'admin-notification': (notification: Notification) => void;
  
  // Company notifications
  'company-notification': (notification: Notification) => void;

  // Student notifications
  'student-notification': (notification: Notification) => void;

  // Mock Interview events
  'interview-started': (data: any) => void;
  'interview-error': (data: { message: string }) => void;
  'ai-typing': (data: { message: string }) => void;
  'ai-feedback': (data: any) => void;
  'next-question': (data: any) => void;
  'generating-summary': (data: { message: string }) => void;
  'interview-completed': (data: any) => void;
  'interview-terminated': (data: any) => void;

  // Connection health
  'pong': () => void;
}

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;
  private currentSessionId: string | null = null;
  private adminNotificationsSubscribed: boolean = false;
  private companyNotificationsSubscribed: boolean = false;
  private mentorNotificationsSubscribed: boolean = false;
  private studentNotificationsSubscribed: boolean = false;
  private companyId: string | null = null;
  private mentorId: string | null = null;

  // Initialize socket connection
  connect(token: string): Promise<Socket> {
    return new Promise((resolve, reject) => {
      // If already connected with same token, return existing socket
      if (this.socket?.connected && this.token === token) {
        console.log('Socket already connected, reusing connection');
        resolve(this.socket);
        return;
      }

      // Disconnect existing socket if token changed
      if (this.socket && this.token !== token) {
        console.log('Token changed, disconnecting old socket');
        this.socket.disconnect();
        this.socket = null;
      }

      this.token = token;
      const serverUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

      console.log('Creating new socket connection to:', serverUrl);

      this.socket = io(serverUrl, {
        auth: {
          token: token
        },
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 10,
        timeout: 10000,
        forceNew: false // Allow reusing connections
      });

      this.socket.on('connect', () => {
        console.log('Socket connected successfully');
        resolve(this.socket!);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        reject(new Error(`Connection failed: ${error.message || error}`));
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        if (reason === 'io server disconnect') {
          // Server disconnected, try to reconnect
          this.socket?.connect();
        }
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('Socket reconnected after', attemptNumber, 'attempts');
      });

      this.socket.on('reconnect_error', (error) => {
        console.error('Socket reconnection error:', error);
      });

      // Set timeout for initial connection
      setTimeout(() => {
        if (!this.socket?.connected) {
          reject(new Error('Connection timeout'));
        }
      }, 15000);
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

  // Subscribe to admin notifications
  subscribeToAdminNotifications(): void {
    if (this.socket?.connected && !this.adminNotificationsSubscribed) {
      this.socket.emit('subscribe-admin-notifications');
      this.adminNotificationsSubscribed = true;
    }
  }

  // Unsubscribe from admin notifications
  unsubscribeFromAdminNotifications(): void {
    if (this.socket?.connected && this.adminNotificationsSubscribed) {
      this.socket.emit('unsubscribe-admin-notifications');
      this.adminNotificationsSubscribed = false;
    }
  }
  
  // Subscribe to company notifications
  subscribeToCompanyNotifications(companyId: string): void {
    if (this.socket?.connected && !this.companyNotificationsSubscribed) {
      this.companyId = companyId;
      this.socket.emit('subscribe-company-notifications', { companyId });
      this.companyNotificationsSubscribed = true;
    }
  }

  // Unsubscribe from company notifications
  unsubscribeFromCompanyNotifications(): void {
    if (this.socket?.connected && this.companyNotificationsSubscribed) {
      this.socket.emit('unsubscribe-company-notifications');
      this.companyNotificationsSubscribed = false;
      this.companyId = null;
    }
  }

  // Subscribe to mentor notifications
  subscribeToMentorNotifications(mentorId?: string): void {
    if (this.socket?.connected && !this.mentorNotificationsSubscribed) {
      if (mentorId) {
        this.mentorId = mentorId;
      }
      this.socket.emit('subscribe-mentor-notifications', { mentorId: this.mentorId });
      this.mentorNotificationsSubscribed = true;
    }
  }

  // Unsubscribe from mentor notifications
  unsubscribeFromMentorNotifications(): void {
    if (this.socket?.connected && this.mentorNotificationsSubscribed) {
      this.socket.emit('unsubscribe-mentor-notifications');
      this.mentorNotificationsSubscribed = false;
      this.mentorId = null;
    }}

  // Subscribe to student notifications
  subscribeToStudentNotifications(): void {
    if (this.socket?.connected && !this.studentNotificationsSubscribed) {
      this.socket.emit('subscribe-student-notifications');
      this.studentNotificationsSubscribed = true;
    }
  }

  // Unsubscribe from student notifications
  unsubscribeFromStudentNotifications(): void {
    if (this.socket?.connected && this.studentNotificationsSubscribed) {
      this.socket.emit('unsubscribe-student-notifications');
      this.studentNotificationsSubscribed = false;
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

  // Get admin notifications subscription status
  get isAdminNotificationsSubscribed(): boolean {
    return this.adminNotificationsSubscribed;
  }
  
  // Get company notifications subscription status
  get isCompanyNotificationsSubscribed(): boolean {
    return this.companyNotificationsSubscribed;
  }

  // Get student notifications subscription status
  get isStudentNotificationsSubscribed(): boolean {
    return this.studentNotificationsSubscribed;
  }
  
  // Get company ID
  get currentCompanyId(): string | null {
    return this.companyId;
  }

  // Get mentor notifications subscription status
  get isMentorNotificationsSubscribed(): boolean {
    return this.mentorNotificationsSubscribed;
  }
  
  // Get mentor ID
  get currentMentorId(): string | null {
    return this.mentorId;
  }

  // Notification event listeners
  onAdminNotification(callback: (notification: Notification) => void): void {
    if (this.socket) {
      this.socket.on('admin-notification', callback);
    }
  }

  onCompanyNotification(callback: (notification: Notification) => void): void {
    if (this.socket) {
      this.socket.on('company-notification', callback);
    }
  }

  onMentorNotification(callback: (notification: Notification) => void): void {
    if (this.socket) {
      this.socket.on('mentor-notification', callback);
    }
  }

  onStudentNotification(callback: (notification: Notification) => void): void {
    if (this.socket) {
      this.socket.on('student-notification', callback);
    }
  }


  // Ping server for connection health check
  ping(): void {
    if (this.socket?.connected) {
      this.socket.emit('ping');
    }
  }

  // Mock Interview methods
  startInterview(mockInterviewId: string): void {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('start-interview', { mockInterviewId });
  }

  submitAnswer(sessionId: string, answer: string, questionNumber: number, typingTime?: number): void {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('student-answer', { 
      sessionId, 
      answer, 
      questionNumber, 
      typingTime: typingTime || 0 
    });
  }

  terminateInterview(sessionId: string, reason: string): void {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('terminate-interview', { sessionId, reason });
  }

  getInterviewHistory(sessionId: string): void {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('get-interview-history', { sessionId });
  }

  // Get socket instance for direct access
  get socketInstance(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
export const socketService = new SocketService();

// Make it globally accessible for debugging and force reconnection
if (typeof window !== 'undefined') {
  (window as any).socketService = socketService;
}

export default socketService;