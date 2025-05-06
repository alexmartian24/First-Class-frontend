import React, { useState, useEffect } from "react";
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { BACKEND_URL } from '../../constants';
import "./About.css";

function About() {
  const { isEditor } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState('');
  const [aboutData, setAboutData] = useState({
    header: {
      title: 'About This Project',
      intro: 'Welcome to our journal platform.'
    },
    mission: {
      title: '🎯 Our Mission',
      text: 'To provide a robust platform for academic publishing.'
    },
    features: {
      title: '🔍 Key Features',
      text: 'Manuscript submission, peer review, and publication management.'
    },
    getStarted: {
      title: '🚀 Get Started Today!',
      text: 'Explore the platform and take advantage of our features.'
    }
  });

  useEffect(() => {
    // Fetch content from backend for each section
    const fetchContent = async () => {
      setIsLoading(true);
      try {
        // Fetch each section separately by key
        const keys = ['about_header', 'about_mission', 'about_features', 'about_getstarted'];
        const newData = { ...aboutData };
        
        // Create an array of promises for all fetch requests
        const promises = keys.map(key => axios.get(`${BACKEND_URL}/text/${key}`));
        
        // Wait for all promises to resolve
        const results = await Promise.allSettled(promises);
        
        // Process results
        results.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value.data) {
            const data = result.value.data;
            const key = keys[index];
            
            switch(key) {
              case 'about_header':
                newData.header = {
                  title: data.title || newData.header.title,
                  text: data.text || newData.header.text
                };
                break;
              case 'about_mission':
                newData.mission = {
                  title: data.title || newData.mission.title,
                  text: data.text || newData.mission.text
                };
                break;
              case 'about_features':
                newData.features = {
                  title: data.title || newData.features.title,
                  text: data.text || newData.features.text
                };
                break;
              case 'about_getstarted':
                newData.getStarted = {
                  title: data.title || newData.getStarted.title,
                  text: data.text || newData.getStarted.text
                };
                break;
              default:
                break;
            }
          }
        });
        
        setAboutData(newData);
      } catch (error) {
        console.error('Error fetching about content:', error);
        // Keep default content on error
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContent();
  }, []);

  const handleSave = async () => {
    try {
      // Save each section separately
      const savePromises = [
        axios.put(`${BACKEND_URL}/text/about_header`, {
          key: 'about_header',
          title: aboutData.header.title,
          text: aboutData.header.text
        }),
        axios.put(`${BACKEND_URL}/text/about_mission`, {
          key: 'about_mission',
          title: aboutData.mission.title,
          text: aboutData.mission.text
        }),
        axios.put(`${BACKEND_URL}/text/about_features`, {
          key: 'about_features',
          title: aboutData.features.title,
          text: aboutData.features.text
        }),
        axios.put(`${BACKEND_URL}/text/about_getstarted`, {
          key: 'about_getstarted',
          title: aboutData.getStarted.title,
          text: aboutData.getStarted.text
        })
      ];
      
      await Promise.all(savePromises);
      setIsEditing(false);
      setSaveMessage('Changes saved successfully.'); 
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving content:', error);
    }
  };

  const handleEdit = (section, field, value) => {
    setAboutData(prev => {
      const newData = { ...prev };
      
      // Update the specified section and field
      if (newData[section]) {
        newData[section] = {
          ...newData[section],
          [field]: value
        };
      }
      
      return newData;
    });
  };

  return (
    <div className="about-container">
      {saveMessage && <div className="save-message">{saveMessage}</div>}
      {isLoading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <div className="about-header">
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={aboutData.header.title || ''}
                  onChange={(e) => handleEdit('header', 'title', e.target.value)}
                  className="edit-section-title"
                />
                <textarea
                  value={aboutData.header.text || ''}
                  onChange={(e) => handleEdit('header', 'text', e.target.value)}
                  className="edit-section-text"
                />
              </>
            ) : (
              <>
                <h1>{aboutData.header.title}</h1>
                <p className="about-intro">{aboutData.header.text}</p>
              </>
            )}
          </div>

          <section className="about-section">
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={aboutData.mission.title || ''}
                  onChange={(e) => handleEdit('mission', 'title', e.target.value)}
                  className="edit-section-title"
                />
                <textarea
                  value={aboutData.mission.text || ''}
                  onChange={(e) => handleEdit('mission', 'text', e.target.value)}
                  className="edit-section-text"
                />
              </>
            ) : (
              <>
                <h2>{aboutData.mission.title}</h2>
                <p>{aboutData.mission.text}</p>
              </>
            )}
          </section>

          <section className="about-section">
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={aboutData.features.title || ''}
                  onChange={(e) => handleEdit('features', 'title', e.target.value)}
                  className="edit-section-title"
                />
                <textarea
                  value={aboutData.features.text || ''}
                  onChange={(e) => handleEdit('features', 'text', e.target.value)}
                  className="edit-section-text"
                />
              </>
            ) : (
              <>
                <h2>{aboutData.features.title}</h2>
                <p>{aboutData.features.text}</p>
              </>
            )}
          </section>

          <section className="about-section">
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={aboutData.getStarted.title || ''}
                  onChange={(e) => handleEdit('getStarted', 'title', e.target.value)}
                  className="edit-section-title"
                />
                <textarea
                  value={aboutData.getStarted.text || ''}
                  onChange={(e) => handleEdit('getStarted', 'text', e.target.value)}
                  className="edit-section-text"
                />
              </>
            ) : (
              <>
                <h2>{aboutData.getStarted.title}</h2>
                <p>{aboutData.getStarted.text}</p>
              </>
            )}
          </section>
          
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
        </>
      )}
    </div>
  );
}

export default About;