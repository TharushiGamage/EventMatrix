import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Perform any logout logic here (e.g. clearing tokens)
    console.log('User logged out');
    setShowDropdown(false);
    navigate('/'); // Redirect to login or home
  };

  return (
    <header className="site-header">
      <div className="header-container">
        <Link to="/" className="header-brand">
          <span className="brand-accent">Event</span>Matrix
        </Link>
        
        <div className="header-actions">
          {/* Notification Button */}
          <button className="notification-btn" aria-label="Notifications">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span className="notification-badge">3</span>
          </button>

          {/* User Profile Dropdown */}
          <div className="user-dropdown-container" ref={dropdownRef}>
            <div 
              className="user-profile" 
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="avatar">U</div>
            </div>
            
            {showDropdown && (
              <div className="user-dropdown-menu">
                <div className="dropdown-header">
                  <strong>User Name</strong>
                  <span>user@eventmatrix.camp</span>
                </div>
                <div className="dropdown-divider"></div>
                <Link to="/" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  My Profile
                </Link>
                <div className="dropdown-divider"></div>
                <button onClick={handleLogout} className="dropdown-item logout-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
