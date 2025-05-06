// src/Components/People/People.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './People.css';
import { BACKEND_URL } from '../../constants';
import { useAuth } from '../../context/AuthContext';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

const axiosConfig = {
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
};

const PEOPLE_READ_ENDPOINT = `${BACKEND_URL}/people`;
const PEOPLE_CREATE_ENDPOINT = `${BACKEND_URL}/people/create`;
const PEOPLE_UPDATE_ENDPOINT = (email) => `${BACKEND_URL}/people/${encodeURIComponent(email)}`;
const PEOPLE_DELETE_ENDPOINT = (email) => `${BACKEND_URL}/people/${encodeURIComponent(email)}`;

function RoleSelect({ value, onChange, options }) {
  return (
    <select multiple value={value} onChange={onChange}>
      {options.map((r) => (
        <option key={r} value={r}>{r}</option>
      ))}
    </select>
  );
}

function PersonForm({ visible, onSubmit, cancel, initialData = {}, isEdit = false, setError }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    affiliation: '',
    roles: [],
    password: '',
  });
  const [availableRoles, setAvailableRoles] = useState([]);
  const [roleMapping, setRoleMapping] = useState({});

  useEffect(() => {
    if (!visible) return;
    axios.get(`${BACKEND_URL}/roles`, axiosConfig)
      .then((res) => {
        setRoleMapping(res.data);
        setAvailableRoles(Object.values(res.data));
      })
      .catch((err) => console.error('Error fetching roles:', err));
  }, [visible]);

  useEffect(() => {
    if (visible) {
      const prefill = {
        name: initialData.name || '',
        email: initialData.email || '',
        affiliation: initialData.affiliation || '',
        roles: (initialData.roles || []).map((code) => initialData?.roleMapping?.[code] || code),
        password: '',
      };
      setFormData(prefill);
      setError('');
    }
  }, [visible, initialData, setError]);

  if (!visible) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRolesChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setFormData((prev) => ({ ...prev, roles: selected }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, affiliation, roles, password } = formData;
    if (!name || !email || !affiliation || roles.length === 0 || (!isEdit && !password)) {
      setError('All fields are required.');
      return;
    }
    const roleCodes = roles.map((roleName) => Object.keys(roleMapping).find((code) => roleMapping[code] === roleName)).filter(Boolean);
    const personPayload = {
      name,
      email,
      affiliation,
      roles: roleCodes,
      ...(isEdit ? {} : { password: 'simulated_hashed_' + password }),
    };

    onSubmit(personPayload);
  };

  return (
    <div className="modal-overlay">
      <form className="person-form" onSubmit={handleSubmit}>
        <h3>{isEdit ? 'Edit Person' : 'Add Person'}</h3>
        <label>Name</label>
        <input name="name" type="text" value={formData.name} onChange={handleChange} />
        <label>Email</label>
        <input name="email" type="email" value={formData.email} onChange={handleChange} />
        <label>Affiliation</label>
        <input name="affiliation" type="text" value={formData.affiliation} onChange={handleChange} />
        <label>Roles</label>
        <RoleSelect value={formData.roles} onChange={handleRolesChange} options={availableRoles} />
        {!isEdit && (
          <>
            <label>Password</label>
            <input name="password" type="password" value={formData.password} onChange={handleChange} />
          </>
        )}
        <div className="form-buttons">
          <button type="button" className="cancel" onClick={cancel}>Cancel</button>
          <button type="submit" className="save">{isEdit ? 'Save' : 'Add'}</button>
        </div>
      </form>
    </div>
  );
}

function ErrorMessage({ message }) {
  if (!message) return null;
  return <div className="error-message">{message}</div>;
}

function Person({ person, fetchPeople, setError, onEdit }) {
  const { name, email, affiliation, roles } = person;
  const [roleMapping, setRoleMapping] = useState({});

  useEffect(() => {
    axios.get(`${BACKEND_URL}/roles`, axiosConfig)
      .then((res) => setRoleMapping(res.data))
      .catch((err) => console.error('Error fetching roles:', err));
  }, []);

  const handleDelete = () => {
    if (!window.confirm(`Delete ${name || email}?`)) return;
    axios.delete(PEOPLE_DELETE_ENDPOINT(email), axiosConfig)
      .then(() => fetchPeople())
      .catch((err) => setError(`Failed to delete: ${err.message}`));
  };

  return (
    <div className="person-card">
      <div className="person-card-header">
        <h2><Link to={`/people/${encodeURIComponent(email)}`}>{name || 'Unnamed'}</Link></h2>
      </div>
      <div className="person-card-body">
        <p><strong>Email:</strong> {email}</p>
        {affiliation && <p><strong>Affiliation:</strong> {affiliation}</p>}
        {roles?.length > 0 && <p><strong>Roles:</strong> {roles.map((c) => roleMapping[c] || c).join(', ')}</p>}
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

export default function People() {
  const { user, isEditor } = useAuth();
  const [people, setPeople] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
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
    axios.get(PEOPLE_READ_ENDPOINT, axiosConfig)
      .then((res) => setPeople(Object.values(res.data || {})))
      .catch((err) => setError(`Failed to load: ${err.message}`))
      .finally(() => setLoading(false));
  };

  const handleAdd = (data) => {
    axios.post(PEOPLE_CREATE_ENDPOINT, data, axiosConfig)
      .then(() => { fetchPeople(); setAdding(false); })
      .catch((err) => setError(`Failed to add: ${err.message}`));
  };

  const handleEdit = (data) => {
    axios.put(PEOPLE_UPDATE_ENDPOINT(editing.email), data, axiosConfig)
      .then(() => { fetchPeople(); setEditing(null); })
      .catch((err) => setError(`Failed to update: ${err.message}`));
  };

  if (loading) return <div className="people-container"><p>Loading…</p></div>;
  if (error) return <div className="people-container"><ErrorMessage message={error} /></div>;

  return (
    <div className="people-container">
      <div className="people-header">
        <h1>People</h1>
        <button className="add-person-button" onClick={() => { setAdding(true); setEditing(null); }}>
          + Add Person
        </button>
      </div>
      <ErrorMessage message={error} />

      <PersonForm
        visible={adding}
        onSubmit={handleAdd}
        cancel={() => setAdding(false)}
        fetchPeople={fetchPeople}
        setError={setError}
      />

      <PersonForm
        visible={!!editing}
        onSubmit={handleEdit}
        cancel={() => setEditing(null)}
        initialData={editing}
        isEdit={true}
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