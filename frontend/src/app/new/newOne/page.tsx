"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChatInterface } from '@/components/MentorComponents/ChatInterface'

export default function CommunicationDemo() {
  const [showFloatingChat, setShowFloatingChat] = useState<boolean>(false)
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Chat Component Demo</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <Button onClick={() => setShowFloatingChat(!showFloatingChat)}>
            {showFloatingChat ? 'Close Floating Chat' : 'Open Floating Chat'}
          </Button>
        </div>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Chat Interface</CardTitle>
          <CardDescription>
            A standalone chat interface for text-based communication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[500px]">
            <ChatInterface
              sessionId="demo-session-123"
              userId="student-789"
              userName="Alex Johnson"
              userAvatar="/placeholder.svg"
              recipientId="mentor-456"
              recipientName="Telmo Sampaio"
              recipientAvatar="/placeholder.svg"
              recipientRole="mentor"
            />
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-gray-500">
            This component provides a chat-only interface for text-based communication.
          </p>
        </CardFooter>
      </Card>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Implementation Notes</h2>
        <Card>
          <CardContent className="pt-6">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Chat Implementation:</strong> Uses a simple mock implementation that can be replaced with a real WebSocket connection.
              </li>
              <li>
                <strong>Responsive Design:</strong> The component is responsive and works on both desktop and mobile devices.
              </li>
              <li>
                <strong>No External Dependencies:</strong> No paid services or external APIs are required.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
      
      {/* Floating Chat */}
      {showFloatingChat && (
        <div className="fixed bottom-4 right-4 w-[400px] h-[500px] shadow-xl rounded-lg overflow-hidden">
          <div className="absolute top-2 right-2 z-10">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowFloatingChat(false)}
              className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm"
            >
              <span className="sr-only">Close</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            </Button>
          </div>
          <ChatInterface
            sessionId="demo-session-123"
            userId="student-789"
            userName="Alex Johnson"
            userAvatar="/placeholder.svg"
            recipientId="mentor-456"
            recipientName="Telmo Sampaio"
            recipientAvatar="/placeholder.svg"
            recipientRole="mentor"
          />
        </div>
      )}
    </div>
  )
}