import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCalendarEvents } from '../../../services/eventService';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

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

export default function EventCalendar() {
    const navigate = useNavigate();
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [calendarData, setCalendarData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(null);
    const popupRef = useRef(null);

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

    // Close popup on outside click
    useEffect(() => {
        function handleClick(e) {
            if (popupRef.current && !popupRef.current.contains(e.target)) {
                setSelectedDay(null);
            }
        }
        if (selectedDay) {
            document.addEventListener('mousedown', handleClick);
        }
        return () => document.removeEventListener('mousedown', handleClick);
    }, [selectedDay]);

    const goToday = () => {
        setCurrentMonth(today.getMonth() + 1);
        setCurrentYear(today.getFullYear());
        setSelectedDay(null);
    };

    const goPrev = () => {
        setSelectedDay(null);
        if (currentMonth === 1) {
            setCurrentMonth(12);
            setCurrentYear((y) => y - 1);
        } else {
            setCurrentMonth((m) => m - 1);
        }
    };

    const goNext = () => {
        setSelectedDay(null);
        if (currentMonth === 12) {
            setCurrentMonth(1);
            setCurrentYear((y) => y + 1);
        } else {
            setCurrentMonth((m) => m + 1);
        }
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

    const handleDayClick = (day) => {
        const dateStr = formatDateStr(currentYear, currentMonth, day);
        if (events[dateStr]) {
            setSelectedDay(selectedDay === day ? null : day);
        }
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
        const hasPaid = dayEvents.some((e) => e.isPaid);
        const hasFree = dayEvents.some((e) => !e.isPaid);

        cells.push(
            <div
                key={d}
                className={`cal-day${isToday(d) ? ' cal-day-today' : ''}${hasEvents ? ' cal-day-has-events' : ''}${selectedDay === d ? ' cal-day-selected' : ''}`}
                onClick={() => handleDayClick(d)}
            >
                <span className="cal-day-number">{d}</span>
                {hasEvents && (
                    <div className="cal-day-indicators">
                        {hasFree && <span className="cal-dot cal-dot-free" />}
                        {hasPaid && <span className="cal-dot cal-dot-paid" />}
                        {dayEvents.length > 1 && (
                            <span className="cal-event-count">{dayEvents.length}</span>
                        )}
                    </div>
                )}

                {/* Day popup */}
                {selectedDay === d && hasEvents && (
                    <div className="cal-popup" ref={popupRef}>
                        <div className="cal-popup-header">
                            <span className="cal-popup-date">
                                {MONTH_NAMES[currentMonth - 1]} {d}, {currentYear}
                            </span>
                            <span className="cal-popup-count">{dayEvents.length} event{dayEvents.length > 1 ? 's' : ''}</span>
                        </div>
                        <ul className="cal-popup-list">
                            {dayEvents.map((evt) => (
                                <li
                                    key={evt.id}
                                    className="cal-popup-item"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/feed/${evt.id}`);
                                    }}
                                >
                                    <div className="cal-popup-item-top">
                                        <span className={`cal-popup-dot ${evt.isPaid ? 'cal-dot-paid' : 'cal-dot-free'}`} />
                                        <span className="cal-popup-name">{evt.name}</span>
                                    </div>
                                    <div className="cal-popup-item-meta">
                                        <span>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                            </svg>
                                            {formatTime(evt.startTime)} – {formatTime(evt.endTime)}
                                        </span>
                                        <span>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                                            </svg>
                                            {evt.venue}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
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
        </section>
    );
}
