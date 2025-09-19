"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import socketService, { type Notification as SocketNotification } from '@/lib/socket-service'

interface NotificationContextType {
  notifications: SocketNotification[]
  unreadCount: number
  addNotification: (notification: SocketNotification) => void
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  fetchNotifications: () => Promise<void>
  isLoading: boolean
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth()
  const [notifications, setNotifications] = useState<SocketNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Function to fetch notifications from API
  const fetchNotifications = async () => {
    if (!token || !user) return
    
    try {
      setIsLoading(true)
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
      const response = await fetch(`${API_BASE_URL}/api/notifications/${user.role}?limit=20`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Add a new notification to the list
  const addNotification = (notification: SocketNotification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 19)]) // Keep only latest 20
    setUnreadCount(prev => prev + 1)
  }

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!token) return
    
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
      const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === notificationId 
              ? { ...notification, isRead: true } 
              : notification
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!token || !user) return
    
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
      const response = await fetch(`${API_BASE_URL}/api/notifications/read-all/${user.role}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, isRead: true }))
        )
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  // Handle new notification from socket
  const handleNewNotification = (notification: SocketNotification) => {
    addNotification(notification)
    
    // Show browser notification if permission granted
    if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted') {
      new window.Notification(notification.title, {
        body: notification.message,
        icon: '/levelUPlogo.png'
      })
    }
  }

  // Connect to socket and set up notification listeners
  useEffect(() => {
    if (token && user) {
      // Initialize socket connection
      socketService.connect(token)
        .then(() => {
          console.log('Socket connected for notifications')
          
          // Subscribe to notifications based on user role
          if (user.role === 'student') {
            socketService.subscribeToStudentNotifications()
            socketService.on('student-notification', handleNewNotification)
          } else if (user.role === 'admin') {
            socketService.subscribeToAdminNotifications()
            socketService.on('admin-notification', handleNewNotification)
          } else if (user.role === 'company') {
            // For company, you might need to pass companyId - we'll get it from a different source
            socketService.subscribeToCompanyNotifications('')
            socketService.on('company-notification', handleNewNotification)
          }
        })
        .catch(error => {
          console.error('Socket connection error:', error)
        })
      
      // Fetch initial notifications
      fetchNotifications()
      
      // Request browser notification permission
      if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'default') {
        window.Notification.requestPermission()
      }
    }
    
    return () => {
      // Clean up socket listeners
      if (user?.role === 'student') {
        socketService.off('student-notification', handleNewNotification)
        if (socketService.isStudentNotificationsSubscribed) {
          socketService.unsubscribeFromStudentNotifications()
        }
      } else if (user?.role === 'admin') {
        socketService.off('admin-notification', handleNewNotification)
        if (socketService.isAdminNotificationsSubscribed) {
          socketService.unsubscribeFromAdminNotifications()
        }
      } else if (user?.role === 'company') {
        socketService.off('company-notification', handleNewNotification)
        if (socketService.isCompanyNotificationsSubscribed) {
          socketService.unsubscribeFromCompanyNotifications()
        }
      }
    }
  }, [token, user])

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    isLoading
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
