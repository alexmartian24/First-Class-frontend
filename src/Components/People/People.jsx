// src/Components/People/People.jsx
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './People.css';
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
  withCredentials: false,
};

const PEOPLE_READ_ENDPOINT   = `${BACKEND_URL}/people`;
const PEOPLE_CREATE_ENDPOINT = `${BACKEND_URL}/people/create`;
const PEOPLE_UPDATE_ENDPOINT = (email) => `${BACKEND_URL}/people/${encodeURIComponent(email)}`;
const PEOPLE_DELETE_ENDPOINT = (email) => `${BACKEND_URL}/people/${encodeURIComponent(email)}`;

/**
 * AddPersonForm
 */
function AddPersonForm({ visible, cancel, fetchPeople, setError }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [roles, setRoles] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [roleMapping, setRoleMapping] = useState({});
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!visible) return;
    axios
      .get(`${BACKEND_URL}/roles`, axiosConfig)
      .then((response) => {
        setRoleMapping(response.data);
        setAvailableRoles(Object.values(response.data));
      })
      .catch((error) => {
        console.error('Error fetching roles:', error);
      });
  }, [visible]);

  // Reset form when opened
  useEffect(() => {
    if (visible) {
      setName('');
      setEmail('');
      setAffiliation('');
      setRoles([]);
      setPassword('');
      setError('');
    }
  }, [visible, setError]);

  if (!visible) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !affiliation || roles.length === 0 || !password) {
      setError('All fields are required.');
      return;
    }

    const roleCodes = roles
      .map((roleName) =>
        Object.keys(roleMapping).find((code) => roleMapping[code] === roleName)
      )
      .filter(Boolean);

    const newPerson = {
      name,
      email,
      affiliation,
      roles: roleCodes,
      password: 'simulated_hashed_' + password,
    };

    axios
      .post(PEOPLE_CREATE_ENDPOINT, newPerson, axiosConfig)
      .then(() => {
        fetchPeople();
        cancel();
      })
      .catch((error) => setError(`There was a problem adding the person: ${error.message}`));
  };

  return (
    <div className="modal-overlay">
      <form className="person-form" onSubmit={handleSubmit}>
        <h3>Add Person</h3>

        <label htmlFor="add-name">Name</label>
        <input
          id="add-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label htmlFor="add-email">Email</label>
        <input
          id="add-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="add-affiliation">Affiliation</label>
        <input
          id="add-affiliation"
          type="text"
          value={affiliation}
          onChange={(e) => setAffiliation(e.target.value)}
        />

        <label htmlFor="add-roles">Roles</label>
        <select
          id="add-roles"
          multiple
          value={roles}
          onChange={(e) => {
            const sel = Array.from(e.target.selectedOptions, (opt) => opt.value);
            setRoles(sel);
          }}
        >
          {availableRoles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <label htmlFor="add-password">Password</label>
        <input
          id="add-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="form-buttons">
          <button type="button" className="cancel" onClick={cancel}>Cancel</button>
          <button type="submit" className="save">Add</button>
        </div>
      </form>
    </div>
  );
}

AddPersonForm.propTypes = {
  visible: PropTypes.bool.isRequired,
  cancel: PropTypes.func.isRequired,
  fetchPeople: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
};

/**
 * EditPersonForm
 */
function EditPersonForm({ visible, person, cancel, fetchPeople, setError }) {
  const [name, setName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [roles, setRoles] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [roleMapping, setRoleMapping] = useState({});

  useEffect(() => {
    if (!visible) return;
    axios
      .get(`${BACKEND_URL}/roles`, axiosConfig)
      .then((response) => {
        setRoleMapping(response.data);
        setAvailableRoles(Object.values(response.data));
      })
      .catch((error) => console.error('Error fetching roles:', error));
  }, [visible]);

  useEffect(() => {
    if (visible && person && Object.keys(roleMapping).length) {
      setName(person.name || '');
      setNewEmail(person.email || '');
      setAffiliation(person.affiliation || '');
      const rn = (person.roles || []).map((code) => roleMapping[code] || code);
      setRoles(rn);
    }
  }, [visible, person, roleMapping]);

  if (!visible || !person) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !newEmail || !affiliation || roles.length === 0) {
      setError('All fields are required.');
      return;
    }

    const roleCodes = roles
      .map((roleName) =>
        Object.keys(roleMapping).find((code) => roleMapping[code] === roleName)
      )
      .filter(Boolean);

    const updated = {
      name,
      email: newEmail,
      affiliation,
      roles: roleCodes,
    };

    axios
      .put(PEOPLE_UPDATE_ENDPOINT(person.email), updated, axiosConfig)
      .then(() => {
        fetchPeople();
        cancel();
      })
      .catch((error) => setError(`There was a problem updating: ${error.message}`));
  };

  return (
    <div className="modal-overlay">
      <form className="person-form" onSubmit={handleSubmit}>
        <h3>Edit Person</h3>

        <label htmlFor="edit-name">Name</label>
        <input
          id="edit-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label htmlFor="edit-email">Email</label>
        <input
          id="edit-email"
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
        />

        <label htmlFor="edit-affiliation">Affiliation</label>
        <input
          id="edit-affiliation"
          type="text"
          value={affiliation}
          onChange={(e) => setAffiliation(e.target.value)}
        />

        <label htmlFor="edit-roles">Roles</label>
        <select
          id="edit-roles"
          multiple
          value={roles}
          onChange={(e) => {
            const sel = Array.from(e.target.selectedOptions, (opt) => opt.value);
            setRoles(sel);
          }}
        >
          {availableRoles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <div className="form-buttons">
          <button type="button" className="cancel" onClick={cancel}>Cancel</button>
          <button type="submit" className="save">Save</button>
        </div>
      </form>
    </div>
  );
}

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

