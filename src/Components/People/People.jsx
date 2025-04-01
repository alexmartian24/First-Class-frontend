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
    const [password, setPassword] = useState('');

    if (!visible) return null;

    const handleSubmit = (event) => {
      event.preventDefault();
      if (!name || !email || !affiliation || !role || !password) {
        setError('All fields are required.');
        return;
      }

      const newPerson = { name, email, affiliation, role, password };

      axios
        .put(PEOPLE_CREATE_ENDPOINT, newPerson, axiosConfig)
        .then(() => {
          fetchPeople();
          setName('');
          setEmail('');
          setAffiliation('');
          setRole('');
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

        <label htmlFor="password">Password</label>
        <input
          required
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter a secure password"
        />

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
      roles: PropTypes.arrayOf(PropTypes.string),
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
    const [isAuthorized, setIsAuthorized] = useState(false);

    // Check user authorization
    useEffect(() => {
      const checkAuth = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !['Editor', 'Managing Editor'].includes(user.roles[0])) {
          setIsAuthorized(false);
          setError('Please log in as an Editor or Managing Editor to view people.');
          setLoading(false);
          return;
        }
        setIsAuthorized(true);
      };

      // Check initially
      checkAuth();

      // Listen for storage events (login/logout)
      const handleStorageChange = (e) => {
        if (e.key === 'user') {
          checkAuth();
        }
      };
      window.addEventListener('storage', handleStorageChange);

      // Cleanup
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }, []); // Only check authorization on mount

    // Fetch people whenever authorization changes
    useEffect(() => {
      if (isAuthorized) {
        fetchPeople();
      }
    }, [isAuthorized]);

    // Fetch the people from the backend
    const fetchPeople = () => {
      if (!isAuthorized) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      axios
        .get(PEOPLE_READ_ENDPOINT, axiosConfig)
        .then(({ data }) => {
          const peopleArray = Object.values(data);
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

    const handleEditPerson = (person) => {
      setEditingPerson(person);
      setAddingPerson(false);
    };

    const handleDeletePerson = (email) => {
      if (window.confirm('Are you sure you want to delete this person?')) {
        axios
          .delete(PEOPLE_DELETE_ENDPOINT(email), axiosConfig)
          .then(() => {
            fetchPeople();
          })
          .catch((error) =>
            setError(`Failed to delete person: ${error.message}`)
          );
      }
    };

    return (
      <div className="people-container">
        <header>
          <h1>People</h1>
        </header>
        
        {error && (
          <div className="error-message">
            {error}
            {!localStorage.getItem('user') && (
              <p>
                <Link to="/login" className="login-link">Click here to log in</Link>
              </p>
            )}
          </div>
        )}

        <div className="people-actions">
          <button onClick={() => setAddingPerson(true)}>
            Add Person
          </button>
        </div>

        <AddPersonForm
          visible={addingPerson}
          cancel={() => setAddingPerson(false)}
          fetchPeople={fetchPeople}
          setError={setError}
        />

        {isAuthorized && (
          <>
            <EditPersonForm
              visible={!!editingPerson}
              person={editingPerson}
              cancel={() => setEditingPerson(null)}
              fetchPeople={fetchPeople}
              setError={setError}
            />

            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="people-list">
                <table className="people-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Affiliation</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {people.map((person) => (
                      <tr key={person.email} className="person-row">
                        <td>
                          <Link to={`/people/${encodeURIComponent(person.email)}/manuscripts`} className="person-name-link">
                            {person.name}
                          </Link>
                        </td>
                        <td>{person.email}</td>
                        <td>{person.affiliation}</td>
                        <td>{person.roles[0]}</td>
                        <td className="person-actions">
                          <button onClick={() => handleEditPerson(person)}>
                            <FontAwesomeIcon icon={faPencilAlt} />
                          </button>
                          <button
                            onClick={() => handleDeletePerson(person.email)}
                            data-testid={`delete-${person.email}`}
                          >
                            <FontAwesomeIcon icon={faTrashAlt} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  export default People;