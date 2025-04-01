import React, { useState, useEffect } from 'react';
import propTypes from 'prop-types';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Dashboard.css';

import { BACKEND_URL } from '../../constants';

const axiosConfig = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false
};

const RECEIVE_ACTION_ENDPOINT = `${BACKEND_URL}/manuscripts/receive_action`;
const CREATE_MANUSCRIPT_ENDPOINT = `${BACKEND_URL}/manuscripts/create`;
const FETCH_MANUSCRIPT_ENDPOINT = `${BACKEND_URL}/manuscripts`;
const UPDATE_MANUSCRIPT_ENDPOINT = (id) => `${BACKEND_URL}/manuscripts/update/${encodeURIComponent(id)}`;
const DELETE_MANUSCRIPT_ENDPOINT = (id) => `${BACKEND_URL}/manuscripts/${encodeURIComponent(id)}`;

function CreateManuscriptForm({ visible, cancel, setError, onSuccess }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const manuscriptData = { title, author };

    axios
      .put(CREATE_MANUSCRIPT_ENDPOINT, manuscriptData, axiosConfig)
      .then((response) => {
        console.log('Manuscript created successfully:', response.data);
        setTitle('');
        setAuthor('');
        if (onSuccess) onSuccess(response.data.Return);
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
  onSuccess: propTypes.func,
};

function EditManuscriptForm({ visible, manuscript, cancel, setError, fetchManuscripts }) {
  const [title, setTitle] = useState(manuscript.title);
  const [author, setAuthor] = useState(manuscript.author);

  useEffect(() => {
    if (manuscript) {
      setTitle(manuscript.title);
      setAuthor(manuscript.author);
    }
  }, [manuscript]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const updatedData = { title, author };

    axios
      .put(UPDATE_MANUSCRIPT_ENDPOINT(manuscript.manu_id), updatedData, axiosConfig)
      .then((response) => {
        console.log('Manuscript updated successfully:', response.data);
        cancel(); // close edit form after success
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

  if (!visible || !manuscript) return null;

  return (
    <form className="manuscript-form edit-form">
      <h2>Edit Manuscript (ID: {manuscript.manu_id})</h2>
      <label htmlFor="edit-title">Title</label>
      <input
        required
        type="text"
        id="edit-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label htmlFor="edit-author">Author</label>
      <input
        required
        type="text"
        id="edit-author"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
      />

      <div className="form-buttons">
        <button type="button" onClick={cancel}>Cancel</button>
        <button type="submit" onClick={handleSubmit}>Save Changes</button>
      </div>
    </form>
  );
}

EditManuscriptForm.propTypes = {
  visible: propTypes.bool.isRequired,
  manuscript: propTypes.object,
  cancel: propTypes.func.isRequired,
  setError: propTypes.func.isRequired,
  fetchManuscripts: propTypes.func.isRequired,
};

function ManuscriptActionForm({ visible, cancel, setError, manuscriptId, setManuscriptId }) {
  const [currentState, setCurrentState] = useState('SUB');
  const [action, setAction] = useState('');
  const [referee, setReferee] = useState('');

  const stateTransitions = {
    SUB: ['REJ', 'REV', 'WIT'],
    REV: ['REJ', 'AUR'],
    AUR: ['REV'],
    CED: ['REV'],
    WIT: ['No actions available'],
    REJ: ['No actions available'],
  };

  const changeManuscriptId = (event) => { setManuscriptId(event.target.value); };
  const changeCurrentState = (event) => { setCurrentState(event.target.value); };
  const changeAction = (event) => { setAction(event.target.value); };
  const changeReferee = (event) => { setReferee(event.target.value); };

  const submitAction = (event) => {
    event.preventDefault();
    if (!manuscriptId.trim()) {
      setError('Manuscript ID is required.');
      return;
    }
    const actionData = {
      manu_id: manuscriptId,
      curr_state: currentState,
      action,
      referee: referee || undefined,
    };

    axios
      .put(RECEIVE_ACTION_ENDPOINT, actionData, axiosConfig)
      .then((response) => {
        console.log('Action successful:', response.data);
        setManuscriptId('');
        setCurrentState('SUB');
        setAction('');
        setReferee('');
      })
      .catch((error) => {
        setError(`There was a problem performing the action: ${
          error.response?.data?.message || error.message
        }`);
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
          <option value="SUB">Submitted</option>
          <option value="REV">Under Review</option>
          <option value="AUR">Author Revision</option>
          <option value="CED">Copy Edit</option>
          <option value="WIT">Withdrawn</option>
          <option value="REJ">Rejected</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="action">Action</label>
        <select required id="action" value={action} onChange={changeAction}>
          <option value="">Select an action...</option>
          {stateTransitions[currentState]?.map((act) => (
            <option key={act} value={act}>{act}</option>
          ))}
        </select>
      </div>

      {action === 'ARF' && (
        <div className="form-group">
          <label htmlFor="referee">Referee Email</label>
          <input
            type="email"
            id="referee"
            value={referee}
            onChange={changeReferee}
          />
        </div>
      )}

      <div className="form-buttons">
        <button type="button" onClick={cancel}>Cancel</button>
        <button type="submit" onClick={submitAction}>Submit Action</button>
      </div>
    </form>
  );
}

ManuscriptActionForm.propTypes = {
  visible: propTypes.bool.isRequired,
  cancel: propTypes.func.isRequired,
  setError: propTypes.func.isRequired,
  manuscriptId: propTypes.string.isRequired,
  setManuscriptId: propTypes.func.isRequired,
};

function Dashboard() {
  const [error, setError] = useState('');
  const [showActionForm, setShowActionForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingManuscript, setEditingManuscript] = useState(null);
  const [manuscriptId, setManuscriptId] = useState('');
  const [manuscripts, setManuscripts] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const fetchManuscripts = () => {
    if (!isAuthorized) return;
    axios
      .get(FETCH_MANUSCRIPT_ENDPOINT, axiosConfig)
      .then(({ data }) => {
        const manuscriptsArray = Array.isArray(data) ? data : [data];
        setManuscripts(manuscriptsArray);
      })
      .catch((err) => {
        console.error('Error fetching manuscripts:', err);
        setError(`Failed to retrieve manuscripts: ${err.message}`);
      });
  };

  // Check user authorization on mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !['Editor', 'Managing Editor'].includes(user.roles[0])) {
      setIsAuthorized(false);
      setError('Please log in as an Editor or Managing Editor to view manuscripts.');
      return;
    }
    setIsAuthorized(true);
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      fetchManuscripts();
    }
  }, [isAuthorized]);

  const toggleActionForm = () => {
    setShowActionForm(!showActionForm);
    setShowCreateForm(false);
  };

  const toggleCreateForm = () => {
    setShowCreateForm(!showCreateForm);
    setShowActionForm(false);
  };

  const handleManuscriptCreated = (newManuscriptId) => {
    setShowCreateForm(false);
    setError('');
    if (newManuscriptId) {
      setManuscriptId(newManuscriptId);
    }
    fetchManuscripts();
    setShowActionForm(true);
  };

  const handleEdit = (manuscript) => {
    setEditingManuscript(manuscript);
  };

  const handleDelete = (manuscript) => {
    if (window.confirm(`Are you sure you want to delete manuscript ID ${manuscript.manu_id}?`)) {
      axios
        .delete(DELETE_MANUSCRIPT_ENDPOINT(manuscript.manu_id), axiosConfig)
        .then((response) => {
          console.log('Manuscript deleted:', response.data);
          fetchManuscripts();
        })
        .catch((error) => {
          setError(`Error deleting manuscript: ${error.response?.data?.message || error.message}`);
        });
    }
  };

  const cancelEdit = () => {
    setEditingManuscript(null);
  };

  return (
    <div className="dashboard-container">
      <h1>Manuscript Management</h1>
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

      <div className="dashboard-buttons">
        <button onClick={toggleCreateForm}>
          {showCreateForm ? 'Cancel Create' : 'Create New Manuscript'}
        </button>
        {isAuthorized && (
          <button onClick={toggleActionForm}>
            {showActionForm ? 'Cancel Action' : 'Perform Manuscript Action'}
          </button>
        )}
      </div>

      <CreateManuscriptForm
        visible={showCreateForm}
        cancel={() => setShowCreateForm(false)}
        setError={setError}
        onSuccess={handleManuscriptCreated}
      />

      {editingManuscript && (
        <EditManuscriptForm
          visible={!!editingManuscript}
          manuscript={editingManuscript}
          cancel={cancelEdit}
          setError={setError}
          fetchManuscripts={fetchManuscripts}
        />
      )}

      {isAuthorized && (
        <>
          <ManuscriptActionForm
            visible={showActionForm}
            cancel={() => setShowActionForm(false)}
            setError={setError}
            manuscriptId={manuscriptId}
            setManuscriptId={setManuscriptId}
          />

          {manuscripts.length > 0 ? (
            <div className="manuscripts-list">
              <h2>All Manuscripts</h2>
              <table className="manuscripts-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>State</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {manuscripts.map((manuscript) => (
                    <tr key={manuscript.manu_id}>
                      <td>{manuscript.manu_id}</td>
                      <td>{manuscript.title}</td>
                      <td>{manuscript.author}</td>
                      <td>
                        <span className={`state-badge state-${manuscript.curr_state?.toLowerCase()}`}>
                          {manuscript.curr_state}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button onClick={() => handleEdit(manuscript)}>Edit</button>
                          <button onClick={() => handleDelete(manuscript)}>Delete</button>
                        </div>
                      </td>
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