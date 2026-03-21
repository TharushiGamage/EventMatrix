import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Bell, LayoutDashboard, User, ShieldCheck, Menu, X, Camera, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/userApi';
import './profile-layout.css';

const ProfileLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { user, updateUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isOrganizer = user?.role === 'Organizer';

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('profileImage', file);
    try {
      const res = await profileService.uploadProfileImage(formData);
      updateUser(res.data);
    } catch (err) {
      console.error('Image upload failed', err);
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
    setProfileDropdownOpen(false);
  };

  const confirmLogout = () => {
    logout();
    navigate('/login');
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Derive page title from current route
  const getPageTitle = () => {
    if (location.pathname === '/profile/general') return 'General Settings';
    if (location.pathname === '/profile/security') return 'Personal Security';

    return 'My Profile';
  };

  return (
    <div className="profile-layout">
      {/* Sidebar Navigation */}
      <aside className={`profile-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="profile-sidebar-header">
          <div className="profile-sidebar-user">
            <label className="profile-sidebar-avatar" htmlFor="sidebarAvatarUpload">
              {user?.profileImage && user.profileImage !== 'default.png' ? (
                <img src={`http://localhost:5000${user.profileImage}`} alt="Avatar" />
              ) : (
                user?.name?.charAt(0).toUpperCase()
              )}
              <div className="sidebar-avatar-overlay">
                <Camera size={16} />
              </div>
              <input 
                type="file" 
                id="sidebarAvatarUpload" 
                style={{ display: 'none' }} 
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
            <div className="profile-sidebar-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
          </div>
        </div>

        <nav className="profile-sidebar-menu">
          <div className="p-menu-section">
            <div className="p-menu-section-title">Dashboard</div>
            <NavLink to="/profile" end className={({ isActive }) => `profile-sidebar-link ${isActive ? 'active' : ''}`}>
              <div className="p-link-left">
                <LayoutDashboard size={20} />
                <span>Overview</span>
              </div>
            </NavLink>
          </div>

          <div className="p-menu-section">
            <div className="p-menu-section-title">Account</div>
            <NavLink to="/profile/general" className={({ isActive }) => `profile-sidebar-link ${isActive ? 'active' : ''}`}>
              <div className="p-link-left">
                <User size={20} />
                <span>General Info</span>
              </div>
            </NavLink>

            <NavLink to="/profile/security" className={({ isActive }) => `profile-sidebar-link ${isActive ? 'active' : ''}`}>
              <div className="p-link-left">
                <ShieldCheck size={20} />
                <span>Personal Security</span>
              </div>
            </NavLink>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="profile-main">
        {/* Top Navbar */}
        <header className="profile-topbar">
          <div className="p-topbar-left">
            <button className="p-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="p-topbar-title">{getPageTitle()}</div>
          </div>

          <div className="p-topbar-right">
            <div className="p-topbar-notifications">
              <button className="p-notification-bell">
                <Bell size={20} />
              </button>
            </div>
            <div className="p-topbar-divider"></div>
            <div className="p-topbar-profile" onClick={() => setProfileDropdownOpen(!profileDropdownOpen)} style={{ cursor: 'pointer', position: 'relative' }}>
              <div className="p-profile-avatar">
                {user?.profileImage && user.profileImage !== 'default.png' ? (
                  <img src={`http://localhost:5000${user.profileImage}`} alt="Avatar" />
                ) : (
                  user?.name?.charAt(0).toUpperCase()
                )}
              </div>
              <div className="p-profile-info">
                <div className="p-profile-name">{user?.name}</div>
                <div className="p-profile-role">{user?.role}</div>
              </div>

              {profileDropdownOpen && (
                <div className="p-profile-dropdown">
                  <button className="p-dropdown-logout" onClick={handleLogout}>
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <div className="profile-content-wrapper">
          <Outlet />
        </div>

        {/* Logout Confirmation Dialog */}
        {showLogoutConfirm && (
          <div className="p-logout-overlay">
            <div className="p-logout-dialog">
              <div className="p-logout-dialog-content">
                <div className="p-logout-dialog-icon">
                  <LogOut size={32} />
                </div>
                <h3 className="p-logout-dialog-title">Confirm Logout</h3>
                <p className="p-logout-dialog-message">Are you sure you want to logout from this account?</p>
              </div>
              <div className="p-logout-dialog-actions">
                <button className="p-logout-cancel-btn" onClick={cancelLogout}>
                  Cancel
                </button>
                <button className="p-logout-confirm-btn" onClick={confirmLogout}>
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfileLayout;
