import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { BACKEND_URL } from '../../constants';
import "./About.css";

function About() {
  const { isEditor } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(null);  // Start with null to show loading state
  const defaultContent = {
    title: 'About This Project',
    intro: 'Welcome to our journal platform.',
    sections: [
      {
        title: '🎯 Our Mission',
        text: 'To provide a robust platform for academic publishing.'
      },
      {
        title: '🔍 Key Features',
        text: 'Manuscript submission, peer review, and publication management.'
      },
      {
        title: '🚀 Get Started Today!',
        text: 'Explore the platform and take advantage of our features.'
      }
    ]
  };

  useEffect(() => {
    // Fetch content from backend
    const fetchContent = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/text/about`);
        if (response.data) {
          setContent(response.data);
        } else {
          // If no data in backend, use default content
          setContent(defaultContent);
        }
      } catch (error) {
        console.error('Error fetching about content:', error);
        // On error, use default content
        setContent(defaultContent);
      }
    };
    fetchContent();
  }, []);

  const handleSave = async () => {
    try {
      await axios.put(`${BACKEND_URL}/text/about`, content, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving content:', error);
    }
  };

  const handleEdit = (field, value, sectionIndex = null) => {
    if (sectionIndex !== null) {
      // Edit section content
      setContent(prev => ({
        ...prev,
        sections: prev.sections.map((section, idx) => 
          idx === sectionIndex 
            ? { ...section, [field]: value }
            : section
        )
      }));
    } else {
      // Edit main content
      setContent(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  return (
    <div className="about-container">
      {content ? (
        <div className="about-header">
          <h1>{content.title}</h1>
        


        {content.sections.map((section, index) => (
          <section key={index} className="about-section">
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => handleEdit('title', e.target.value, index)}
                  className="edit-section-title"
                />
                <textarea
                  value={section.text}
                  onChange={(e) => handleEdit('text', e.target.value, index)}
                  className="edit-section-text"
                />
              </>
            ) : (
              <>
                <h2>{section.title}</h2>
                <p>{section.text}</p>
              </>
            )}
          </section>
        ))}
      </div>
      ) : (
        <div className="loading">Loading...</div>
      )}
      {isEditor() && (
        <div className="edit-controls">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="save-button">
                Save Changes
              </button>
              <button onClick={() => setIsEditing(false)} className="cancel-button">
                Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="edit-button">
              Edit Content
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default About;