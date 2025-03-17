import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaBars, FaHome, FaExclamationCircle } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  // Add new states for feature tooltips
  const [showFeatureTooltip, setShowFeatureTooltip] = useState(false);
  const [featureTooltipContent, setFeatureTooltipContent] = useState('');
  const [featureTooltipPosition, setFeatureTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipTimeout = useRef(null);

  // Get first name only
  const firstName = user ? user.name.split(' ')[0] : '';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    
    // Show tooltip after 2 seconds if user is not logged in
    if (!user) {
      const tooltipTimer = setTimeout(() => {
        setShowTooltip(true);
      }, 2000);
      
      // Auto-hide tooltip after 10 seconds
      const hideTimer = setTimeout(() => {
        setShowTooltip(false);
      }, 12000);
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
        clearTimeout(tooltipTimer);
        clearTimeout(hideTimer);
      };
    }
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [user]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  const closeTooltip = () => {
    setShowTooltip(false);
  };

  // Function to show feature tooltips
  const showUnavailableFeatureTooltip = (e, message) => {
    // Calculate position
    const rect = e.currentTarget.getBoundingClientRect();
    const position = {
      top: rect.bottom + window.scrollY + 5,
      left: rect.left + window.scrollX - 100
    };
    
    // Set tooltip content and position
    setFeatureTooltipContent(message);
    setFeatureTooltipPosition(position);
    setShowFeatureTooltip(true);
    
    // Clear any existing timeout
    if (tooltipTimeout.current) {
      clearTimeout(tooltipTimeout.current);
    }
    
    // Hide tooltip after 3 seconds
    tooltipTimeout.current = setTimeout(() => {
      setShowFeatureTooltip(false);
    }, 3000);
  };

  // Function to prevent navigation and show tooltip
  const handleUnavailableFeature = (e, message) => {
    e.preventDefault();
    showUnavailableFeatureTooltip(e, message);
  };

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        {/* Left side - Logo */}
        <div className="header-left">
          <Link to="/" className="logo">
            Home Sharing Platform
          </Link>
        </div>

        {/* Middle - Tagline */}
        <div className="header-middle">
          <div className="tagline">Your Home Away From Home</div>
        </div>

        {/* Right side - Navigation */}
        <div className="header-right">
          {/* Main navigation */}
          <nav className="main-nav">
            <ul>
              <li>
                <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/listings" className={location.pathname === '/listings' ? 'active' : ''}>
                  Browse
                </Link>
              </li>
              {!user ? (
                <li className="auth-nav-item">
                  <Link to="/login" className="login-signup-link">
                    Login/Signup
                  </Link>
                  {showTooltip && (
                    <div className="host-tooltip">
                      <button className="close-tooltip" onClick={closeTooltip}>×</button>
                      <FaHome className="tooltip-icon" />
                      <p>Want to list your home? Login or sign up first!</p>
                    </div>
                  )}
                </li>
              ) : (
                <li className="user-nav-item">
                  <div className="user-menu-container">
                    <button className="user-menu-button" onClick={toggleMenu}>
                      <FaUserCircle />
                      <span className="user-name">{firstName}</span>
                    </button>
                    {menuOpen && (
                      <div className="user-menu">
                        <Link to="/dashboard" onClick={closeMenu}>Dashboard</Link>
                        <a href="#" 
                          onClick={(e) => handleUnavailableFeature(e, "Profile feature is coming soon!")} 
                          className="feature-unavailable">
                          Profile
                        </a>
                        <Link to="/create-listing" onClick={closeMenu}>Create Listing</Link>
                        <button onClick={handleLogout}>Sign Out</button>
                      </div>
                    )}
                  </div>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>

      {/* Feature unavailable tooltip */}
      {showFeatureTooltip && (
        <div 
          className="feature-tooltip" 
          style={{
            top: `${featureTooltipPosition.top}px`,
            left: `${featureTooltipPosition.left}px`
          }}
        >
          <FaExclamationCircle className="tooltip-icon" />
          <p>{featureTooltipContent}</p>
        </div>
      )}
    </header>
  );
};

export default Header;