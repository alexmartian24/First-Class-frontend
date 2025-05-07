import React, { useState, useEffect } from "react";
import axios from 'axios';
import { BACKEND_URL } from '../../constants';
import "./Masthead.css";

function Masthead() {
  const [masthead, setMasthead] = useState({});

  useEffect(() => {
    const fetchMasthead = async () => {
      try {
        const { data } = await axios.get(`${BACKEND_URL}/people/masthead`);
        if (data?.Masthead) setMasthead(data.Masthead);
      } catch (err) {
        console.error("Error fetching masthead:", err);
      }
    };
    fetchMasthead();
  }, []);

  return (
    <div className="masthead-container">
      <div className="masthead-hero">
        <h1 className="masthead-title">Our Team</h1>
        <p className="masthead-sub">Meet the people behind the mission</p>
      </div>

      <div className="masthead-grid">
        {Object.entries(masthead).map(([role, people]) => (
          <div key={role} className="role-card">
            <div className="role-card-header">{role}</div>
            <div className="role-card-body">
              <ul className="person-list">
                {people.map((person, i) => (
                  <li key={i} className="person-entry">
                    <span className="person-name">{person.name}</span>
                    <a href={`mailto:${person.email}`} className="person-email">
                      {person.email}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Masthead;