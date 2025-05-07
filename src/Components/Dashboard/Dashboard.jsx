// src/Components/Dashboard/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import propTypes from 'prop-types';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import { useAuth } from '../../context/AuthContext';

import { BACKEND_URL } from '../../constants';

const PEOPLE_NAME_ENDPOINT = (email) =>
  `${BACKEND_URL}/people/name/${encodeURIComponent(email)}`;
const AUTHOR_MANUSCRIPTS_ENDPOINT = (email) =>
  `${BACKEND_URL}/manuscripts/${encodeURIComponent(email)}`;

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

const axiosConfig = {
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  },
  withCredentials: false
};

const RECEIVE_ACTION_ENDPOINT = `${BACKEND_URL}/manuscripts/receive_action`;
const CREATE_MANUSCRIPT_ENDPOINT = `${BACKEND_URL}/manuscripts/create`;
const FETCH_MANUSCRIPT_ENDPOINT = `${BACKEND_URL}/manuscripts`;
const SORTED_MANUSCRIPTS_ENDPOINT = `${BACKEND_URL}/manuscripts/sorted`;
const MANUSCRIPTS_BY_STATE_ENDPOINT = (state) =>
  `${BACKEND_URL}/manuscripts/state/${encodeURIComponent(state)}`;
const DELETE_MANUSCRIPT_ENDPOINT = (id) =>
  `${BACKEND_URL}/manuscripts/delete/${encodeURIComponent(id)}`;

// State names will be fetched from the backend
const STATE_NAMES_ENDPOINT = `${BACKEND_URL}/manuscripts/state_names`;
const VALID_STATES_ENDPOINT = `${BACKEND_URL}/manuscripts/valid_states`;

function CreateManuscriptForm({ visible, cancel, setError, onSuccess }) {
  const { user, setUser } = useAuth();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState(user?.email || '');

  // Update author field when user changes
  useEffect(() => {
    if (user?.email) {
      setAuthor(user.email);
    }
  }, [user]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const manuscriptData = { title, author };

    axios
      .put(CREATE_MANUSCRIPT_ENDPOINT, manuscriptData, axiosConfig)
      .then((response) => {
        console.log('Manuscript created successfully:', response.data);

        // If the current user is the author and has no AU role, add it
        if (user && user.email === author && !user.roles.includes('AU')) {
          const updatedUser = {
            ...user,
            roles: [...user.roles, 'AU']
          };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }

        setTitle('');
        setAuthor('');
        if (onSuccess) onSuccess();
      })
      .catch((error) => {
        if (!error.response) {
          setError('Network error: Failed to reach server. Check your connection.');
        } else {
          setError(`API error: ${error.response.data.message || 'Unknown error occurred'}`);
        }
        console.error('API Error Details:', error);
      });
  };

  if (!visible) return null;

  return (
    <form className="manuscript-form">
      <h2>Create New Manuscript</h2>
      <label htmlFor="title">Title</label>
      <input
        required
        type="text"
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label htmlFor="author">Author</label>
      <input
        required
        type="text"
        id="author"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
      />

      <div className="form-buttons">
        <button type="button" onClick={cancel}>Cancel</button>
        <button type="submit" onClick={handleSubmit}>Create Manuscript</button>
      </div>
    </form>
  );
}

CreateManuscriptForm.propTypes = {
  visible: propTypes.bool.isRequired,
  cancel: propTypes.func.isRequired,
  setError: propTypes.func.isRequired,
  onSuccess: propTypes.func
};

