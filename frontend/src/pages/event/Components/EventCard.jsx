import { useNavigate } from 'react-router-dom';

export default function EventCard({ event, onDelete }) {
    const navigate = useNavigate();

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [h, m] = timeStr.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${m} ${ampm}`;
    };

    const formatTimeRange = (start, end) => {
        if (!start || !end) return '';
        return `${formatTime(start)} - ${formatTime(end)}`;
    };

    const isUpcoming = new Date(event.date) >= new Date(new Date().toDateString());

    return (
        <div className="event-card">
            <div className="event-card-header">
                <div className="event-card-badges">
                    <span className={`badge ${event.isPaid ? 'badge-paid' : 'badge-free'}`}>
                        {event.isPaid ? (event.ticketTypes?.length > 0 ? `₹${Math.min(...event.ticketTypes.map(t => parseFloat(t.price) || 0))}${event.ticketTypes.length > 1 ? '+' : ''}` : (event.ticketPrice ? `₹${event.ticketPrice}` : 'Paid')) : 'Free'}
                    </span>
                    {isUpcoming && <span className="badge badge-upcoming">Upcoming</span>}
                </div>
                <div className="event-card-actions">
                    <button
                        className="icon-btn icon-btn-edit"
                        onClick={() => navigate(`/edit/${event.id}`)}
                        title="Edit Event"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                    </button>
                    <button
                        className="icon-btn icon-btn-delete"
                        onClick={() => onDelete(event)}
                        title="Delete Event"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                    </button>
                </div>
            </div>

            <h3 className="event-card-title">{event.name}</h3>

            <div className="event-card-details">
                <div className="event-detail">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>{formatDate(event.date)}</span>
                </div>
                <div className="event-detail">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{formatTimeRange(event.startTime, event.endTime)}</span>
                </div>
                <div className="event-detail">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{event.venue}</span>
                </div>
                <div className="event-detail">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>{event.organizedBy}</span>
                </div>
            </div>

            <p className="event-card-description">{event.description}</p>

            <div className="event-card-footer">
                <div className="event-participants">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span>Max {event.maxParticipants} participants</span>
                </div>
            </div>
        </div>
    );
}
