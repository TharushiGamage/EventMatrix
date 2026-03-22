import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { createEvent, updateEvent, fetchEventById } from '../../../services/eventService';
import { useEventRefresh } from '../../../context/EventRefreshContext';
import './EventForm.css';

export default function EventForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();
    const { triggerRefresh } = useEventRefresh();
    const isEdit = Boolean(id);

    const emptyForm = {
        name: '',
        date: '',
        additionalDates: [],
        startTime: '',
        endTime: '',
        venue: '',
        organizedBy: '',
        maxParticipants: '',
        isPaid: false,
        ticketTypes: [{
            name: '', price: '', totalCount: '',
            issuingDates: '', issuingTimes: '', issuingVenues: ''
        }],
        description: '',
        image: null,
    };

    const [form, setForm] = useState(emptyForm);
    const [currentImage, setCurrentImage] = useState(null);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [overlapWarning, setOverlapWarning] = useState(null);
    const [loadingEvent, setLoadingEvent] = useState(isEdit);

    // Fetch event data from API when editing
    useEffect(() => {
        if (!isEdit) return;
        let cancelled = false;

        (async () => {
            try {
                const event = await fetchEventById(id);
                if (cancelled) return;
                setCurrentImage(event.image || null);
                setForm({
                    name: event.name || '',
                    date: event.date || '',
                    additionalDates: event.additionalDates || [],
                    startTime: event.startTime || '',
                    endTime: event.endTime || '',
                    venue: event.venue || '',
                    organizedBy: event.organizedBy || '',
                    maxParticipants: event.maxParticipants ?? '',
                    isPaid: event.isPaid || false,
                    ticketTypes: event.ticketTypes?.length > 0 ? event.ticketTypes : [
                        { name: '', price: event.ticketPrice || '', totalCount: '', issuingDates: '', issuingTimes: '', issuingVenues: '' }
                    ],
                    description: event.description || '',
                    image: null,
                });
            } catch (err) {
                if (!cancelled) setApiError(err.message);
            } finally {
                if (!cancelled) setLoadingEvent(false);
            }
        })();

        return () => { cancelled = true; };
    }, [isEdit, id]);

    // Auto-populate organizedBy with current user's name when creating new event
    useEffect(() => {
        if (isEdit || !user?.name) return;
        setForm(prevForm => ({
            ...prevForm,
            organizedBy: user.name
        }));
    }, [user?.name, isEdit]);

    const validate = () => {
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = 'Event name is required';
        if (!form.date) newErrors.date = 'Date is required';
        if (!form.startTime) newErrors.startTime = 'Start Time is required';
        if (form.endTime && form.startTime && form.endTime <= form.startTime) {
            newErrors.endTime = 'End time must be after start time';
        }
        if (!form.venue.trim()) newErrors.venue = 'Venue is required';
        if (!form.organizedBy.trim()) newErrors.organizedBy = 'Organizer is required';
        if (form.maxParticipants && parseInt(form.maxParticipants) < 1)
            newErrors.maxParticipants = 'Must be at least 1';
        if (form.isPaid) {
            if (!form.ticketTypes || form.ticketTypes.length === 0) {
                newErrors.ticketTypes_general = 'At least one ticket type is required';
            } else {
                form.ticketTypes.forEach((ticket, index) => {
                    if (!ticket.name.trim()) newErrors[`ticket_${index}_name`] = 'Required';
                    if (!ticket.price || parseFloat(ticket.price) <= 0) newErrors[`ticket_${index}_price`] = 'Invalid price';
                    if (!ticket.totalCount || parseInt(ticket.totalCount) < 1) newErrors[`ticket_${index}_totalCount`] = 'Invalid check';
                    if (!ticket.issuingDates.trim()) newErrors[`ticket_${index}_issuingDates`] = 'Required';
                    if (!ticket.issuingTimes.trim()) newErrors[`ticket_${index}_issuingTimes`] = 'Required';
                    if (!ticket.issuingVenues.trim()) newErrors[`ticket_${index}_issuingVenues`] = 'Required';
                });
            }
        }
        if (!form.description.trim()) newErrors.description = 'Description is required';
        if (form.image && form.image.size > 5 * 1024 * 1024) {
            newErrors.image = 'Image size must be less than 5MB';
        }
        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (touched[name]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setForm(prev => ({ ...prev, image: file || null }));
        if (touched.image) {
            setErrors(prev => {
                const next = { ...prev };
                delete next.image;
                return next;
            });
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        checkOverlapAfterChange(name, form);
    };

    const checkOverlapAfterChange = async (fieldName, currentForm) => {
        // If a relevant field was blurred, let's check for overlap if all 3 are filled and valid
        if (['date', 'startTime', 'endTime'].includes(fieldName)) {
            // Need all 3 fields
            if (!currentForm.date || !currentForm.startTime || !currentForm.endTime) {
                setOverlapWarning(null);
                return;
            }
            // End time must be after start time
            if (currentForm.endTime <= currentForm.startTime) {
                setOverlapWarning(null);
                return;
            }

            try {
                // To avoid import cycle issues if we haven't imported checkEventOverlap at top, we dynamically fetch or assume it's imported
                // We must ensure checkEventOverlap is imported at top level
                const { checkEventOverlap } = await import('../../../services/eventService');
                const result = await checkEventOverlap(currentForm.date, currentForm.startTime, currentForm.endTime);

                if (result.hasOverlap) {
                    // Filter out the current event itself if we are editing
                    const conflicts = isEdit ? result.conflicts.filter(c => c.id !== id) : result.conflicts;
                    if (conflicts.length > 0) {
                        setOverlapWarning(conflicts);
                        return;
                    }
                }
                setOverlapWarning(null);
            } catch (err) {
                // Silently ignore overlap check errors or log them
                console.error("Failed to check overlap", err);
            }
        }
    };

    const handleTicketChange = (index, field, value) => {
        const newTicketTypes = [...form.ticketTypes];
        newTicketTypes[index] = { ...newTicketTypes[index], [field]: value };
        setForm(prev => ({ ...prev, ticketTypes: newTicketTypes }));
    };

    const addTicketType = () => {
        setForm(prev => ({
            ...prev,
            ticketTypes: [
                ...prev.ticketTypes,
                { name: '', price: '', totalCount: '', issuingDates: '', issuingTimes: '', issuingVenues: '' }
            ]
        }));
    };

    const removeTicketType = (index) => {
        setForm(prev => ({
            ...prev,
            ticketTypes: prev.ticketTypes.filter((_, i) => i !== index)
        }));
    };

    const addAdditionalDate = () => {
        setForm(prev => ({
            ...prev,
            additionalDates: [...prev.additionalDates, '']
        }));
    };

    const removeAdditionalDate = (index) => {
        setForm(prev => ({
            ...prev,
            additionalDates: prev.additionalDates.filter((_, i) => i !== index)
        }));
    };

    const handleAdditionalDateChange = (index, value) => {
        const newDates = [...form.additionalDates];
        newDates[index] = value;
        setForm(prev => ({ ...prev, additionalDates: newDates }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError(null);

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setTouched(
                Object.keys(validationErrors).reduce((acc, key) => ({ ...acc, [key]: true }), {})
            );
            return;
        }

        const filteredAdditionalDates = form.additionalDates.filter(d => d);

        const payloadParams = {
            name: form.name.trim(),
            date: form.date,
            additionalDates: filteredAdditionalDates,
            startTime: form.startTime,
            endTime: form.endTime || undefined,
            venue: form.venue.trim(),
            organizedBy: form.organizedBy.trim(),
            maxParticipants: form.maxParticipants ? parseInt(form.maxParticipants) : undefined,
            isPaid: form.isPaid,
            ticketTypes: form.isPaid ? form.ticketTypes.map(t => ({
                name: t.name.trim(),
                price: parseFloat(t.price),
                totalCount: parseInt(t.totalCount),
                issuingDates: t.issuingDates.trim(),
                issuingTimes: t.issuingTimes.trim(),
                issuingVenues: t.issuingVenues.trim()
            })) : [],
            description: form.description.trim(),
        };

        let finalPayload;
        if (form.image) {
            finalPayload = new FormData();
            Object.entries(payloadParams).forEach(([key, value]) => {
                if (value === undefined) return;
                if (key === 'ticketTypes' || key === 'additionalDates') {
                    finalPayload.append(key, JSON.stringify(value));
                } else {
                    finalPayload.append(key, value);
                }
            });
            finalPayload.append('image', form.image);
        } else {
            finalPayload = payloadParams;
        }

        try {
            setSubmitting(true);
            if (isEdit) {
                await updateEvent(id, finalPayload);
            } else {
                await createEvent(finalPayload);
                triggerRefresh();
            }
            navigate('/profile/my-events');
        } catch (err) {
            setApiError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingEvent) {
        return (
            <div className="form-page">
                <div className="empty-state">
                    <div className="spinner"></div>
                    <p>Loading event...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="event-form-container">
            <div className="event-form-header">
                <button type="button" className="back-btn-float" onClick={() => navigate('/profile/my-events')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                    Back to My Events
                </button>
                <h1 className="form-page-title">{isEdit ? 'Edit Event' : 'Create New Event'}</h1>
                <p className="form-page-subtitle">
                    {isEdit 
                        ? 'Update your event details below to keep your attendees informed.' 
                        : 'Fill in the details below to publish a new event to the campus community.'}
                </p>
            </div>

            {apiError && (
                <div className="error-banner" style={{ marginBottom: '24px', borderRadius: '12px' }}>
                    <span>{apiError}</span>
                    <button onClick={() => setApiError(null)}>&times;</button>
                </div>
            )}

            {overlapWarning && (
                <div className="warning-banner" style={{
                    marginBottom: '24px', padding: '16px 20px', backgroundColor: '#fffbeb',
                    color: '#b45309', borderRadius: '12px', border: '1px solid #fde68a',
                    display: 'flex', alignItems: 'flex-start', gap: '12px', boxShadow: '0 4px 6px -1px rgba(251, 191, 36, 0.1)'
                }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <div style={{ flexGrow: 1 }}>
                        <div style={{ fontWeight: '700', marginBottom: '4px', fontSize: '1.05rem' }}>Time Overlap Warning</div>
                        <div style={{ fontSize: '0.95rem', opacity: 0.9 }}>
                            This event overlaps with existing events on this date:
                            <ul style={{ marginTop: '6px', paddingLeft: '20px', marginBottom: 0 }}>
                                {overlapWarning.map(c => (
                                    <li key={c.id}>
                                        <strong>{c.name}</strong> ({c.startTime} - {c.endTime} at {c.venue})
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setOverlapWarning(null)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#b45309', padding: 0, lineHeight: 1 }}
                    >&times;</button>
                </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
                
                {/* SECTION 1: Basic Details */}
                <div className="form-section-card">
                    <div className="section-header">
                        <div>
                            <h2 className="section-title">Basic Details</h2>
                            <p className="section-subtitle">The fundamental information about your event.</p>
                        </div>
                        <div className="section-icon-wrapper">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label className="field-label" htmlFor="name">
                            Event Name <span className="required-asterisk">*</span>
                        </label>
                        <input
                            id="name" type="text" name="name"
                            className={`styled-input ${errors.name && touched.name ? 'error' : ''}`}
                            placeholder="e.g. Annual Tech Symposium 2026"
                            value={form.name} onChange={handleChange} onBlur={handleBlur}
                        />
                        {errors.name && touched.name && <span className="error-text">{errors.name}</span>}
                    </div>

                    <div>
                        <label className="field-label" htmlFor="description">
                            Event Description <span className="required-asterisk">*</span>
                        </label>
                        <textarea
                            id="description" name="description"
                            className={`styled-input styled-textarea ${errors.description && touched.description ? 'error' : ''}`}
                            placeholder="Describe the event, agenda, and special instructions..."
                            value={form.description} onChange={handleChange} onBlur={handleBlur}
                        />
                        {errors.description && touched.description && <span className="error-text">{errors.description}</span>}
                    </div>
                </div>

                {/* SECTION 2: Date & Time */}
                <div className="form-section-card">
                    <div className="section-header">
                        <div>
                            <h2 className="section-title">Date & Time</h2>
                            <p className="section-subtitle">When is your event taking place?</p>
                        </div>
                        <div className="section-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        </div>
                    </div>

                    <div className="form-grid-3" style={{ marginBottom: '20px' }}>
                        <div>
                            <label className="field-label" htmlFor="date">
                                Primary Date <span className="required-asterisk">*</span>
                            </label>
                            <input
                                id="date" type="date" name="date"
                                className={`styled-input ${errors.date && touched.date ? 'error' : ''}`}
                                value={form.date} onChange={handleChange} onBlur={handleBlur}
                            />
                            {errors.date && touched.date && <span className="error-text">{errors.date}</span>}
                        </div>
                        <div>
                            <label className="field-label" htmlFor="startTime">
                                Start Time <span className="required-asterisk">*</span>
                            </label>
                            <input
                                id="startTime" type="time" name="startTime"
                                className={`styled-input ${errors.startTime && touched.startTime ? 'error' : ''}`}
                                value={form.startTime} onChange={handleChange} onBlur={handleBlur}
                            />
                            {errors.startTime && touched.startTime && <span className="error-text">{errors.startTime}</span>}
                        </div>
                        <div>
                            <label className="field-label" htmlFor="endTime">
                                End Time
                            </label>
                            <input
                                id="endTime" type="time" name="endTime"
                                className={`styled-input ${errors.endTime && touched.endTime ? 'error' : ''}`}
                                value={form.endTime} onChange={handleChange} onBlur={handleBlur}
                            />
                            {errors.endTime && touched.endTime && <span className="error-text">{errors.endTime}</span>}
                        </div>
                    </div>

                    <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px dashed #e2e8f0' }}>
                        <label className="field-label">Additional Days (Optional)</label>
                        {form.additionalDates.map((d, index) => (
                            <div key={index} className="additional-date-item">
                                <input
                                    type="date" className="styled-input" value={d}
                                    onChange={(e) => handleAdditionalDateChange(index, e.target.value)}
                                />
                                <button
                                    type="button" className="btn-remove-date" title="Remove this day"
                                    onClick={() => removeAdditionalDate(index)}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                        ))}
                        <button type="button" className="add-btn" onClick={addAdditionalDate} style={{ marginTop: '8px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            Add Another Day
                        </button>
                    </div>
                </div>

                {/* SECTION 3: Location & Organizer */}
                <div className="form-section-card">
                    <div className="section-header">
                        <div>
                            <h2 className="section-title">Location & Logistics</h2>
                            <p className="section-subtitle">Where is it happening and who is hosting?</p>
                        </div>
                        <div className="section-icon-wrapper" style={{ background: '#fce7f3', color: '#db2777' }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        </div>
                    </div>

                    <div className="form-grid-3">
                        <div style={{ gridColumn: 'span 2' }}>
                            <label className="field-label" htmlFor="venue">
                                Venue / Location <span className="required-asterisk">*</span>
                            </label>
                            <input
                                id="venue" type="text" name="venue"
                                className={`styled-input ${errors.venue && touched.venue ? 'error' : ''}`}
                                placeholder="e.g. Main Auditorium, Block A"
                                value={form.venue} onChange={handleChange} onBlur={handleBlur}
                            />
                            {errors.venue && touched.venue && <span className="error-text">{errors.venue}</span>}
                        </div>

                        <div>
                            <label className="field-label" htmlFor="maxParticipants">
                                Max Participants
                            </label>
                            <input
                                id="maxParticipants" type="number" name="maxParticipants"
                                className={`styled-input ${errors.maxParticipants && touched.maxParticipants ? 'error' : ''}`}
                                placeholder="e.g. 200" min="1"
                                value={form.maxParticipants} onChange={handleChange} onBlur={handleBlur}
                            />
                            {errors.maxParticipants && touched.maxParticipants && <span className="error-text">{errors.maxParticipants}</span>}
                        </div>

                        <div style={{ gridColumn: 'span 3' }}>
                            <label className="field-label" htmlFor="organizedBy">
                                Organized By <span className="required-asterisk">*</span>
                            </label>
                            <input
                                id="organizedBy" type="text" name="organizedBy"
                                className={`styled-input ${errors.organizedBy && touched.organizedBy ? 'error' : ''}`}
                                placeholder="e.g. Computer Science Department"
                                value={form.organizedBy} onChange={handleChange} onBlur={handleBlur} readOnly
                            />
                            {errors.organizedBy && touched.organizedBy && <span className="error-text">{errors.organizedBy}</span>}
                        </div>
                    </div>
                </div>

                {/* SECTION 4: Ticketing */}
                <div className="form-section-card">
                    <div className="section-header">
                        <div>
                            <h2 className="section-title">Ticketing & Pricing</h2>
                            <p className="section-subtitle">Setup pricing tiers for event entry.</p>
                        </div>
                        <div className="section-icon-wrapper" style={{ background: '#ecfdf5', color: '#10b981' }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><line x1="12" y1="18" x2="12" y2="22"></line><line x1="12" y1="2" x2="12" y2="6"></line></svg>
                        </div>
                    </div>

                    <div className="paid-toggle-wrapper" style={{ marginBottom: form.isPaid ? '24px' : '0' }}>
                        <div>
                            <div className="paid-toggle-label">Require tickets / payment for entry?</div>
                            <div className="paid-toggle-desc">Turn this on to configure different ticket tiers and prices.</div>
                        </div>
                        <label className="toggle-switch">
                            <input id="isPaid" type="checkbox" name="isPaid" checked={form.isPaid} onChange={handleChange} />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    {form.isPaid && (
                        <div className="slide-down">
                            {errors.ticketTypes_general && <span className="error-text" style={{ marginBottom: '16px', display: 'block' }}>{errors.ticketTypes_general}</span>}

                            {form.ticketTypes.map((ticket, index) => (
                                <div key={index} className="ticket-type-card">
                                    {form.ticketTypes.length > 1 && (
                                        <button type="button" className="ticket-remove-btn" onClick={() => removeTicketType(index)} title="Remove Ticket Type">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </button>
                                    )}
                                    
                                    <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px', color: '#0f172a' }}>Ticket Tier {index + 1}</h3>

                                    <div className="form-grid-3" style={{ marginBottom: '16px' }}>
                                        <div>
                                            <label className="field-label">Ticket Name <span className="required-asterisk">*</span></label>
                                            <input type="text" className={`styled-input ${errors[`ticket_${index}_name`] ? 'error' : ''}`} placeholder="e.g. VIP Pass" value={ticket.name} onChange={(e) => handleTicketChange(index, 'name', e.target.value)} />
                                            {errors[`ticket_${index}_name`] && <span className="error-text">{errors[`ticket_${index}_name`]}</span>}
                                        </div>
                                        <div>
                                            <label className="field-label">Price (Rs) <span className="required-asterisk">*</span></label>
                                            <input type="number" min="0" step="0.01" className={`styled-input ${errors[`ticket_${index}_price`] ? 'error' : ''}`} placeholder="e.g. 500" value={ticket.price} onChange={(e) => handleTicketChange(index, 'price', e.target.value)} />
                                            {errors[`ticket_${index}_price`] && <span className="error-text">{errors[`ticket_${index}_price`]}</span>}
                                        </div>
                                        <div>
                                            <label className="field-label">Total Count <span className="required-asterisk">*</span></label>
                                            <input type="number" min="1" className={`styled-input ${errors[`ticket_${index}_totalCount`] ? 'error' : ''}`} placeholder="e.g. 100" value={ticket.totalCount} onChange={(e) => handleTicketChange(index, 'totalCount', e.target.value)} />
                                            {errors[`ticket_${index}_totalCount`] && <span className="error-text">{errors[`ticket_${index}_totalCount`]}</span>}
                                        </div>
                                    </div>

                                    <div className="form-grid-3">
                                        <div>
                                            <label className="field-label">Issuing Date <span className="required-asterisk">*</span></label>
                                            <input type="date" className={`styled-input ${errors[`ticket_${index}_issuingDates`] ? 'error' : ''}`} value={ticket.issuingDates} onChange={(e) => handleTicketChange(index, 'issuingDates', e.target.value)} />
                                            {errors[`ticket_${index}_issuingDates`] && <span className="error-text">{errors[`ticket_${index}_issuingDates`]}</span>}
                                        </div>
                                        <div>
                                            <label className="field-label">Issuing Time <span className="required-asterisk">*</span></label>
                                            <input type="time" className={`styled-input ${errors[`ticket_${index}_issuingTimes`] ? 'error' : ''}`} value={ticket.issuingTimes} onChange={(e) => handleTicketChange(index, 'issuingTimes', e.target.value)} />
                                            {errors[`ticket_${index}_issuingTimes`] && <span className="error-text">{errors[`ticket_${index}_issuingTimes`]}</span>}
                                        </div>
                                        <div>
                                            <label className="field-label">Issuing Venues <span className="required-asterisk">*</span></label>
                                            <input type="text" className={`styled-input ${errors[`ticket_${index}_issuingVenues`] ? 'error' : ''}`} placeholder="e.g. Main Campus Counter" value={ticket.issuingVenues} onChange={(e) => handleTicketChange(index, 'issuingVenues', e.target.value)} />
                                            {errors[`ticket_${index}_issuingVenues`] && <span className="error-text">{errors[`ticket_${index}_issuingVenues`]}</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button type="button" className="add-btn" onClick={addTicketType}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                Add Another Ticket Tier
                            </button>
                        </div>
                    )}
                </div>

                {/* SECTION 5: Media */}
                <div className="form-section-card">
                    <div className="section-header">
                        <div>
                            <h2 className="section-title">Cover Image</h2>
                            <p className="section-subtitle">Upload a beautiful cover image to attract participants.</p>
                        </div>
                        <div className="section-icon-wrapper" style={{ background: '#f3e8ff', color: '#9333ea' }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        </div>
                    </div>

                    {isEdit && currentImage && (
                        <div className="current-image-preview">
                            <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.6)', color: 'white', position: 'absolute', top: 0, left: 0, right: 0, fontSize: '0.85rem', fontWeight: '500' }}>
                                Currently using this image
                            </div>
                            <img src={`http://localhost:5000/uploaded_images/${currentImage}`} alt="Event Cover" />
                        </div>
                    )}

                    <div className="image-dropzone">
                        <input id="image" type="file" name="image" accept="image/jpeg, image/png, image/webp" onChange={handleFileChange} onBlur={handleBlur} />
                        <svg className="dropzone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        <div className="dropzone-text">Click or drag an image here to upload</div>
                        <div className="dropzone-subtext">Supported formats: JPEG, PNG, WEBP. Max size: 5MB.</div>
                        {form.image && (
                            <div style={{ marginTop: '16px', color: '#16a34a', fontWeight: '600', fontSize: '0.9rem' }}>
                                Selected: {form.image.name}
                            </div>
                        )}
                    </div>
                    {errors.image && touched.image && <span className="error-text" style={{ marginTop: '12px' }}>{errors.image}</span>}
                </div>

                <div className="form-footer-actions">
                    <button type="button" className="cancel-btn" onClick={() => navigate('/profile/my-events')}>
                        Cancel
                    </button>
                    <button type="submit" className="submit-btn" disabled={submitting}>
                        {submitting
                            ? (isEdit ? 'Updating Event...' : 'Publishing Event...')
                            : (isEdit ? 'Update Event Details' : 'Publish Event')}
                    </button>
                </div>
            </form>
        </div>
    );
}
