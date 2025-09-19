"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import socketService, { Notification } from "@/lib/socket-service"
import axios from "axios"
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow'

export function StudentNotificationDropdown() {
  const { token, user } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  
  // Function to fetch notifications from API
  const fetchNotifications = async () => {
    if (!token || user?.role !== 'student') return
    
    try {
      setIsLoading(true)
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
      const response = await axios.get(`${API_BASE_URL}/api/notifications/student?limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data) {
        setNotifications(response.data.notifications)
        setUnreadCount(response.data.unreadCount)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!token) return
    
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
      await axios.put(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true } 
            : notification
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!token) return
    
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
      await axios.put(`${API_BASE_URL}/api/notifications/read-all/student`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }
  
  // Handle notification click based on type
  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    markAsRead(notification._id)
    
    // Navigate based on notification type
    if (notification.type === 'application_approved' && notification.entityId) {
      router.push(`/student/applications`)
    } else if (notification.type === 'application_rejected' && notification.entityId) {
      router.push(`/student/applications`)
    }
    
    // Close dropdown
    setOpen(false)
  }
  
  // Handle new notification from socket
  const handleNewNotification = (notification: Notification) => {
    // Add to the beginning of the list
    setNotifications(prev => [notification, ...prev.slice(0, 9)])
    // Increment unread count
    setUnreadCount(prev => prev + 1)
  }
  
  // Connect to socket on component mount
  useEffect(() => {
    if (token && user?.role === 'student') {
      // Initialize socket connection
      socketService.connect(token)
        .then(() => {
          console.log('Socket connected for student notifications')
          socketService.subscribeToStudentNotifications()
          
          // Listen for new notifications
          socketService.on('student-notification', handleNewNotification)
        })
        .catch(error => {
          console.error('Socket connection error:', error)
        })
      
      // Fetch initial notifications
      fetchNotifications()
    }
    
    return () => {
      // Clean up socket listeners
      socketService.off('student-notification', handleNewNotification)
      // Unsubscribe from student notifications
      if (socketService.isStudentNotificationsSubscribed) {
        socketService.unsubscribeFromStudentNotifications()
      }
    }
  }, [token, user?.role])
  
  // Refetch notifications when dropdown opens
  useEffect(() => {
    if (open) {
      fetchNotifications()
    }
  }, [open])

  // Show loading or don't render for non-student users
  if (!user || user.role !== 'student') {
    return null
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notifications
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-xs h-auto p-1"
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <DropdownMenuItem disabled>
            Loading notifications...
          </DropdownMenuItem>
        ) : notifications.length === 0 ? (
          <DropdownMenuItem disabled>
            No notifications yet
          </DropdownMenuItem>
        ) : (
          <DropdownMenuGroup className="max-h-60 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification._id}
                className={`cursor-pointer p-3 ${!notification.isRead ? 'bg-blue-50' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex flex-col space-y-1 w-full">
                  <div className="flex items-start justify-between">
                    <p className="font-medium text-sm">{notification.title}</p>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0 ml-2" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-center justify-center cursor-pointer"
          onClick={() => {
            router.push('/student/notifications')
            setOpen(false)
          }}
        >
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}