"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Send,
  Clock,
  User,
  Bot
} from "lucide-react"
import { useSocket } from "@/hooks/useSocket"
import { socketService } from "@/lib/socket-service"

interface Message {
  id: string
  type: 'ai' | 'student' | 'system'
  content: string
  timestamp: Date
}

interface InterviewSession {
  sessionId: string
  mockInterview: {
    title: string
    domain: string
    difficulty: string
    duration: number
  }
  totalQuestions: number
  currentQuestion: number
  timeRemaining: number
  messages: Message[]
}

interface InterviewStartResponse {
  sessionId: string
  mockInterview: {
    title: string
    domain: string
    difficulty: string
    duration: number
  }
  totalQuestions: number
  currentQuestion: number
  timeRemaining: number
  messages: any[]
}


export default function InterviewSessionPage() {
  const params = useParams()
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const [session, setSession] = useState<InterviewSession | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [aiTyping, setAiTyping] = useState(false)
  const [timeDisplay, setTimeDisplay] = useState("00:00")
  const [error, setError] = useState<string | null>(null)
  const hasStartedInterview = useRef(false)
  const [retryAttempts, setRetryAttempts] = useState(0)

  // Socket connection for real-time interview
  const {
    socket,
    isConnected,
    error: socketError,
    startInterview,
    submitAnswer,
    terminateInterview
  } = useSocket()

  // Load initial interview session with retry logic
  useEffect(() => {
    const loadSession = async () => {
      console.log('🔍 loadSession called with params:', params)
      if (!params.id) {
        console.error('❌ No interview ID found in params')
        return
      }

      // Show loading while connecting to socket
      if (!isConnected) {
        setLoading(true)
        setError(socketError || 'Connecting to server...')
        return
      }

      // Prevent multiple calls once connected
      if (hasStartedInterview.current) {
        return
      }

      try {
        hasStartedInterview.current = true
        setLoading(true)
        setError(null)
        
        console.log('🚀 Starting interview session with ID:', params.id)
        console.log('🔌 Socket connected:', isConnected)
        console.log('💾 Socket instance exists:', !!socket)
        
        // Start interview session with retry logic
        let sessionData: InterviewStartResponse | null = null;
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries && !sessionData) {
          try {
            console.log(`🚀 Attempting to start interview (attempt ${retryCount + 1}/${maxRetries})...`);
            sessionData = await startInterview(params.id as string)
            console.log('✅ Interview session data received:', sessionData)
            break; // Success, exit retry loop
          } catch (error) {
            retryCount++;
            console.error(`❌ Interview start attempt ${retryCount} failed:`, error);
            
            if (retryCount >= maxRetries) {
              throw new Error(`Failed to start interview after ${maxRetries} attempts. Please refresh the page and try again.`);
            }
            
            // Wait before retrying (exponential backoff)
            const waitTime = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
            console.log(`⏳ Waiting ${waitTime}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
        
        if (sessionData) {
          console.log('Interview session started:', sessionData.sessionId)
          
          setSession({
            sessionId: sessionData.sessionId,
            mockInterview: sessionData.mockInterview,
            totalQuestions: sessionData.totalQuestions,
            currentQuestion: sessionData.currentQuestion || 1,
            timeRemaining: sessionData.timeRemaining,
            messages: sessionData.messages || []
          })
          
            // Convert backend messages to frontend format
            const frontendMessages: Message[] = sessionData.messages?.map((msg: any, index: number) => {
              let messageType: 'ai' | 'student' | 'system'
              
              if (msg.messageType === 'system_message' || msg.messageType === 'student_disconnected') {
                messageType = 'system'
              } else if (msg.messageType === 'ai_greeting' || msg.messageType === 'ai_question' || msg.messageType === 'ai_feedback' || msg.messageType === 'ai_summary') {
                messageType = 'ai'
              } else {
                messageType = 'student'
              }

              return {
                id: msg._id || index.toString(),
                type: messageType,
                content: msg.content,
                timestamp: new Date(msg.createdAt || Date.now())
              }
            }) || []

          setMessages(frontendMessages)
          setError(null)
          
          // Make sure typing indicator is off at start
          console.log('🔴 Setting aiTyping to FALSE - Interview initialization')
          setAiTyping(false)
        }
      } catch (error) {
        hasStartedInterview.current = false // Reset flag on error so user can retry
        console.error('❌ Error loading session:', error)
        console.error('📊 Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          type: typeof error,
          stack: error instanceof Error ? error.stack : 'No stack trace'
        })
        if (error instanceof Error) {
          if (error.message.includes('already have an active session')) {
            setError('Resuming your existing interview session...')
            // Try again after a short delay
            setTimeout(() => {
              hasStartedInterview.current = false
            }, 2000)
          } else if (error.message.includes('Socket not connected')) {
            setError('Connection lost. Reconnecting...')
            // Reset and try to reconnect
            hasStartedInterview.current = false
          } else if (error.message.includes('Interview initialization is taking longer than expected')) {
            setError('Interview is starting... This may take a moment. Please wait or refresh if needed.')
            // Don't reset the flag immediately for timeout errors
            setTimeout(() => {
              hasStartedInterview.current = false
            }, 5000)
          } else {
            setError(error.message)
          }
        } else {
          setError('Failed to start interview session')
        }
      } finally {
        setLoading(false)
      }
    }

    loadSession()
  }, [params.id, isConnected, socketError, startInterview])

  // Auto-retry connection if socket error changes
  useEffect(() => {
    if (socketError && !session) {
      if (socketError.includes('Reconnecting') || socketError.includes('Retrying')) {
        // Show reconnecting message but keep loading state
        setError(socketError)
        setLoading(true)
      } else {
        setError(`Connection error: ${socketError}`)
        setLoading(false)
      }
      // Reset the interview flag so we can retry when connection is restored
      hasStartedInterview.current = false
    }
  }, [socketError, session])

  // When connection is restored, try to resume
  useEffect(() => {
    if (isConnected && !session && !hasStartedInterview.current && error?.includes('Connection')) {
      console.log('Connection restored, trying to resume interview...')
      setError(null)
      hasStartedInterview.current = false // Allow retry
    }
  }, [isConnected, session, error])

  // Timer effect
  useEffect(() => {
    if (!session) return

    const interval = setInterval(() => {
      setSession(prev => {
        if (!prev || prev.timeRemaining <= 0) return prev
        
        const newTimeRemaining = prev.timeRemaining - 1
        const minutes = Math.floor(newTimeRemaining / 60)
        const seconds = newTimeRemaining % 60
        setTimeDisplay(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
        
        return {
          ...prev,
          timeRemaining: newTimeRemaining
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [session])

  // Socket event listeners
  useEffect(() => {
    if (!socket) return

    socket.on('ai-feedback', (data) => {
      // Hide typing indicator when AI responds
      console.log('🔴 Setting aiTyping to FALSE - AI feedback received')
      setAiTyping(false)
      
      // Add AI response message (simple, not evaluative)
      const aiMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: data.feedback || "Thank you for your answer. Let me ask you the next question.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
    })

    socket.on('next-question', (data) => {
      // Hide typing indicator when next question arrives
      console.log('🔴 Setting aiTyping to FALSE - Next question received')
      setAiTyping(false)
      
      // Add the next question
      const questionMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.question,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, questionMessage])
      
      // Update session progress
      setSession(prev => prev ? {
        ...prev,
        currentQuestion: data.questionNumber
      } : null)
    })

    socket.on('interview-completed', (data) => {
      // Hide typing indicator when interview completes
      console.log('🔴 Setting aiTyping to FALSE - Interview completed')
      setAiTyping(false)
      
      const completionMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: "Thank you for completing this mock interview! Your detailed report is being generated and will be available for download shortly.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, completionMessage])

      // Redirect to results page after a delay
      setTimeout(() => {
        router.push(`/mock-interviews/${params.id}/results`)
      }, 3000)
    })

    // Handle system messages (like disconnections, terminations, etc.)
    socket.on('system-message', (data) => {
      const systemMessage: Message = {
        id: Date.now().toString(),
        type: 'system',
        content: data.message || data.content,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, systemMessage])
    })

    return () => {
      socket.off('ai-feedback')
      socket.off('next-question')
      socket.off('interview-completed')
      socket.off('system-message')
      // Clean up typing indicator on unmount
      console.log('🔴 Setting aiTyping to FALSE - Component cleanup')
      setAiTyping(false)
    }
  }, [socket])

  // Auto-scroll to bottom when new messages arrive (within chat area only)
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'end',
        inline: 'nearest'
      })
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || sending || !session) return

    setSending(true)

    // Add student message
    const studentMessage: Message = {
      id: Date.now().toString(),
      type: 'student',
      content: currentMessage.trim(),
      timestamp: new Date()
    }
    setMessages(prev => [...prev, studentMessage])

    try {
      // Submit answer via socket
      await submitAnswer(session.sessionId, studentMessage.content, session.currentQuestion)
      setCurrentMessage("")
      
      // Show AI typing indicator
      console.log('🔵 Setting aiTyping to TRUE - AI is processing...')
      setAiTyping(true)
    } catch (error) {
      console.error('Error submitting answer:', error)
      // Hide typing indicator on error
      console.log('🔴 Setting aiTyping to FALSE - Error occurred')
      setAiTyping(false)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleTerminate = async () => {
    if (!session) return
    
    if (confirm('Are you sure you want to end this interview? Your progress will be saved.')) {
      try {
        await terminateInterview(session.sessionId)
        router.push('/mock-interviews')
      } catch (error) {
        console.error('Error terminating interview:', error)
      }
    }
  }

  const handleRetryConnection = async () => {
    console.log('Retrying connection...')
    const newRetryAttempts = retryAttempts + 1
    
    hasStartedInterview.current = false
    setError(null)
    setLoading(true)
    setRetryAttempts(newRetryAttempts)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Authentication token not found. Please login again.')
        setLoading(false)
        return
      }

      // After 2 failed attempts, use force reconnect
      if (newRetryAttempts >= 2) {
        console.log('Using force reconnect after multiple failures...')
        try {
          await (socketService as any).forceReconnect(token)
          console.log('Force reconnect successful')
          setError(null)
          hasStartedInterview.current = false // Allow interview to start
        } catch (forceError) {
          console.error('Force reconnect failed:', forceError)
          if (newRetryAttempts >= 3) {
            // After 3 attempts, suggest page refresh
            setError('Connection failed. Please refresh the page.')
            setTimeout(() => {
              if (confirm('Connection issues persist. Refresh the page?')) {
                window.location.reload()
              }
            }, 2000)
          } else {
            setError('Force reconnect failed. Retrying...')
          }
        }
      } else {
        // Regular retry - disconnect and let useSocket reconnect
        if (socketService.socketInstance) {
          socketService.socketInstance.disconnect()
        }
        
        // Wait a moment for useSocket hook to reconnect
        setTimeout(() => {
          console.log('Waiting for useSocket to reconnect...')
        }, 1500)
      }
    } catch (err) {
      console.error('Error during retry:', err)
      setError('Retry failed. Please try again or refresh the page.')
    }
  }

  if (loading || !isConnected) {
    const loadingMessage = () => {
      if (error?.includes('Reconnecting')) return 'Reconnecting to server...'
      if (error?.includes('Retrying')) return 'Retrying connection...'
      if (!isConnected) return 'Connecting to server...'
      return 'Initializing interview session... This may take up to 20 seconds.'
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">{loadingMessage()}</p>
          
          {/* Show additional info if reconnecting */}
          {(!isConnected || error?.includes('Reconnecting')) && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-3">
                Having trouble connecting? This might take a moment...
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  hasStartedInterview.current = false
                  window.location.reload()
                }}
              >
                Refresh Page
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (error && !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to start interview</h2>
          <p className="text-red-600 mb-2">{error}</p>
          {retryAttempts > 0 && (
            <p className="text-sm text-gray-500 mb-4">Retry attempt: {retryAttempts}</p>
          )}
          <div className="flex gap-3 justify-center">
            <Button onClick={handleRetryConnection} disabled={loading}>
              {loading ? 'Retrying...' : 'Try Again'}
            </Button>
          </div>
          {retryAttempts > 2 && (
            <p className="text-xs text-gray-400 mt-4">
              Having trouble? Try refreshing the page or check your internet connection.
            </p>
          )}
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Interview session not found</h2>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex p-4 justify-center">
      {/* Chat Area - 90vh height */}
      <div className="w-full max-w-4xl h-[85vh] flex flex-col space-y-2">
          
          {/* Timer Container - Same width as chat */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm py-2 px-6 flex-shrink-0">
            <div className="flex items-center justify-between gap-8">
              {/* Timer */}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-mono text-lg font-semibold text-gray-900">{timeDisplay}</span>
              </div>
              
              {/* Question Progress */}
              <div className="text-center">
                <div className="text-sm font-medium text-gray-700 mb-2">Question {session.currentQuestion} of {session.totalQuestions}</div>
                <div className="w-36 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(session.currentQuestion / session.totalQuestions) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {/* End Interview Button */}
              <div>
                <Button
                  variant="outline"
                  onClick={handleTerminate}
                  size="sm"
                  className="text-red-600 border-red-200"
                >
                  End Interview
                </Button>
              </div>
            </div>
          </div>

          {/* Messages Container - Full height with internal scroll */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
            {/* Messages Area - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((message) => {
                // Handle system messages - very minimal
                if (message.type === 'system') {
                  return (
                    <div key={message.id} className="flex justify-center">
                      <div className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                        {message.content}
                      </div>
                    </div>
                  )
                }

                return (
                  <div key={message.id} className="flex gap-3">
                    {message.type === 'ai' ? (
                      <>
                        {/* AI Message - Left side */}
                        <Avatar className="h-10 w-10 flex-shrink-0 mt-1">
                          <AvatarImage src="/ai-avatar.png" />
                          <AvatarFallback className="bg-primary text-white">
                            <Bot className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 max-w-md">
                          <div className="text-sm font-medium text-gray-900 mb-1">Sarah Chen (AI Interviewer)</div>
                          <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 text-gray-800">
                            {message.content}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Student Message - Right side */}
                        <div className="flex-1" />
                        <div className="flex-1 max-w-md">
                          <div className="text-sm font-medium text-gray-900 mb-1 text-right">You</div>
                          <div className="bg-primary rounded-2xl rounded-tr-sm px-4 py-3 text-white ml-auto">
                            {message.content}
                          </div>
                        </div>
                        <Avatar className="h-10 w-10 flex-shrink-0 mt-1">
                          <AvatarImage src="/user-avatar.png" />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                      </>
                    )}
                  </div>
                )
              })}
              
              {/* AI Typing Indicator */}
              {aiTyping && (
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10 flex-shrink-0 mt-1">
                    <AvatarImage src="/ai-avatar.png" />
                    <AvatarFallback className="bg-primary text-white">
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 max-w-md">
                    <div className="text-sm font-medium text-gray-900 mb-1">Sarah Chen (AI Interviewer)</div>
                    <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 text-gray-800">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Sarah is thinking</span>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input Area - Clean bottom section */}
            <div className="p-2 flex-shrink-0 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Type your answer here..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={sending}
                    className="border-gray-200 rounded-full h-12 px-4 bg-gray-50 focus:bg-white text-base placeholder:text-gray-500 border-0 focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || sending}
                  className="rounded-full h-12 w-12 p-0 flex-shrink-0 bg-primary hover:bg-primary/90"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
      </div>
    </div>
  )
}
