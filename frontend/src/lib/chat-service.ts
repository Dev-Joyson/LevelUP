/**
 * A simple chat service using WebSockets
 * 
 * This is a client-side implementation that can connect to a WebSocket server.
 * For development/demo purposes, you can use a free WebSocket service like:
 * - Socket.IO (https://socket.io/)
 * - Pusher (https://pusher.com/) - has a free tier
 * - Firebase Realtime Database - has a free tier
 */

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: Date
  isRead: boolean
  sessionId: string
}

export interface ChatUser {
  id: string
  name: string
  avatar?: string
  role: 'mentor' | 'student'
}

export interface ChatOptions {
  userId: string
  userName: string
  userAvatar?: string
  sessionId: string
  onMessage?: (message: ChatMessage) => void
  onConnectionStateChange?: (state: 'connecting' | 'connected' | 'disconnected' | 'error') => void
  onError?: (error: Error) => void
}

export class ChatService {
  private socket: WebSocket | null = null
  private options: ChatOptions
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5
  private reconnectTimeout: NodeJS.Timeout | null = null
  private messageQueue: ChatMessage[] = []
  
  constructor(options: ChatOptions) {
    this.options = options
  }
  
  /**
   * Connect to the WebSocket server
   * 
   * In a real implementation, you would connect to your WebSocket server.
   * For this example, we're using a mock implementation.
   */
  connect(serverUrl: string = 'wss://echo.websocket.org'): void {
    if (this.socket) {
      this.close()
    }
    
    try {
      if (this.options.onConnectionStateChange) {
        this.options.onConnectionStateChange('connecting')
      }
      
      // In a real implementation, you would connect to your WebSocket server
      // For this example, we're using a mock implementation
      this.mockWebSocketConnection()
      
    } catch (error) {
      if (this.options.onError) {
        this.options.onError(error as Error)
      }
      this.handleReconnect()
    }
  }
  
  /**
   * Mock WebSocket connection for demo purposes
   */
  private mockWebSocketConnection(): void {
    // Simulate connection established
    setTimeout(() => {
      if (this.options.onConnectionStateChange) {
        this.options.onConnectionStateChange('connected')
      }
      
      this.reconnectAttempts = 0
      
      // Send any queued messages
      while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift()
        if (message) {
          this.sendMessage(message.content)
        }
      }
    }, 500)
  }
  
  /**
   * Handle reconnection attempts
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
      
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout)
      }
      
      this.reconnectTimeout = setTimeout(() => {
        this.connect()
      }, delay)
    } else {
      if (this.options.onConnectionStateChange) {
        this.options.onConnectionStateChange('error')
      }
    }
  }
  
  /**
   * Send a message
   */
  sendMessage(content: string): ChatMessage {
    if (!content.trim()) {
      throw new Error('Message content cannot be empty')
    }
    
    const message: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      senderId: this.options.userId,
      senderName: this.options.userName,
      senderAvatar: this.options.userAvatar,
      content,
      timestamp: new Date(),
      isRead: false,
      sessionId: this.options.sessionId
    }
    
    // In a real implementation, you would send this message through the WebSocket
    // For this example, we'll simulate sending and receiving messages
    
    // If not connected, queue the message
    if (!this.socket) {
      this.messageQueue.push(message)
      return message
    }
    
    // Simulate sending message
    setTimeout(() => {
      // Simulate receiving a response after 1-2 seconds
      if (Math.random() > 0.3) { // 70% chance of getting a response
        setTimeout(() => {
          const responseMessage: ChatMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            senderId: this.options.userId === 'mentor' ? 'student' : 'mentor',
            senderName: this.options.userId === 'mentor' ? 'Student' : 'Mentor',
            senderAvatar: '/placeholder.svg',
            content: this.generateAutoResponse(content),
            timestamp: new Date(),
            isRead: false,
            sessionId: this.options.sessionId
          }
          
          if (this.options.onMessage) {
            this.options.onMessage(responseMessage)
          }
        }, 1000 + Math.random() * 1000)
      }
    }, 200)
    
    return message
  }
  
  /**
   * Generate an automatic response for demo purposes
   */
  private generateAutoResponse(message: string): string {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello there! How can I help you today?"
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('guidance')) {
      return "I'd be happy to help. Could you please provide more details about what you need assistance with?"
    }
    
    if (lowerMessage.includes('thank')) {
      return "You're welcome! Let me know if you need anything else."
    }
    
    if (lowerMessage.includes('code') || lowerMessage.includes('programming')) {
      return "That's an interesting coding question. Let me think about it for a moment..."
    }
    
    if (lowerMessage.includes('job') || lowerMessage.includes('career') || lowerMessage.includes('interview')) {
      return "Career development is important. I can definitely provide some insights based on my experience in the industry."
    }
    
    // Default response
    return "I understand. Let's discuss this further. Could you elaborate on your thoughts?"
  }
  
  /**
   * Mark a message as read
   */
  markAsRead(messageId: string): void {
    // In a real implementation, you would send this to the server
    console.log(`Marking message ${messageId} as read`)
  }
  
  /**
   * Close the connection
   */
  close(): void {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
    
    if (this.options.onConnectionStateChange) {
      this.options.onConnectionStateChange('disconnected')
    }
  }
}
