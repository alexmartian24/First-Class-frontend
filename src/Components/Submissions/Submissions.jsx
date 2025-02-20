import React, { useEffect, useState } from 'react';
import axios from 'axios';
import propTypes from 'prop-types';
import { BACKEND_URL } from '../../constants';

// const SUBMISSIONS_READ_ENDPOINT = `${BACKEND_URL}/submissions`;
// const SUBMISSIONS_CREATE_ENDPOINT = `${BACKEND_URL}/submissions/create`;

// Renders a single submission item.
function Submissions({ submission }) {
  const { title, body } = submission;

  return (
    <div className="submission-item">
      <h2>{title || 'Untitled Submission'}</h2>
      {body && <p>{body}</p>}
    </div>
  );
}


export default Submissions;

// Submission.propTypes = {
//   submission: propTypes.shape({
//     title: propTypes.string,
//     body: propTypes.string,
//   }).isRequired,
// };

// // Add a new submission.
// function AddSubmissionForm({
//   visible,
//   cancel,
//   fetchSubmissions,
//   setError,
// }) {
//   const [title, setTitle] = useState('');
//   const [body, setBody] = useState('');

//   const handleSubmit = (event) => {
//     event.preventDefault();
//     const newSubmission = {
//       title,
//       body,
//     };

//     axios.put(SUBMISSIONS_CREATE_ENDPOINT, newSubmission)
//       .then(fetchSubmissions)
//       .catch((error) => {
//         setError(`There was a problem adding the submission. ${error}`);
//       });
//   };

//   if (!visible) return null;

//   return (
//     <form onSubmit={handleSubmit}>
//       <label htmlFor="title">
//         Title
//       </label>
//       <input
//         required
//         type="text"
//         id="title"
//         value={title}
//         onChange={(e) => setTitle(e.target.value)}
//       />

//       <label htmlFor="body">
//         Body
//       </label>
//       <textarea
//         required
//         id="body"
//         value={body}
//         onChange={(e) => setBody(e.target.value)}
//       />

//       <button type="button" onClick={cancel}>
//         Cancel
//       </button>
//       <button type="submit">
//         Submit
//       </button>
//     </form>
//   );
// }

// AddSubmissionForm.propTypes = {
//   visible: propTypes.bool.isRequired,
//   cancel: propTypes.func.isRequired,
//   fetchSubmissions: propTypes.func.isRequired,
//   setError: propTypes.func.isRequired,
// };

// // Main Submissions component that fetches and displays submissions.
// function Submissions() {
//   const [error, setError] = useState('');
//   const [submissions, setSubmissions] = useState([]);
//   const [addingSubmission, setAddingSubmission] = useState(false);

//   const fetchSubmissions = () => {
//     axios.get(SUBMISSIONS_READ_ENDPOINT)
//       .then(({ data }) => {
//         setSubmissions(data);
//       })
//       .catch((error) => {
//         setError(`There was a problem retrieving the submissions. ${error}`);
//       });
//   };

//   const showAddSubmissionForm = () => setAddingSubmission(true);
//   const hideAddSubmissionForm = () => setAddingSubmission(false);

//   useEffect(() => {
//     fetchSubmissions();
//   }, []);

//   return (
//     <div className="submissions-wrapper">
//       <header>
//         <h1>All Submissions</h1>
//         <button type="button" onClick={showAddSubmissionForm}>
//           Add a Submission
//         </button>
//       </header>

//       {error && <div className="error-message">{error}</div>}

//       <AddSubmissionForm
//         visible={addingSubmission}
//         cancel={hideAddSubmissionForm}
//         fetchSubmissions={fetchSubmissions}
//         setError={setError}
//       />

//       {submissions.map((submission) => (
//         <Submission
//           key={submission.id || submission.title /* or another unique key */}
//           submission={submission}
//         />
//       ))}
//     </div>
//   );
// }
