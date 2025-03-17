import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>Sorry, we couldn't find the page you were looking for.</p>
        <Link to="/" className="back-home-button">
          <FaHome /> Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;