import React from "react";
import { Link } from "react-router-dom";
import "./About.css";

function About() {
  return (
    <div className="about-container">
      <div className="about-header">
        <h1>About This Project</h1>
        <p className="about-intro">
          Honestly, we have the freedom to shape this however we like. The professor
          mentioned that the content itself doesn&apos;t matter as much—we could even
          use placeholder text. What truly counts is demonstrating that we can
          build the functionality. So, stay tuned for what&apos;s next!
        </p>
      </div>

      <section className="about-section">
        <h2>
          Welcome to <span className="highlight">Journal</span>
        </h2>
        <p>
          <strong>Journal</strong> is your all-in-one platform for managing and exploring
          submissions, people, and data records with ease.
        </p>
        <p>
          Whether you’re a contributor, reviewer, or simply browsing, <strong>Journal</strong>{" "}
          provides an intuitive and seamless experience tailored to your needs.
          Our platform is built to streamline data management, enhance collaboration,
          and ensure efficient record-keeping—all in one place.
        </p>
      </section>

      <section className="about-section">
        <h2>
          Why Use <span className="highlight">Journal?</span>
        </h2>
        <ul className="features-list">
          <li>
            <strong>📌 Effortless Submission Management</strong> – Easily submit, track, and review records.
          </li>
          <li>
            <strong>👥 People Database</strong> – Browse and manage an organized directory of individuals.
          </li>
          <li>
            <strong>🎨 Intuitive Interface</strong> – Navigate through data with a user-friendly design.
          </li>
          <li>
            <strong>🤝 Seamless Collaboration</strong> – Work efficiently with teams and track contributions.
          </li>
          <li>
            <strong>🔒 Reliable & Secure</strong> – Ensure data integrity and access whenever you need it.
          </li>
        </ul>
      </section>

      <section className="about-section about-footer">
        <h2>🚀 Get Started Today!</h2>
        <p>
          Explore the people database, manage submissions, and take full advantage of
          the platform’s capabilities. Whether you’re looking to contribute or gain insights,
          <strong> Journal</strong> makes the process simple and effective.
        </p>
        <div className="about-footer-button">
          <Link to="/dashboard" className="write-journal-button">
            Click here to write a journal!
          </Link>
        </div>
      </section>
    </div>
  );
}

export default About;