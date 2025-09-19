"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import socketService, { type Notification as SocketNotification } from '@/lib/socket-service'

interface NotificationContextType {
  notifications: SocketNotification[]
  unreadCount: number
  addNotification: (notification: SocketNotification) => void
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
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
    if (!notification.isRead) {
      setUnreadCount(prev => prev + 1)
    }

  }

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!token || !user) return

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
      const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      })


      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, isRead: true }
              : notif
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

  // Setup socket connection and listeners
  useEffect(() => {
    if (!token || !user) {
      console.log('NotificationContext: Missing token or user', { token: !!token, user: !!user })
      return
    }

    console.log('NotificationContext: Setting up socket connection for', user.role)

    // Initialize socket connection
    socketService.connect(token)
      .then(() => {
        console.log('NotificationContext: Socket connected successfully')
        
        // Subscribe to notifications based on user role
        if (user.role === 'admin') {
          socketService.subscribeToAdminNotifications()
          socketService.onAdminNotification(addNotification)
          console.log('NotificationContext: Admin notifications subscribed')
        } else if (user.role === 'company') {
          // For company, we'll skip the companyId for now - the backend should handle this
          try {
            socketService.subscribeToCompanyNotifications('default')
            socketService.onCompanyNotification(addNotification)
            console.log('NotificationContext: Company notifications subscribed')
          } catch (error) {
            console.warn('NotificationContext: Company notifications failed:', error)
          }
        } else if (user.role === 'mentor') {
          socketService.subscribeToMentorNotifications()
          socketService.onMentorNotification(addNotification)
          console.log('NotificationContext: Mentor notifications subscribed')
        } else if (user.role === 'student') {
          socketService.subscribeToStudentNotifications()
          socketService.onStudentNotification(addNotification)
          console.log('NotificationContext: Student notifications subscribed')
        }

        // Fetch initial notifications
        fetchNotifications()
      })
      .catch(error => {
        console.error('NotificationContext: Socket connection failed:', error)
      })

    // Cleanup on unmount
    return () => {
      if (user.role === 'admin') {
        socketService.unsubscribeFromAdminNotifications()
      } else if (user.role === 'company') {
        socketService.unsubscribeFromCompanyNotifications()
      } else if (user.role === 'mentor') {
        socketService.unsubscribeFromMentorNotifications()
      } else if (user.role === 'student') {
        socketService.unsubscribeFromStudentNotifications()
      }
      socketService.disconnect()
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
