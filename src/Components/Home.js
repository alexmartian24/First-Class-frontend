import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home-container">
      <div className="content-center">
        <h1>Journal</h1>
        <p>
          Welcome to Journal, a platform where you can manage and explore
          various submissions, people, and data records seamlessly. Whether
          you&apos;re here to contribute, review, or browse, this tool is designed
          to make your experience efficient and intuitive.
        </p>
        <p>
          Click below to get started and explore the people database, manage
          submissions, and interact with the system.
        </p>
        <Link to="/people" className="btn-glitch-fill">
          <span className="text">Get Started</span>
          <span className="text-decoration"> _</span>
          <span className="decoration">⇒</span>
        </Link>
      </div>
    </div>
  );
}

export default Home;
