import React, { useState } from 'react';
import './ForgotPassword.css'; 
import { useNavigate } from 'react-router-dom';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your NYU email.');
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setMessage('Password reset instructions have been sent to your email.');
      setError('');
    }, 1000);
  };

  return (
    <div className="login-container fade-in">
      <header className="login-header">
        <img src="/logo192.png" alt="Logo" className="logo" />
        <h1>Forgot Password</h1>
        <p>Enter your NYU email to reset your password</p>
      </header>

      <form className="login-form" onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <div className="form-group">
          <label htmlFor="email">NYU Email</label>
          <input
            type="email"
            id="email"
            placeholder="netid@nyu.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit">Send Reset Link</button>
        </div>

        <div className="additional-links">
          <button type="button" className="link-button" onClick={() => navigate('/login')}>
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
}

export default ForgotPassword;
