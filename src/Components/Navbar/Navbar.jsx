import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const BASE_PAGES = [
  { label: 'Home',      to: '/'         },
  { label: 'About',     to: '/about'    },
  { label: 'Masthead',  to: '/masthead' },
  { label: 'Dashboard', to: '/dashboard'},
];

const EDITOR_PAGES = [
  { label: 'People',    to: '/people'   },
  { label: 'Settings',  to: '/settings' },
];

function Navbar() {
  const { user, logout, isEditor } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // build page list
  const pages = [...BASE_PAGES];
  if (user && isEditor()) pages.push(...EDITOR_PAGES);

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* BRAND */}
        <Link to="/" className="nav-brand">Journal</Link>

        {/* LINKS */}
        <ul className="nav-list">
          {pages.map(({ label, to }) => (
            <li key={to} className="nav-item">
              <Link
                to={to}
                className={
                  'nav-link' +
                  (location.pathname === to ? ' active' : '')
                }
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* LOGIN / LOGOUT */}
        <div className="nav-cta">
          {user ? (
            <button onClick={handleLogout} className="nav-link logout">
              Logout&nbsp;({user.name})
            </button>
          ) : (
            <Link to="/login" className="nav-link">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

Navbar.propTypes = {
  // nothing
};

export default Navbar;