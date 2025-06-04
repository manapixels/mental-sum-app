import "@testing-library/jest-dom";

// Mock window.crypto for tests since it's used in problem generation
Object.defineProperty(window, "crypto", {
  value: {
    randomUUID: () => {
      // Generate a proper UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
      const hex = () => Math.floor(Math.random() * 16).toString(16);
      return "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx".replace(/x/g, hex);
    },
    getRandomValues: (arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
  },
});

// Mock localStorage for user data tests
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Setup global test utilities
global.beforeEach(() => {
  jest.clearAllMocks();
});
