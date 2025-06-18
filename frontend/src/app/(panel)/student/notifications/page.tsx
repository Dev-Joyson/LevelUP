"use client"

import { useState } from "react"
import { FileText, Mail, Bell, Check, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Notification {
  id: string
  type: "application" | "message" | "reminder"
  title: string
  content: string
  timestamp: string
  timeAgo: string
  isRead: boolean
  category: "today" | "yesterday" | "older"
}

const notifications: Notification[] = [
  {
    id: "1",
    type: "application",
    title: "Application Update",
    content: "Your application for the Software Engineering Internship at Tech Innovators has been updated.",
    timestamp: "2024-01-15T14:00:00Z",
    timeAgo: "2h ago",
    isRead: false,
    category: "today",
  },
  {
    id: "2",
    type: "message",
    title: "New Message",
    content: "You have a new message from Alex in the mentorship program.",
    timestamp: "2024-01-15T12:00:00Z",
    timeAgo: "4h ago",
    isRead: false,
    category: "today",
  },
  {
    id: "3",
    type: "reminder",
    title: "Session Reminder",
    content: "Reminder: Your mentorship session with Dr. Smith is scheduled for tomorrow at 3 PM.",
    timestamp: "2024-01-14T15:00:00Z",
    timeAgo: "1d ago",
    isRead: true,
    category: "yesterday",
  },
  {
    id: "4",
    type: "application",
    title: "Application Update",
    content: "Your application for the Data Science Internship at Data Solutions has been reviewed.",
    timestamp: "2024-01-14T10:00:00Z",
    timeAgo: "1d ago",
    isRead: true,
    category: "yesterday",
  },
  {
    id: "5",
    type: "message",
    title: "New Message",
    content: "You have a new message from Sarah in the community forum.",
    timestamp: "2024-01-13T16:00:00Z",
    timeAgo: "2d ago",
    isRead: true,
    category: "older",
  },
  {
    id: "6",
    type: "application",
    title: "Application Update",
    content: "Your application for the UX Design Internship at Creative Studios has been updated.",
    timestamp: "2024-01-12T14:00:00Z",
    timeAgo: "3d ago",
    isRead: true,
    category: "older",
  },
]

export default function StudentNotificationsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all")
  const [notificationList, setNotificationList] = useState(notifications)

  const filteredNotifications = notificationList.filter((notification) => {
    if (activeTab === "unread") {
      return !notification.isRead
    }
    return true
  })

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "application":
        return <FileText className="h-5 w-5 text-blue-600" />
      case "message":
        return <Mail className="h-5 w-5 text-green-600" />
      case "reminder":
        return <Bell className="h-5 w-5 text-orange-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  const groupedNotifications = {
    today: filteredNotifications.filter((n) => n.category === "today"),
    yesterday: filteredNotifications.filter((n) => n.category === "yesterday"),
    older: filteredNotifications.filter((n) => n.category === "older"),
  }

  const unreadCount = notificationList.filter((n) => !n.isRead).length

  const markAsRead = (id: string) => {
    setNotificationList((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, isRead: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotificationList((prev) => prev.map((notification) => ({ ...notification, isRead: true })))
  }

  const deleteNotification = (id: string) => {
    setNotificationList((prev) => prev.filter((notification) => notification.id !== id))
  }

  const renderNotificationGroup = (title: string, notifications: Notification[]) => {
    if (notifications.length === 0) return null

    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-4 p-4 rounded-lg border transition-colors hover:bg-gray-50 ${
                !notification.isRead ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
              }`}
            >
              {/* Icon */}
              <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      {notification.title}
                      {!notification.isRead && (
                        <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 text-xs">
                          New
                        </Badge>
                      )}
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{notification.content}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-gray-500">{notification.timeAgo}</span>
                    <div className="flex gap-1">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="h-8 w-8 p-0 hover:bg-blue-100"
                        >
                          <Check className="h-4 w-4 text-blue-600" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="h-8 w-8 p-0 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline" className="text-sm">
              Mark all as read
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-8 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("all")}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === "all" ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab("unread")}
            className={`pb-3 text-sm font-medium transition-colors relative flex items-center gap-2 ${
              activeTab === "unread" ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
                {unreadCount}
              </Badge>
            )}
          </button>
        </div>

        {/* Notifications */}
        <div>
          {renderNotificationGroup("Today", groupedNotifications.today)}
          {renderNotificationGroup("Yesterday", groupedNotifications.yesterday)}
          {renderNotificationGroup("Older", groupedNotifications.older)}

          {filteredNotifications.length === 0 && (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === "unread" ? "No unread notifications" : "No notifications"}
              </h3>
              <p className="text-gray-500">
                {activeTab === "unread"
                  ? "You're all caught up! Check back later for new updates."
                  : "You don't have any notifications yet."}
              </p>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-gray-900 mb-2">{notificationList.length}</div>
            <div className="text-sm text-gray-600">Total Notifications</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">{unreadCount}</div>
            <div className="text-sm text-gray-600">Unread</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {notificationList.filter((n) => n.isRead).length}
            </div>
            <div className="text-sm text-gray-600">Read</div>
          </div>
        </div>
      </div>
    </div>
  )
}
