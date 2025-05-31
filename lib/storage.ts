import { AppData, User, Session } from "./types";

const STORAGE_KEY = "mental-sum-app-data";
const STORAGE_VERSION = "1.0.0";

// Storage utility functions
export class StorageManager {
  private static getStorageData(): AppData | null {
    try {
      if (typeof window === "undefined") return null;

      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;

      const parsed = JSON.parse(data) as unknown;
      const appData = parsed as AppData;

      // Convert date strings back to Date objects
      if (appData.users) {
        appData.users = appData.users.map((user: unknown) => {
          const u = user as Record<string, unknown>;
          return {
            ...u,
            createdAt: new Date(u.createdAt as string),
            statistics: {
              ...(u.statistics as Record<string, unknown>),
              lastSessionDate: (u.statistics as Record<string, unknown>)
                ?.lastSessionDate
                ? new Date(
                    (u.statistics as Record<string, unknown>)
                      .lastSessionDate as string,
                  )
                : undefined,
            },
          };
        }) as User[];
      }

      if (appData.sessions) {
        appData.sessions = appData.sessions.map((session: unknown) => {
          const s = session as Record<string, unknown>;
          return {
            ...s,
            startTime: new Date(s.startTime as string),
            endTime: s.endTime ? new Date(s.endTime as string) : undefined,
            problems: (s.problems as unknown[]).map((problem: unknown) => {
              const p = problem as Record<string, unknown>;
              return {
                ...p,
                attemptedAt: new Date(p.attemptedAt as string),
                completedAt: p.completedAt
                  ? new Date(p.completedAt as string)
                  : undefined,
              };
            }),
          };
        }) as Session[];
      }

      if (appData.lastBackup) {
        appData.lastBackup = new Date(appData.lastBackup as unknown as string);
      }

      return appData;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return null;
    }
  }

  private static setStorageData(data: AppData): void {
    try {
      if (typeof window === "undefined") return;

      const dataToStore = {
        ...data,
        lastBackup: new Date(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (error) {
      console.error("Error writing to localStorage:", error);
      throw new Error("Failed to save data. Storage might be full.");
    }
  }

  private static getDefaultData(): AppData {
    return {
      users: [],
      currentUserId: undefined,
      sessions: [],
      version: STORAGE_VERSION,
      lastBackup: new Date(),
    };
  }

  // Initialize storage with default data if empty
  static initialize(): AppData {
    let data = this.getStorageData();

    if (!data || data.version !== STORAGE_VERSION) {
      data = this.getDefaultData();
      this.setStorageData(data);
    }

    return data;
  }

  // User management functions
  static getAllUsers(): User[] {
    const data = this.getStorageData() || this.getDefaultData();
    return data.users;
  }

  static getUserById(id: string): User | null {
    const users = this.getAllUsers();
    return users.find((user) => user.id === id) || null;
  }

  static getCurrentUser(): User | null {
    const data = this.getStorageData();
    if (!data || !data.currentUserId) return null;

    return this.getUserById(data.currentUserId);
  }

  static setCurrentUser(userId: string): void {
    const data = this.getStorageData() || this.getDefaultData();
    data.currentUserId = userId;
    this.setStorageData(data);
  }

  static createUser(user: Omit<User, "id" | "createdAt">): User {
    const data = this.getStorageData() || this.getDefaultData();

    const newUser: User = {
      ...user,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    data.users.push(newUser);

    // Set as current user if it's the first user
    if (data.users.length === 1) {
      data.currentUserId = newUser.id;
    }

    this.setStorageData(data);
    return newUser;
  }

  static updateUser(userId: string, updates: Partial<User>): User | null {
    const data = this.getStorageData() || this.getDefaultData();
    const userIndex = data.users.findIndex((user) => user.id === userId);

    if (userIndex === -1) return null;

    data.users[userIndex] = {
      ...data.users[userIndex],
      ...updates,
      id: userId, // Ensure ID cannot be changed
      createdAt: data.users[userIndex].createdAt, // Ensure createdAt cannot be changed
    };

    this.setStorageData(data);
    return data.users[userIndex];
  }

  static deleteUser(userId: string): boolean {
    const data = this.getStorageData() || this.getDefaultData();
    const userIndex = data.users.findIndex((user) => user.id === userId);

    if (userIndex === -1) return false;

    data.users.splice(userIndex, 1);

    // Remove all sessions for this user
    data.sessions = data.sessions.filter(
      (session) => session.userId !== userId,
    );

    // Update current user if deleted user was current
    if (data.currentUserId === userId) {
      data.currentUserId = data.users.length > 0 ? data.users[0].id : undefined;
    }

    this.setStorageData(data);
    return true;
  }

  // Session management functions
  static createSession(session: Omit<Session, "id">): Session {
    const data = this.getStorageData() || this.getDefaultData();

    const newSession: Session = {
      ...session,
      id: crypto.randomUUID(),
    };

    data.sessions.push(newSession);
    this.setStorageData(data);
    return newSession;
  }

  static updateSession(
    sessionId: string,
    updates: Partial<Session>,
  ): Session | null {
    const data = this.getStorageData() || this.getDefaultData();
    const sessionIndex = data.sessions.findIndex(
      (session) => session.id === sessionId,
    );

    if (sessionIndex === -1) return null;

    data.sessions[sessionIndex] = {
      ...data.sessions[sessionIndex],
      ...updates,
      id: sessionId, // Ensure ID cannot be changed
    };

    this.setStorageData(data);
    return data.sessions[sessionIndex];
  }

  static getSessionsByUser(userId: string): Session[] {
    const data = this.getStorageData() || this.getDefaultData();
    return data.sessions.filter((session) => session.userId === userId);
  }

  static getSessionById(sessionId: string): Session | null {
    const data = this.getStorageData() || this.getDefaultData();
    return data.sessions.find((session) => session.id === sessionId) || null;
  }

  // Data export/import functions
  static exportData(): string {
    const data = this.getStorageData() || this.getDefaultData();
    return JSON.stringify(data, null, 2);
  }

  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData) as AppData;

      // Basic validation
      if (!data.users || !Array.isArray(data.users)) {
        throw new Error("Invalid data format");
      }

      this.setStorageData(data);
      return true;
    } catch (error) {
      console.error("Error importing data:", error);
      return false;
    }
  }

  // Utility functions
  static clearAllData(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  static getStorageSize(): number {
    if (typeof window === "undefined") return 0;

    const data = localStorage.getItem(STORAGE_KEY);
    return data ? new Blob([data]).size : 0;
  }
}
