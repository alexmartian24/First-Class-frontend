import { render, screen, fireEvent, act } from "@testing-library/react";
import Navbar from "./Navbar";
import { TestWrapper } from "../../test-utils/test-wrapper";
import "@testing-library/jest-dom";

describe("Navbar Component", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset the DOM
    document.body.innerHTML = '';
    // Reset window location
    window.history.pushState({}, '', '/');
  });

  test("renders the navbar with all navigation links", () => {
    render(<Navbar />, { wrapper: TestWrapper });
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("View All People")).toBeInTheDocument();
    expect(screen.getByText("View All Submissions")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  test("renders login link when user is not logged in", () => {
    render(<Navbar />, { wrapper: TestWrapper });
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  test("renders logout button when user is logged in", async () => {
    const mockUser = { email: "test@test.com", roles: ["Editor"] };
    localStorage.setItem("user", JSON.stringify(mockUser));
    
    render(<Navbar />, { wrapper: TestWrapper });

    // Trigger auth-change event
    await act(async () => {
      window.dispatchEvent(new Event('auth-change'));
    });

    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  test("handles logout correctly", async () => {
    const mockUser = { email: "test@test.com", roles: ["Editor"] };
    localStorage.setItem("user", JSON.stringify(mockUser));
    
    // Mock window.location.href
    const originalLocation = window.location;
    delete window.location;
    window.location = { href: '' };

    render(<Navbar />, { wrapper: TestWrapper });

    // Trigger auth-change event
    await act(async () => {
      window.dispatchEvent(new Event('auth-change'));
    });

    const logoutButton = screen.getByText("Logout");
    await act(async () => {
      fireEvent.click(logoutButton);
    });

    expect(localStorage.getItem("user")).toBeNull();
    expect(window.location.href).toBe("/");

    // Restore window.location
    window.location = originalLocation;
  });

  test("updates navbar when auth-change event is fired", async () => {
    render(<Navbar />, { wrapper: TestWrapper });

    // Initially should show Login
    expect(screen.getByText("Login")).toBeInTheDocument();

    // Simulate login
    const mockUser = { email: "test@test.com", roles: ["Editor"] };
    localStorage.setItem("user", JSON.stringify(mockUser));
    
    // Trigger auth-change event
    await act(async () => {
      window.dispatchEvent(new Event('auth-change'));
    });

    // Should now show Logout
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  test("each link has the correct href", () => {
    render(<Navbar />, { wrapper: TestWrapper });

    expect(screen.getByText("Home").closest("a")).toHaveAttribute("href", "/");
    expect(screen.getByText("About").closest("a")).toHaveAttribute("href", "/about");
    expect(screen.getByText("View All People").closest("a")).toHaveAttribute("href", "/people");
    expect(screen.getByText("View All Submissions").closest("a")).toHaveAttribute("href", "/dashboard");
    expect(screen.getByText("Settings").closest("a")).toHaveAttribute("href", "/settings");
  });
});
