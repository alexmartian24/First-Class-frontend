import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './People.css';
import { BACKEND_URL } from '../../constants';
import { useAuth } from '../../context/AuthContext';

// Axios configuration for cross-origin requests
const axiosConfig = {
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
};

const PERSON_ENDPOINT = (email) => `${BACKEND_URL}/people/${encodeURIComponent(email)}`;
const MANUSCRIPTS_BY_AUTHOR_ENDPOINT = (email) => `${BACKEND_URL}/manuscripts/${encodeURIComponent(email)}`;

/**
 * PersonDetail component displays details about a person and their manuscripts
 */
export default function PersonDetail() {
  const { email } = useParams();
  const { user } = useAuth();
  const [person, setPerson] = useState(null);
  const [manuscripts, setManuscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleMapping, setRoleMapping] = useState({});

  // Fetch role mapping
  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/roles`, axiosConfig)
      .then((res) => setRoleMapping(res.data))
      .catch((err) => console.error('Error fetching roles:', err));
  }, []);

  // Fetch person details and manuscripts
  useEffect(() => {
    if (!user) {
      setError('Please log in to view this page.');
      setLoading(false);
      return;
    }

    const fetchPersonData = async () => {
      try {
        setLoading(true);
        
        // Fetch person details
        const personResponse = await axios.get(PERSON_ENDPOINT(email), axiosConfig);
        setPerson(personResponse.data);
        
        // Fetch manuscripts by author
        const manuscriptsResponse = await axios.get(MANUSCRIPTS_BY_AUTHOR_ENDPOINT(email), axiosConfig);
        setManuscripts(Array.isArray(manuscriptsResponse.data) ? manuscriptsResponse.data : Object.values(manuscriptsResponse.data || {}));
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(`Failed to load data: ${err.message}`);
        setLoading(false);
      }
    };

    fetchPersonData();
  }, [email, user]);

  if (loading) return <div className="person-detail-container"><p>Loading…</p></div>;
  if (error) return <div className="person-detail-container"><div className="error-message">{error}</div></div>;
  if (!person) return <div className="person-detail-container"><p>Person not found</p></div>;

  return (
    <div className="person-detail-container">
      <div className="person-detail-header">
        <h1>{person.name || 'Unnamed Person'}</h1>
      </div>

      <div className="person-detail-card">
        <h2>Person Details</h2>
        <p><strong>Email:</strong> {person.email}</p>
        {person.affiliation && <p><strong>Affiliation:</strong> {person.affiliation}</p>}
        {person.roles?.length > 0 && (
          <p><strong>Roles:</strong> {person.roles.map(c => roleMapping[c] || c).join(', ')}</p>
        )}
      </div>

      <div className="person-manuscripts">
        <h2>Manuscripts</h2>
        {manuscripts.length === 0 ? (
          <p>No manuscripts found for this person.</p>
        ) : (
          <div className="person-manuscripts-list">
            {manuscripts.map((manuscript) => (
              <div key={manuscript._id} className="manuscript-card">
                <h3>{manuscript.title}</h3>
                <p><strong>ID:</strong> {manuscript.manu_id}</p>
                <p><strong>State:</strong> {manuscript.curr_state}</p>
                {manuscript.referees && (
                  <p><strong>Referees:</strong> {manuscript.referees.join(', ')}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
