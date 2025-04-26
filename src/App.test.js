import { render, screen } from '@testing-library/react';
import App from './App';
import '@testing-library/jest-dom';
import { useAuth } from './context/AuthContext';

// Mock the auth context module
jest.mock('./context/AuthContext', () => {
  const originalModule = jest.requireActual('./context/AuthContext');
  return {
    ...originalModule,
    useAuth: jest.fn(),
    AuthProvider: ({ children }) => children // Mock the AuthProvider to just render its children
  };
});

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      if (value !== undefined) {
        store[key] = typeof value === 'string' ? value : JSON.stringify(value);
      }
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('App', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Default mock implementation for useAuth - no user logged in
    useAuth.mockImplementation(() => ({
      user: null,
      isEditor: () => false,
      logout: jest.fn()
    }));
  });

  it('renders nav with base links when not logged in', async () => {
    render(<App />);

    // Check for base navigation elements
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Masthead')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('renders nav with editor links when logged in as editor', async () => {
    // Mock logged in editor
    useAuth.mockImplementation(() => ({
      user: { email: "test@test.com", name: "Test User", roles: ["ED"] },
      isEditor: () => true,
      logout: jest.fn()
    }));

    render(<App />);

    // Check for base navigation elements
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Masthead')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    
    // Check for editor-specific links
    expect(screen.getByText('People')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });
});
