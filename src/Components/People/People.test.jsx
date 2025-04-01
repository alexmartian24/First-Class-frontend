import { render, screen, fireEvent, act } from "@testing-library/react";
import { TestWrapper } from "../../test-utils/test-wrapper";
import axios from "axios";
import People from "./People";
import "@testing-library/jest-dom";

// Mock axios
jest.mock("axios");

describe("People Component", () => {
  const mockPeople = {
    "test@test.com": {
      name: "Test User",
      email: "test@test.com",
      affiliation: "Test University",
      roles: ["Author"]
    },
    "editor@test.com": {
      name: "Test Editor",
      email: "editor@test.com",
      affiliation: "Test College",
      roles: ["Editor"]
    }
  };

  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
    axios.get.mockReset();
    axios.put.mockReset();
    axios.delete.mockReset();
    window.history.pushState({}, '', '/');
    // Suppress expected console.error for people without roles
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test("renders login message when not authorized", () => {
    render(<People />, { wrapper: TestWrapper });
    expect(screen.getByText(/Please log in as an Editor or Managing Editor/)).toBeInTheDocument();
  });

  test("renders people table when authorized", async () => {
    // Mock logged in user
    localStorage.setItem("user", JSON.stringify({ roles: ["Editor"] }));
    axios.get.mockResolvedValueOnce({ data: mockPeople });

    render(<People />, { wrapper: TestWrapper });

    // Trigger auth-change event
    await act(async () => {
      window.dispatchEvent(new Event('auth-change'));
    });

    // Check table headers
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Affiliation")).toBeInTheDocument();
    expect(screen.getByText("Role")).toBeInTheDocument();

    // Wait for data to load and check content
    const testUser = await screen.findByText("Test User");
    expect(testUser).toBeInTheDocument();
    expect(screen.getByText("test@test.com")).toBeInTheDocument();
    expect(screen.getByText("Test University")).toBeInTheDocument();
    expect(screen.getByText("Author")).toBeInTheDocument();
  });

  test("handles adding a new person", async () => {
    localStorage.setItem("user", JSON.stringify({ roles: ["Editor"] }));
    axios.get.mockResolvedValue({ data: mockPeople });
    axios.put.mockResolvedValueOnce({});

    render(<People />, { wrapper: TestWrapper });

    // Trigger auth-change event
    await act(async () => {
      window.dispatchEvent(new Event('auth-change'));
    });

    // Wait for loading to complete
    await screen.findByText("Test User");

    // Click add person button
    await act(async () => {
      fireEvent.click(screen.getByText("Add Person"));
    });

    // Fill out form
    await act(async () => {
      fireEvent.change(screen.getByLabelText("Name"), {
        target: { value: "New Person" },
      });
      fireEvent.change(screen.getByLabelText("Email"), {
        target: { value: "new@test.com" },
      });
      fireEvent.change(screen.getByLabelText("Affiliation"), {
        target: { value: "New University" },
      });
      fireEvent.change(screen.getByLabelText("Role"), {
        target: { value: "Author" },
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "password123" },
      });
    });

    // Submit form
    const form = screen.getByTestId("add-person-form");
    await act(async () => {
      fireEvent.submit(form);
    });

    // Check if axios.put was called with correct data
    expect(axios.put).toHaveBeenCalledWith(
      expect.any(String),
      {
        name: "New Person",
        email: "new@test.com",
        affiliation: "New University",
        role: "Author",
        password: "password123"
      },
      expect.any(Object)
    );
  });

  test("handles deleting a person", async () => {
    localStorage.setItem("user", JSON.stringify({ roles: ["Editor"] }));
    axios.get.mockResolvedValue({ data: mockPeople });
    axios.delete.mockResolvedValueOnce({});

    // Mock window.confirm
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => true);

    render(<People />, { wrapper: TestWrapper });

    // Trigger auth-change event
    await act(async () => {
      window.dispatchEvent(new Event('auth-change'));
    });

    // Wait for data to load
    await screen.findByText("Test User");

    // Find and click delete button
    const deleteButton = screen.getByTestId("delete-test@test.com");
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    // Check if axios.delete was called
    expect(axios.delete).toHaveBeenCalled();

    // Restore window.confirm
    window.confirm = originalConfirm;
  });

  test("displays error message when people without roles are found", async () => {
    localStorage.setItem("user", JSON.stringify({ roles: ["Editor"] }));
    const peopleWithoutRoles = {
      "noRole@test.com": {
        name: "No Role User",
        email: "noRole@test.com",
        affiliation: "Test Place",
        roles: []
      }
    };
    axios.get.mockResolvedValueOnce({ data: peopleWithoutRoles });

    render(<People />, { wrapper: TestWrapper });

    // Trigger auth-change event
    await act(async () => {
      window.dispatchEvent(new Event('auth-change'));
    });

    // Wait for error message
    const errorMessage = await screen.findByText(/Warning: Found 1 people without roles/);
    expect(errorMessage).toBeInTheDocument();
  });
});
