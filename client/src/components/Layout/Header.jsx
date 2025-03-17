import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaBars } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Get first name only
  const firstName = user ? user.name.split(' ')[0] : '';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
                        <Link to="/profile" onClick={closeMenu}>Profile</Link>
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

        {/* Mobile menu button */}
        <button className="mobile-menu-button" onClick={toggleMenu}>
          <FaBars />
        </button>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="mobile-menu">
            <nav>
              <Link to="/" onClick={closeMenu}>Home</Link>
              <Link to="/listings" onClick={closeMenu}>Browse</Link>
              {user ? (
                <>
                  <Link to="/dashboard" onClick={closeMenu}>Dashboard</Link>
                  <Link to="/profile" onClick={closeMenu}>Profile</Link>
                  <Link to="/create-listing" onClick={closeMenu}>Create Listing</Link>
                  <button onClick={handleLogout}>Sign Out</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={closeMenu}>Login/Signup</Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;