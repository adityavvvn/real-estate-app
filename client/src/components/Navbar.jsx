import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import NotificationBell from './NotificationBell';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem('token');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        {/* Brand */}
        <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
          🏠 RealEstate
        </Link>

        {/* Mobile Menu Toggle */}
        <button className="navbar-toggle" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Navigation Links */}
        <ul className={`navbar-nav ${isMobileMenuOpen ? 'open' : ''}`}>
          <li>
            <Link 
              to="/" 
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Home
            </Link>
          </li>
          
          {isLoggedIn && (
            <>
              <li>
                <Link 
                  to="/add" 
                  className={`nav-link ${location.pathname === '/add' ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  Add Property
                </Link>
              </li>
              <li>
                <Link 
                  to="/my-properties" 
                  className={`nav-link ${location.pathname === '/my-properties' ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  My Properties
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* Right Side Actions */}
        <div className="navbar-right">
          {isLoggedIn && <NotificationBell />}
          
          {!isLoggedIn ? (
            <>
              <Link to="/login" className="nav-button" onClick={closeMobileMenu}>
                Login
              </Link>
              <Link to="/register" className="nav-button secondary" onClick={closeMobileMenu}>
                Register
              </Link>
            </>
          ) : (
            <button className="nav-button secondary" onClick={logout}>
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
