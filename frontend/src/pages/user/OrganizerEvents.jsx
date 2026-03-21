import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEventRefresh } from '../../context/EventRefreshContext';
import { fetchEvents, deleteEvent } from '../../services/eventService';
import { Edit, Trash2, ArrowLeft, Calendar, MapPin, DollarSign, Users } from 'lucide-react';
import './profile-layout.css';

const OrganizerEvents = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshTrigger } = useEventRefresh();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState('All');
  const [deleting, setDeleting] = useState(null);

  const loadOrganizerEvents = async () => {
    try {
      setLoading(true);
      const allEvents = await fetchEvents({ search });
      
      const identityKeys = [user.name, user.email, user.studentId]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase().trim());

      const organizerEvents = allEvents.filter((event) => {
        const owner = String(event.organizedBy || '').toLowerCase().trim();
        return owner && identityKeys.some((key) => owner === key || owner.includes(key));
      });

      setEvents(organizerEvents || []);
    } catch (err) {
      console.error('Error loading organizer events:', err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadOrganizerEvents();
  }, [user, search, refreshTrigger]);

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    try {
      setDeleting(eventId);
      await deleteEvent(eventId);
      setEvents(events.filter(e => (e.id || e._id) !== eventId));
      alert('Event deleted successfully');
    } catch (err) {
      alert('Failed to delete event: ' + err.message);
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (eventId) => {
    navigate(`/edit/${eventId}`);
  };

  const today = new Date().toISOString().split('T')[0];
  const filtered = events.filter(ev => {
    if (filterTab === 'All') return true;
    if (filterTab === 'Upcoming') return ev.date >= today;
    if (filterTab === 'Past') return ev.date < today;
    return true;
  });

  return (
    <div className="profile-content-wrapper">
      {/* Back Button */}
      <button
        className="back-link"
        onClick={() => navigate('/profile')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'none',
          border: 'none',
          color: '#2563eb',
          fontSize: '0.95rem',
          fontWeight: '600',
          cursor: 'pointer',
          marginBottom: '2rem',
          padding: 0,
        }}
      >
        <ArrowLeft size={18} />
        Back to Profile
      </button>

      {/* Page Header */}
      <div className="profile-page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>My Events</h1>
          <p>Manage all events you've created</p>
        </div>
      </div>

      {/* Controls */}
      <div className="organizer-controls" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.5rem',
        marginBottom: '2rem',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['All', 'Upcoming', 'Past'].map(tab => (
            <button
              key={tab}
              className={`org-filter-tab ${filterTab === tab ? 'active' : ''}`}
              onClick={() => setFilterTab(tab)}
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                border: filterTab === tab ? '2px solid #2563eb' : '1px solid #e2e8f0',
                background: filterTab === tab ? '#eff6ff' : '#ffffff',
                color: filterTab === tab ? '#2563eb' : '#64748b',
                fontWeight: filterTab === tab ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {tab} ({filtered.filter(ev => {
                if (tab === 'All') return true;
                if (tab === 'Upcoming') return ev.date >= today;
                return ev.date < today;
              }).length})
            </button>
          ))}
        </div>

        <div style={{
          flex: 1,
          minWidth: '250px',
          maxWidth: '400px',
        }}>
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontFamily: 'inherit',
            }}
          />
        </div>
      </div>

      {/* Events Grid - Portrait Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '2rem',
      }}>
        {loading ? (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: '0.95rem',
            gridColumn: '1 / -1',
          }}>
            Loading your events...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: '0.95rem',
            gridColumn: '1 / -1',
          }}>
            No events found.
          </div>
        ) : (
          filtered.map(event => (
            <div
              key={event.id || event._id}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                height: '100%',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(37, 99, 235, 0.15)';
                e.currentTarget.style.borderColor = '#2563eb';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Event Header */}
              <div style={{
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '1rem',
              }}>
                <h3 style={{
                  fontSize: '1.15rem',
                  fontWeight: '700',
                  color: '#0f172a',
                  marginBottom: '0.5rem',
                  lineHeight: '1.3',
                }}>
                  {event.name}
                </h3>
                <span style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  background: event.isPaid ? '#fef3c7' : '#d1fae5',
                  color: event.isPaid ? '#92400e' : '#065f46',
                  fontWeight: '600',
                  fontSize: '0.75rem',
                }}>
                  {event.isPaid ? 'Paid' : 'Free'}
                </span>
              </div>

              {/* Description */}
              <p style={{
                color: '#64748b',
                fontSize: '0.85rem',
                lineHeight: '1.4',
                flex: 1,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {event.description}
              </p>

              {/* Event Details */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                fontSize: '0.85rem',
                color: '#64748b',
              }}>
                {/* Date & Time */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={16} style={{ color: '#2563eb', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>{event.date}</div>
                    {event.startTime && (
                      <div style={{ fontSize: '0.8rem' }}>{event.startTime} - {event.endTime || ''}</div>
                    )}
                  </div>
                </div>

                {/* Venue */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={16} style={{ color: '#2563eb', flexShrink: 0 }} />
                  <span style={{ fontWeight: '500' }}>{event.venue}</span>
                </div>

                {/* Participants */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={16} style={{ color: '#2563eb', flexShrink: 0 }} />
                  <span style={{ fontWeight: '500' }}>{event.registeredStudents?.length || 0} Participants</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                marginTop: 'auto',
                paddingTop: '1rem',
                borderTop: '1px solid #e2e8f0',
              }}>
                <button
                  onClick={() => handleEdit(event.id || event._id)}
                  style={{
                    flex: 1,
                    padding: '0.65rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#3b82f6',
                    color: '#ffffff',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#2563eb';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#3b82f6';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <Edit size={16} />
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(event.id || event._id)}
                  disabled={deleting === (event.id || event._id)}
                  style={{
                    flex: 1,
                    padding: '0.65rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#ef4444',
                    color: '#ffffff',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    opacity: deleting === (event.id || event._id) ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#dc2626';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#ef4444';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <Trash2 size={16} />
                  {deleting === (event.id || event._id) ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrganizerEvents;
