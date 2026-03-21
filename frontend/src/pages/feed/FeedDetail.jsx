import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchFeedEventDetail } from '../../services/eventService';

export default function FeedDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchFeedEventDetail(id);
                if (!cancelled) setEvent(data);
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [id]);

    const formatDate = (dateStr) => {
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
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
        if (!start) return '';
        if (!end) return formatTime(start);
        return `${formatTime(start)} - ${formatTime(end)}`;
    };

    const formatTimestamp = (ts) => {
        return new Date(ts).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="feed-page">
                <div className="feed-empty">
                    <div className="spinner"></div>
                    <p>Loading event details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="feed-page">
                <div className="feed-detail-error">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    <h3>{error}</h3>
                    <button className="btn btn-primary" onClick={() => navigate('/feed')}>Back to Feed</button>
                </div>
            </div>
        );
    }

    return (
        <div className="feed-page">
            <button className="feed-back-btn" onClick={() => navigate('/feed')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
                Back to Feed
            </button>

            <article className="feed-detail">
                {/* Event Image */}
                {event.image && (
                    <div className="feed-detail-image-wrapper" style={{ maxWidth: '700px', margin: '0 auto 24px', height: '400px', overflow: 'hidden', borderRadius: '12px' }}>
                        <img 
                            src={`http://localhost:5000/uploaded_images/${event.image}`} 
                            alt={event.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    </div>
                )}

                {/* Hero section */}
                <div className="feed-detail-hero">
                    <div className="feed-detail-hero-badges">
                        <span className={`badge ${event.isPaid ? 'badge-paid' : 'badge-free'}`}>
                            {event.isPaid ? 'Paid' : 'Free'}
                        </span>
                        {event.isPaid && event.ticketPrice && (
                            <span className="feed-detail-price">Rs {event.ticketPrice}</span>
                        )}
                    </div>
                    <h1 className="feed-detail-title">{event.name}</h1>
                    <p className="feed-detail-organizer">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        Organized by <strong>{event.organizedBy}</strong>
                    </p>
                </div>

                {/* Register Button */}
                <div className="feed-detail-register">
                    <button
                        className="btn btn-register btn-register-lg"
                        onClick={() => alert(`Registration for "${event.name}" — coming soon!`)}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" />
                            <line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
                        </svg>
                        Register for this Event
                    </button>
                </div>

                {/* Info grid */}
                <div className="feed-detail-grid">
                    <div className="feed-detail-info-card">
                        <div className="feed-detail-info-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                        </div>
                        <div>
                            <span className="feed-detail-info-label">Date</span>
                            <span className="feed-detail-info-value">{formatDate(event.date)}</span>
                        </div>
                    </div>
                    {event.additionalDates && event.additionalDates.length > 0 && (
                        event.additionalDates.map((d, i) => (
                            <div className="feed-detail-info-card" key={`addl-date-${i}`}>
                                <div className="feed-detail-info-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="feed-detail-info-label">Additional Day</span>
                                    <span className="feed-detail-info-value">{formatDate(d)}</span>
                                </div>
                            </div>
                        ))
                    )}
                    {event.startTime && (
                        <div className="feed-detail-info-card">
                            <div className="feed-detail-info-icon" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                </svg>
                            </div>
                            <div>
                                <span className="feed-detail-info-label">Time</span>
                                <span className="feed-detail-info-value">{formatTimeRange(event.startTime, event.endTime)}</span>
                            </div>
                        </div>
                    )}
                    <div className="feed-detail-info-card">
                        <div className="feed-detail-info-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                            </svg>
                        </div>
                        <div>
                            <span className="feed-detail-info-label">Venue</span>
                            <span className="feed-detail-info-value">{event.venue}</span>
                        </div>
                    </div>
                    {event.maxParticipants && (
                        <div className="feed-detail-info-card">
                            <div className="feed-detail-info-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                                </svg>
                            </div>
                            <div>
                                <span className="feed-detail-info-label">Max Participants</span>
                                <span className="feed-detail-info-value">{event.maxParticipants}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Ticket Types */}
                {event.isPaid && event.ticketTypes && event.ticketTypes.length > 0 && (
                    <div className="feed-detail-section">
                        <h2 className="feed-detail-section-title">Ticket Types</h2>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {event.ticketTypes.map((ticket, i) => (
                                <div key={i} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '14px 18px', background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)'
                                }}>
                                    <div>
                                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>{ticket.name}</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {ticket.totalCount} available
                                            {ticket.issuingDates && ` · ${ticket.issuingDates}`}
                                        </span>
                                    </div>
                                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--warning)' }}>Rs {ticket.price}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Description */}
                <div className="feed-detail-section">
                    <h2 className="feed-detail-section-title">About this event</h2>
                    <p className="feed-detail-description">{event.description}</p>
                </div>

                {/* Footer timestamps */}
                <div className="feed-detail-footer">
                    <span>Created {formatTimestamp(event.createdAt)}</span>
                    <span>Updated {formatTimestamp(event.updatedAt)}</span>
                </div>
            </article>
        </div>
    );
}
