import { render, screen, fireEvent, act } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import { TestWrapper } from "../../test-utils/test-wrapper";
import axios from "axios";
import Login from "./Login";
import "@testing-library/jest-dom";

// Mock axios and useNavigate
jest.mock("axios");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn()
}));

describe("Login Component", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
    axios.post.mockReset();
    useNavigate.mockReturnValue(mockNavigate);
    mockNavigate.mockReset();
    window.history.pushState({}, '', '/');
  });

  test("renders login form", () => {
    render(<Login />, { wrapper: TestWrapper });
    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
  });

  test("handles successful login", async () => {
    const mockUser = {
      email: "test@test.com",
      roles: ["Editor"]
    };
    axios.post.mockResolvedValueOnce({ data: { Return: mockUser } });

    // Create a spy for dispatchEvent
    const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');

    render(<Login />, { wrapper: TestWrapper });

    // Fill out form
    await act(async () => {
      fireEvent.change(screen.getByLabelText("Email"), {
        target: { value: "test@test.com" }
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "password123" }
      });
    });

    // Submit form
    const form = screen.getByTestId("login-form");
    await act(async () => {
      fireEvent.submit(form);
    });

    // Check if axios.post was called with correct data
    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      {
        email: "test@test.com",
        password: "password123"
      },
      expect.any(Object)
    );

    // Check if user was stored in localStorage
    expect(JSON.parse(localStorage.getItem("user"))).toEqual(mockUser);

    // Check if auth-change event was dispatched
    expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event));
    expect(dispatchEventSpy.mock.calls[0][0].type).toBe("auth-change");

    // Check if navigation occurred
    expect(mockNavigate).toHaveBeenCalledWith("/about");

    // Cleanup
    dispatchEventSpy.mockRestore();
  });

  test("handles login failure", async () => {
    const errorMessage = "Invalid credentials";
    axios.post.mockRejectedValueOnce({
      response: { data: { message: errorMessage } }
    });

    render(<Login />, { wrapper: TestWrapper });

    // Fill out form
    await act(async () => {
      fireEvent.change(screen.getByLabelText("Email"), {
        target: { value: "test@test.com" }
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "wrongpassword" }
      });
    });

    // Submit form
    const form = screen.getByTestId("login-form");
    await act(async () => {
      fireEvent.submit(form);
    });

    // Check if error message is displayed
    const error = await screen.findByText(errorMessage);
    expect(error).toBeInTheDocument();

    // Check that user was not stored in localStorage
    expect(localStorage.getItem("user")).toBeNull();
  });

  test("validates required fields", async () => {
    render(<Login />, { wrapper: TestWrapper });

    // Submit empty form
    const form = screen.getByTestId("login-form");
    await act(async () => {
      fireEvent.submit(form);
    });

    // Check for validation message
    const error = await screen.findByText("Email and password are required");
    expect(error).toBeInTheDocument();

    // Verify axios was not called
    expect(axios.post).not.toHaveBeenCalled();
  });
});
