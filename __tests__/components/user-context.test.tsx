import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { UserProvider, useUser } from "@/lib/contexts/user-context";
import { defaultUserPreferences, defaultUserStatistics } from "@/lib/types";

// Mock localStorage with full persistence simulation
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    _getStore: () => store, // Helper for testing
    _setStore: (newStore: Record<string, string>) => {
      store = { ...newStore };
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

// Test component that uses the UserContext
const TestUserComponent: React.FC = () => {
  const { currentUser, users, isLoading, createUser, updateUser, deleteUser } =
    useUser();

  return (
    <div>
      <div data-testid="current-user">{currentUser?.name || "No user"}</div>
      <div data-testid="users-count">{users.length}</div>
      <div data-testid="loading-state">{isLoading ? "Loading" : "Ready"}</div>

      <button onClick={() => createUser("Test User")} data-testid="create-user">
        Create User
      </button>

      <button
        onClick={() => {
          if (currentUser) {
            updateUser(currentUser.id, {
              preferences: {
                ...currentUser.preferences,
                sessionLength: 15,
              },
            });
          }
        }}
        data-testid="update-preferences"
      >
        Update Preferences
      </button>

      <button
        onClick={() => {
          if (currentUser) {
            deleteUser(currentUser.id);
          }
        }}
        data-testid="delete-user"
      >
        Delete User
      </button>
    </div>
  );
};

describe("UserContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
    // Set up default empty data structure
    const emptyData = {
      users: [],
      currentUserId: undefined,
      sessions: [],
      version: "1.0.0",
    };
    mockLocalStorage.setItem("mental-sum-app-data", JSON.stringify(emptyData));
  });

  describe("Provider Initialization", () => {
    test("should initialize with empty state when no data exists", async () => {
      render(
        <UserProvider>
          <TestUserComponent />
        </UserProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading-state")).toHaveTextContent("Ready");
      });

      expect(screen.getByTestId("current-user")).toHaveTextContent("No user");
      expect(screen.getByTestId("users-count")).toHaveTextContent("0");
    });

    test("should load existing users from localStorage", async () => {
      const existingUser = {
        id: "user-1",
        name: "Existing User",
        createdAt: new Date().toISOString(),
        preferences: defaultUserPreferences,
        statistics: defaultUserStatistics,
      };

      const dataWithUser = {
        users: [existingUser],
        currentUserId: "user-1",
        sessions: [],
        version: "1.0.0",
      };

      mockLocalStorage.setItem(
        "mental-sum-app-data",
        JSON.stringify(dataWithUser),
      );

      render(
        <UserProvider>
          <TestUserComponent />
        </UserProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading-state")).toHaveTextContent("Ready");
      });

      expect(screen.getByTestId("current-user")).toHaveTextContent(
        "Existing User",
      );
      expect(screen.getByTestId("users-count")).toHaveTextContent("1");
    });
  });

  describe("User Management", () => {
    test("should create a new user", async () => {
      render(
        <UserProvider>
          <TestUserComponent />
        </UserProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading-state")).toHaveTextContent("Ready");
      });

      // Initial state should be empty
      expect(screen.getByTestId("users-count")).toHaveTextContent("0");

      const createButton = screen.getByTestId("create-user");
      fireEvent.click(createButton);

      // Wait for user creation to complete and state to update
      await waitFor(
        () => {
          expect(screen.getByTestId("current-user")).toHaveTextContent(
            "Test User",
          );
        },
        { timeout: 2000 },
      );

      await waitFor(
        () => {
          expect(screen.getByTestId("users-count")).toHaveTextContent("1");
        },
        { timeout: 2000 },
      );

      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    test("should update user preferences", async () => {
      const existingUser = {
        id: "user-1",
        name: "Test User",
        createdAt: new Date().toISOString(),
        preferences: { ...defaultUserPreferences, sessionLength: 10 },
        statistics: defaultUserStatistics,
      };

      const dataWithUser = {
        users: [existingUser],
        currentUserId: "user-1",
        sessions: [],
        version: "1.0.0",
      };

      mockLocalStorage.setItem(
        "mental-sum-app-data",
        JSON.stringify(dataWithUser),
      );

      render(
        <UserProvider>
          <TestUserComponent />
        </UserProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading-state")).toHaveTextContent("Ready");
      });

      // Clear previous setItem calls from initialization
      mockLocalStorage.setItem.mockClear();

      const updateButton = screen.getByTestId("update-preferences");
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalled();
      });

      // Find the most recent call to setItem for our data
      const setItemCalls = mockLocalStorage.setItem.mock.calls;
      const dataUpdateCall = setItemCalls.find(
        (call) =>
          call[0] === "mental-sum-app-data" &&
          call[1].includes("sessionLength"),
      );

      expect(dataUpdateCall).toBeDefined();
      if (dataUpdateCall) {
        const savedData = JSON.parse(dataUpdateCall[1]);
        expect(savedData.users).toBeDefined();
        expect(savedData.users[0]).toBeDefined();
        expect(savedData.users[0].preferences.sessionLength).toBe(15);
      }
    });

    test("should delete a user", async () => {
      const user1 = {
        id: "user-1",
        name: "User 1",
        createdAt: new Date().toISOString(),
        preferences: defaultUserPreferences,
        statistics: defaultUserStatistics,
      };

      const user2 = {
        id: "user-2",
        name: "User 2",
        createdAt: new Date().toISOString(),
        preferences: defaultUserPreferences,
        statistics: defaultUserStatistics,
      };

      const dataWithUsers = {
        users: [user1, user2],
        currentUserId: "user-1",
        sessions: [],
        version: "1.0.0",
      };

      mockLocalStorage.setItem(
        "mental-sum-app-data",
        JSON.stringify(dataWithUsers),
      );

      render(
        <UserProvider>
          <TestUserComponent />
        </UserProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading-state")).toHaveTextContent("Ready");
      });

      // Verify initial state
      expect(screen.getByTestId("users-count")).toHaveTextContent("2");

      const deleteButton = screen.getByTestId("delete-user");
      fireEvent.click(deleteButton);

      // Wait for deletion to complete
      await waitFor(
        () => {
          expect(screen.getByTestId("users-count")).toHaveTextContent("1");
        },
        { timeout: 2000 },
      );

      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    test("should handle localStorage errors gracefully", async () => {
      // Override the getItem mock to throw an error
      mockLocalStorage.getItem.mockImplementationOnce(() => {
        throw new Error("localStorage not available");
      });

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <UserProvider>
          <TestUserComponent />
        </UserProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading-state")).toHaveTextContent("Ready");
      });

      expect(screen.getByTestId("current-user")).toHaveTextContent("No user");
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test("should handle corrupted data gracefully", async () => {
      // Set corrupted data
      mockLocalStorage.setItem("mental-sum-app-data", "invalid json data");

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <UserProvider>
          <TestUserComponent />
        </UserProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading-state")).toHaveTextContent("Ready");
      });

      expect(screen.getByTestId("current-user")).toHaveTextContent("No user");
      expect(screen.getByTestId("users-count")).toHaveTextContent("0");

      consoleSpy.mockRestore();
    });
  });
});
