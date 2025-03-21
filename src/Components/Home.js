import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  const quotes = [
    "Oh you're here? Why?",
    "Oh welcome back, I forgot about you.",
    "Why did you wake me up?",
    "You again? What do you want?",
    "I was having such a nice nap...",
    "Did you really have to come back?",
    "Hmph. I guess you have business here.",
    "Ugh, fine. Let's get this over with.",
    "You took your time, didn't you?",
    "Welcome back… I guess."
  ];

  const [currentQuote, setCurrentQuote] = useState("");

  useEffect(() => {
    // Generate a new random quote on every page refresh
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setCurrentQuote(quotes[randomIndex]);
  }, []);

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="content-wrapper">
          <h1 className="title">Journal</h1>
          <div className="subtitle-line"></div>
          
          <p className="random-quote">
            <span>&ldquo;{currentQuote}&rdquo;</span>
          </p>

          <p className="description">
            Welcome to Journal, a platform where you can manage and explore
            various submissions, people, and data records seamlessly. Whether
            you&apos;re here to contribute, review, or browse, this tool is designed
            to make your experience efficient and intuitive.
          </p>
          
          <p className="action-text">
            Click below to get started and explore the people database, manage
            submissions, and interact with the system.
            <Link to="/about" className="read-more-button">Read More</Link>
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