import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Link } from 'react-router-dom';

import { BACKEND_URL } from '../../constants';

const PEOPLE_READ_ENDPOINT = `${BACKEND_URL}/people`;
const PEOPLE_CREATE_ENDPOINT = `${BACKEND_URL}/people/create`;
const PEOPLE_DELETE_ENDPOINT = (email) => `${BACKEND_URL}/people/${encodeURIComponent(email)}`;

function AddPersonForm({ visible, cancel, fetchPeople, setError }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!name || !email || !affiliation || !role) {
      setError('All fields are required.');
      return;
    }

    const newPerson = { name, email, affiliation, role };

    axios.put(PEOPLE_CREATE_ENDPOINT, newPerson)
      .then(() => {
        fetchPeople();
        setName('');
        setEmail('');
        setAffiliation('');
        setRole('');
      })
      .catch((error) => setError(`There was a problem adding the person: ${error.message}`));
  };

  if (!visible) return null;

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="name">Name</label>
      <input required type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} />

      <label htmlFor="email">Email</label>
      <input required type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />

      <label htmlFor="affiliation">Affiliation</label>
      <input required type="text" id="affiliation" value={affiliation} onChange={(e) => setAffiliation(e.target.value)} />

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
        <button type="button" onClick={cancel}>Cancel</button>
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

function Person({ person, fetchPeople, setError }) {
  const { name, email, affiliation, roles } = person;

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${name || email}?`)) {
      axios.delete(PEOPLE_DELETE_ENDPOINT(email))
        .then(() => {
          fetchPeople();
        })
        .catch((error) => setError(`Failed to delete person: ${error.message}`));
    }
  };

  return (
    <div className="person-container">
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
      <button type="button" onClick={handleDelete} className="delete-button">Delete</button>
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
};

function peopleObjectToArray(data) {
  if (!data) return [];
  return Object.entries(data).map(([email, person]) => ({ ...person, email }));
}

function People() {
  const [error, setError] = useState('');
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingPerson, setAddingPerson] = useState(false);

  const fetchPeople = () => {
    setLoading(true);
    axios.get(PEOPLE_READ_ENDPOINT)
      .then(({ data }) => setPeople(peopleObjectToArray(data)))
      .catch((error) => setError(`Failed to retrieve people: ${error.message}`))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  return (
    <div className="wrapper">
      <header>
        <h1>View All People</h1>
        <button type="button" onClick={() => setAddingPerson(true)}>Add a Person</button>
      </header>

      {error && <ErrorMessage message={error} />}
      {loading ? <p>Loading...</p> : (
        <>
          <AddPersonForm
            visible={addingPerson}
            cancel={() => setAddingPerson(false)}
            fetchPeople={fetchPeople}
            setError={setError}
          />
          {people.map((person) => (
            <Person 
              key={person.email} 
              person={person} 
              fetchPeople={fetchPeople}
              setError={setError}
            />
          ))}
        </>
      )}
    </div>
  );
}

export default People;
