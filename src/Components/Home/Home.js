import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { BACKEND_URL } from "../../constants";
import "./Home.css";

function Home() {
  const { isEditor } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState({
    title: "Journal",
    description:
      "Welcome to Journal, your comprehensive platform for managing academic submissions and interacting with the system."
  });

  useEffect(() => {
    // Fetch content from backend
    const fetchContent = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/text/home`);
        if (response.data) {
          setContent(response.data);
        }
      } catch (error) {
        console.error("Error fetching home content:", error);
      }
    };
    fetchContent();
  }, []);

  const handleSave = async () => {
    try {
      await axios.put(`${BACKEND_URL}/text/home`, content, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving content:", error);
    }
  };

  const handleEdit = (field, value) => {
    setContent((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="content-wrapper">
          {isEditing ? (
            <>
              <input
                type="text"
                className="edit-title"
                value={content.title}
                onChange={(e) => handleEdit("title", e.target.value)}
                placeholder="Enter title"
              />
              <textarea
                className="edit-description"
                value={content.description}
                onChange={(e) => handleEdit("description", e.target.value)}
                placeholder="Enter description"
              />
            </>
          ) : (
            <>
              <h1 className="title">{content.title}</h1>
              <div className="subtitle-line"></div>
              <p className="description">
                {content.description}
                <Link to="/about" className="read-more-button">
                  Read More
                </Link>
              </p>
            </>
          )}

          {isEditor() && (
            <div className="edit-controls">
              {isEditing ? (
                <>
                  <button onClick={handleSave} className="save-button">
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="cancel-button"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="edit-button"
                >
                  Edit Content
                </button>
              )}
            </div>
          )}

          <Link to="/login" className="cta-button">
            <span className="button-text">Get Started</span>
            <span className="button-icon">→</span>
          </Link>
        </div>

        <div className="visual-element">
          <div className="bg-overlay"></div>
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>
    </div>
  );
}

export default Home;