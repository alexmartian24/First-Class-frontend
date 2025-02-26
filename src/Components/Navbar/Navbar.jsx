import React from 'react';
import propTypes from 'prop-types';
import { Link } from 'react-router-dom';

const PAGES = [
  { label: 'Home', destination: '/' },
  { label: 'About', destination: '/about' },
  { label: 'View All People', destination: '/people' },
  { label: 'View All Submissions', destination: '/dashboard' },
];

function NavLink({ page }) {
  const { label, destination } = page;
  return (
    <li>
      <Link to={destination}>{label}</Link>
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
    <nav style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <ul style={{ display: 'flex', listStyle: 'none', padding: 0, margin: 0, gap: '20px' }}>
        {PAGES.map((page) => (
          <NavLink key={page.destination} page={page} />
        ))}
      </ul>
    </nav>
  );
}

export default Navbar;