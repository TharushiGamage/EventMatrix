import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Hash, Award, Calendar, Briefcase, Shield, ArrowRight, KeyRound, DollarSign, Clock, Users, CreditCard } from 'lucide-react';
import { fetchEvents } from '../../services/eventService';

const ProfileOverview = () => {
  const { user } = useAuth();
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
        const identityKeys = [user.name, user.email, user.studentId]
          .filter(Boolean)
          .map((value) => String(value).toLowerCase().trim());

        const organizerEvents = events.filter((event) => {
          const owner = String(event.organizedBy || '').toLowerCase().trim();
          return owner && identityKeys.some((key) => owner === key || owner.includes(key));
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcomingEvents = organizerEvents.filter((event) => {
          const eventDate = parseEventDate(event.date);
          return eventDate && eventDate >= today;
        }).length;

        const pendingPayments = organizerEvents.filter((event) => {
          const eventDate = parseEventDate(event.date);
          return Boolean(event.isPaid) && (!eventDate || eventDate >= today);
        }).length;

        const totalAttendance = organizerEvents.reduce((acc, event) => acc + (event.registeredStudents?.length || 0), 0);
        
        // Count events that are paid but maybe not pending
        const approvedPayments = organizerEvents.filter((event) => {
          const eventDate = parseEventDate(event.date);
          return Boolean(event.isPaid) && eventDate && eventDate < today;
        }).length;

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
        if (active) {
          setOrganizerStats({ totalEvents: 0, pendingPayments: 0, upcomingEvents: 0, totalAttendance: 0, approvedPayments: 0 });
        }
      }
    };

    loadOrganizerStats();
    return () => {
      active = false;
    };
  }, [isOrganizer, user]);

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
            <div className="profile-stat-card org-card org-stat-blue">
              <div className="org-stat-icon-wrapper">
                <Calendar size={24} />
              </div>
              <div className="org-stat-number">{organizerStats.totalEvents}</div>
              <div className="org-stat-name">Total Events</div>
              <div className="org-stat-meta">Events created by you</div>
            </div>
            <div className="profile-stat-card org-card org-stat-purple">
              <div className="org-stat-icon-wrapper">
                <DollarSign size={24} />
              </div>
              <div className="org-stat-number">{organizerStats.pendingPayments}</div>
              <div className="org-stat-name">Pending Payments</div>
              <div className="org-stat-meta">Paid events awaiting completion</div>
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
            <div className="profile-stat-card org-card org-stat-pink">
              <div className="org-stat-icon-wrapper">
                <CreditCard size={24} />
              </div>
              <div className="org-stat-number">{organizerStats.approvedPayments}</div>
              <div className="org-stat-name">Approved Payments</div>
              <div className="org-stat-meta">Completed paid events</div>
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