/**
 * ErrorMessage
 */
function ErrorMessage({ message }) {
  if (!message) return null;
  return <div className="error-message">{message}</div>;
}
ErrorMessage.propTypes = {
  message: PropTypes.string,
};

/**
 * Person
 */
function Person({ person, fetchPeople, setError, onEdit }) {
  const { name, email, affiliation, roles } = person;
  const [roleMapping, setRoleMapping] = useState({});

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/roles`, axiosConfig)
      .then((res) => setRoleMapping(res.data))
      .catch((err) => console.error('Error fetching roles:', err));
  }, []);

  const handleDelete = () => {
    if (!window.confirm(`Delete ${name || email}?`)) return;
    axios
      .delete(PEOPLE_DELETE_ENDPOINT(email), axiosConfig)
      .then(() => fetchPeople())
      .catch((err) => setError(`Failed to delete: ${err.message}`));
  };

  return (
    <div className="person-card">
      <div className="person-card-header">
        <h2>
          <Link to={`/people/${encodeURIComponent(email)}`}>{name || 'Unnamed'}</Link>
        </h2>
      </div>

      <div className="person-card-body">
        <p><strong>Email:</strong> {email}</p>
        {affiliation && <p><strong>Affiliation:</strong> {affiliation}</p>}
        {roles?.length > 0 && (
          <p><strong>Roles:</strong> {roles.map(c => roleMapping[c] || c).join(', ')}</p>
        )}
      </div>

      <div className="person-card-actions">
        <button className="action-btn edit" onClick={() => onEdit(person)}>
          <FontAwesomeIcon icon={faPencilAlt} />
        </button>
        <button className="action-btn delete" onClick={handleDelete}>
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

/**
 * People (main)
 */
export default function People() {
  const { user, isEditor } = useAuth();
  const [people, setPeople]   = useState([]);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding]   = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    if (!user || !isEditor()) {
      setError('Please log in as an Editor or Managing Editor.');
      setLoading(false);
      return;
    }
    fetchPeople();
  }, [user, isEditor]);

  const fetchPeople = () => {
    setLoading(true);
    axios
      .get(PEOPLE_READ_ENDPOINT, axiosConfig)
      .then((res) => {
        const arr = Object.values(res.data || {});
        setPeople(arr);
      })
      .catch((err) => setError(`Failed to load: ${err.message}`))
      .finally(() => setLoading(false));
  };

  if (loading) return <div className="people-container"><p>Loading…</p></div>;
  if (error)   return <div className="people-container"><ErrorMessage message={error}/></div>;

  return (
    <div className="people-container">
      <div className="people-header">
        <h1>People</h1>
        <button
          className="add-person-button"
          onClick={() => { setAdding(true); setEditing(null); }}
        >
          + Add Person
        </button>
      </div>

      <ErrorMessage message={error} />

      <AddPersonForm
        visible={adding}
        cancel={() => setAdding(false)}
        fetchPeople={fetchPeople}
        setError={setError}
      />

      <EditPersonForm
        visible={!!editing}
        person={editing}
        cancel={() => setEditing(null)}
        fetchPeople={fetchPeople}
        setError={setError}
      />

      <div className="people-grid">
        {people.map((p) => (
          <Person
            key={p.email}
            person={p}
            fetchPeople={fetchPeople}
            setError={setError}
            onEdit={setEditing}
          />
        ))}
      </div>
    </div>
  );
}