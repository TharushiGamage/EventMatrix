import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEventRefresh } from '../../context/EventRefreshContext';
import { Mail, Hash, Award, Calendar, Briefcase, Shield, ArrowRight, KeyRound, DollarSign, Clock, Users, CreditCard, Plus } from 'lucide-react';
import { fetchEvents } from '../../services/eventService';
import { registrationService } from '../../services/registrationService';

const ProfileOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { refreshTrigger } = useEventRefresh();
  const isOrganizer = user?.role === 'Organizer';
  const [organizerStats, setOrganizerStats] = useState({
    totalEvents: 0,
    pendingPayments: 0,
    upcomingEvents: 0,
    totalAttendance: 0,
    approvedPayments: 0,
  });

  useEffect(() => {
    let active = true;

    const parseEventDate = (dateString) => {
      if (!dateString) return null;
      const parsed = new Date(dateString);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    };

    const loadOrganizerStats = async () => {
      if (!isOrganizer || !user) return;

      try {
        const events = await fetchEvents();
        console.log('All events fetched:', events);
        console.log('Current user:', user);
        
        const identityKeys = [user.name, user.email, user.studentId]
          .filter(Boolean)
          .map((value) => String(value).toLowerCase().trim());

        console.log('Identity keys for matching:', identityKeys);

        const organizerEvents = events.filter((event) => {
          const owner = String(event.organizedBy || '').toLowerCase().trim();
          console.log(`Comparing event "${event.name}" organizedBy "${owner}" against keys:`, identityKeys);
          return owner && identityKeys.some((key) => owner === key || owner.includes(key));
        });

        console.log('Filtered organizer events:', organizerEvents);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcomingEvents = organizerEvents.filter((event) => {
          const eventDate = parseEventDate(event.date);
          return eventDate && eventDate >= today;
        }).length;

        const eventIds = organizerEvents.map(e => e.id);
        
        let pendingPayments = 0;
        let approvedPayments = 0;
        const totalAttendance = organizerEvents.reduce((acc, event) => acc + (event.registeredStudents?.length || 0), 0);

        if (eventIds.length > 0) {
            const stats = await registrationService.getDashboardStats(eventIds);
            pendingPayments = stats.pendingPayments;
            approvedPayments = stats.approvedPayments;
        }

        if (active) {
          setOrganizerStats({
            totalEvents: organizerEvents.length,
            pendingPayments,
            upcomingEvents,
            totalAttendance,
            approvedPayments,
          });
        }
      } catch (error) {
        console.error('Error loading organizer stats:', error);
        if (active) {
          setOrganizerStats({ totalEvents: 0, pendingPayments: 0, upcomingEvents: 0, totalAttendance: 0, approvedPayments: 0 });
        }
      }
    };

    loadOrganizerStats();
    return () => {
      active = false;
    };
  }, [isOrganizer, user, refreshTrigger]);

  return (
    <div className="pf-fade-in">
      {/* Page Header */}
      <div className="profile-page-header">
        <div>
          <h1>{isOrganizer ? 'Creator Dashboard' : 'Dashboard Overview'}</h1>
          <p>{isOrganizer ? 'High-level metrics and quick actions for your events.' : 'A high-level view of your account status and quick actions.'}</p>
        </div>
        {isOrganizer && (
          <button
            className="create-event-btn"
            onClick={() => navigate('/create')}
          >
            <Plus size={20} />
            Create Event
          </button>
        )}
      </div>

      {/* Stats Section */}
      <div className="profile-section">
        <h3 className="profile-section-title">Overview</h3>
        <p className="profile-section-desc">{isOrganizer ? 'Your event performance at a glance.' : 'Your account information at a glance.'}</p>
        
        {isOrganizer ? (
          <div className="profile-stats-grid">
            <div
              className="profile-stat-card org-card org-stat-blue"
              onClick={() => navigate('/profile/events')}
              style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(37, 99, 235, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="org-stat-icon-wrapper">
                <Calendar size={24} />
              </div>
              <div className="org-stat-number">{organizerStats.totalEvents}</div>
              <div className="org-stat-name">Total Events</div>
              <div className="org-stat-meta">Events created by you</div>
            </div>
            <div
              className="profile-stat-card org-card org-stat-purple"
              onClick={() => navigate('/organizer/pending')}
              style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(168, 85, 247, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="org-stat-icon-wrapper">
                <DollarSign size={24} />
              </div>
              <div className="org-stat-number">{organizerStats.pendingPayments}</div>
              <div className="org-stat-name">Pending Payments</div>
              <div className="org-stat-meta">Student receipts awaiting review</div>
            </div>
            <div className="profile-stat-card org-card org-stat-orange">
              <div className="org-stat-icon-wrapper">
                <Clock size={24} />
              </div>
              <div className="org-stat-number">{organizerStats.upcomingEvents}</div>
              <div className="org-stat-name">Upcoming Events</div>
              <div className="org-stat-meta positive">Scheduled from today onward</div>
            </div>
            <div className="profile-stat-card org-card org-stat-teal">
              <div className="org-stat-icon-wrapper">
                <Users size={24} />
              </div>
              <div className="org-stat-number">{organizerStats.totalAttendance}</div>
              <div className="org-stat-name">Total Attendance</div>
              <div className="org-stat-meta positive">Attendees across events</div>
            </div>
            <div
              className="profile-stat-card org-card org-stat-pink"
              onClick={() => navigate('/organizer/approved')}
              style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(236, 72, 153, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="org-stat-icon-wrapper">
                <CreditCard size={24} />
              </div>
              <div className="org-stat-number">{organizerStats.approvedPayments}</div>
              <div className="org-stat-name">Approved Payments</div>
              <div className="org-stat-meta">Approved student registrations</div>
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
