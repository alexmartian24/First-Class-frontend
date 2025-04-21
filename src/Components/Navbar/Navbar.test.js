import { render, screen, fireEvent, act } from "@testing-library/react";
import Navbar from "./Navbar";
import { TestWrapper } from "../../test-utils/test-wrapper";
import { useAuth } from "../../context/AuthContext";
import "@testing-library/jest-dom";

// Mock the auth context module
jest.mock("../../context/AuthContext", () => {
  const originalModule = jest.requireActual("../../context/AuthContext");
  return {
    ...originalModule,
    useAuth: jest.fn()
  };
});

describe("Navbar Component", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset the DOM
    document.body.innerHTML = '';
    // Reset window location
    window.history.pushState({}, '', '/');
    // Reset all mocks
    jest.clearAllMocks();
    // Default mock implementation for useAuth
    useAuth.mockImplementation(() => ({
      user: null,
      isEditor: () => false,
      logout: jest.fn()
    }));
  });

  test("renders the navbar with base navigation links", () => {
    render(<Navbar />, { wrapper: TestWrapper });
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Masthead")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  test("renders login link when user is not logged in", () => {
    render(<Navbar />, { wrapper: TestWrapper });
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  test("renders logout button when user is logged in", () => {
    // Mock the auth context for a logged-in user
    useAuth.mockImplementation(() => ({
      user: { email: "test@test.com", name: "Test User", roles: ["ED"] },
      isEditor: () => true,
      logout: jest.fn()
    }));
    
    render(<Navbar />, { wrapper: TestWrapper });
    
    // With mocked auth context, we should see the logout button
    expect(screen.getByText(/Logout/)).toBeInTheDocument();
  });

  test("handles logout correctly", () => {
    // Create a mock logout function we can track
    const mockLogout = jest.fn();
    
    // Mock auth context
    useAuth.mockImplementation(() => ({
      user: { email: "test@test.com", name: "Test User", roles: ["ED"] },
      isEditor: () => true,
      logout: mockLogout
    }));

    render(<Navbar />, { wrapper: TestWrapper });

    // Find and click the logout button
    const logoutButton = screen.getByText(/Logout/);
    fireEvent.click(logoutButton);

    // Verify the logout function was called
    expect(mockLogout).toHaveBeenCalled();
    // We can't easily test navigation in this setup, so we'll skip that part
  });

  test("shows different links for logged in editors", () => {
    // First render with no user logged in
    const { unmount } = render(<Navbar />, { wrapper: TestWrapper });
    
    // Initially should show Login and base links only
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.queryByText("People")).not.toBeInTheDocument(); // Editor-only link should not be present
    
    // Unmount the component
    unmount();
    
    // Create a custom wrapper with a mocked auth context that simulates a logged-in editor
    const EditorWrapper = ({ children }) => {
      // Mock the auth context values for an editor
      const mockAuthContext = {
        user: { email: "test@test.com", name: "Test User", roles: ["ED"] },
        isEditor: () => true,
        logout: jest.fn()
      };
      
      // Mock the useAuth hook to return our mock context
      jest.spyOn(require('../../context/AuthContext'), 'useAuth').mockReturnValue(mockAuthContext);
      
      return <TestWrapper>{children}</TestWrapper>;
    };
    
    // Render with the editor wrapper
    render(<Navbar />, { wrapper: EditorWrapper });
    
    // Now we should see the editor-specific links
    expect(screen.getByText("People")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  test("each link has the correct href", () => {
    // Mock auth context for a logged-in editor
    useAuth.mockImplementation(() => ({
      user: { email: "test@test.com", name: "Test User", roles: ["ED"] },
      isEditor: () => true,
      logout: jest.fn()
    }));
    
    render(<Navbar />, { wrapper: TestWrapper });

    // Check base links
    expect(screen.getByText("Home").closest("a")).toHaveAttribute("href", "/");
    expect(screen.getByText("About").closest("a")).toHaveAttribute("href", "/about");
    expect(screen.getByText("Masthead").closest("a")).toHaveAttribute("href", "/masthead");
    expect(screen.getByText("Dashboard").closest("a")).toHaveAttribute("href", "/dashboard");
    
    // Check editor-specific links
    expect(screen.getByText("People").closest("a")).toHaveAttribute("href", "/people");
    expect(screen.getByText("Settings").closest("a")).toHaveAttribute("href", "/settings");
  });
});
