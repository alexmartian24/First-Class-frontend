import React, { useState } from 'react';
import propTypes from 'prop-types';
import axios from 'axios';
import './Dashboard.css';

import { BACKEND_URL } from '../../constants';
const RECEIVE_ACTION_ENDPOINT = `${BACKEND_URL}/manuscripts/receive_action`;
const CREATE_MANUSCRIPT_ENDPOINT = `${BACKEND_URL}/manuscripts/create`;

function CreateManuscriptForm({
    visible,
    cancel,
    setError,
    onSuccess,
}) {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        const manuscriptData = {
            title: title,
            author: author,
        };
    
axios.put(CREATE_MANUSCRIPT_ENDPOINT, manuscriptData)
    .then((response) => {
        console.log('Manuscript created successfully:', response.data);
        setTitle('');
        setAuthor('');
        if (onSuccess) onSuccess(response.data.Return);
    })
    .catch((error) => {
        if (!error.response) {
            setError("Network error: Failed to reach server. Check your connection.");
        } else {
            setError(`API error: ${error.response.data.message || "Unknown error occurred"}`);
        }
        console.error("API Error Details:", error);
    });
    };

    if (!visible) return null;
  
    return (
        <form className="manuscript-form">
        <h2>Create New Manuscript</h2>
        <label htmlFor="title">
            Title
        </label>
        <input 
            required 
            type="text" 
            id="title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
        />

        <label htmlFor="author">
            Author
        </label>
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

function ManuscriptActionForm({
    visible,
    cancel,
    setError,
    manuscriptId,
    setManuscriptId,
}) {
    const [currentState, setCurrentState] = useState('SUB');
    const [action, setAction] = useState('');
    const [referee, setReferee] = useState('');

    const stateTransitions = {
        //keep in this format so backend recognizes it
        SUB: ["REJ", "REV", "WIT"],      // Submitted -> Rejected, Review, Withdrawn
        REV: ["REJ", "AUR"],        // Review -> Rejected, Author Revisions
        AUR: ["REV"],                            // Author Revisions -> Review
        CED: ["REV"],                            // Copy Edit -> Review
        WIT: ["No actions available"],              // Withdrawn -> No transitions
        REJ: ["No actions available"],              // Rejected -> No transitions
    };

    const changeManuscriptId = (event) => { setManuscriptId(event.target.value); };
    const changeCurrentState = (event) => { setCurrentState(event.target.value); };
    const changeAction = (event) => { setAction(event.target.value); };
    const changeReferee = (event) => { setReferee(event.target.value); };

    const submitAction = (event) => {
        event.preventDefault();
        if (!manuscriptId.trim()) {
            setError("Manuscript ID is required.");
            return;
        }
    const actionData = {
        manu_id: manuscriptId,
        curr_state: currentState,
        action: action,
        referee: referee || undefined,
    };
    
    axios.put(RECEIVE_ACTION_ENDPOINT, actionData)
        .then((response) => {
            console.log('Action successful:', response.data);
            // Clear form
            setManuscriptId('');
            setCurrentState('SUB');
            setAction('');
            setReferee('');
        })
        .catch((error) => {
            setError(`There was a problem performing the action: ${error.response?.data?.message || error.message}`);
        });
    };

    if (!visible) return null;
  
    return (
        <form className="manuscript-action-form">
        <div className="form-header">
        <h2>Perform Manuscript Action</h2>
        </div>
      
        <div className="form-group">
        <label htmlFor="manuscriptId">
            Manuscript ID
        </label>
        <input 
            required 
            type="text" 
            id="manuscriptId" 
            value={manuscriptId} 
            onChange={changeManuscriptId} 
        />
        </div>

        <div className="form-group">
        <label htmlFor="currentState">
            Current State
        </label>
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
        <label htmlFor="action">
            Action
        </label>
        <select 
          required 
          id="action" 
          value={action} 
          onChange={changeAction}
        >
            <option value="">Select an action...</option>
            {stateTransitions[currentState]?.map((act) => (
                <option key={act} value={act}>{act}</option>
            ))}
            </select>
        </div>

        {(action === 'ARF') && (
            <div className="form-group">
                <label htmlFor="referee">
                    Referee Email
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
    const [manuscriptId, setManuscriptId] = useState('');

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
        setShowActionForm(true);
    };

    return (
        <div className="dashboard-container">
            <h1>Manuscript Management</h1>
            {error && <div className="error-message">{error}</div>}
            
            <div className="dashboard-buttons">
                <button onClick={toggleCreateForm}>
                    {showCreateForm ? 'Cancel Create' : 'Create New Manuscript'}
                </button>
                <button onClick={toggleActionForm}>
                    {showActionForm ? 'Cancel Action' : 'Perform Manuscript Action'}
                </button>
            </div>

            <CreateManuscriptForm
                visible={showCreateForm}
                cancel={toggleCreateForm}
                setError={setError}
                onSuccess={handleManuscriptCreated}
            />
            
            <ManuscriptActionForm
                visible={showActionForm}
                cancel={toggleActionForm}
                setError={setError}
                manuscriptId={manuscriptId}
                setManuscriptId={setManuscriptId}
            />
        </div>
    );
}

export default Dashboard;