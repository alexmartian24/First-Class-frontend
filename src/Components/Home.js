import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="content-wrapper">
          <h1 className="title">Journal</h1>
          <div className="subtitle-line"></div>
          
          <p className="description">
            Welcome to Journal, a platform where you can manage and explore
            various submissions, people, and data records seamlessly. Whether
            you&apos;re here to contribute, review, or browse, this tool is designed
            to make your experience efficient and intuitive.
          </p>
          
          <p className="action-text">
            Click below to get started and explore the people database, manage
            submissions, and interact with the system.
          </p>
          
          <Link to="/people" className="cta-button">
            <span className="button-text">Get Started</span>
            <span className="button-icon">→</span>
          </Link>
        </div>
        
        <div className="visual-element">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>
    </div>
  );
}

export default Home;