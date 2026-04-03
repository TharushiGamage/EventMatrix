import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { LogOut, Package, BookOpen, ChevronRight, Menu, X, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../../components/NotificationBell';
import './admin-layout.css';

const ResourceManagerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            <div className="logo-icon">RM</div>
            <div className="logo-text">
              <div className="logo-title">EventMatrix</div>
              <div className="logo-subtitle">Resource Mgr</div>
            </div>
          </div>
        </div>

        <nav className="admin-sidebar-menu">
          <div className="menu-section">
            <div className="menu-section-title">Main</div>
            <NavLink to="/resource-manager" end className={({ isActive }) => `admin-sidebar-link ${isActive ? 'active' : ''}`}>
              <div className="link-left">
                <Package size={20} />
                <span>Resources</span>
              </div>
            </NavLink>
          </div>

          <div className="menu-section">
            <div className="menu-section-title">Management</div>
            <NavLink to="/resource-manager/bookings" className={({ isActive }) => `admin-sidebar-link ${isActive ? 'active' : ''}`}>
              <div className="link-left">
                <BookOpen size={20} />
                <span>Bookings</span>
              </div>
              <ChevronRight className="caret-icon" size={16} />
            </NavLink>
          </div>

          <div className="menu-section">
            <div className="menu-section-title">Account</div>
            <NavLink to="/resource-manager/account/general" className={({ isActive }) => `admin-sidebar-link ${isActive ? 'active' : ''}`}>
              <div className="link-left">
                <ShieldCheck size={20} />
                <span>General Info</span>
              </div>
              <ChevronRight className="caret-icon" size={16} />
            </NavLink>

            <NavLink to="/resource-manager/account/security" className={({ isActive }) => `admin-sidebar-link ${isActive ? 'active' : ''}`}>
              <div className="link-left">
                <ShieldCheck size={20} />
                <span>Personal Security</span>
              </div>
              <ChevronRight className="caret-icon" size={16} />
            </NavLink>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        {/* Top Navbar */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="topbar-title">Resource Manager Panel</div>
          </div>

          <div className="topbar-right">
            <div className="topbar-notifications">
              <NotificationBell />
            </div>
            <div className="topbar-divider"></div>
            <div className="topbar-profile" onClick={() => setProfileDropdownOpen(!profileDropdownOpen)} style={{ cursor: 'pointer', position: 'relative' }}>
              <div className="profile-avatar">{user?.name?.charAt(0).toUpperCase() || 'R'}</div>
              <div className="profile-info">
                <div className="profile-name">{user?.name || 'Resource Manager'}</div>
                <div className="profile-role">Resource Manager</div>
              </div>

              {profileDropdownOpen && (
                <div className="admin-profile-dropdown">
                  <button className="admin-dropdown-logout" onClick={handleLogout}>
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <div className="admin-content-wrapper">
          <Outlet />
        </div>

        {/* Logout Confirmation Dialog */}
        {showLogoutConfirm && (
          <div className="admin-logout-overlay">
            <div className="admin-logout-dialog">
              <div className="admin-logout-dialog-content">
                <div className="admin-logout-dialog-icon">
                  <LogOut size={32} />
                </div>
                <h3 className="admin-logout-dialog-title">Confirm Logout</h3>
                <p className="admin-logout-dialog-message">Are you sure you want to logout from this account?</p>
              </div>
              <div className="admin-logout-dialog-actions">
                <button className="admin-logout-cancel-btn" onClick={cancelLogout}>
                  Cancel
                </button>
                <button className="admin-logout-confirm-btn" onClick={confirmLogout}>
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

export default ResourceManagerLayout;
