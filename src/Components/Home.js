import React from "react";
import "./Home.css";

function Home() {
  return (
    <div className="home-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="logo">First Class</div>
        <ul className="nav-links">
          <li><a href="#about">About</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <h1>Welcome to First Class</h1>
        <p>Your journey to excellence starts here.</p>
        <button className="cta-button">Get Started</button>
      </header>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2025 First Class. All rights reserved.</p>
        <ul className="footer-links">
          <li><a href="#">Privacy Policy</a></li>
          <li><a href="#">Terms of Service</a></li>
        </ul>
      </footer>
    </div>
  );
}

export default Home;
