"use client"

import { useState, useEffect, useRef } from "react"
import { Send, Paperclip, Smile, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChatService, ChatMessage, ChatOptions } from "@/lib/chat-service"

interface ChatInterfaceProps {
  sessionId: string
  userId: string
  userName: string
  userAvatar?: string
  recipientId: string
  recipientName: string
  recipientAvatar?: string
  recipientRole: 'mentor' | 'student'
  initialMessages?: ChatMessage[]
  onClose?: () => void
}

export function ChatInterface({
  sessionId,
  userId,
  userName,
  userAvatar,
  recipientId,
  recipientName,
  recipientAvatar,
  recipientRole,
  initialMessages = [],
  onClose
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [newMessage, setNewMessage] = useState<string>("")
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [isTyping, setIsTyping] = useState<boolean>(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatServiceRef = useRef<ChatService | null>(null)
  
  // Initialize chat service
  useEffect(() => {
    const chatOptions: ChatOptions = {
      userId,
      userName,
      userAvatar,
      sessionId,
      onMessage: (message) => {
        setMessages((prev) => [...prev, message])
        setIsTyping(false)
      },
      onConnectionStateChange: (state) => {
        setIsConnected(state === 'connected')
      }
    }
    
    chatServiceRef.current = new ChatService(chatOptions)
    chatServiceRef.current.connect()
    
    return () => {
      if (chatServiceRef.current) {
        chatServiceRef.current.close()
      }
    }
  }, [userId, userName, userAvatar, sessionId])
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])
  
  // Handle sending a message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !chatServiceRef.current) return
    
    const message = chatServiceRef.current.sendMessage(newMessage)
    setMessages((prev) => [...prev, message])
    setNewMessage("")
    
    // Simulate typing indicator
    setTimeout(() => {
      setIsTyping(true)
      
      // The actual response will come through the onMessage callback
      // This is just to show the typing indicator
    }, 500)
  }
  
  // Format timestamp for display
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  
  // Group messages by date
  const groupedMessages = messages.reduce((groups: { [date: string]: ChatMessage[] }, message) => {
    const date = message.timestamp.toLocaleDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {})
  
  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={recipientAvatar} alt={recipientName} />
            <AvatarFallback>{recipientName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-gray-900">{recipientName}</h3>
            <p className="text-xs text-gray-500 capitalize">{recipientRole}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date} className="space-y-4">
            <div className="flex justify-center">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {date === new Date().toLocaleDateString() ? 'Today' : date}
              </span>
            </div>
            
            {dateMessages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.senderId === userId ? "justify-end" : "justify-start"}`}
              >
                {message.senderId !== userId && (
                  <Avatar className="mr-2 flex-shrink-0">
                    <AvatarImage src={recipientAvatar} />
                    <AvatarFallback>{recipientName.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.senderId === userId 
                      ? "bg-primary text-white" 
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-medium">
                      {message.senderId === userId ? "You" : recipientName}
                    </span>
                    <span className={`text-xs ${message.senderId === userId ? "text-white/70" : "text-gray-500"}`}>
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
          </div>
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <Avatar className="mr-2 flex-shrink-0">
              <AvatarImage src={recipientAvatar} />
              <AvatarFallback>{recipientName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="bg-gray-100 text-gray-900 rounded-lg p-3 flex items-center">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex gap-2">
          <div className="flex-shrink-0">
            <Button variant="outline" size="icon" className="rounded-full">
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 relative">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="pr-20 rounded-full"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button 
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 rounded-full"
              >
                <Smile className="h-4 w-4 text-gray-500" />
              </Button>
              <Button 
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 rounded-full"
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                <Send className="h-4 w-4 text-primary" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS for typing indicator */}
      <style jsx>{`
        .typing-indicator {
          display: flex;
          align-items: center;
        }
        
        .typing-indicator span {
          height: 8px;
          width: 8px;
          background: #606060;
          border-radius: 50%;
          display: inline-block;
          margin-right: 3px;
          animation: bounce 1.3s linear infinite;
        }
        
        .typing-indicator span:nth-child(2) {
          animation-delay: 0.15s;
        }
        
        .typing-indicator span:nth-child(3) {
          animation-delay: 0.3s;
        }
        
        @keyframes bounce {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-4px);
          }
        }
      `}</style>
    </div>
  )
}
