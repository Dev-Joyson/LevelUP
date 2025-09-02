"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { socketService } from '@/lib/socket-service'
import axios from 'axios'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { 
  Send, 
  ArrowLeft, 
  Clock, 
  CheckCheck, 
  User,
  Circle,
  Loader2,
  AlertTriangle 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader } from '@/components/common/Loader'

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
  isReadBy?: boolean;
}

interface OnlineUser {
  userId: string;
  role: 'student' | 'mentor';
  email: string;
  name?: string;
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

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const { user, token, loading: authLoading } = useAuth()
  
  // Fallback: Check localStorage directly if useAuth fails
  const getFallbackUser = () => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          return JSON.parse(storedUser)
        } catch (error) {
          console.error('Error parsing stored user:', error)
        }
      }
    }
    return null
  }
  
  const effectiveUser = user || getFallbackUser()
  
  const sessionId = params?.sessionId as string
  
  // State management
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null)
  const [sessionTime, setSessionTime] = useState<SessionTime | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [typingUsers, setTypingUsers] = useState<{email: string, name: string}[]>([])
  const [error, setError] = useState<string | null>(null)
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const messageInputRef = useRef<HTMLInputElement>(null)

  // Utility function to deduplicate messages
  const deduplicateMessages = (messages: ChatMessage[]): ChatMessage[] => {
    const seen = new Set<string>()
    return messages.filter(message => {
      if (seen.has(message._id)) {
        return false
      }
      seen.add(message._id)
      return true
    })
  }

  // Scroll to bottom of messages (only within chat container)
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    }
  }, [])

  // Load chat history
  const loadChatHistory = useCallback(async () => {
    if (!token || !sessionId) return

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
      const response = await axios.get(`${API_BASE_URL}/api/chat/session/${sessionId}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data?.messages) {
        setMessages(deduplicateMessages(response.data.messages))
        setSessionInfo(response.data.sessionInfo)
        setSessionTime(response.data.sessionTime)
        setTimeout(scrollToBottom, 100)
      }
    } catch (error: any) {
      console.error('Error loading chat history:', error)
      if (error.response?.status === 403) {
        setError(error.response?.data?.message || 'Access denied to this session')
        if (error.response?.data?.sessionTime) {
          setSessionTime(error.response.data.sessionTime)
        }
      } else {
        setError('Failed to load chat history')
      }
    }
  }, [token, sessionId, scrollToBottom])

  // Track if chat is already initialized to prevent duplicates
  const chatInitialized = useRef(false)

  // Initialize socket connection and join session
  const initializeChat = useCallback(async () => {
    if (!token || !sessionId || chatInitialized.current) return

    try {
      setLoading(true)
      chatInitialized.current = true
      
      // Connect to socket
      await socketService.connect(token)
      setConnected(true)

      // Remove any existing listeners to prevent duplicates
      socketService.off('session-joined')
      socketService.off('access-denied')
      socketService.off('error')
      socketService.off('new-message')
      socketService.off('user-online')
      socketService.off('user-offline')
      socketService.off('online-users')
      socketService.off('user-typing')
      socketService.off('user-stopped-typing')
      socketService.off('message-read')

      // Set up event listeners
      socketService.on('session-joined', (data) => {
        console.log('Successfully joined session:', data)
        setSessionInfo(data.sessionInfo)
        setSessionTime(data.sessionTime)
        toast.success('Connected to session chat')
      })

      socketService.on('access-denied', (data) => {
        console.error('Access denied:', data)
        setError(data.message)
        if (data.sessionTime) {
          setSessionTime(data.sessionTime)
        }
        toast.error(data.message)
      })

      socketService.on('error', (data) => {
        console.error('Socket error:', data)
        toast.error(data.message)
      })

      socketService.on('new-message', (message) => {
        setMessages(prev => {
          // Check if message already exists to prevent duplicates
          const messageExists = prev.some(existingMessage => existingMessage._id === message._id)
          if (messageExists) {
            return prev
          }
          return [...prev, message]
        })
        setTimeout(scrollToBottom, 100)
        
        // Mark message as read if not sent by current user
        if (message.senderId !== (effectiveUser?.userId || effectiveUser?.id)) {
          setTimeout(() => {
            socketService.markMessageRead(message._id, sessionId)
          }, 1000)
        }
      })

      socketService.on('user-online', (userInfo) => {
        setOnlineUsers(prev => [...prev.filter(u => u.userId !== userInfo.userId), {
          userId: userInfo.userId,
          role: userInfo.role as 'student' | 'mentor',
          email: userInfo.email
        }])
        
        // Use name if available, otherwise format email nicely  
        let displayName = userInfo.name || userInfo.email
        if (displayName === userInfo.email) {
          const emailPrefix = userInfo.email.split('@')[0]
          displayName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)
        }
        
        toast.success(`${displayName} joined the chat`)
      })

      socketService.on('user-offline', (userInfo) => {
        setOnlineUsers(prev => prev.filter(u => u.userId !== userInfo.userId))
        
        // Use name if available, otherwise format email nicely
        let displayName = userInfo.name || userInfo.email
        if (displayName === userInfo.email) {
          const emailPrefix = userInfo.email.split('@')[0]
          displayName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)
        }
        
        toast.info(`${displayName} left the chat`)
      })

      socketService.on('online-users', (data) => {
        setOnlineUsers(data.users)
      })

      socketService.on('user-typing', (userInfo) => {
        // Use first name from backend, with fallback to formatted email
        let userName = userInfo.name || userInfo.email
        
        // If still just email, extract first name from email
        if (userName === userInfo.email) {
          const emailPrefix = userInfo.email.split('@')[0]
          if (emailPrefix.includes('.')) {
            // Take first part before dot as first name
            userName = emailPrefix.split('.')[0].charAt(0).toUpperCase() + emailPrefix.split('.')[0].slice(1)
          } else {
            userName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)
          }
        }
        
        setTypingUsers(prev => [
          ...prev.filter(user => user.email !== userInfo.email), 
          { email: userInfo.email, name: userName }
        ])
      })

      socketService.on('user-stopped-typing', (userInfo) => {
        setTypingUsers(prev => prev.filter(user => user.email !== userInfo.email))
      })

      socketService.on('message-read', (data) => {
        setMessages(prev => prev.map(msg => {
          if (msg._id === data.messageId) {
            // Check if this user has already marked it as read to prevent duplicates
            const alreadyRead = msg.readBy.some(read => read.userId === data.readBy.userId)
            if (alreadyRead) {
              return msg
            }
            return { ...msg, readBy: [...msg.readBy, { userId: data.readBy.userId, readAt: data.readBy.readAt }] }
          }
          return msg
        }))
      })



      // Load chat history first
      await loadChatHistory()
      
      // Then join the session
      socketService.joinSession(sessionId)

    } catch (error: any) {
      console.error('Error initializing chat:', error)
      setError('Failed to connect to chat. Please try again.')
      toast.error('Failed to connect to chat')
    } finally {
      setLoading(false)
    }
  }, [token, sessionId, effectiveUser?.userId, effectiveUser?.id, loadChatHistory, scrollToBottom])

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || sending || !connected) return

    const messageToSend = newMessage.trim()
    
    try {
      setSending(true)
      setNewMessage('') // Clear message immediately to prevent double sending
      
      // Create temporary message for immediate display
      const currentUserId = effectiveUser?.userId || effectiveUser?.id || ''
      const tempMessage: ChatMessage = {
        _id: `temp-${Date.now()}`, // Temporary ID
        sessionId,
        senderId: currentUserId,
        senderEmail: effectiveUser?.email || '',
        senderRole: effectiveUser?.role as 'student' | 'mentor',
        message: messageToSend,
        messageType: 'text',
        createdAt: new Date().toISOString(),
        readBy: []
      }
      
      // Add message to local state immediately
      setMessages(prev => [...prev, tempMessage])
      setTimeout(scrollToBottom, 100)
      
      socketService.sendMessage(sessionId, messageToSend)
      messageInputRef.current?.focus()
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
      setNewMessage(messageToSend) // Restore message on error
      
      // Remove the temporary message on error
      setMessages(prev => prev.filter(msg => !msg._id.startsWith('temp-')))
    } finally {
      setSending(false)
    }
  }

  // Handle typing
  const handleTyping = () => {
    if (connected) {
      socketService.startTyping(sessionId)
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socketService.stopTyping(sessionId)
      }, 2000)
    }
  }

  // Format message time
  const formatMessageTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm')
  }

  // Get participant info
  const getParticipantInfo = () => {
    if (!sessionInfo || !effectiveUser) return null
    
    const isStudent = effectiveUser.role === 'student'
    const participant = isStudent ? sessionInfo.mentor : sessionInfo.student
    
    // Safety check: ensure participant exists before accessing properties
    if (!participant) return null
    
    return {
      name: participant.name || 'Unknown User',
      email: participant.email || '',
      image: isStudent ? sessionInfo.mentor?.profileImage : undefined,
      role: isStudent ? 'mentor' : 'student'
    }
  }

  // Check if user is online
  const isUserOnline = (userId: string) => {
    return onlineUsers.some(user => user.userId === userId)
  }

  // Initialize chat on component mount
  useEffect(() => {
    if (!authLoading && token && sessionId) {
      initializeChat()
    }

    // Cleanup on unmount
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      chatInitialized.current = false
      socketService.leaveSession()
    }
  }, [authLoading, token, sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle keyboard shortcuts - now handled directly on Input component

  // Show loading screen
  if (loading || authLoading) {
    return <Loader />
  }

  // Show error screen
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900">Access Denied</h1>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">{error}</p>
            
            {sessionTime && (
              <div className="bg-gray-50 p-4 rounded-lg text-sm">
                <p className="font-medium text-gray-700 mb-2">Session Time:</p>
                <p>Start: {format(new Date(sessionTime.start), 'PPp')}</p>
                <p>End: {format(new Date(sessionTime.end), 'PPp')}</p>
                <p>Current: {format(new Date(sessionTime.current), 'PPp')}</p>
              </div>
            )}
            
            <Button onClick={() => router.back()} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const participantInfo = getParticipantInfo()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            {participantInfo && (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={participantInfo.image} alt={participantInfo.name} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  {participantInfo && sessionInfo && isUserOnline(participantInfo.role === 'mentor' ? sessionInfo?.mentor?._id || '' : sessionInfo?.student?._id || '') && (
                    <Circle className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{participantInfo.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{participantInfo.role}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {sessionInfo && (
              <Badge variant="outline" className="text-xs">
                {sessionInfo.sessionTypeName}
              </Badge>
            )}
            
            {connected ? (
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                <Circle className="h-2 w-2 bg-green-500 rounded-full mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="text-gray-500">
                Disconnected
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto p-4">
        <Card className="h-[calc(100vh-12rem)]">
          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto h-[calc(100vh-16rem)]">
            <div className="space-y-4">
              {messages.map((message, index) => {
                const currentUserId = effectiveUser?.userId || effectiveUser?.id
                const isOwn = message.senderId === currentUserId
                // Check if the OTHER user (not sender) has read the message
                const otherUserHasRead = message.readBy.some(read => read.userId !== currentUserId)
                const isRead = otherUserHasRead
                
                return (
                  <div
                    key={`${message._id}-${index}`}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-1' : 'order-2'}`}>
                      <div
                        className={`px-4 py-2 rounded-lg ${
                          isOwn
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm break-words">{message.message}</p>
                      </div>
                      
                      <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-xs text-gray-500">
                          {formatMessageTime(message.createdAt)}
                        </span>
                        {isOwn && (
                          <div className="flex items-center">
                            {isRead ? (
                              <CheckCheck className="h-3 w-3 text-blue-500" />
                            ) : (
                              <CheckCheck className="h-3 w-3 text-gray-400" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              
              {/* Typing indicator */}
              {typingUsers.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-xs">
                    <div className="flex items-center gap-1">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs text-gray-500 ml-2">
                        {typingUsers[0]?.name || 'Someone'} is typing...
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-2">
              <Input
                ref={messageInputRef}
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value)
                  handleTyping()
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                placeholder="Type your message..."
                disabled={!connected || sending}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim() || !connected || sending}
                className="px-3 py-2"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
