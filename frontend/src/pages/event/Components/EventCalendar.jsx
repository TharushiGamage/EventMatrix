import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCalendarEvents } from '../../../services/eventService';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const MAX_VISIBLE_EVENTS = 2;

function getDaysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(month, year) {
    return new Date(year, month - 1, 1).getDay();
}

function formatDateStr(year, month, day) {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatTime(t) {
    const [h, m] = t.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
}

function formatFullDate(year, month, day) {
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

/* ─── Event Detail Dialog ─── */
function EventDetailDialog({ event, dateLabel, onClose, onViewMore }) {
    const dialogRef = useRef(null);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    if (!event) return null;

    const colorClass = event.isPaid ? 'paid' : 'free';

    return (
        <div className="cal-dialog-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className={`cal-dialog cal-dialog-${colorClass}`} ref={dialogRef}>
                {/* Close button */}
                <button className="cal-dialog-close" onClick={onClose} aria-label="Close">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                {/* Header */}
                <div className="cal-dialog-header">
                    <span className={`cal-dialog-badge cal-dialog-badge-${colorClass}`}>
                        {event.isPaid ? 'Paid' : 'Free'}
                    </span>
                    <h3 className="cal-dialog-title">{event.name}</h3>
                </div>

                {/* Body */}
                <div className="cal-dialog-body">
                    <div className="cal-dialog-row">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span>{dateLabel}</span>
                    </div>
                    <div className="cal-dialog-row">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>{formatTime(event.startTime)} – {formatTime(event.endTime)}</span>
                    </div>
                    <div className="cal-dialog-row">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>{event.venue}</span>
                    </div>
                    {event.organizer && (
                        <div className="cal-dialog-row">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                            </svg>
                            <span>{event.organizer}</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="cal-dialog-footer">
                    <button className="btn btn-ghost" onClick={onClose}>Close</button>
                    <button className="btn btn-primary" onClick={() => onViewMore(event.id)}>
                        View More
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 6 15 12 9 18" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Main Calendar ─── */
export default function EventCalendar() {
    const navigate = useNavigate();
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [calendarData, setCalendarData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dialogEvent, setDialogEvent] = useState(null);
    const [dialogDate, setDialogDate] = useState('');

    const loadCalendar = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchCalendarEvents(currentMonth, currentYear);
            setCalendarData(data);
        } catch {
            setCalendarData({ month: currentMonth, year: currentYear, totalEvents: 0, events: {} });
        } finally {
            setLoading(false);
        }
    }, [currentMonth, currentYear]);

    useEffect(() => {
        loadCalendar();
    }, [loadCalendar]);

    const goToday = () => {
        setCurrentMonth(today.getMonth() + 1);
        setCurrentYear(today.getFullYear());
    };

    const goPrev = () => {
        if (currentMonth === 1) {
            setCurrentMonth(12);
            setCurrentYear((y) => y - 1);
        } else {
            setCurrentMonth((m) => m - 1);
        }
    };

    const goNext = () => {
        if (currentMonth === 12) {
            setCurrentMonth(1);
            setCurrentYear((y) => y + 1);
        } else {
            setCurrentMonth((m) => m + 1);
        }
    };

    const openEventDialog = (evt, day) => {
        setDialogEvent(evt);
        setDialogDate(formatFullDate(currentYear, currentMonth, day));
    };

    const closeDialog = () => {
        setDialogEvent(null);
        setDialogDate('');
    };

    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const events = calendarData?.events || {};

    const isToday = (day) => {
        return (
            day === today.getDate() &&
            currentMonth === today.getMonth() + 1 &&
            currentYear === today.getFullYear()
        );
    };

    // Build grid cells
    const cells = [];
    // Leading blanks
    for (let i = 0; i < firstDay; i++) {
        cells.push(<div key={`blank-${i}`} className="cal-day cal-day-empty" />);
    }
    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = formatDateStr(currentYear, currentMonth, d);
        const dayEvents = events[dateStr] || [];
        const hasEvents = dayEvents.length > 0;
        const visibleEvents = dayEvents.slice(0, MAX_VISIBLE_EVENTS);
        const remaining = dayEvents.length - MAX_VISIBLE_EVENTS;

        cells.push(
            <div
                key={d}
                className={`cal-day${isToday(d) ? ' cal-day-today' : ''}${hasEvents ? ' cal-day-has-events' : ''}`}
            >
                <span className="cal-day-number">{d}</span>
                {hasEvents && (
                    <div className="cal-day-events">
                        {visibleEvents.map((evt) => (
                            <button
                                key={evt.id}
                                className={`cal-event-bar ${evt.isPaid ? 'cal-event-bar-paid' : 'cal-event-bar-free'}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openEventDialog(evt, d);
                                }}
                                title={evt.name}
                            >
                                <span className="cal-event-bar-text">{evt.name}</span>
                            </button>
                        ))}
                        {remaining > 0 && (
                            <span
                                className="cal-event-more"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Open dialog for the first remaining event
                                    openEventDialog(dayEvents[MAX_VISIBLE_EVENTS], d);
                                }}
                            >
                                +{remaining} more
                            </span>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <section className="cal-section">
            <div className="cal-header">
                <div className="cal-nav">
                    <button className="cal-nav-btn" onClick={goPrev} aria-label="Previous month">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                    <h3 className="cal-month-title">
                        {MONTH_NAMES[currentMonth - 1]} {currentYear}
                    </h3>
                    <button className="cal-nav-btn" onClick={goNext} aria-label="Next month">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 6 15 12 9 18" />
                        </svg>
                    </button>
                </div>
                <div className="cal-header-right">
                    {calendarData && (
                        <span className="cal-total-badge">
                            {calendarData.totalEvents} event{calendarData.totalEvents !== 1 ? 's' : ''}
                        </span>
                    )}
                    <button className="btn btn-ghost cal-today-btn" onClick={goToday}>Today</button>
                </div>
            </div>

            {loading ? (
                <div className="cal-loading">
                    <div className="spinner" />
                    <p>Loading calendar…</p>
                </div>
            ) : (
                <div className="cal-grid-wrapper">
                    <div className="cal-weekdays">
                        {DAYS_OF_WEEK.map((d) => (
                            <div key={d} className="cal-weekday">{d}</div>
                        ))}
                    </div>
                    <div className="cal-grid">
                        {cells}
                    </div>
                </div>
            )}

            {/* Event Detail Dialog */}
            {dialogEvent && (
                <EventDetailDialog
                    event={dialogEvent}
                    dateLabel={dialogDate}
                    onClose={closeDialog}
                    onViewMore={(id) => {
                        closeDialog();
                        navigate(`/feed/${id}`);
                    }}
                />
            )}
        </section>
    );
}
