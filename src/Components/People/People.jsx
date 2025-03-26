import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './People.css';

import { BACKEND_URL } from '../../constants';

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
  const [role, setRole] = useState('');

  useEffect(() => {
    if (person) {
      setName(person.name || '');
      setNewEmail(person.email || '');
      setAffiliation(person.affiliation || '');
      setRole(person.roles && person.roles.length > 0 ? person.roles[0] : '');
    }
  }, [person]);

  if (!visible || !person) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!name || !newEmail || !affiliation || !role) {
      setError('All fields are required.');
      return;
    }

    const updatedPerson = {
      name,
      email: newEmail, // Match backend parameter name
      affiliation,
      role,
    };

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
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="">Select a role</option>
        <option value="Author">Author</option>
        <option value="Consulting Editor">Consulting Editor</option>
        <option value="Copy Editor">Copy Editor</option>
        <option value="Editor">Editor</option>
        <option value="Managing Editor">Managing Editor</option>
        <option value="Referee">Referee</option>
        <option value="Typesetter">Typesetter</option>
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

EditPersonForm.propTypes = {
  visible: PropTypes.bool.isRequired,
  person: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string.isRequired,
    affiliation: PropTypes.string,
    roles: PropTypes.arrayOf(PropTypes.string),
  }),
  cancel: PropTypes.func.isRequired,
  fetchPeople: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
};

function AddPersonForm({ visible, cancel, fetchPeople, setError }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [role, setRole] = useState('');

  if (!visible) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!name || !email || !affiliation || !role) {
      setError('All fields are required.');
      return;
    }

    const newPerson = { name, email, affiliation, role };

    axios
      .put(PEOPLE_CREATE_ENDPOINT, newPerson, axiosConfig)
      .then(() => {
        fetchPeople();
        setName('');
        setEmail('');
        setAffiliation('');
        setRole('');
        cancel(); // Hide the form after successful submission
      })
      .catch((error) =>
        setError(`There was a problem adding the person: ${error.message}`)
      );
  };

  return (
    <form onSubmit={handleSubmit}>
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
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="">Select a role</option>
        <option value="Author">Author</option>
        <option value="Consulting Editor">Consulting Editor</option>
        <option value="Copy Editor">Copy Editor</option>
        <option value="Editor">Editor</option>
        <option value="Managing Editor">Managing Editor</option>
        <option value="Referee">Referee</option>
        <option value="Typesetter">Typesetter</option>
      </select>

      <div className="form-buttons">
        <button type="button" onClick={cancel}>
          Cancel
        </button>
        <button type="submit">Submit</button>
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
        {roles && roles.length > 0 && <p>Roles: {roles.join(', ')}</p>}
      </div>

      <div className="person-actions">
        <button type="button" onClick={() => onEdit(person)}>
          <FontAwesomeIcon icon={faPencilAlt} />
        </button>
        <button type="button" onClick={handleDelete}>
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
    roles: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  fetchPeople: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

// Convert the backend data structure (object keyed by email) to an array
function peopleObjectToArray(data) {
  if (!data) return [];
  return Object.entries(data).map(([email, person]) => ({ ...person, email }));
}

function People() {
  const [error, setError] = useState('');
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingPerson, setAddingPerson] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);

  // Fetch the people from the backend
  const fetchPeople = () => {
    setLoading(true);
    axios
      .get(PEOPLE_READ_ENDPOINT, axiosConfig)
      .then(({ data }) => {
        const peopleArray = peopleObjectToArray(data);
        setPeople(peopleArray);
      })
      .catch((error) =>
        setError(`Failed to retrieve people: ${error.message}`)
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  // When clicking "Edit," set the editing person, hide the add form, and scroll to that spot
  const handleEditPerson = (person) => {
    setEditingPerson(person);
    setAddingPerson(false);

    // Wait for React to render the edit form, then scroll to it
    setTimeout(() => {
      const element = document.getElementById(`edit-person-${person.email}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 0);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingPerson(null);
  };

  return (
    <div className="wrapper">
      <header>
        <h1>View All People</h1>
        <button
          type="button"
          onClick={() => {
            setAddingPerson(true);
            setEditingPerson(null);
          }}
        >
          Add a Person
        </button>
      </header>

      {error && <ErrorMessage message={error} />}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <AddPersonForm
            visible={addingPerson}
            cancel={() => setAddingPerson(false)}
            fetchPeople={fetchPeople}
            setError={setError}
          />

          {/* 
            Map over the people. If the current person is being edited,
            show the EditPersonForm inline. Otherwise, show the Person card.
          */}
          {people.map((person) => {
            if (editingPerson && editingPerson.email === person.email) {
              return (
                <div key={person.email} id={`edit-person-${person.email}`}>
                  <EditPersonForm
                    visible
                    person={person}
                    cancel={handleCancelEdit}
                    fetchPeople={fetchPeople}
                    setError={setError}
                  />
                </div>
              );
            } else {
              return (
                <Person
                  key={person.email}
                  person={person}
                  fetchPeople={fetchPeople}
                  setError={setError}
                  onEdit={handleEditPerson}
                />
              );
            }
          })}
        </>
      )}
    </div>
  );
}

export default People;