function ChangeStateForm({ visible, manuscript, cancel, setError, fetchManuscripts, stateNames }) {
  const stateNamesObj = stateNames && !Array.isArray(stateNames) ? stateNames : {};
  const manuscriptId = manuscript?.manu_id || '';
  const currentState = manuscript?.curr_state || '';
  const [newState, setNewState] = useState('');
  const [refereeEmail, setRefereeEmail] = useState('');
  const [refereesList, setRefereesList] = useState([]);

  const [actionMapping, setActionMapping] = useState({});

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/manuscripts/state_transitions`, axiosConfig)
      .then((response) => setActionMapping(response.data))
      .catch((error) => {
        console.error('Failed to fetch action mapping:', error);
        setError('Failed to load available state transitions');
      });
  }, []);

  useEffect(() => {
    if (manuscript) {
      setNewState('');
    }
  }, [manuscript]);

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/people/referees`, axiosConfig)
      .then(({ data }) => setRefereesList(data))
      .catch((err) => {
        console.error('Failed to load referees:', err);
        setError('Could not load referees list');
      });
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const actionData = {
      manu_id: manuscriptId,
      curr_state: currentState,
      action: newState,
      referee: refereeEmail || undefined
    };

    axios
      .put(RECEIVE_ACTION_ENDPOINT, actionData, axiosConfig)
      .then(() => {
        cancel();
        fetchManuscripts();
      })
      .catch((error) => {
        if (!error.response) {
          setError('Network error: Failed to reach server.');
        } else {
          setError(`API error: ${error.response.data.message || 'Unknown error occurred'}`);
        }
        console.error('API Error Details:', error);
      });
  };

  const availableActions =
    currentState && actionMapping[currentState]
      ? actionMapping[currentState]
      : [];

  if (!visible) return null;

  return (
    <form className="manuscript-form state-form">
      <h2>Change Manuscript State</h2>

      <div className="form-group">
        <label htmlFor="manuscriptId">Manuscript ID</label>
        <input
          type="text"
          id="manuscriptId"
          value={manuscriptId}
          readOnly
          className="readonly-field"
        />
      </div>

      <div className="form-group">
        <label htmlFor="currentState">Current State</label>
        <input
          type="text"
          id="currentState"
          value={stateNamesObj[currentState] || currentState}
          readOnly
          className="readonly-field"
        />
      </div>

      <div className="form-group">
        <label htmlFor="newState">New State</label>
        <select
          required
          id="newState"
          value={newState}
          onChange={(e) => {
            setNewState(e.target.value);
            if (e.target.value !== 'DRF' && e.target.value !== 'ARF') {
              setRefereeEmail('');
            }
          }}
        >
          <option value="">Select action</option>
          {availableActions.map((action) => (
            <option key={action} value={action}>
              {stateNamesObj[action] || action}
            </option>
          ))}
        </select>
      </div>

      {(newState === 'DRF' || newState === 'ARF') && (
        <div className="form-group">
          <label htmlFor="refereeEmail">Referee Email</label>
          <select
            id="refereeEmail"
            value={refereeEmail}
            onChange={(e) => setRefereeEmail(e.target.value)}
            required
          >
            <option value="">— Select a referee —</option>
            {refereesList.map((email) => (
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
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={!manuscriptId || !currentState || !newState}
        >
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
  stateNames: propTypes.oneOfType([propTypes.object, propTypes.array])
};

function ManuscriptActionForm({ visible, cancel, setError, manuscriptId, setManuscriptId }) {
  const [currentState, setCurrentState] = useState('SUB');
  const [action, setAction] = useState('');
  const [referee, setReferee] = useState('');
  const [actionMapping, setActionMapping] = useState({});

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/manuscripts/state_transitions`, axiosConfig)
      .then((response) => {
        setActionMapping(response.data);
      })
      .catch((error) => {
        console.error('Error fetching state transitions:', error);
      });
  }, []);

  const availableStates =
    Object.keys(actionMapping).length > 0
      ? Object.keys(actionMapping)
      : ['SUB', 'REV', 'AUR', 'CED', 'FMT', 'PUB', 'REJ', 'WIT', 'EDR'];

  const changeManuscriptId = (e) => setManuscriptId(e.target.value);
  const changeCurrentState = (e) => {
    setCurrentState(e.target.value);
    setAction('');
  };
  const changeAction = (e) => setAction(e.target.value);
  const changeReferee = (e) => setReferee(e.target.value);

  const submitAction = (e) => {
    e.preventDefault();
    if (!manuscriptId.trim()) {
      setError('Manuscript ID is required.');
      return;
    }
    const actionData = {
      manu_id: manuscriptId,
      curr_state: currentState,
      action,
      referee: referee || undefined
    };

    axios
      .put(RECEIVE_ACTION_ENDPOINT, actionData, axiosConfig)
      .then(() => {
        setManuscriptId('');
        setCurrentState(availableStates[0] || 'SUB');
        setAction('');
        setReferee('');
      })
      .catch((error) => {
        setError(
          `There was a problem performing the action: ${
            error.response?.data?.message || error.message
          }`
        );
      });
  };

  if (!visible) return null;

  return (
    <form className="manuscript-action-form">
      <div className="form-header">
        <h2>Perform Manuscript Action</h2>
      </div>

      <div className="form-group">
        <label htmlFor="manuscriptId">Manuscript ID</label>
        <input
          required
          type="text"
          id="manuscriptId"
          value={manuscriptId}
          onChange={changeManuscriptId}
        />
      </div>

      <div className="form-group">
        <label htmlFor="currentState">Current State</label>
        <select
          required
          id="currentState"
          value={currentState}
          onChange={changeCurrentState}
        >
          {availableStates.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="action">Action</label>
        <select required id="action" value={action} onChange={changeAction}>
          <option value="">Select an action...</option>
          {actionMapping[currentState] && actionMapping[currentState].length > 0 ? (
            actionMapping[currentState].map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))
          ) : (
            <option value="">No actions available</option>
          )}
        </select>
      </div>

      {(action === 'ARF' || action === 'DRF') && (
        <div className="form-group">
          <label htmlFor="referee">
            {action === 'ARF'
              ? 'Referee Email to Add'
              : 'Referee Email to Remove'}
          </label>
          <input
            type="email"
            id="referee"
            value={referee}
            onChange={changeReferee}
          />
        </div>
      )}

      <div className="form-buttons">
        <button type="button" onClick={cancel}>
          Cancel
        </button>
        <button type="submit" onClick={submitAction}>
          Submit Action
        </button>
      </div>
    </form>
  );
}

ManuscriptActionForm.propTypes = {
  visible: propTypes.bool.isRequired,
  cancel: propTypes.func.isRequired,
  setError: propTypes.func.isRequired,
  manuscriptId: propTypes.string.isRequired,
  setManuscriptId: propTypes.func.isRequired
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

  const fetchManuscripts = () => {
    if (!isAuthorized && !isAuthor) return;

    let endpoint;

    if (isAuthor && !isAuthorized && user?.email) {
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
          if (validStates.includes(viewMode)) {
            endpoint = MANUSCRIPTS_BY_STATE_ENDPOINT(viewMode);
          } else {
            endpoint = FETCH_MANUSCRIPT_ENDPOINT;
          }
      }
    }

    axios
      .get(endpoint, axiosConfig)
      .then(({ data }) => {
        let manuscriptsArray = Array.isArray(data) ? data : [data];
        if (viewMode === 'sorted') {
          manuscriptsArray = manuscriptsArray.slice().reverse();
        }
        setManuscripts(manuscriptsArray);
      })
      .catch((err) => {
        console.error(`Error fetching manuscripts (${viewMode}):`, err);
        setError(`Failed to retrieve manuscripts: ${err.message}`);
        if (viewMode !== 'default') {
          setViewMode('default');
          axios
            .get(FETCH_MANUSCRIPT_ENDPOINT, axiosConfig)
            .then(({ data }) => {
              const manuscriptsArray = Array.isArray(data) ? data : [data];
              setManuscripts(manuscriptsArray);
            })
            .catch((retryErr) => {
              console.error('Error fetching manuscripts (fallback):', retryErr);
              setError(`Failed to retrieve manuscripts: ${retryErr.message}`);
            });
        }
      });
  };

  useEffect(() => {
    axios
      .get(STATE_NAMES_ENDPOINT, axiosConfig)
      .then(({ data }) => {
        if (data && typeof data === 'object') {
          if (Array.isArray(data)) {
            const stateNamesObj = {};
            const stateCodesList = [];
            data.forEach((item) => {
              if (item && item.code && item.name) {
                stateNamesObj[item.code] = item.name;
                stateCodesList.push(item.code);
              }
            });
            setStateNames(stateNamesObj);
            setValidStates(stateCodesList);
          } else {
            setStateNames(data);
            setValidStates(Object.keys(data));
          }
        } else {
          console.error('Invalid state names data received:', data);
          setStateNames({});
          setValidStates([]);
        }
      })
      .catch((err) => {
        console.error('Error fetching state names:', err);
        setError(`Failed to retrieve state names: ${err.message}`);
        setStateNames({});
      });
  }, []);

  useEffect(() => {
    axios
      .get(VALID_STATES_ENDPOINT, axiosConfig)
      .then(({ data }) => {
        if (Array.isArray(data)) {
          const stateCodes = data.map((state) => state.code);
          setValidStates(stateCodes);
          setValidStateOptions(data);
        } else {
          console.error('Invalid valid states data received:', data);
          setValidStateOptions([]);
        }
      })
      .catch((err) => {
        console.error('Error fetching valid states:', err);
        setValidStateOptions([]);
      });
  }, []);

  useEffect(() => {
    if (user && isEditor()) {
      setIsAuthorized(true);
      setError('');
    } else {
      setIsAuthorized(false);
    }

    if (user && user.email) {
      setIsAuthor(true);
      setError('');
    } else {
      setIsAuthor(false);
    }

    if (!user || (!isEditor() && !user.email)) {
      setError('Please log in to view manuscripts.');
    }
  }, [user, isEditor]);

  useEffect(() => {
    if (isAuthorized || isAuthor) {
      fetchManuscripts();
    }
  }, [isAuthorized, isAuthor, viewMode]);

  useEffect(() => {
    if (manuscripts.length > 0) {
      const uniqueAuthors = [...new Set(manuscripts.map((m) => m.author))];
      uniqueAuthors.forEach((authorEmail) => {
        if (authorEmail && authorEmail.includes('@')) {
          fetchAuthorName(authorEmail);
        }
      });
    }
  }, [manuscripts]);

  const fetchAuthorName = (email) => {
    if (authorNames[email] || !email.includes('@')) return;

    axios
      .get(PEOPLE_NAME_ENDPOINT(email), axiosConfig)
      .then((response) => {
        if (response.data && response.data.name) {
          setAuthorNames((prev) => ({
            ...prev,
            [email]: response.data.name
          }));
        }
      })
      .catch((error) => {
        console.error(`Error fetching name for ${email}:`, error);
      });
  };

  const toggleCreateForm = () => setShowCreateForm((s) => !s);

  const handleManuscriptCreated = () => {
    setError('');
    setShowCreateForm(false);
    fetchManuscripts();
  };

  const handleEdit = (manuscript) => setEditingManuscript(manuscript);

  const handleDelete = (manuscript) => {
    if (
      window.confirm(
        `Are you sure you want to delete manuscript ID ${manuscript.manu_id}?`
      )
    ) {
      axios
        .delete(DELETE_MANUSCRIPT_ENDPOINT(manuscript.manu_id), axiosConfig)
        .then(() => fetchManuscripts())
        .catch((error) =>
          setError(
            `Error deleting manuscript: ${error.response?.data?.message ||
              error.message}`
          )
        );
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
        cancel={() => setShowCreateForm(false)}
        setError={setError}
        onSuccess={handleManuscriptCreated}
      />

      {editingManuscript && (
        <ChangeStateForm
          visible={!!editingManuscript}
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
                onChange={(e) => setViewMode(e.target.value || 'default')}
              >
                <option value="">-- Select State --</option>
                {validStateOptions.map((state) => (
                  <option key={state.code} value={state.code}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {(isAuthorized || isAuthor) && (
        <>
          {manuscripts.length > 0 ? (
            <div className="manuscripts-list">
              <h2>
                {isAuthor && !isAuthorized && 'Your Manuscripts'}
                {isAuthorized && viewMode === 'default' && 'All Manuscripts'}
                {isAuthorized && viewMode === 'sorted' && 'Manuscripts Sorted by State'}
                {isAuthorized && validStates.includes(viewMode) && `Manuscripts in State: ${stateNames[viewMode] || viewMode}`}
              </h2>
              <table className="manuscripts-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>State</th>
                    {isAuthorized && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {manuscripts.map((manuscript) => (
                    <tr key={manuscript.manu_id}>
                      <td>{manuscript.manu_id}</td>
                      <td>{manuscript.title}</td>
                      <td>
                        {manuscript.author &&
                        manuscript.author.includes('@') &&
                        authorNames[manuscript.author]
                          ? authorNames[manuscript.author]
                          : manuscript.author}
                      </td>
                      <td>
                        <span
                          className={`state-badge state-${manuscript.curr_state?.toLowerCase()}`}
                        >
                          {stateNames[manuscript.curr_state] ||
                            manuscript.curr_state}
                        </span>
                      </td>
                      {isAuthorized && (
                        <td>
                          <div className="action-buttons">
                            <button onClick={() => handleEdit(manuscript)}>
                              <FontAwesomeIcon icon={faPencilAlt} />
                            </button>
                            <button onClick={() => handleDelete(manuscript)}>
                              <FontAwesomeIcon icon={faTrashAlt} />
                            </button>
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
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;