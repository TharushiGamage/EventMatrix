import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Hash, Award, Calendar, Briefcase, Shield, ArrowRight, Activity } from 'lucide-react';

const ProfileOverview = () => {
  const { user } = useAuth();
  const isOrganizer = user?.role === 'Organizer';

  return (
    <div className="pf-fade-in">
      {/* Page Header */}
      <div className="profile-page-header">
        <div>
          <h1>{isOrganizer ? 'Creator Dashboard' : 'Dashboard Overview'}</h1>
          <p>{isOrganizer ? 'High-level metrics and quick actions for your events.' : 'A high-level view of your account status and quick actions.'}</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="profile-section">
        <h3 className="profile-section-title">Overview</h3>
        <p className="profile-section-desc">{isOrganizer ? 'Your event performance at a glance.' : 'Your account information at a glance.'}</p>
        
        {isOrganizer ? (
          <div className="profile-stats-grid">
            <div className="profile-stat-card org-card">
              <div className="org-stat-number">0</div>
              <div className="org-stat-name">Active Events</div>
              <div className="org-stat-meta positive">+0% from last month</div>
            </div>
            <div className="profile-stat-card org-card">
              <div className="org-stat-number">0</div>
              <div className="org-stat-name">Total Tickets Sold</div>
              <div className="org-stat-meta">Standard Tier</div>
            </div>
            <div className="profile-stat-card org-card">
              <div className="org-stat-number">$0.00</div>
              <div className="org-stat-name">Total Revenue</div>
              <div className="org-stat-meta">Manage Payouts</div>
            </div>
          </div>
        ) : (
          <div className="profile-stats-grid">
            <div className="profile-stat-card">
              <div className="profile-stat-icon stat-icon-blue">
                <Mail size={24} />
              </div>
              <div className="profile-stat-content">
                <div className="profile-stat-label">Registered Email</div>
                <div className="profile-stat-value">{user?.email}</div>
              </div>
            </div>
            <div className="profile-stat-card">
              <div className="profile-stat-icon stat-icon-purple">
                <Hash size={24} />
              </div>
              <div className="profile-stat-content">
                <div className="profile-stat-label">Student ID</div>
                <div className="profile-stat-value">{user?.studentId}</div>
              </div>
            </div>
            <div className="profile-stat-card">
              <div className="profile-stat-icon stat-icon-green">
                <Award size={24} />
              </div>
              <div className="profile-stat-content">
                <div className="profile-stat-label">System Role</div>
                <div className="profile-stat-value">{user?.role}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="profile-section">
        <h3 className="profile-section-title">Quick Actions</h3>
        <p className="profile-section-desc">Frequently used shortcuts for your account.</p>
        <div className="profile-actions-grid">
          {isOrganizer ? (
            <>
              <Link to="/create" className="profile-action-card org-cta">
                <div className="paction-icon"><Calendar size={24} /></div>
                <div className="paction-text">
                  <h4>Create New Event</h4>
                  <p>Launch a new experience for your audience.</p>
                </div>
                <ArrowRight size={18} className="paction-arrow" />
              </Link>
              <Link to="/my-events" className="profile-action-card">
                <div className="paction-icon"><Briefcase size={24} /></div>
                <div className="paction-text">
                  <h4>Manage My Events</h4>
                  <p>View attendees, edit details, and track sales.</p>
                </div>
                <ArrowRight size={18} className="paction-arrow" />
              </Link>
            </>
          ) : (
            <Link to="/" className="profile-action-card">
              <div className="paction-icon"><Calendar size={24} /></div>
              <div className="paction-text">
                <h4>Browse Events</h4>
                <p>View and register for upcoming events.</p>
              </div>
              <ArrowRight size={18} className="paction-arrow" />
            </Link>
          )}

          {user?.role === 'Admin' && (
            <Link to="/admin" className="profile-action-card highlight">
              <div className="paction-icon"><Shield size={24} /></div>
              <div className="paction-text">
                <h4>Admin Panel</h4>
                <p>Manage users and system settings.</p>
              </div>
              <ArrowRight size={18} className="paction-arrow" />
            </Link>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="profile-section">
        <h3 className="profile-section-title">Recent Activity</h3>
        <p className="profile-section-desc">Your latest account activities.</p>
        <div className="profile-activity-list">
          <div className="profile-activity-item">
            <div className="pa-dot-indicator"></div>
            <div className="pa-content-wrap">
              <span className="pa-content-text">Successfully logged into your account</span>
              <span className="pa-content-time">Just now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileOverview;
