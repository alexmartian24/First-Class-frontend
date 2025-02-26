import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home-container">
      <div className="content-center">
        <h1>Journal</h1>
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
