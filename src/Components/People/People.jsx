import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './People.css';

// import { BACKEND_URL, getSystemInfo } from '../../constants';
import { BACKEND_URL } from '../../constants';
import { useAuth } from '../../context/AuthContext';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

  // Axios configuration for cross-origin requests
  const axiosConfig = {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    withCredentials: false, // Required for cross-origin requests to public API
  };

  const PEOPLE_READ_ENDPOINT = `${BACKEND_URL}/people`;
  const PEOPLE_CREATE_ENDPOINT = `${BACKEND_URL}/people/create`;
  const PEOPLE_UPDATE_ENDPOINT = (email) =>
    `${BACKEND_URL}/people/update/${encodeURIComponent(email)}`;
  const PEOPLE_DELETE_ENDPOINT = (email) =>
    `${BACKEND_URL}/people/${encodeURIComponent(email)}`;

  function EditPersonForm({ visible, person, cancel, fetchPeople, setError }) {
  const [name, setName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [roles, setRoles] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [roleMapping, setRoleMapping] = useState({});

  useEffect(() => {
    // Fetch roles from backend
    axios
      .get(`${BACKEND_URL}/roles`, axiosConfig)
      .then((response) => {
        // Store the role code to name mapping
        setRoleMapping(response.data);
        // Get array of role names for the select
        const rolesArray = Object.values(response.data);
        setAvailableRoles(rolesArray);
      })
      .catch((error) => {
        console.error('Error fetching roles:', error);
      });
  }, []);

  useEffect(() => {
    if (person && roleMapping) {
      setName(person.name || '');
      setNewEmail(person.email || '');
      setAffiliation(person.affiliation || '');
      // Convert role codes to role names
      const roleNames = (person.roles || []).map(code => roleMapping[code] || code);
      setRoles(roleNames);
    }
  }, [person, roleMapping]);

  if (!visible || !person) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!name || !newEmail || !affiliation || roles.length === 0) {
      setError('All fields are required.');
      return;
    }

    // Convert role names to role codes
    console.log('Selected role names:', roles);
    console.log('Role mapping:', roleMapping);
    
    const roleCodes = roles.map(roleName => {
      // Find the code (key) for this role name (value)
      const code = Object.keys(roleMapping).find(code => roleMapping[code] === roleName);
      console.log(`Converting ${roleName} to code:`, code);
      return code;
    }).filter(Boolean); // Remove any undefined values
    
    console.log('Final role codes:', roleCodes);

    const updatedPerson = {
      name,
      email: newEmail,
      affiliation,
      roles: roleCodes, // Update expects array of roles
    };
    console.log('Selected roles:', roles);
    console.log('Role codes to send:', roleCodes);
    console.log('Full update payload:', updatedPerson);
    axios
      .put(PEOPLE_UPDATE_ENDPOINT(person.email), updatedPerson, axiosConfig)
      .then(() => {
        fetchPeople();
        cancel();
      })
      .catch((error) =>
        setError(`There was a problem updating the person: ${error.message}`)
      );
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Edit Person</h3>

      <label htmlFor="edit-name">Name</label>
      <input
        required
        type="text"
        id="edit-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label htmlFor="edit-email">Email</label>
      <input
        required
        type="email"
        id="edit-email"
        value={newEmail}
        onChange={(e) => setNewEmail(e.target.value)}
      />

      <label htmlFor="edit-affiliation">Affiliation</label>
      <input
        required
        type="text"
        id="edit-affiliation"
        value={affiliation}
        onChange={(e) => setAffiliation(e.target.value)}
      />

      <label htmlFor="edit-role">Role</label>
      <select
        required
        id="edit-role"
        multiple
        value={roles}
        onChange={(e) => {
          const selectedRoles = Array.from(e.target.selectedOptions, option => option.value);
          setRoles(selectedRoles);
        }}
      >
        {availableRoles.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>

      <div className="form-buttons">
        <button type="button" onClick={cancel}>
          Cancel
        </button>
        <button type="submit">Save Changes</button>
      </div>
    </form>
  );
}

