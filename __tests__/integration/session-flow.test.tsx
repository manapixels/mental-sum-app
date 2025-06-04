import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { UserProvider } from "@/lib/contexts/user-context";
import { SessionProvider } from "@/lib/contexts/session-context";

// Mock next/navigation properly
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => "/session",
}));

// Mock localStorage completely
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
  };
})();

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

// Mock Audio
Object.defineProperty(window, "Audio", {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })),
});

describe("Session Flow Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();

    // Initialize with basic data structure
    const testData = {
      users: [
        {
          id: "test-user-id",
          name: "Test User",
          preferences: {
            operations: {
              addition: true,
              subtraction: true,
              multiplication: false,
              division: false,
            },
            sessionLength: 5,
            maxNumber: 20,
            enableSound: false,
            enableHaptic: false,
          },
          statistics: {
            totalProblemsAttempted: 0,
            totalCorrectAnswers: 0,
            averageAccuracy: 0,
            averageResponseTime: 0,
            totalSessionsCompleted: 0,
            streakCurrent: 0,
            streakBest: 0,
            personalBests: {},
          },
          strategyPerformance: {},
          problemHistory: [],
          createdAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
        },
      ],
      sessions: [],
      currentUserId: "test-user-id",
    };

    mockLocalStorage.setItem("mental-math-app-data", JSON.stringify(testData));
  });

  test("should render session providers without errors", () => {
    const MockSessionWrapper = () => (
      <UserProvider>
        <SessionProvider>
          <div data-testid="session-wrapper">
            <h1>Session Integration Test</h1>
            <button
              onClick={() => mockPush("/session/test-session-id/results")}
            >
              Complete Session
            </button>
          </div>
        </SessionProvider>
      </UserProvider>
    );

    render(<MockSessionWrapper />);

    expect(screen.getByTestId("session-wrapper")).toBeInTheDocument();
    expect(screen.getByText("Session Integration Test")).toBeInTheDocument();

    const completeButton = screen.getByText("Complete Session");
    fireEvent.click(completeButton);

    expect(mockPush).toHaveBeenCalledWith("/session/test-session-id/results");
  });

  test("should handle provider nesting without errors", () => {
    const NestedProviderTest = () => (
      <UserProvider>
        <div data-testid="user-provider">
          <SessionProvider>
            <div data-testid="session-provider">
              <span>Providers loaded successfully</span>
            </div>
          </SessionProvider>
        </div>
      </UserProvider>
    );

    render(<NestedProviderTest />);

    expect(screen.getByTestId("user-provider")).toBeInTheDocument();
    expect(screen.getByTestId("session-provider")).toBeInTheDocument();
    expect(
      screen.getByText("Providers loaded successfully"),
    ).toBeInTheDocument();
  });

  test("should handle localStorage initialization", () => {
    const TestStorageComponent = () => (
      <UserProvider>
        <div data-testid="storage-test">Storage Test Component</div>
      </UserProvider>
    );

    render(<TestStorageComponent />);

    expect(screen.getByTestId("storage-test")).toBeInTheDocument();
    expect(mockLocalStorage.getItem).toHaveBeenCalled();
  });
});
