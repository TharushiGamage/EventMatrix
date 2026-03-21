import { Outlet, NavLink, Link } from 'react-router-dom';
import { Bell, LogOut, LayoutDashboard, Folder, Users, Star, Calendar, BookOpen, Settings, ChevronRight, Menu, X } from 'lucide-react';
import { useState } from 'react';
import './admin-layout.css';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

        <div className="admin-sidebar-footer">
          <button className="logout-button">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
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
            <div className="topbar-profile">
              <div className="profile-avatar">A</div>
              <div className="profile-info">
                <div className="profile-name">Admin</div>
                <div className="profile-role">System Administrator</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <div className="admin-content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
