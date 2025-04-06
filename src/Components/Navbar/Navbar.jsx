import React from 'react';
import propTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const BASE_PAGES = [
  { label: 'Home', destination: '/' },
  { label: 'About', destination: '/about' },
  { label: 'Dashboard', destination: '/dashboard' },
];

const EDITOR_PAGES = [
  { label: 'People', destination: '/people' },
  { label: 'Settings', destination: '/settings' },
];

function NavLink({ page }) {
  const { label, destination } = page;
  return (
    <li className="nav-item">
      <Link to={destination} className="nav-link">{label}</Link>
    </li>
  );
}

NavLink.propTypes = {
  page: propTypes.shape({
    label: propTypes.string.isRequired,
    destination: propTypes.string.isRequired,
  }).isRequired,
};

function Navbar() {
  const { user, logout, isEditor } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };



  const pages = [...BASE_PAGES];
  if (user && isEditor()) {
    pages.push(...EDITOR_PAGES);
  }

  return (
    <nav className="navbar">
      <ul className="nav-list">
        {pages.map((page) => (
          <NavLink key={page.destination} page={page} />
        ))}
        <li className="nav-item">
          {user ? (
            <button onClick={handleLogout} className="nav-link">Logout ({user.name})</button>
          ) : (
            <Link to="/login" className="nav-link">Login</Link>
          )}
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;