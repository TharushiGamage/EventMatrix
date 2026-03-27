import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEventRefresh } from '../../context/EventRefreshContext';
import { fetchEvents, deleteEvent } from '../../services/eventService';
import { Edit, Trash2, Calendar, MapPin, Users, Search } from 'lucide-react';
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

  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  const loadOrganizerEvents = async () => {
    try {
      setLoading(true);
      const allEvents = await fetchEvents({ search });

      const identityKeys = [user?.name, user?.email, user?.studentId]
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

  const normalizeDate = (date) => {
    if (!date) return null;
    const parsed = new Date(date);
    if (Number.isNaN(parsed)) return null;
    parsed.setHours(0, 0, 0, 0);
    return parsed;
  };

  const matchesSearch = (event) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return [event.name, event.venue, event.description, event.organizedBy]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(query));
  };

  const isUpcoming = (event) => {
    const eventDate = normalizeDate(event.date);
    if (!eventDate) return false;
    return eventDate >= today;
  };

  const isPast = (event) => {
    const eventDate = normalizeDate(event.date);
    if (!eventDate) return false;
    return eventDate < today;
  };

  const matchesTab = (event, tab) => {
    if (tab === 'All') return true;
    if (tab === 'Upcoming') return isUpcoming(event);
    return isPast(event);
  };

  const filtered = events.filter((event) => matchesSearch(event) && matchesTab(event, filterTab));

  const countForTab = (tab) =>
    events.filter((event) => matchesSearch(event) && matchesTab(event, tab)).length;

  const handleEdit = (id) => {
    navigate(`/profile/edit-event/${id}`);
  };

  const handleDelete = async (id) => {
    try {
      setDeleting(id);
      await deleteEvent(id);
      await loadOrganizerEvents();
    } catch (err) {
      alert('Failed to delete event: ' + err.message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="profile-content-wrapper organizer-page">
      <div className="profile-page-header organizer-header">
        <div>
          <h1>My Events</h1>
          <p>Manage all events you've created</p>
        </div>
      </div>

      <div className="organizer-controls">
        <div className="organizer-tabs">
          {['All', 'Upcoming', 'Past'].map((tab) => (
            <button
              key={tab}
              className={`organizer-tab ${filterTab === tab ? 'active' : ''}`}
              onClick={() => setFilterTab(tab)}
            >
              {tab} ({countForTab(tab)})
            </button>
          ))}
        </div>

        <div className="organizer-search">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="organizer-search-input"
          />
        </div>
      </div>

      <div className="organizer-grid">
        {loading ? (
          <div className="organizer-empty">Loading your events...</div>
        ) : filtered.length === 0 ? (
          <div className="organizer-empty">No events found.</div>
        ) : (
          filtered.map((event) => (
            <div key={event.id || event._id} className="organizer-card">
              <div className="organizer-card-header">
                <div>
                  <h3 className="organizer-title">{event.name}</h3>
                  <p className="organizer-date">{event.date}</p>
                </div>
                <span className={`organizer-type-badge ${event.isPaid ? 'paid' : 'free'}`}>
                  {event.isPaid ? 'Paid' : 'Free'}
                </span>
              </div>

              <p className="organizer-description">{event.description}</p>

              <div className="organizer-details">
                <div className="organizer-detail-row">
                  <Calendar size={16} className="icon" />
                  <div>
                    <div className="organizer-detail-strong">{event.date}</div>
                    {event.startTime && (
                      <div className="organizer-muted">
                        {event.startTime} {event.endTime ? `- ${event.endTime}` : ''}
                      </div>
                    )}
                  </div>
                </div>

                <div className="organizer-detail-row">
                  <MapPin size={16} className="icon" />
                  <span className="organizer-detail-strong">{event.venue}</span>
                </div>

                <div className="organizer-detail-row">
                  <Users size={16} className="icon" />
                  <span className="organizer-detail-strong">
                    {(event.participantCount ??
                      event.registeredStudentsCount ??
                      (event.registeredStudents?.length ?? 0))}{' '}
                    Participants
                  </span>
                </div>
              </div>

              <div className="organizer-actions">
                <button onClick={() => handleEdit(event.id || event._id)} className="organizer-edit-button">
                  <Edit size={16} />
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(event.id || event._id)}
                  disabled={deleting === (event.id || event._id)}
                  className="organizer-delete-button"
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
