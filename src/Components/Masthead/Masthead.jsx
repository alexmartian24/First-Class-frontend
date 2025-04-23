import React, { useState, useEffect } from "react";
import axios from 'axios';
import { BACKEND_URL } from '../../constants';
import "./Masthead.css";

function Masthead() {
  const [masthead, setMasthead] = useState({});

  useEffect(() => {
    const fetchMasthead = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/people/masthead`);
        if (response.data && response.data.Masthead) {
          setMasthead(response.data.Masthead);
        }
      } catch (error) {
        console.error('Error fetching masthead:', error);
      }
    };
    fetchMasthead();
  }, []);

  return (
    <div className="masthead-container upgraded">
      <div className="masthead-hero">
        <h1>Our Team</h1>
        <p className="masthead-sub">Meet the people behind the mission</p>
      </div>

      <div className="masthead-content">
        {Object.entries(masthead).map(([role, people]) => (
          <div key={role} className="role-group">
            <h2>{role}</h2>
            <ul>
              {people.map((person, index) => (
                <li key={index} className="person-entry">
                  <span className="person-name">{person.name}</span>
                  <a href={`mailto:${person.email}`} className="person-email">{person.email}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Masthead;
