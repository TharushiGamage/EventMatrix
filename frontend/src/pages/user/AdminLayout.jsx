import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut, LayoutDashboard, Folder, Users, Star, Calendar, BookOpen, Settings, ChevronRight, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './admin-layout.css';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { logout } = useAuth();
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
            <div className="logo-icon">EM</div>
            <div className="logo-text">
              <div className="logo-title">EventMatrix</div>
              <div className="logo-subtitle">Admin</div>
            </div>
          </div>
        </div>

        <nav className="admin-sidebar-menu">
          <div className="menu-section">
            <div className="menu-section-title">Main</div>
            <NavLink to="/admin" end className={({ isActive }) => `admin-sidebar-link ${isActive ? 'active' : ''}`}>
              <div className="link-left">
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </div>
            </NavLink>
          </div>

          <div className="menu-section">
            <div className="menu-section-title">Management</div>
            <NavLink to="/admin/users" className={({ isActive }) => `admin-sidebar-link ${isActive ? 'active' : ''}`}>
              <div className="link-left">
                <Users size={20} />
                <span>Users</span>
              </div>
              <ChevronRight className="caret-icon" size={16} />
            </NavLink>

            <a href="#" className="admin-sidebar-link">
              <div className="link-left">
                <Calendar size={20} />
                <span>Events</span>
              </div>
              <ChevronRight className="caret-icon" size={16} />
            </a>

            <a href="#" className="admin-sidebar-link">
              <div className="link-left">
                <BookOpen size={20} />
                <span>Bookings</span>
              </div>
              <ChevronRight className="caret-icon" size={16} />
            </a>

            <a href="#" className="admin-sidebar-link">
              <div className="link-left">
                <Star size={20} />
                <span>Categories</span>
              </div>
              <ChevronRight className="caret-icon" size={16} />
            </a>
          </div>

          <div className="menu-section">
            <div className="menu-section-title">Settings</div>
              <NavLink to="/admin/settings" className={({ isActive }) => `admin-sidebar-link ${isActive ? 'active' : ''}`}>
                <div className="link-left">
                  <Settings size={20} />
                  <span>System Settings</span>
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
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="topbar-title">Admin Panel</div>
          </div>

          <div className="topbar-right">
            <div className="topbar-notifications">
              <button className="notification-bell">
                <Bell size={20} />
                <span className="notification-badge">3</span>
              </button>
            </div>
            <div className="topbar-divider"></div>
            <div className="topbar-profile" onClick={() => setProfileDropdownOpen(!profileDropdownOpen)} style={{ cursor: 'pointer', position: 'relative' }}>
              <div className="profile-avatar">A</div>
              <div className="profile-info">
                <div className="profile-name">Admin</div>
                <div className="profile-role">System Administrator</div>
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

export default AdminLayout;
