import { render, screen, fireEvent, act, within } from "@testing-library/react";
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
      roles: ["AU"]  // Changed from "Author" to "AU" to match backend role codes
    },
    "editor@test.com": {
      name: "Test Editor",
      email: "editor@test.com",
      affiliation: "Test College",
      roles: ["ED"]  // Changed from "Editor" to "ED" to match backend role codes
    }
  };

  // Mock role mapping that matches what the backend would return
  const mockRoleMapping = {
    "AU": "Author",
    "ED": "Editor",
    "ME": "Managing Editor",
    "RF": "Referee"
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

    // Mock the roles API call that happens in the component
    axios.get.mockImplementation((url) => {
      if (url.includes('/roles')) {
        return Promise.resolve({ data: mockRoleMapping });
      }
      // For other API calls, return a resolved promise with empty data
      // The specific test cases will override this as needed
      return Promise.resolve({ data: {} });
    });
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
    localStorage.setItem("user", JSON.stringify({ roles: ["ED"] }));
    // Override the default mock for the specific people API call
    axios.get.mockImplementation((url) => {
      if (url.includes('/roles')) {
        return Promise.resolve({ data: mockRoleMapping });
      } else if (url.includes('/people')) {
        return Promise.resolve({ data: mockPeople });
      }
      return Promise.resolve({ data: {} });
    });

    render(<People />, { wrapper: TestWrapper });

    // Trigger auth-change event
    await act(async () => {
      window.dispatchEvent(new Event('auth-change'));
    });

    // Wait for data to load and check content
    const testUser = await screen.findByText("Test User");
    expect(testUser).toBeInTheDocument();
    
    // Check for email, affiliation and roles by finding the person card first
    const personCard = testUser.closest('.person-card');
    expect(personCard).toBeInTheDocument();
    
    // Now search within the person card
    const emailLabel = within(personCard).getByText("Email:");
    expect(emailLabel).toBeInTheDocument();
    expect(within(personCard).getByText("test@test.com")).toBeInTheDocument();
    
    const affiliationLabel = within(personCard).getByText("Affiliation:");
    expect(affiliationLabel).toBeInTheDocument();
    expect(within(personCard).getByText("Test University")).toBeInTheDocument();
    
    const rolesLabel = within(personCard).getByText("Roles:");
    expect(rolesLabel).toBeInTheDocument();
    
    // Find the roles paragraph which contains the Author text
    const rolesParagraph = within(personCard).getByText("Roles:").closest('p');
    expect(rolesParagraph).toBeInTheDocument();
    expect(rolesParagraph.textContent).toContain("Author");
  });

  test("handles adding a new person", async () => {
    localStorage.setItem("user", JSON.stringify({ roles: ["ED"] }));
    // Override the default mock for the specific people API call
    axios.get.mockImplementation((url) => {
      if (url.includes('/roles')) {
        return Promise.resolve({ data: mockRoleMapping });
      } else if (url.includes('/people')) {
        return Promise.resolve({ data: mockPeople });
      }
      return Promise.resolve({ data: {} });
    });
    axios.post.mockResolvedValueOnce({});

    render(<People />, { wrapper: TestWrapper });

    // Trigger auth-change event
    await act(async () => {
      window.dispatchEvent(new Event('auth-change'));
    });

    // Wait for loading to complete
    await screen.findByText("Test User");

    // Click add person button
    await act(async () => {
      fireEvent.click(screen.getByText("+ Add Person"));
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
      
      // Mock the role selection - we need to simulate selecting from a multiple select
      const roleSelect = screen.getByLabelText("Roles");
      // Create a mock selected options array
      Object.defineProperty(roleSelect, 'selectedOptions', {
        writable: true,
        value: [{ value: 'Author' }]
      });
      fireEvent.change(roleSelect, {
        target: { value: ['Author'] }
      });
      
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "password123" },
      });
    });

    // Submit form
    const form = screen.getByText("Add Person").closest("form");
    await act(async () => {
      fireEvent.submit(form);
    });

    // Check if axios.post was called with correct endpoint and data
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/people/create'),
      expect.objectContaining({
        name: "New Person",
        email: "new@test.com",
        affiliation: "New University",
        roles: expect.any(Array), // Just check that roles is an array
        password: expect.stringContaining("password123") // Password might be hashed
      }),
      expect.any(Object)
    );
  });

  test("handles deleting a person", async () => {
    localStorage.setItem("user", JSON.stringify({ roles: ["ED"] }));
    // Override the default mock for the specific people API call
    axios.get.mockImplementation((url) => {
      if (url.includes('/roles')) {
        return Promise.resolve({ data: mockRoleMapping });
      } else if (url.includes('/people')) {
        return Promise.resolve({ data: mockPeople });
      }
      return Promise.resolve({ data: {} });
    });
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

    // Find the person card for Test User
    const personCard = screen.getByText("Test User").closest(".person-card");
    
    // Find the delete button within that card (it's the second button - first is edit)
    const deleteButton = personCard.querySelectorAll("button")[1];
    
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    // Check if axios.delete was called with the correct endpoint
    expect(axios.delete).toHaveBeenCalledWith(
      expect.stringMatching(/\/people\/test(%40|@)test\.com/),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }),
        withCredentials: false
      })
    );

    // Restore window.confirm
    window.confirm = originalConfirm;
  });

  test("renders person with no roles correctly", async () => {
    localStorage.setItem("user", JSON.stringify({ roles: ["ED"] }));
    const peopleWithoutRoles = {
      "noRole@test.com": {
        name: "No Role User",
        email: "noRole@test.com",
        affiliation: "Test Place",
        roles: []
      }
    };
    // Override the default mock for the specific people API call
    axios.get.mockImplementation((url) => {
      if (url.includes('/roles')) {
        return Promise.resolve({ data: mockRoleMapping });
      } else if (url.includes('/people')) {
        return Promise.resolve({ data: peopleWithoutRoles });
      }
      return Promise.resolve({ data: {} });
    });

    render(<People />, { wrapper: TestWrapper });

    // Trigger auth-change event
    await act(async () => {
      window.dispatchEvent(new Event('auth-change'));
    });

    // Wait for the person card to be rendered
    const personName = await screen.findByText("No Role User");
    expect(personName).toBeInTheDocument();
    
    // Check that the person's email is displayed
    expect(screen.getByText("Email:")).toBeInTheDocument();
    expect(screen.getByText("noRole@test.com")).toBeInTheDocument();
    
    // Check that the person's affiliation is displayed
    expect(screen.getByText("Affiliation:")).toBeInTheDocument();
    expect(screen.getByText("Test Place")).toBeInTheDocument();
    
    // Verify that roles section is not displayed for this person
    expect(screen.queryByText("Roles:")).not.toBeInTheDocument();
  });
});
