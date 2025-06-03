"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  defaultUserPreferences,
  defaultUserStatistics,
  initializeStrategyPerformance,
  StrategyId,
  StrategyMetrics,
  ALL_STRATEGY_IDS,
  Problem,
  UserStatistics,
  Session,
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
  logProblemAttempt: (problemAttempt: Problem) => void;
  updateStrategyMetrics: (
    strategyId: StrategyId,
    isCorrect: boolean,
    timeSpentMs: number,
  ) => void;
  getSessionById: (sessionId: string) => Session | null;
  getSessionsForCurrentUser: () => Session[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const MAX_PROBLEM_HISTORY_LENGTH = 100; // Max number of problems to keep in history

// Helper function for migration
const migrateUserStatistics = (user: User): User => {
  let statisticsUpdated = false;
  const newStats = { ...user.statistics };

  if (!newStats.strategyPerformance) {
    console.log(`Migrating strategyPerformance for user ${user.id}`);
    newStats.strategyPerformance = initializeStrategyPerformance();
    statisticsUpdated = true;
  } else {
    let individualStrategyMissing = false;
    for (const strategyId of ALL_STRATEGY_IDS) {
      if (!newStats.strategyPerformance[strategyId as StrategyId]) {
        newStats.strategyPerformance[strategyId as StrategyId] = {
          correct: 0,
          incorrect: 0,
          totalAttempts: 0,
        };
        individualStrategyMissing = true;
      }
    }
    if (individualStrategyMissing) {
      console.log(
        `Migrating individual missing strategies for user ${user.id}`,
      );
      statisticsUpdated = true;
    }
  }

  if (!newStats.problemHistory) {
    console.log(`Migrating problemHistory for user ${user.id}`);
    newStats.problemHistory = [];
    statisticsUpdated = true;
  }

  if (statisticsUpdated) {
    return { ...user, statistics: newStats };
  }
  return user;
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeUsers = () => {
      try {
        const appData = StorageManager.initialize(); // Initialize and get data
        const allUsers = appData.users; // Get users from AppData
        const currentUserId = appData.currentUserId; // Get currentUserId from AppData

        const migratedUsers = allUsers.map((user) => {
          const migratedUser = migrateUserStatistics(user);
          if (migratedUser !== user) {
            StorageManager.updateUser(migratedUser.id, {
              statistics: migratedUser.statistics,
            });
          }
          return migratedUser;
        });
        setUsers(migratedUsers);

        if (currentUserId) {
          const currentUserData = migratedUsers.find(
            (u) => u.id === currentUserId,
          );
          setCurrentUserState(currentUserData || null);
        } else if (migratedUsers.length > 0) {
          StorageManager.setCurrentUser(migratedUsers[0].id);
          setCurrentUserState(migratedUsers[0]);
        } else {
          setCurrentUserState(null);
        }

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
      const user = StorageManager.getUserById(userId);
      if (user) {
        const migratedUser = migrateUserStatistics(user);
        if (migratedUser !== user) {
          StorageManager.updateUser(migratedUser.id, {
            statistics: migratedUser.statistics,
          });
        }
        StorageManager.setCurrentUser(migratedUser.id);
        setCurrentUserState(migratedUser);
      } else {
        setCurrentUserState(null);
      }
    } catch (error) {
      console.error("Error setting current user:", error);
    }
  };

  const createUser = (name: string): User => {
    try {
      const newUserInput = {
        name: name.trim(),
        preferences: defaultUserPreferences,
        statistics: defaultUserStatistics,
      };
      const newUser = StorageManager.createUser(newUserInput);

      // Refresh users and ensure migration (though new user is already fine)
      const allUsers = StorageManager.getAllUsers().map(migrateUserStatistics);
      setUsers(allUsers);
      setCurrentUserState(newUser);
      return newUser;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  };

  const updateUserStatistics = (
    userId: string,
    newStats: Partial<UserStatistics>,
  ) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      const updatedUser = {
        ...user,
        statistics: {
          ...user.statistics,
          ...newStats,
        },
      };
      // Ensure strategyPerformance and problemHistory are correctly merged if part of newStats
      if (newStats.strategyPerformance) {
        updatedUser.statistics.strategyPerformance = {
          ...user.statistics.strategyPerformance,
          ...newStats.strategyPerformance,
        };
      }
      if (newStats.problemHistory) {
        // Typically problemHistory is fully replaced or pushed to, not merged key by key
        updatedUser.statistics.problemHistory = newStats.problemHistory;
      }

      StorageManager.updateUser(userId, { statistics: updatedUser.statistics });
      if (currentUser?.id === userId) {
        setCurrentUserState(migrateUserStatistics(updatedUser)); // Apply migration again just in case
      }
      // Update the user in the main users list state as well
      setUsers((prevUsers) =>
        prevUsers
          .map((u) => (u.id === userId ? updatedUser : u))
          .map(migrateUserStatistics),
      );
      return updatedUser;
    }
    return null;
  };

  const logProblemAttempt = (problemAttempt: Problem) => {
    if (!currentUser) return;

    const newHistory = [...(currentUser.statistics.problemHistory || [])];
    newHistory.push(problemAttempt);

    // Cap the history length
    if (newHistory.length > MAX_PROBLEM_HISTORY_LENGTH) {
      newHistory.shift(); // Remove the oldest problem
    }

    updateUserStatistics(currentUser.id, { problemHistory: newHistory });
    console.log("Problem logged, history length:", newHistory.length);
  };

  const updateStrategyMetrics = (
    strategyId: StrategyId,
    isCorrect: boolean,
  ) => {
    if (!currentUser) return;

    const currentMetrics = currentUser.statistics.strategyPerformance[
      strategyId
    ] || {
      correct: 0,
      incorrect: 0,
      totalAttempts: 0,
    };

    const updatedMetrics: StrategyMetrics = {
      ...currentMetrics,
      totalAttempts: currentMetrics.totalAttempts + 1,
      correct: currentMetrics.correct + (isCorrect ? 1 : 0),
      incorrect: currentMetrics.incorrect + (isCorrect ? 0 : 1),
    };

    const newStrategyPerformance = {
      ...currentUser.statistics.strategyPerformance,
      [strategyId]: updatedMetrics,
    };

    updateUserStatistics(currentUser.id, {
      strategyPerformance: newStrategyPerformance,
    });
    console.log("Strategy metrics updated for:", strategyId, updatedMetrics);
  };

  const updateUser = (userId: string, updates: Partial<User>): User | null => {
    try {
      if (updates.statistics) {
        const userToUpdate =
          users.find((u) => u.id === userId) ||
          StorageManager.getUserById(userId);
        if (userToUpdate) {
          const mergedStats = {
            ...userToUpdate.statistics,
            ...updates.statistics,
          };

          if (!mergedStats.strategyPerformance) {
            mergedStats.strategyPerformance = initializeStrategyPerformance();
          } else {
            for (const strategyId of ALL_STRATEGY_IDS) {
              if (!mergedStats.strategyPerformance[strategyId as StrategyId]) {
                mergedStats.strategyPerformance[strategyId as StrategyId] = {
                  correct: 0,
                  incorrect: 0,
                  totalAttempts: 0,
                };
              }
            }
          }

          if (!mergedStats.problemHistory) {
            mergedStats.problemHistory = [];
          }
          updates.statistics = mergedStats;
        }
      }

      const updatedUser = StorageManager.updateUser(userId, updates);

      if (updatedUser) {
        const allUsers = StorageManager.getAllUsers().map((user) =>
          migrateUserStatistics(user),
        ); // ensure all users in list are migrated
        setUsers(allUsers);
        if (currentUser?.id === userId) {
          // Ensure the state has the fully migrated user from storage
          const freshUpdatedUser = migrateUserStatistics(updatedUser);
          setCurrentUserState(freshUpdatedUser);
        }
      }
      return updatedUser; // Return the user from storage, migration happens in state
    } catch (error) {
      console.error("Error updating user:", error);
      return null;
    }
  };

  const deleteUser = (userId: string): boolean => {
    try {
      const success = StorageManager.deleteUser(userId);
      if (success) {
        const allUsers = StorageManager.getAllUsers().map(
          migrateUserStatistics,
        );
        setUsers(allUsers);

        const appData = StorageManager.initialize(); // Get current app data
        const currentUserIdAfterDelete = appData.currentUserId;

        if (currentUserIdAfterDelete) {
          const newCurrentUser = allUsers.find(
            (u) => u.id === currentUserIdAfterDelete,
          );
          setCurrentUserState(newCurrentUser || null);
        } else {
          setCurrentUserState(null);
        }
      }
      return success;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  };

  const refreshUsers = () => {
    try {
      const appData = StorageManager.initialize();
      const allUsers = appData.users.map(migrateUserStatistics);
      setUsers(allUsers);

      const currentUserId = appData.currentUserId;
      if (currentUserId) {
        const current = allUsers.find((u) => u.id === currentUserId);
        setCurrentUserState(current || null);
      } else {
        setCurrentUserState(null);
      }
    } catch (error) {
      console.error("Error refreshing users:", error);
    }
  };

  const getSessionById = (sessionId: string): Session | null => {
    if (!currentUser) {
      console.warn("getSessionById called when currentUser is null.");
      return null;
    }
    try {
      const session = StorageManager.getSessionById(sessionId);
      if (session && session.userId === currentUser.id) {
        return session;
      }
      if (session && session.userId !== currentUser.id) {
        console.warn(
          `User ${currentUser.id} attempted to access session ${sessionId} belonging to user ${session.userId}.`,
        );
      }
      return null;
    } catch (error) {
      console.error(`Error fetching session by ID (${sessionId}):`, error);
      return null;
    }
  };

  const getSessionsForCurrentUser = (): Session[] => {
    if (!currentUser) {
      return [];
    }
    try {
      return StorageManager.getSessionsByUser(currentUser.id);
    } catch (error) {
      console.error(
        `Error fetching sessions for user ${currentUser.id}:`,
        error,
      );
      return [];
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
    logProblemAttempt,
    updateStrategyMetrics,
    getSessionById,
    getSessionsForCurrentUser,
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
