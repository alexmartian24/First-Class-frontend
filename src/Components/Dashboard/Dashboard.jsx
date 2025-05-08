// src/Components/Dashboard/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import propTypes from 'prop-types';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import { useAuth } from '../../context/AuthContext';
import { BACKEND_URL } from '../../constants';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

const PEOPLE_NAME_ENDPOINT = email =>
  `${BACKEND_URL}/people/name/${encodeURIComponent(email)}`;
const AUTHOR_MANUSCRIPTS_ENDPOINT = email =>
  `${BACKEND_URL}/manuscripts/${encodeURIComponent(email)}`;
const RECEIVE_ACTION_ENDPOINT = `${BACKEND_URL}/manuscripts/receive_action`;
const CREATE_MANUSCRIPT_ENDPOINT = `${BACKEND_URL}/manuscripts/create`;
const FETCH_MANUSCRIPT_ENDPOINT = `${BACKEND_URL}/manuscripts`;
const SORTED_MANUSCRIPTS_ENDPOINT = `${BACKEND_URL}/manuscripts/sorted`;
const MANUSCRIPTS_BY_STATE_ENDPOINT = state =>
  `${BACKEND_URL}/manuscripts/state/${encodeURIComponent(state)}`;
const DELETE_MANUSCRIPT_ENDPOINT = id =>
  `${BACKEND_URL}/manuscripts/delete/${encodeURIComponent(id)}`;
const STATE_NAMES_ENDPOINT = `${BACKEND_URL}/manuscripts/state_names`;
const VALID_STATES_ENDPOINT = `${BACKEND_URL}/manuscripts/valid_states`;

const axiosConfig = {
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  withCredentials: false
};

