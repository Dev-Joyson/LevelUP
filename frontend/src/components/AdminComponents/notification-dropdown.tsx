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
import { formatDistanceToNow } from 'date-fns'

export function NotificationDropdown() {
  const { token, user } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  
  // Function to fetch notifications from API
  const fetchNotifications = async () => {
    if (!token || user?.role !== 'admin') return
    
    try {
      setIsLoading(true)
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
      const response = await axios.get(`${API_BASE_URL}/api/notifications/admin?limit=10`, {
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
      await axios.put(`${API_BASE_URL}/api/notifications/read-all/admin`, {}, {
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
    if (notification.type === 'company_registration' && notification.entityId) {
      router.push(`/admin/company?companyId=${notification.entityId}`)
    } else if (notification.type === 'mentor_registration' && notification.entityId) {
      router.push(`/admin/mentor?mentorId=${notification.entityId}`)
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
    if (token && user?.role === 'admin') {
      // Initialize socket connection
      socketService.connect(token)
        .then(() => {
          console.log('Socket connected for admin notifications')
          socketService.subscribeToAdminNotifications()
          
          // Listen for new notifications
          socketService.on('admin-notification', handleNewNotification)
        })
        .catch(error => {
          console.error('Socket connection error:', error)
        })
      
      // Fetch initial notifications
      fetchNotifications()
    }
    
    return () => {
      // Clean up socket listeners
      socketService.off('admin-notification', handleNewNotification)
      // Unsubscribe from admin notifications
      if (socketService.isAdminNotificationsSubscribed) {
        socketService.unsubscribeFromAdminNotifications()
      }
    }
  }, [token, user?.role])
  
  // Refetch notifications when dropdown opens
  useEffect(() => {
    if (open) {
      fetchNotifications()
    }
  }, [open])
  
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2">
          <DropdownMenuLabel className="text-base font-semibold">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-blue-600 hover:text-blue-800"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No notifications to display
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification._id}
                className={`p-3 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex flex-col w-full">
                  <div className="font-medium">{notification.title}</div>
                  <div className="text-sm text-gray-600">{notification.message}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        <div className="p-2 text-center">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-sm"
            onClick={() => router.push('/admin/notifications')}
          >
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
