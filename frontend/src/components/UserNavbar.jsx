import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User as UserIcon, Shield, Calendar, Home, LogIn, UserPlus, ClipboardList } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
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
        
        {/* Brand Area */}
        <Link to="/" className="user-navbar-brand">
          <Calendar size={20} strokeWidth={2.5} />
          <span>UEMS</span>
        </Link>

        {/* Right Section */}
        <div className="user-navbar-right">
          
          <div className="user-navbar-links">
            <Link to="/" className={`user-nav-link ${isActive('/') ? 'active' : ''}`}>
              <Home size={16} /> <span>Events</span>
            </Link>

            {user ? (
              <>
                <Link to="/profile" className={`user-nav-link ${isActive('/profile') ? 'active' : ''}`}>
                  <UserIcon size={16} /> <span>Profile</span>
                </Link>

                {/* Student-only nav links */}
                {user.role === 'Student' && (
                  <Link to="/my-registrations" className={`user-nav-link ${isActive('/my-registrations') ? 'active' : ''}`}>
                    <ClipboardList size={16} /> <span>My Registrations</span>
                  </Link>
                )}

                {/* Organizer-only nav links */}
                {user.role === 'Organizer' && (
                  <Link to="/organizer/pending" className={`user-nav-link ${isActive('/organizer/pending') ? 'active' : ''}`}>
                    <ClipboardList size={16} /> <span>Pending Reviews</span>
                  </Link>
                )}

                {user.role === 'Admin' && (
                  <Link to="/admin/users" className={`user-nav-link ${isActive('/admin/users') ? 'active' : ''}`}>
                    <Shield size={16} /> <span>Admin</span>
                  </Link>
                )}

                {/* Notification bell (Student + Organizer) */}
                {(user.role === 'Student' || user.role === 'Organizer') && (
                  <NotificationBell />
                )}

                {/* User Info & Logout */}
                <div className="user-navbar-user-section">
                  <span className="user-badge">{user.role}</span>
                  <span className="user-name">{user.name}</span>
                  <button onClick={handleLogout} className="user-logout-btn" title="Logout">
                    <LogOut size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </>
            ) : (
              // Not Logged In
              <div className="user-navbar-auth">
                <Link to="/login" className="user-nav-login">
                  <LogIn size={16} /> Login
                </Link>
                <Link to="/register" className="user-nav-signup">
                  <UserPlus size={16} /> Register
                </Link>
              </div>
            )}
          </div>
          
        </div>

      </div>
    </nav>
  );
};

export default UserNavbar;