//visible, person, cancel, fetchPeople, setError

EditPersonForm.propTypes = {
  visible: PropTypes.bool.isRequired,
  person: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string.isRequired,
    affiliation: PropTypes.string,
    roles: PropTypes.arrayOf(PropTypes.string).isRequired,
  }),
  cancel: PropTypes.func.isRequired,
  fetchPeople: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
  };

function AddPersonForm({ visible, cancel, fetchPeople, setError }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [roles, setRoles] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [roleMapping, setRoleMapping] = useState({});
  const [password, setPassword] = useState('');

  // Fetch the list of roles from the backend
  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/roles`, axiosConfig)
      .then((response) => {
        // Store the role code to name mapping
        setRoleMapping(response.data);
        // Get array of role names for the select
        const rolesArray = Object.values(response.data);
        setAvailableRoles(rolesArray);
      })
      .catch((error) => {
        console.error('Error fetching roles:', error);
      });
  }, []);

  if (!visible) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!name || !email || !affiliation || roles.length === 0 || !password) {
      setError('All fields are required.');
      return;
    }

    // Convert role names to role codes
    console.log('Selected role names:', roles);
    console.log('Role mapping:', roleMapping);
    const hashedPassword = "simulated_hashed_" + password; 

    
    const roleCodes = roles.map(roleName => {
      // Find the code (key) for this role name (value)
      const code = Object.keys(roleMapping).find(code => roleMapping[code] === roleName);
      console.log(`Converting ${roleName} to code:`, code);
      return code;
    }).filter(Boolean); // Remove any undefined values
    
    console.log('Final role codes:', roleCodes);

    const newPerson = { 
      name, 
      email, 
      affiliation, 
      roles: roleCodes, // Send all roles
      password: hashedPassword
    };
    axios
      .put(PEOPLE_CREATE_ENDPOINT, newPerson, axiosConfig)
      .then(() => {
        fetchPeople();
        setName('');
        setEmail('');
        setAffiliation('');
        setRoles([]);
        setPassword('');
        cancel();
      })
      .catch((error) =>
        setError(`There was a problem adding the person: ${error.message}`)
      );
  };

  return (
    <form
      className="add-person-form"
      onSubmit={handleSubmit}
      data-testid="add-person-form"
    >
      <label htmlFor="name">Name</label>
      <input
        required
        type="text"
        id="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label htmlFor="email">Email</label>
      <input
        required
        type="email"
        id="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label htmlFor="affiliation">Affiliation</label>
      <input
        required
        type="text"
        id="affiliation"
        value={affiliation}
        onChange={(e) => setAffiliation(e.target.value)}
      />

      <label htmlFor="role">Role</label>
      <select
        required
        id="role"
        multiple
        value={roles}
        onChange={(e) => {
          const selectedRoles = Array.from(e.target.selectedOptions, option => option.value);
          setRoles(selectedRoles);
        }}
      >
        {availableRoles.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>

      <label htmlFor="password">Password</label>
      <input
        required
        type="password"
        id="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="form-buttons">
        <button type="button" onClick={cancel}>
          Cancel
        </button>
        <button type="submit">Add Person</button>
      </div>
    </form>
  );
}

AddPersonForm.propTypes = {
  visible: PropTypes.bool.isRequired,
  cancel: PropTypes.func.isRequired,
  fetchPeople: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
};

function ErrorMessage({ message }) {
  if (!message) return null;
  return <div className="error-message">{message}</div>;
}

ErrorMessage.propTypes = {
  message: PropTypes.string,
};

function Person({ person, fetchPeople, setError, onEdit }) {
  const { name, email, affiliation, roles } = person;
  const [roleMapping, setRoleMapping] = useState({});

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/roles`, axiosConfig)
      .then((response) => {
        setRoleMapping(response.data);
      })
      .catch((error) => {
        console.error('Error fetching roles:', error);
      });
  }, []);

  const handleDelete = () => {
    try {
      const confirmResult = window.confirm(
        `Are you sure you want to delete ${name || email}?`
      );
      if (confirmResult) {
        axios
          .delete(PEOPLE_DELETE_ENDPOINT(email), axiosConfig)
          .then(() => {
            fetchPeople();
          })
          .catch((error) =>
            setError(`Failed to delete person: ${error.message}`)
          );
      }
    } catch (error) {
      setError(
        'Cannot delete: Browser popups are disabled. Please enable popups and try again.'
      );
    }
  };

  return (
    <div className="person-container">
      <div className="person-details">
        {name ? (
          <Link to={`/people/${encodeURIComponent(email)}`}>
            <h2>{name}</h2>
          </Link>
        ) : (
          <h2>Unnamed Person</h2>
        )}
        <p>Email: {email}</p>
        {affiliation && <p>Affiliation: {affiliation}</p>}
        {roles && roles.length > 0 && (
          <p>Roles: {roles.map(code => roleMapping[code] || code).join(', ')}</p>
        )}
      </div>

      <div className="person-actions">
        <button type="button" onClick={() => onEdit(person)}>
          <FontAwesomeIcon icon={faPencilAlt} />
        </button>
        <button
          type="button"
          onClick={handleDelete}
          data-testid={`delete-${email}`}
        >
          <FontAwesomeIcon icon={faTrashAlt} />
        </button>
      </div>
    </div>
  );
}

