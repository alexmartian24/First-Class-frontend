import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "./Navbar";
import "@testing-library/jest-dom";


describe("Navbar Component", () => {
  test("renders the navbar with all navigation links", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    // check if they all have it
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("View All People")).toBeInTheDocument();
    expect(screen.getByText("View All Submissions")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });
  test("renders correct number of links", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(5); 
  });

  test("each link has the correct href", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText("Home").closest("a")).toHaveAttribute("href", "/");
    expect(screen.getByText("About").closest("a")).toHaveAttribute("href", "/about");
    expect(screen.getByText("View All People").closest("a")).toHaveAttribute("href", "/people");
    expect(screen.getByText("View All Submissions").closest("a")).toHaveAttribute("href", "/dashboard");
    expect(screen.getByText("Settings").closest("a")).toHaveAttribute("href", "/settings");
});
});
