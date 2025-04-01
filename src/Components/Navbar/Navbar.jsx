import React, { useState, useEffect } from 'react';
import propTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './Navbar.css';

const PAGES = [
  { label: 'Home', destination: '/' },
  { label: 'About', destination: '/about' },
  { label: 'View All People', destination: '/people' },
  { label: 'View All Submissions', destination: '/dashboard' },
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
  const [user, setUser] = useState(null);

  // Check localStorage for user data on mount and when it changes
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Failed to parse user data:', e);
          localStorage.removeItem('user');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    // Initial check
    handleStorageChange();

    // Listen for storage changes (from other tabs)
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom auth events (from same tab)
    window.addEventListener('auth-change', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleStorageChange);
    };
  }, []); // Empty dependency array - only run on mount

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event('auth-change'));
    window.location.href = '/';
  };

  return (
    <nav className="navbar">
      <ul className="nav-list">
        {PAGES.map((page) => (
          <NavLink key={page.destination} page={page} />
        ))}
        {user ? (
          <li className="nav-item">
            <button onClick={handleLogout} className="nav-link">Logout</button>
          </li>
        ) : (
          <NavLink page={{ label: 'Login', destination: '/login' }} />
        )}
      </ul>
    </nav>
  );
}

export default Navbar;