Person.propTypes = {
  person: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string.isRequired,
    affiliation: PropTypes.string,
    roles: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  fetchPeople: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

function People() {
  const [people, setPeople] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingPerson, setAddingPerson] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const { user, isEditor } = useAuth();

  useEffect(() => {
    if (!user || !isEditor()) {
      setError('Please log in as an Editor or Managing Editor to view people.');
      setLoading(false);
      return;
    }
    fetchPeople();
  }, [user, isEditor]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        if (!user || !isEditor()) {
          setError('Please log in as an Editor or Managing Editor to view people.');
          setLoading(false);
        } else {
          fetchPeople();
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user, isEditor]);

  if (!user || !isEditor()) {
    return (
      <div className="people-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  const fetchPeople = () => {
    setLoading(true);
    axios
      .get(PEOPLE_READ_ENDPOINT, axiosConfig)
      .then((response) => {
        const peopleArray = Object.values(response.data);
        // Check for people without roles and log them
        const peopleWithoutRoles = peopleArray.filter(person => !person.roles || !person.roles.length);
        if (peopleWithoutRoles.length > 0) {
          const emails = peopleWithoutRoles.map(p => p.email).join(', ');
          console.error('Data integrity issue: Found people without roles:', peopleWithoutRoles);
          setError(`Warning: Found ${peopleWithoutRoles.length} people without roles (${emails}). Please contact system administrator.`);
        }
        
        // Still normalize the data to prevent crashes
        const normalizedPeople = peopleArray.map(person => ({
          ...person,
          roles: person.roles || [] // If roles is undefined, use empty array
        }));
        setPeople(normalizedPeople);
      })
      .catch((error) =>
        setError(`Failed to retrieve people: ${error.message}`)
      )
      .finally(() => setLoading(false));
  };

  if (!user || !isEditor()) {
    return <ErrorMessage message={error} />;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="people-container">
      <h1>People</h1>
      <ErrorMessage message={error} />

      <button
        type="button"
        onClick={() => setAddingPerson(true)}
        className="add-person-button"
      >
        Add Person
      </button>

      <AddPersonForm
        visible={addingPerson}
        cancel={() => setAddingPerson(false)}
        fetchPeople={fetchPeople}
        setError={setError}
      />

      {user && isEditor() && (
        <>
          <EditPersonForm
            visible={!!editingPerson}
            person={editingPerson}
            cancel={() => setEditingPerson(null)}
            fetchPeople={fetchPeople}
            setError={setError}
          />

          <div className="people-list">
            {people.map((person) => (
              <Person
                key={person.email}
                person={person}
                fetchPeople={fetchPeople}
                setError={setError}
                onEdit={setEditingPerson}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default People;