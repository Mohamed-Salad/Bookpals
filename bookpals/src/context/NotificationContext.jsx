// src/context/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { getPendingFriendRequests } from "../services/database";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMobileNotifications, setShowMobileNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications data
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        // Fetch friend requests
        const requests = await getPendingFriendRequests(user.id);
        setFriendRequests(requests);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  // Context value
  const value = {
    friendRequests,
    unreadCount,
    notificationCount: friendRequests.length + unreadCount,
    loading,
    showMobileNotifications,
    toggleMobileNotifications: () =>
      setShowMobileNotifications(!showMobileNotifications),
    refreshNotifications: async () => {
      if (!user?.id) return;

      try {
        const requests = await getPendingFriendRequests(user.id);
        setFriendRequests(requests);
      } catch (error) {
        console.error("Error refreshing notifications:", error);
      }
    },
    updateUnreadCount: (count) => setUnreadCount(count),
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};
