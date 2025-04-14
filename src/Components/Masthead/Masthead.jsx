import React, { useState, useEffect } from "react";
//import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { BACKEND_URL } from '../../constants';
import "./Masthead.css";

function Masthead() {
  //const { isEditor } = useAuth();
  //const [isEditing, setIsEditing] = useState(false);
  const [masthead, setMasthead] = useState({});

  useEffect(() => {
    // Fetch masthead data
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
    <div className="masthead-container">
      <h1>Masthead</h1>
      <div className="masthead-content">
        {Object.entries(masthead).map(([role, people]) => (
          <div key={role} className="role-group">
            <h2>{role}</h2>
            <ul>
              {people.map((person, index) => (
                <li key={index}>
                  {person.name} - <a href={`mailto:${person.email}`}>{person.email}</a>
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
