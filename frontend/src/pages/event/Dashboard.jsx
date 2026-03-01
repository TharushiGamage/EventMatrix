import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import EventCard from './Components/EventCard';
import EventCalendar from './Components/EventCalendar';
import EventModal from './Components/EventModal';
import { fetchEvents, fetchEventStats, deleteEvent as deleteEventApi } from '../../services/eventService';

export default function Dashboard() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [stats, setStats] = useState({ totalEvents: 0, upcomingEvents: 0, paidEvents: 0, freeEvents: 0 });
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch events from API
    const loadEvents = useCallback(async () => {
        try {
            setError(null);
            const data = await fetchEvents({ search, filter });
            setEvents(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [search, filter]);

    // Fetch stats from API
    const loadStats = useCallback(async () => {
        try {
            const data = await fetchEventStats();
            setStats(data);
        } catch {
            // stats are non-critical, silently ignore
        }
    }, []);

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        try {
            await deleteEventApi(deleteTarget.id);
            setDeleteTarget(null);
            // Refresh both lists
            loadEvents();
            loadStats();
        } catch (err) {
            setError(err.message);
            setDeleteTarget(null);
        }
    };

    return (
        <div className="dashboard">
            {/* Header */}
            <header className="dashboard-header">
                <div className="dashboard-header-text">
                    <h1 className="dashboard-title">Event Management</h1>
                    <p className="dashboard-subtitle">Create, manage, and track campus events</p>
                </div>
                <button className="btn btn-primary btn-lg" onClick={() => navigate('/create')}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Create Event
                </button>
            </header>

            {/* Stats */}
            <section className="stats-bar">
                <div className="stat-card stat-total">
                    <span className="stat-number">{stats.totalEvents}</span>
                    <span className="stat-label">Total Events</span>
                </div>
                <div className="stat-card stat-upcoming">
                    <span className="stat-number">{stats.upcomingEvents}</span>
                    <span className="stat-label">Upcoming</span>
                </div>
                <div className="stat-card stat-paid">
                    <span className="stat-number">{stats.paidEvents}</span>
                    <span className="stat-label">Paid</span>
                </div>
                <div className="stat-card stat-free">
                    <span className="stat-number">{stats.freeEvents}</span>
                    <span className="stat-label">Free</span>
                </div>
            </section>

            {/* Error banner */}
            {error && (
                <div className="error-banner">
                    <span>{error}</span>
                    <button onClick={() => setError(null)}>&times;</button>
                </div>
            )}

            {/* Calendar */}
            <EventCalendar />

            {/* Search & Filter */}
            <section className="toolbar">
                <div className="search-box">
                    <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search events by name, venue, or organizer..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className="search-clear" onClick={() => setSearch('')}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    )}
                </div>
                <div className="filter-group">
                    {['all', 'paid', 'free'].map((f) => (
                        <button
                            key={f}
                            className={`filter-btn ${filter === f ? 'filter-active' : ''}`}
                            onClick={() => setFilter(f)}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </section>

            {/* Event Grid */}
            <section className="event-grid">
                {loading ? (
                    <div className="empty-state">
                        <div className="spinner"></div>
                        <p>Loading events...</p>
                    </div>
                ) : events.length > 0 ? (
                    events.map((event) => (
                        <EventCard key={event.id} event={event} onDelete={setDeleteTarget} />
                    ))
                ) : (
                    <div className="empty-state">
                        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                            <line x1="9" y1="15" x2="15" y2="15" />
                        </svg>
                        <h3>No events found</h3>
                        <p>
                            {search || filter !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'Get started by creating your first event'}
                        </p>
                        {!search && filter === 'all' && (
                            <button className="btn btn-primary" onClick={() => navigate('/create')}>
                                Create Event
                            </button>
                        )}
                    </div>
                )}
            </section>

            {/* Delete Modal */}
            <EventModal
                isOpen={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDeleteConfirm}
                title="Delete Event"
                message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
            />
        </div>
    );
}
