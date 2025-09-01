"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Video, VideoOff, Mic, MicOff, MessageSquare, 
  Phone, PhoneOff, Share, ScreenShare, Paperclip,
  Send, Maximize2, Settings
} from "lucide-react"

interface Message {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: Date
  isRead: boolean
}

// Mock session data
const mockSessionData = {
  id: "session-123",
  mentorId: "mentor-456",
  mentorName: "Telmo Sampaio",
  mentorAvatar: "/placeholder.svg",
  studentId: "student-789",
  studentName: "Alex Johnson",
  studentAvatar: "/placeholder.svg",
  sessionType: "Expert Consultation",
  sessionDuration: "60 minutes",
  startTime: new Date(),
  endTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
}

// Mock chat messages
const mockMessages: Message[] = [
  {
    id: "msg-1",
    senderId: "mentor-456",
    senderName: "Telmo Sampaio",
    senderAvatar: "/placeholder.svg",
    content: "Hello! Welcome to our mentoring session. How can I help you today?",
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    isRead: true,
  },
  {
    id: "msg-2",
    senderId: "student-789",
    senderName: "Alex Johnson",
    senderAvatar: "/placeholder.svg",
    content: "Hi Telmo! Thanks for meeting with me. I wanted to discuss my career transition into web development.",
    timestamp: new Date(Date.now() - 4 * 60 * 1000), // 4 minutes ago
    isRead: true,
  },
  {
    id: "msg-3",
    senderId: "mentor-456",
    senderName: "Telmo Sampaio",
    senderAvatar: "/placeholder.svg",
    content: "That's great! I'd be happy to help with that. What's your current background and what kind of web development role are you targeting?",
    timestamp: new Date(Date.now() - 3 * 60 * 1000), // 3 minutes ago
    isRead: true,
  },
]

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<string>("video")
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [newMessage, setNewMessage] = useState<string>("")
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true)
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false)
  const [isCallActive, setIsCallActive] = useState<boolean>(true)
  const [remainingTime, setRemainingTime] = useState<string>("59:45")
  
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])
  
  // In a real implementation, this would connect to a WebRTC service
  useEffect(() => {
    // Simulate accessing user's camera/microphone
    if (isCallActive && isVideoEnabled) {
      navigator.mediaDevices?.getUserMedia({ video: true, audio: isAudioEnabled })
        .then(stream => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream
          }
        })
        .catch(err => console.error("Error accessing media devices:", err))
    }
    
    // Cleanup function to stop all media tracks when component unmounts
    return () => {
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const tracks = (localVideoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach(track => track.stop())
      }
    }
  }, [isCallActive, isVideoEnabled, isAudioEnabled])
  
  // Handle sending a new message
  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: "student-789", // In a real app, this would be the current user's ID
      senderName: "Alex Johnson",
      senderAvatar: "/placeholder.svg",
      content: newMessage,
      timestamp: new Date(),
      isRead: false,
    }
    
    setMessages([...messages, newMsg])
    setNewMessage("")
    
    // In a real app, this would send the message to a backend service
    // which would then broadcast it to the other participant
    
    // Simulate receiving a response after 2 seconds
    setTimeout(() => {
      const responseMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        senderId: "mentor-456",
        senderName: "Telmo Sampaio",
        senderAvatar: "/placeholder.svg",
        content: "I'm reviewing your question. Let me get back to you in a moment.",
        timestamp: new Date(),
        isRead: false,
      }
      setMessages(prev => [...prev, responseMsg])
    }, 2000)
  }
  
  // Format timestamp for display
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  
  // Handle ending the call
  const handleEndCall = () => {
    setIsCallActive(false)
    
    // In a real app, this would disconnect from the WebRTC service
    // and redirect to a session summary page
    
    // For now, we'll just show a confirmation and then redirect
    if (confirm("Are you sure you want to end this session?")) {
      router.push(`/mentorship/${mockSessionData.mentorId}`)
    } else {
      setIsCallActive(true)
    }
  }
  
  // Handle screen sharing
  const handleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const displayMediaOptions = {
          video: {
            cursor: "always"
          },
          audio: false
        }
        
        // @ts-ignore - TypeScript doesn't recognize getDisplayMedia yet
        const screenStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions)
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream
        }
        
        // Listen for the user ending screen sharing
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false)
          // Restore camera feed
          navigator.mediaDevices.getUserMedia({ video: true, audio: isAudioEnabled })
            .then(stream => {
              if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream
              }
            })
        }
        
        setIsScreenSharing(true)
      } else {
        // Stop screen sharing and restore camera
        if (localVideoRef.current && localVideoRef.current.srcObject) {
          const tracks = (localVideoRef.current.srcObject as MediaStream).getTracks()
          tracks.forEach(track => track.stop())
        }
        
        // Restore camera feed
        navigator.mediaDevices.getUserMedia({ video: true, audio: isAudioEnabled })
          .then(stream => {
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream
            }
          })
        
        setIsScreenSharing(false)
      }
    } catch (err) {
      console.error("Error sharing screen:", err)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-medium text-gray-900">
              Session with {mockSessionData.mentorName}
            </h1>
            <span className="text-sm text-gray-500">
              {mockSessionData.sessionType} • {remainingTime} remaining
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push(`/mentorship/${mockSessionData.mentorId}`)}
            >
              Back to Profile
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleEndCall}
            >
              End Session
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar for tabs on mobile, or always visible on desktop */}
        <div className="w-full max-w-xs border-r border-gray-200 bg-white hidden md:block">
          <div className="p-4">
            <Tabs 
              defaultValue="video" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="video">Video</TabsTrigger>
                <TabsTrigger value="chat">Chat</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Participant Info */}
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Participants</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={mockSessionData.mentorAvatar} alt={mockSessionData.mentorName} />
                  <AvatarFallback>{mockSessionData.mentorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{mockSessionData.mentorName}</p>
                  <p className="text-xs text-gray-500">Mentor</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={mockSessionData.studentAvatar} alt={mockSessionData.studentName} />
                  <AvatarFallback>{mockSessionData.studentName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{mockSessionData.studentName}</p>
                  <p className="text-xs text-gray-500">Student</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Session Info */}
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Session Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Type</span>
                <span>{mockSessionData.sessionType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Duration</span>
                <span>{mockSessionData.sessionDuration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Started</span>
                <span>{mockSessionData.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Ends</span>
                <span>{mockSessionData.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content area - changes based on active tab */}
        <div className="flex-1 flex flex-col">
          {/* For desktop, show both video and chat side by side */}
          <div className="hidden md:flex flex-1">
            {/* Video Area - 2/3 width on desktop */}
            <div className="w-2/3 bg-gray-900 relative flex flex-col">
              {/* Remote Video (Mentor) */}
              <div className="flex-1 flex items-center justify-center">
                <div className="relative w-full h-full">
                  <video
                    ref={remoteVideoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    poster="/placeholder.svg?height=480&width=640"
                  />
                  <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                    {mockSessionData.mentorName}
                  </div>
                </div>
              </div>
              
              {/* Local Video (Student) - Small overlay */}
              <div className="absolute bottom-4 right-4 w-1/4 aspect-video bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-700">
                <video
                  ref={localVideoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-0.5 rounded text-xs">
                  You
                </div>
              </div>
              
              {/* Video Controls */}
              <div className="bg-gray-800 p-3 flex items-center justify-center gap-3">
                <Button
                  variant={isVideoEnabled ? "default" : "destructive"}
                  size="icon"
                  onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                >
                  {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </Button>
                <Button
                  variant={isAudioEnabled ? "default" : "destructive"}
                  size="icon"
                  onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                >
                  {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </Button>
                <Button
                  variant={isScreenSharing ? "secondary" : "default"}
                  size="icon"
                  onClick={handleScreenShare}
                >
                  <ScreenShare className="h-5 w-5" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={handleEndCall}
                >
                  <PhoneOff className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {/* Chat Area - 1/3 width on desktop */}
            <div className="w-1/3 border-l border-gray-200 flex flex-col bg-white">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Chat</h2>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.senderId === "student-789" ? "justify-end" : "justify-start"}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.senderId === "student-789" 
                          ? "bg-primary text-white" 
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">
                          {message.senderId === "student-789" ? "You" : message.senderName}
                        </span>
                        <span className="text-xs opacity-70">
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Message Input */}
              <div className="p-3 border-t border-gray-200">
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 relative">
                    <Textarea
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="resize-none pr-10"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                    />
                    <Button 
                      className="absolute right-2 bottom-2" 
                      size="sm"
                      variant="ghost"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* For mobile, show either video or chat based on active tab */}
          <div className="flex flex-col flex-1 md:hidden">
            <Tabs 
              defaultValue="video" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full flex-1 flex flex-col"
            >
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="video">Video</TabsTrigger>
                <TabsTrigger value="chat">Chat</TabsTrigger>
              </TabsList>
              
              <TabsContent value="video" className="flex-1 flex flex-col">
                {/* Video Content for Mobile */}
                <div className="flex-1 bg-gray-900 relative">
                  {/* Remote Video */}
                  <video
                    ref={remoteVideoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    poster="/placeholder.svg?height=480&width=640"
                  />
                  
                  {/* Local Video - Small overlay */}
                  <div className="absolute bottom-4 right-4 w-1/3 aspect-video bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-700">
                    <video
                      ref={localVideoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      playsInline
                      muted
                    />
                  </div>
                </div>
                
                {/* Video Controls for Mobile */}
                <div className="bg-gray-800 p-3 flex items-center justify-center gap-3">
                  <Button
                    variant={isVideoEnabled ? "default" : "destructive"}
                    size="icon"
                    onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                  >
                    {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                  </Button>
                  <Button
                    variant={isAudioEnabled ? "default" : "destructive"}
                    size="icon"
                    onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                  >
                    {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                  </Button>
                  <Button
                    variant={isScreenSharing ? "secondary" : "default"}
                    size="icon"
                    onClick={handleScreenShare}
                  >
                    <ScreenShare className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={handleEndCall}
                  >
                    <PhoneOff className="h-5 w-5" />
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="chat" className="flex-1 flex flex-col data-[state=active]:flex">
                {/* Chat Content for Mobile */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.senderId === "student-789" ? "justify-end" : "justify-start"}`}
                    >
                      {message.senderId !== "student-789" && (
                        <Avatar className="mr-2 flex-shrink-0">
                          <AvatarImage src={message.senderAvatar} />
                          <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div 
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.senderId === "student-789" 
                            ? "bg-primary text-white" 
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium">
                            {message.senderId === "student-789" ? "You" : message.senderName}
                          </span>
                          <span className="text-xs opacity-70">
                            {formatTimestamp(message.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Message Input for Mobile */}
                <div className="p-3 border-t border-gray-200">
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="pr-10"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                      />
                      <Button 
                        className="absolute right-1 top-1/2 -translate-y-1/2" 
                        size="sm"
                        variant="ghost"
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
