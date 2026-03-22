import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User as UserIcon, Shield, Calendar, Home, LogIn, UserPlus, ClipboardList, ChevronDown, KeyRound, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService, profileService } from '../services/userApi';
import NotificationBell from './NotificationBell';
import './UserNavbar.css';
import logo from '../assets/eventmatrix-logo.png';

const UserNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('current');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentFlow, setCurrentFlow] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [forgotFlow, setForgotFlow] = useState({
    identifier: '',
    code: '',
    verified: false,
    newPassword: '',
    confirmPassword: '',
    codeSent: false,
  });

  const isActive = (path) => pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const closeMenuOnOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', closeMenuOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeMenuOnOutsideClick);
  }, []);

  const resetModalState = () => {
    setActionError('');
    setActionSuccess('');
    setSubmitting(false);
    setActiveTab('current');
    setCurrentFlow({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setForgotFlow({
      identifier: user?.email || user?.phone || '',
      code: '',
      verified: false,
      newPassword: '',
      confirmPassword: '',
      codeSent: false,
    });
  };

  const openPasswordModal = () => {
    resetModalState();
    setPasswordModalOpen(true);
    setMenuOpen(false);
  };

  const closePasswordModal = () => {
    setPasswordModalOpen(false);
    resetModalState();
  };

  const handleCurrentPasswordReset = async (event) => {
    event.preventDefault();
    setActionError('');
    setActionSuccess('');

    if (!currentFlow.currentPassword || !currentFlow.newPassword || !currentFlow.confirmPassword) {
      setActionError('Please complete all fields.');
      return;
    }

    if (currentFlow.newPassword !== currentFlow.confirmPassword) {
      setActionError('New password and confirm password must match.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await profileService.changePasswordDirect(currentFlow);
      setActionSuccess(response.message || 'Password updated successfully.');
      setCurrentFlow({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setActionError(error.response?.data?.message || 'Failed to update password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendForgotCode = async () => {
    setActionError('');
    setActionSuccess('');

    if (!forgotFlow.identifier) {
      setActionError('Please enter your email or phone number.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await authService.forgotPassword(forgotFlow.identifier);
      setForgotFlow((prev) => ({ ...prev, codeSent: true, verified: false, code: '' }));
      setActionSuccess(response.message || 'Verification code sent.');
    } catch (error) {
      setActionError(error.response?.data?.message || 'Failed to send verification code.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyForgotCode = async () => {
    setActionError('');
    setActionSuccess('');

    if (!forgotFlow.identifier || !forgotFlow.code) {
      setActionError('Please enter your identifier and verification code.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await authService.verifyResetCode({ identifier: forgotFlow.identifier, code: forgotFlow.code });
      setForgotFlow((prev) => ({ ...prev, verified: true }));
      setActionSuccess(response.message || 'Verification code validated.');
    } catch (error) {
      setActionError(error.response?.data?.message || 'Invalid verification code.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPasswordReset = async (event) => {
    event.preventDefault();
    setActionError('');
    setActionSuccess('');

    if (!forgotFlow.verified) {
      setActionError('Please verify your code before setting a new password.');
      return;
    }

    if (!forgotFlow.newPassword || !forgotFlow.confirmPassword) {
      setActionError('Please enter and confirm your new password.');
      return;
    }

    if (forgotFlow.newPassword !== forgotFlow.confirmPassword) {
      setActionError('New password and confirm password must match.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await authService.resetPassword({
        identifier: forgotFlow.identifier,
        code: forgotFlow.code,
        newPassword: forgotFlow.newPassword,
        confirmPassword: forgotFlow.confirmPassword,
      });

      setActionSuccess(response.message || 'Password reset successfully.');
      setForgotFlow((prev) => ({
        ...prev,
        code: '',
        verified: false,
        newPassword: '',
        confirmPassword: '',
        codeSent: false,
      }));
    } catch (error) {
      setActionError(error.response?.data?.message || 'Failed to reset password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <nav className="user-navbar">
      <div className="user-navbar-inner">
        
        {/* Brand Area */}
        <Link to="/" className="user-navbar-brand">
          <span>EventMatrix</span>
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

                {/* Student-only nav links (moved to profile side-nav) */}

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
                <div className="user-navbar-user-section" ref={menuRef}>
                  <span className="user-badge">{user.role}</span>
                  <button
                    type="button"
                    className="user-name-btn"
                    onClick={() => setMenuOpen((prev) => !prev)}
                    aria-expanded={menuOpen}
                    aria-haspopup="true"
                  >
                    <span className="user-name">{user.name}</span>
                    <ChevronDown size={14} className={`user-menu-chevron ${menuOpen ? 'open' : ''}`} />
                  </button>

                  {menuOpen && (
                    <div className="user-menu-dropdown" role="menu">
                      <button type="button" className="user-menu-item" onClick={openPasswordModal}>
                        <KeyRound size={15} />
                        Reset Password
                      </button>
                    </div>
                  )}

                  <button onClick={handleLogout} className="user-logout-btn" title="Logout">
                    <LogOut size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </>
            ) : (
              // Not Logged In — show only Login (register removed)
              <div className="user-navbar-auth">
                <Link to="/login" className={`user-nav-login ${pathname === '/feed' ? 'prominent-login' : ''}`}>
                  <LogIn size={16} /> Login
                </Link>
              </div>
            )}
          </div>
          
        </div>

      </div>

      {passwordModalOpen && (
        <div className="pw-modal-backdrop" onClick={closePasswordModal}>
          <div className="pw-modal" onClick={(event) => event.stopPropagation()}>
            <div className="pw-modal-header">
              <h3>Reset Password</h3>
              <button type="button" className="pw-close-btn" onClick={closePasswordModal}>
                <X size={18} />
              </button>
            </div>

            <div className="pw-tab-row">
              <button
                type="button"
                className={`pw-tab ${activeTab === 'current' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('current');
                  setActionError('');
                  setActionSuccess('');
                }}
              >
                Use Current Password
              </button>
              <button
                type="button"
                className={`pw-tab ${activeTab === 'forgot' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('forgot');
                  setActionError('');
                  setActionSuccess('');
                }}
              >
                Forgot Password
              </button>
            </div>

            {actionError && <div className="pw-alert error">{actionError}</div>}
            {actionSuccess && <div className="pw-alert success">{actionSuccess}</div>}

            {activeTab === 'current' ? (
              <form className="pw-form" onSubmit={handleCurrentPasswordReset}>
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentFlow.currentPassword}
                  onChange={(event) => setCurrentFlow((prev) => ({ ...prev, currentPassword: event.target.value }))}
                  placeholder="Enter current password"
                />

                <label htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  value={currentFlow.newPassword}
                  onChange={(event) => setCurrentFlow((prev) => ({ ...prev, newPassword: event.target.value }))}
                  placeholder="Enter new password"
                />

                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={currentFlow.confirmPassword}
                  onChange={(event) => setCurrentFlow((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                  placeholder="Re-enter new password"
                />

                <button type="submit" className="pw-primary-btn" disabled={submitting}>
                  {submitting ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            ) : (
              <form className="pw-form" onSubmit={handleForgotPasswordReset}>
                <label htmlFor="identifier">Email or Phone Number</label>
                <div className="pw-inline-row">
                  <input
                    id="identifier"
                    type="text"
                    value={forgotFlow.identifier}
                    onChange={(event) => setForgotFlow((prev) => ({ ...prev, identifier: event.target.value }))}
                    placeholder="you@example.com or 0771234567"
                  />
                  <button type="button" className="pw-secondary-btn" onClick={handleSendForgotCode} disabled={submitting}>
                    {submitting ? 'Sending...' : 'Send Code'}
                  </button>
                </div>

                <label htmlFor="verificationCode">6-digit Verification Code</label>
                <div className="pw-inline-row">
                  <input
                    id="verificationCode"
                    type="text"
                    maxLength={6}
                    value={forgotFlow.code}
                    onChange={(event) => setForgotFlow((prev) => ({ ...prev, code: event.target.value }))}
                    placeholder="Enter code"
                  />
                  <button type="button" className="pw-secondary-btn" onClick={handleVerifyForgotCode} disabled={submitting || !forgotFlow.codeSent}>
                    Verify
                  </button>
                </div>

                <label htmlFor="forgotNewPassword">New Password</label>
                <input
                  id="forgotNewPassword"
                  type="password"
                  value={forgotFlow.newPassword}
                  onChange={(event) => setForgotFlow((prev) => ({ ...prev, newPassword: event.target.value }))}
                  placeholder="Enter new password"
                  disabled={!forgotFlow.verified}
                />

                <label htmlFor="forgotConfirmPassword">Confirm Password</label>
                <input
                  id="forgotConfirmPassword"
                  type="password"
                  value={forgotFlow.confirmPassword}
                  onChange={(event) => setForgotFlow((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                  placeholder="Re-enter new password"
                  disabled={!forgotFlow.verified}
                />

                <button type="submit" className="pw-primary-btn" disabled={submitting || !forgotFlow.verified}>
                  {submitting ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default UserNavbar;