function CreateManuscriptForm({ visible, cancel, setError, onSuccess }) {
  const { user, setUser } = useAuth();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState(user?.email || '');

  useEffect(() => {
    if (user?.email) setAuthor(user.email);
  }, [user]);

  const handleSubmit = event => {
    event.preventDefault();
    const manuscriptData = { title, author };
    axios
      .put(CREATE_MANUSCRIPT_ENDPOINT, manuscriptData, axiosConfig)
      .then(() => {
        if (user && user.email === author && !user.roles.includes('AU')) {
          const updatedUser = { ...user, roles: [...user.roles, 'AU'] };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        setTitle('');
        setAuthor('');
        onSuccess();
      })
      .catch(error => {
        if (!error.response) {
          setError('Network error: Failed to reach server. Check your connection.');
        } else {
          setError(`API error: ${error.response.data.message || 'Unknown error occurred'}`);
        }
      });
  };

  if (!visible) return null;
  return (
    <form className="manuscript-form">
      <h2>Create New Manuscript</h2>
      <label htmlFor="title">Title</label>
      <input
        id="title"
        required
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <label htmlFor="author">Author</label>
      <input
        id="author"
        required
        type="text"
        value={author}
        onChange={e => setAuthor(e.target.value)}
      />

      <div className="form-buttons">
        <button type="button" onClick={cancel}>
          Cancel
        </button>
        <button type="submit" onClick={handleSubmit}>
          Create Manuscript
        </button>
      </div>
    </form>
  );
}

CreateManuscriptForm.propTypes = {
  visible: propTypes.bool.isRequired,
  cancel: propTypes.func.isRequired,
  setError: propTypes.func.isRequired,
  onSuccess: propTypes.func.isRequired
};

function ChangeStateForm({
  visible,
  manuscript,
  cancel,
  setError,
  fetchManuscripts,
  stateNames
}) {
  const { user } = useAuth();

  const manuscriptId = manuscript?.manu_id || '';
  const currentState = manuscript?.curr_state || '';
  const [newState, setNewState] = useState('');
  const [refereeEmail, setRefereeEmail] = useState('');
  const [refereesList, setRefereesList] = useState([]);
  const [actionMapping, setActionMapping] = useState({});

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/manuscripts/state_transitions`, axiosConfig)
      .then(r => setActionMapping(r.data))
      .catch(() => setError('Failed to load available state transitions'));
  }, [setError]);

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/people/referees`, axiosConfig)
      .then(r => setRefereesList(r.data))
      .catch(() => setError('Could not load referees list'));
  }, [setError]);

  const handleSubmit = event => {
    event.preventDefault();
    axios
      .put(
        RECEIVE_ACTION_ENDPOINT,
        {
          manu_id: manuscriptId,
          curr_state: currentState,
          action: newState,
          referee: refereeEmail || undefined
        },
        axiosConfig
      )
      .then(() => {
        cancel();
        fetchManuscripts();
      })
      .catch(error => {
        if (!error.response) {
          setError('Network error: Failed to reach server.');
        } else {
          setError(`API error: ${error.response.data.message || 'Unknown error occurred'}`);
        }
      });
  };

  if (!visible) return null;

  const availableActions = actionMapping[currentState] || [];
  const filteredActions = availableActions.filter(act =>
    act !== 'WIT' ? true : manuscript.author === user.email
  );

  return (
    <form className="manuscript-form state-form">
      <h2>Change Manuscript State</h2>
      <div className="form-group">
        <label htmlFor="manuscriptId">Manuscript ID</label>
        <input
          id="manuscriptId"
          value={manuscriptId}
          readOnly
          className="readonly-field"
        />
      </div>
      <div className="form-group">
        <label htmlFor="currentState">Current State</label>
        <input
          id="currentState"
          value={stateNames[currentState] || currentState}
          readOnly
          className="readonly-field"
        />
      </div>
      <div className="form-group">
        <label htmlFor="newState">New State</label>
        <select
          id="newState"
          required
          value={newState}
          onChange={e => {
            setNewState(e.target.value);
            if (e.target.value !== 'ARF' && e.target.value !== 'DRF') {
              setRefereeEmail('');
            }
          }}
        >
          <option value="">Select action</option>
          {filteredActions.length > 0 ? (
            filteredActions.map(act => (
              <option key={act} value={act}>
                {stateNames[act] || act}
              </option>
            ))
          ) : (
            <option value="">No actions available</option>
          )}
        </select>
      </div>
      {(newState === 'ARF' || newState === 'DRF') && (
        <div className="form-group">
          <label htmlFor="refereeEmail">Referee Email</label>
          <select
            id="refereeEmail"
            required
            value={refereeEmail}
            onChange={e => setRefereeEmail(e.target.value)}
          >
            <option value="">— Select a referee —</option>
            {refereesList.map(email => (
              <option key={email} value={email}>
                {email}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="form-buttons">
        <button type="button" onClick={cancel}>
          Cancel
        </button>
        <button disabled={!newState} type="submit" onClick={handleSubmit}>
          Perform Action
        </button>
      </div>
    </form>
  );
}

ChangeStateForm.propTypes = {
  visible: propTypes.bool.isRequired,
  manuscript: propTypes.object,
  cancel: propTypes.func.isRequired,
  setError: propTypes.func.isRequired,
  fetchManuscripts: propTypes.func.isRequired,
  stateNames: propTypes.object.isRequired
};

function Dashboard() {
  const { isEditor, user } = useAuth();
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingManuscript, setEditingManuscript] = useState(null);
  const [manuscripts, setManuscripts] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isAuthor, setIsAuthor] = useState(false);
  const [authorNames, setAuthorNames] = useState({});
  const [stateNames, setStateNames] = useState({});
  const [viewMode, setViewMode] = useState('default');
  const [validStates, setValidStates] = useState([]);
  const [validStateOptions, setValidStateOptions] = useState([]);

  const toggleCreateForm = () => setShowCreateForm(s => !s);
  const handleManuscriptCreated = () => {
    setError('');
    setShowCreateForm(false);
    fetchManuscripts();
  };

  const fetchManuscripts = () => {
    if (!isAuthorized && !isAuthor) return;
    let endpoint;
    if (isAuthor && !isAuthorized && user.email) {
      endpoint = AUTHOR_MANUSCRIPTS_ENDPOINT(user.email);
    } else {
      switch (viewMode) {
        case 'sorted':
          endpoint = SORTED_MANUSCRIPTS_ENDPOINT;
          break;
        case 'default':
          endpoint = FETCH_MANUSCRIPT_ENDPOINT;
          break;
        default:
          endpoint = validStates.includes(viewMode)
            ? MANUSCRIPTS_BY_STATE_ENDPOINT(viewMode)
            : FETCH_MANUSCRIPT_ENDPOINT;
      }
    }
    axios
      .get(endpoint, axiosConfig)
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : [data];
        setManuscripts(viewMode === 'sorted' ? list.reverse() : list);
      })
      .catch(err => setError(`Failed to retrieve manuscripts: ${err.message}`));
  };

  useEffect(() => {
    axios.get(STATE_NAMES_ENDPOINT, axiosConfig).then(({ data }) => {
      if (Array.isArray(data)) {
        const sn = {}, ss = [];
        data.forEach(i => {
          if (i.code && i.name) {
            sn[i.code] = i.name;
            ss.push(i.code);
          }
        });
        setStateNames(sn);
        setValidStates(ss);
      } else {
        setStateNames(data);
        setValidStates(Object.keys(data));
      }
    });
    axios.get(VALID_STATES_ENDPOINT, axiosConfig).then(({ data }) => {
      if (Array.isArray(data)) {
        setValidStateOptions(data);
      }
    });
  }, []);

  useEffect(() => {
    setIsAuthorized(isEditor());
    setIsAuthor(!!user?.email);
    if (!user || (!isEditor() && !user.email)) {
      setError('Please log in to view manuscripts.');
    }
  }, [user, isEditor]);

  useEffect(fetchManuscripts, [isAuthorized, isAuthor, viewMode]);

  useEffect(() => {
    const authorsList = [...new Set(manuscripts.map(m => m.author))];
    authorsList.forEach(email => {
      if (email.includes('@') && !authorNames[email]) {
        axios
          .get(PEOPLE_NAME_ENDPOINT(email), axiosConfig)
          .then(({ data }) => {
            if (data.name) {
              setAuthorNames(prev => ({ ...prev, [email]: data.name }));
            }
          })
          .catch(() => {});
      }
    });
  }, [manuscripts, authorNames]);

  const handleEdit = manuscript => setEditingManuscript(manuscript);
  const handleDelete = manuscript => {
    if (window.confirm(`Are you sure you want to delete manuscript ${manuscript.manu_id}?`)) {
      axios
        .delete(DELETE_MANUSCRIPT_ENDPOINT(manuscript.manu_id), axiosConfig)
        .then(fetchManuscripts)
        .catch(err => setError(`Error deleting: ${err.message}`));
    }
  };
  const cancelEdit = () => setEditingManuscript(null);

  return (
    <div className="dashboard-container">
      <h1>Manuscript Management</h1>
      {error && (
        <div className="error-message">
          {error}
          {!localStorage.getItem('user') && (
            <p>
              <Link to="/login" className="login-link">
                Click here to log in
              </Link>
            </p>
          )}
        </div>
      )}

      {(isAuthorized || isAuthor) && (
        <div className="dashboard-buttons">
          <button onClick={toggleCreateForm}>
            {showCreateForm ? 'Cancel Create' : 'Create New Manuscript'}
          </button>
        </div>
      )}

      <CreateManuscriptForm
        visible={showCreateForm}
        cancel={toggleCreateForm}
        setError={setError}
        onSuccess={handleManuscriptCreated}
      />

      {editingManuscript && (
        <ChangeStateForm
          visible
          manuscript={editingManuscript}
          cancel={cancelEdit}
          setError={setError}
          fetchManuscripts={fetchManuscripts}
          stateNames={stateNames}
        />
      )}

      {isAuthorized && (
        <div className="view-controls">
          <h3>View Options</h3>
          <div className="view-buttons">
            <button
              className={viewMode === 'default' ? 'active' : ''}
              onClick={() => setViewMode('default')}
            >
              Default Order
            </button>
            <button
              className={viewMode === 'sorted' ? 'active' : ''}
              onClick={() => setViewMode('sorted')}
            >
              Sort by State
            </button>
          </div>
          {validStateOptions.length > 0 && (
            <div className="filter-controls">
              <label htmlFor="stateFilter">Filter by State:</label>
              <select
                id="stateFilter"
                value={validStates.includes(viewMode) ? viewMode : ''}
                onChange={e => setViewMode(e.target.value || 'default')}
              >
                <option value="">-- Select State --</option>
                {validStateOptions.map(s => (
                  <option key={s.code} value={s.code}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {(isAuthorized || isAuthor) && (
        manuscripts.length > 0 ? (
          <div className="manuscripts-list">
            <h2>
              {isAuthor && !isAuthorized && 'Your Manuscripts'}
              {isAuthorized && viewMode === 'default' && 'All Manuscripts'}
              {isAuthorized && viewMode === 'sorted' && 'Manuscripts Sorted by State'}
              {isAuthorized && validStates.includes(viewMode) &&
                `Manuscripts in State: ${stateNames[viewMode] || viewMode}`}
            </h2>
            <table className="manuscripts-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>State</th>
                  {(isAuthorized || isAuthor) && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {manuscripts.map(m => (
                  <tr key={m.manu_id}>
                    <td>{m.manu_id}</td>
                    <td>{m.title}</td>
                    <td>
                      {m.author.includes('@') && authorNames[m.author]
                        ? authorNames[m.author]
                        : m.author}
                    </td>
                    <td>
                      <span className={`state-badge state-${m.curr_state.toLowerCase()}`}>
                        {stateNames[m.curr_state] || m.curr_state}
                      </span>
                    </td>
                    {(isAuthorized || (isAuthor && m.author === user.email)) && (
                      <td>
                        <div className="action-buttons">
                          <button onClick={() => handleEdit(m)}>
                            <FontAwesomeIcon icon={faPencilAlt} />
                          </button>
                          {isAuthorized && (
                            <button onClick={() => handleDelete(m)}>
                              <FontAwesomeIcon icon={faTrashAlt} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No manuscripts found.</p>
        )
      )}
    </div>
  );
}

export default Dashboard;
