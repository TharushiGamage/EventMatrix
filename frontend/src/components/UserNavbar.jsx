import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Shield, Calendar, Home, LogIn, UserPlus } from 'lucide-react';
import './UserNavbar.css';

const UserNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (path) => pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="user-navbar">
      <div className="user-navbar-inner">
        <div className="user-navbar-brand">
          <Calendar size={20} />
          <span>UEMS</span>
        </div>

        <div className="user-navbar-links">
          <Link to="/" className={`user-nav-link ${isActive('/') ? 'active' : ''}`}>
            <Home size={16} /> Events
          </Link>

          {user ? (
            <>
              <Link to="/user-dashboard" className={`user-nav-link ${isActive('/user-dashboard') ? 'active' : ''}`}>
                Dashboard
              </Link>
              <Link to="/profile" className={`user-nav-link ${isActive('/profile') ? 'active' : ''}`}>
                <UserIcon size={16} /> Profile
              </Link>
              {user.role === 'Admin' && (
                <Link to="/admin/users" className={`user-nav-link ${isActive('/admin/users') ? 'active' : ''}`}>
                  <Shield size={16} /> Admin
                </Link>
              )}
              <div className="user-navbar-user">
                <span className="user-badge">{user.role}</span>
                <span className="user-name">{user.name}</span>
                <button onClick={handleLogout} className="user-logout-btn" title="Logout">
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <div className="user-navbar-auth">
              <Link to="/login" className="user-nav-link">
                <LogIn size={16} /> Login
              </Link>
              <Link to="/register" className="user-nav-signup">
                <UserPlus size={16} /> Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default UserNavbar;
