import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchFeedEvents } from '../../services/eventService';

export default function Feed() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, totalItems: 0, totalPages: 1 });
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [category, setCategory] = useState('upcoming');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadFeed = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchFeedEvents({ search, filter, category, page, limit: 10 });
            setEvents(data.events);
            setPagination(data.pagination);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [search, filter, category, page]);

    useEffect(() => {
        loadFeed();
    }, [loadFeed]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setPage(1);
    }, [search, filter, category]);

    const formatDate = (dateStr) => {
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [h, m] = timeStr.split(':');
        const hour = parseInt(h, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const h12 = hour % 12 || 12;
        return `${h12}:${m} ${ampm}`;
    };

    const formatTimeRange = (start, end) => {
        if (!start || !end) return '';
        return `${formatTime(start)} - ${formatTime(end)}`;
    };

    const renderPagination = () => {
        if (pagination.totalPages <= 1) return null;
        const pages = [];
        for (let i = 1; i <= pagination.totalPages; i++) {
            pages.push(
                <button
                    key={i}
                    className={`feed-page-btn ${page === i ? 'feed-page-active' : ''}`}
                    onClick={() => setPage(i)}
                >
                    {i}
                </button>
            );
        }
        return (
            <div className="feed-pagination">
                <button
                    className="feed-page-btn feed-page-arrow"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                {pages}
                <button
                    className="feed-page-btn feed-page-arrow"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
            </div>
        );
    };

    return (
        <div className="feed-page">
            {/* Header */}
            <header className="feed-header">
                <div>
                    <h1 className="feed-title">Campus Events</h1>
                    <p className="feed-subtitle">Discover what's happening on campus</p>
                </div>
                <div className="feed-header-meta">
                    {!loading && (
                        <span className="feed-count">{pagination.totalItems} event{pagination.totalItems !== 1 ? 's' : ''}</span>
                    )}
                </div>
            </header>

            {/* Controls */}
            <section className="feed-controls">
                <div className="search-box">
                    <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search events..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className="search-clear" onClick={() => setSearch('')}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    )}
                </div>

                <div className="feed-filters">
                    <div className="filter-group">
                        {['all', 'paid', 'free'].map((f) => (
                            <button key={f} className={`filter-btn ${filter === f ? 'filter-active' : ''}`} onClick={() => setFilter(f)}>
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div className="feed-category-group">
                        {['upcoming', 'past', 'all'].map((c) => (
                            <button key={c} className={`feed-category-btn ${category === c ? 'feed-category-active' : ''}`} onClick={() => setCategory(c)}>
                                {c.charAt(0).toUpperCase() + c.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Error */}
            {error && (
                <div className="error-banner">
                    <span>{error}</span>
                    <button onClick={() => setError(null)}>&times;</button>
                </div>
            )}

            {/* Event List */}
            <section className="feed-list">
                {loading ? (
                    <div className="feed-empty">
                        <div className="spinner"></div>
                        <p>Loading events...</p>
                    </div>
                ) : events.length > 0 ? (
                    events.map((event, idx) => (
                        <article
                            key={event.id}
                            className="feed-item"
                            style={{ animationDelay: `${idx * 0.04}s` }}
                            onClick={() => navigate(`/feed/${event.id}`)}
                        >
                            <div className="feed-item-date-col">
                                <span className="feed-item-month">{new Date(event.date + 'T00:00:00').toLocaleString('en-US', { month: 'short' })}</span>
                                <span className="feed-item-day">{new Date(event.date + 'T00:00:00').getDate()}</span>
                            </div>
                            <div className="feed-item-content">
                                <div className="feed-item-top">
                                    <h3 className="feed-item-name">{event.name}</h3>
                                    <div className="feed-item-badges">
                                        <span className={`badge ${event.isPaid ? 'badge-paid' : 'badge-free'}`}>
                                            {event.isPaid ? 'Paid' : 'Free'}
                                        </span>
                                    </div>
                                </div>
                                <div className="feed-item-meta">
                                    <span className="feed-meta-item">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                        {formatDate(event.date)} · {formatTimeRange(event.startTime, event.endTime)}
                                    </span>
                                    <span className="feed-meta-item">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                        {event.venue}
                                    </span>
                                    <span className="feed-meta-item">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                                        {event.organizedBy}
                                    </span>
                                </div>
                            </div>
                            <div className="feed-item-price">
                                {event.isPaid ? (
                                    <span className="feed-price-tag">₹{event.ticketPrice}</span>
                                ) : (
                                    <span className="feed-price-free">Free</span>
                                )}
                                <svg className="feed-item-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                            </div>
                        </article>
                    ))
                ) : (
                    <div className="feed-empty">
                        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                            <line x1="9" y1="15" x2="15" y2="15" />
                        </svg>
                        <h3>No events found</h3>
                        <p>{search || filter !== 'all' || category !== 'upcoming' ? 'Try adjusting your search or filters' : 'No upcoming events at the moment'}</p>
                    </div>
                )}
            </section>

            {/* Pagination */}
            {!loading && renderPagination()}
        </div>
    );
}
