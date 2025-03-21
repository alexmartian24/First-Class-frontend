import React from 'react';
import propTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Make sure to create this CSS file

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
  return (
    <nav className="navbar">
      <ul className="nav-list">
        {PAGES.map((page) => (
          <NavLink key={page.destination} page={page} />
        ))}
      </ul>
    </nav>
  );
}

export default Navbar;