"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  defaultUserPreferences,
  defaultUserStatistics,
} from "@/lib/types";
import { StorageManager } from "@/lib/storage";

interface UserContextType {
  currentUser: User | null;
  users: User[];
  setCurrentUser: (userId: string) => void;
  createUser: (name: string) => User;
  updateUser: (userId: string, updates: Partial<User>) => User | null;
  deleteUser: (userId: string) => boolean;
  refreshUsers: () => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize storage and load users
  useEffect(() => {
    const initializeUsers = () => {
      try {
        // Initialize storage
        StorageManager.initialize();

        // Load all users
        const allUsers = StorageManager.getAllUsers();
        setUsers(allUsers);

        // Load current user
        const current = StorageManager.getCurrentUser();
        setCurrentUserState(current);

        // If no users exist, we'll show a welcome screen
        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing users:", error);
        setIsLoading(false);
      }
    };

    initializeUsers();
  }, []);

  const setCurrentUser = (userId: string) => {
    try {
      StorageManager.setCurrentUser(userId);
      const user = StorageManager.getUserById(userId);
      setCurrentUserState(user);
    } catch (error) {
      console.error("Error setting current user:", error);
    }
  };

  const createUser = (name: string): User => {
    try {
      const newUser = StorageManager.createUser({
        name: name.trim(),
        preferences: defaultUserPreferences,
        statistics: defaultUserStatistics,
      });

      // Refresh users list
      const allUsers = StorageManager.getAllUsers();
      setUsers(allUsers);

      // Set as current user
      setCurrentUserState(newUser);

      return newUser;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  };

  const updateUser = (userId: string, updates: Partial<User>): User | null => {
    try {
      const updatedUser = StorageManager.updateUser(userId, updates);

      if (updatedUser) {
        // Refresh users list
        const allUsers = StorageManager.getAllUsers();
        setUsers(allUsers);

        // Update current user if it's the one being updated
        if (currentUser?.id === userId) {
          setCurrentUserState(updatedUser);
        }
      }

      return updatedUser;
    } catch (error) {
      console.error("Error updating user:", error);
      return null;
    }
  };

  const deleteUser = (userId: string): boolean => {
    try {
      const success = StorageManager.deleteUser(userId);

      if (success) {
        // Refresh users list
        const allUsers = StorageManager.getAllUsers();
        setUsers(allUsers);

        // Update current user
        const current = StorageManager.getCurrentUser();
        setCurrentUserState(current);
      }

      return success;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  };

  const refreshUsers = () => {
    try {
      const allUsers = StorageManager.getAllUsers();
      setUsers(allUsers);

      const current = StorageManager.getCurrentUser();
      setCurrentUserState(current);
    } catch (error) {
      console.error("Error refreshing users:", error);
    }
  };

  const value: UserContextType = {
    currentUser,
    users,
    setCurrentUser,
    createUser,
    updateUser,
    deleteUser,
    refreshUsers,
    isLoading,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
