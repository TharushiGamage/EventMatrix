import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createEvent, updateEvent, fetchEventById } from '../../../services/eventService';

export default function EventForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const emptyForm = {
        name: '',
        date: '',
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

    const validate = () => {
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = 'Event name is required';
        if (!form.date) newErrors.date = 'Date is required';
        if (!form.startTime) newErrors.startTime = 'Start Time is required';
        if (!form.endTime) {
            newErrors.endTime = 'End Time is required';
        } else if (form.startTime && form.endTime) {
            if (form.endTime <= form.startTime) {
                newErrors.endTime = 'End time must be after start time';
            }
        }
        if (!form.venue.trim()) newErrors.venue = 'Venue is required';
        if (!form.organizedBy.trim()) newErrors.organizedBy = 'Organizer is required';
        if (!form.maxParticipants || parseInt(form.maxParticipants) < 1)
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

        const payloadParams = {
            name: form.name.trim(),
            date: form.date,
            startTime: form.startTime,
            endTime: form.endTime,
            venue: form.venue.trim(),
            organizedBy: form.organizedBy.trim(),
            maxParticipants: parseInt(form.maxParticipants),
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
                if (key === 'ticketTypes') {
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
            }
            navigate('/');
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
        <div className="form-page">
            <div className="form-page-header">
                <button className="btn btn-ghost" onClick={() => navigate('/')}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                    Back to Dashboard
                </button>
                <h1 className="form-page-title">{isEdit ? 'Edit Event' : 'Create New Event'}</h1>
                <p className="form-page-subtitle">
                    {isEdit ? 'Update the event details below' : 'Fill in the details to create a new event'}
                </p>
            </div>

            {apiError && (
                <div className="error-banner" style={{ marginBottom: '20px' }}>
                    <span>{apiError}</span>
                    <button onClick={() => setApiError(null)}>&times;</button>
                </div>
            )}

            {overlapWarning && (
                <div className="warning-banner" style={{
                    marginBottom: '20px',
                    padding: '12px 16px',
                    backgroundColor: '#fff3cd',
                    color: '#856404',
                    borderRadius: '8px',
                    border: '1px solid #ffeeba',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <div style={{ flexGrow: 1 }}>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>Time Overlap Warning</div>
                        <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                            This event overlaps with existing events on this date:
                            <ul style={{ marginTop: '4px', paddingLeft: '20px', marginBottom: 0 }}>
                                {overlapWarning.map(c => (
                                    <li key={c.id}>
                                        <strong>{c.name}</strong> ({c.startTime} - {c.endTime} at {c.venue})
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <button
                        onClick={() => setOverlapWarning(null)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#856404', padding: 0 }}
                    >&times;</button>
                </div>
            )}

            <form className="event-form" onSubmit={handleSubmit} noValidate>
                {/* Event Name */}
                <div className="form-group">
                    <label className="form-label" htmlFor="name">
                        Event Name <span className="required">*</span>
                    </label>
                    <input
                        id="name"
                        type="text"
                        name="name"
                        className={`form-input ${errors.name && touched.name ? 'input-error' : ''}`}
                        placeholder="e.g. Annual Tech Symposium 2026"
                        value={form.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                    />
                    {errors.name && touched.name && <span className="form-error">{errors.name}</span>}
                </div>

                {/* Date & Time */}
                <div className="form-row">
                    <div className="form-group" style={{ flex: '1 1 100%' }}>
                        <label className="form-label" htmlFor="date">
                            Date <span className="required">*</span>
                        </label>
                        <input
                            id="date"
                            type="date"
                            name="date"
                            className={`form-input ${errors.date && touched.date ? 'input-error' : ''}`}
                            value={form.date}
                            onChange={handleChange}
                            onBlur={handleBlur}
                        />
                        {errors.date && touched.date && <span className="form-error">{errors.date}</span>}
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label" htmlFor="startTime">
                            Start Time <span className="required">*</span>
                        </label>
                        <input
                            id="startTime"
                            type="time"
                            name="startTime"
                            className={`form-input ${errors.startTime && touched.startTime ? 'input-error' : ''}`}
                            value={form.startTime}
                            onChange={handleChange}
                            onBlur={handleBlur}
                        />
                        {errors.startTime && touched.startTime && <span className="form-error">{errors.startTime}</span>}
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="endTime">
                            End Time <span className="required">*</span>
                        </label>
                        <input
                            id="endTime"
                            type="time"
                            name="endTime"
                            className={`form-input ${errors.endTime && touched.endTime ? 'input-error' : ''}`}
                            value={form.endTime}
                            onChange={handleChange}
                            onBlur={handleBlur}
                        />
                        {errors.endTime && touched.endTime && <span className="form-error">{errors.endTime}</span>}
                    </div>
                </div>

                {/* Venue */}
                <div className="form-group">
                    <label className="form-label" htmlFor="venue">
                        Venue <span className="required">*</span>
                    </label>
                    <input
                        id="venue"
                        type="text"
                        name="venue"
                        className={`form-input ${errors.venue && touched.venue ? 'input-error' : ''}`}
                        placeholder="e.g. Main Auditorium, Block A"
                        value={form.venue}
                        onChange={handleChange}
                        onBlur={handleBlur}
                    />
                    {errors.venue && touched.venue && <span className="form-error">{errors.venue}</span>}
                </div>

                {/* Organized By */}
                <div className="form-group">
                    <label className="form-label" htmlFor="organizedBy">
                        Organized By <span className="required">*</span>
                    </label>
                    <input
                        id="organizedBy"
                        type="text"
                        name="organizedBy"
                        className={`form-input ${errors.organizedBy && touched.organizedBy ? 'input-error' : ''}`}
                        placeholder="e.g. Computer Science Department"
                        value={form.organizedBy}
                        onChange={handleChange}
                        onBlur={handleBlur}
                    />
                    {errors.organizedBy && touched.organizedBy && (
                        <span className="form-error">{errors.organizedBy}</span>
                    )}
                </div>

                {/* Max Participants */}
                <div className="form-group">
                    <label className="form-label" htmlFor="maxParticipants">
                        Maximum Participation Count <span className="required">*</span>
                    </label>
                    <input
                        id="maxParticipants"
                        type="number"
                        name="maxParticipants"
                        className={`form-input ${errors.maxParticipants && touched.maxParticipants ? 'input-error' : ''}`}
                        placeholder="e.g. 200"
                        min="1"
                        value={form.maxParticipants}
                        onChange={handleChange}
                        onBlur={handleBlur}
                    />
                    {errors.maxParticipants && touched.maxParticipants && (
                        <span className="form-error">{errors.maxParticipants}</span>
                    )}
                </div>

                {/* Paid / Non-Paid Toggle */}
                <div className="form-group">
                    <div className="toggle-row">
                        <label className="form-label" htmlFor="isPaid" style={{ marginBottom: 0 }}>
                            Paid Event
                        </label>
                        <label className="toggle-switch">
                            <input
                                id="isPaid"
                                type="checkbox"
                                name="isPaid"
                                checked={form.isPaid}
                                onChange={handleChange}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                </div>

                {/* Ticket Types — shown only if Paid */}
                {form.isPaid && (
                    <div className="form-group slide-down">
                        <label className="form-label">
                            Ticket Types <span className="required">*</span>
                        </label>
                        {errors.ticketTypes_general && <span className="form-error">{errors.ticketTypes_general}</span>}

                        {form.ticketTypes.map((ticket, index) => (
                            <div key={index} style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px', marginBottom: '16px', position: 'relative', background: '#fcfcfc' }}>
                                {form.ticketTypes.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeTicketType(index)}
                                        style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '1.2rem', padding: '4px', lineHeight: 1 }}
                                        title="Remove Ticket Type"
                                    >
                                        &times;
                                    </button>
                                )}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '12px' }}>
                                    <div>
                                        <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '4px' }}>Ticket Name <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            className={`form-input ${errors[`ticket_${index}_name`] ? 'input-error' : ''}`}
                                            placeholder="e.g. VIP Pass"
                                            value={ticket.name}
                                            onChange={(e) => handleTicketChange(index, 'name', e.target.value)}
                                        />
                                        {errors[`ticket_${index}_name`] && <span className="form-error" style={{ fontSize: '0.8rem' }}>{errors[`ticket_${index}_name`]}</span>}
                                    </div>
                                    <div>
                                        <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '4px' }}>Price (₹) <span className="required">*</span></label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            className={`form-input ${errors[`ticket_${index}_price`] ? 'input-error' : ''}`}
                                            placeholder="e.g. 500"
                                            value={ticket.price}
                                            onChange={(e) => handleTicketChange(index, 'price', e.target.value)}
                                        />
                                        {errors[`ticket_${index}_price`] && <span className="form-error" style={{ fontSize: '0.8rem' }}>{errors[`ticket_${index}_price`]}</span>}
                                    </div>
                                    <div>
                                        <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '4px' }}>Total Count <span className="required">*</span></label>
                                        <input
                                            type="number"
                                            min="1"
                                            className={`form-input ${errors[`ticket_${index}_totalCount`] ? 'input-error' : ''}`}
                                            placeholder="e.g. 100"
                                            value={ticket.totalCount}
                                            onChange={(e) => handleTicketChange(index, 'totalCount', e.target.value)}
                                        />
                                        {errors[`ticket_${index}_totalCount`] && <span className="form-error" style={{ fontSize: '0.8rem' }}>{errors[`ticket_${index}_totalCount`]}</span>}
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '12px' }}>
                                    <div>
                                        <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '4px' }}>Issuing Dates <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            className={`form-input ${errors[`ticket_${index}_issuingDates`] ? 'input-error' : ''}`}
                                            placeholder="e.g. 2026-03-01 to 2026-03-10"
                                            value={ticket.issuingDates}
                                            onChange={(e) => handleTicketChange(index, 'issuingDates', e.target.value)}
                                        />
                                        {errors[`ticket_${index}_issuingDates`] && <span className="form-error" style={{ fontSize: '0.8rem' }}>{errors[`ticket_${index}_issuingDates`]}</span>}
                                    </div>
                                    <div>
                                        <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '4px' }}>Issuing Times <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            className={`form-input ${errors[`ticket_${index}_issuingTimes`] ? 'input-error' : ''}`}
                                            placeholder="e.g. 09:00 to 17:00"
                                            value={ticket.issuingTimes}
                                            onChange={(e) => handleTicketChange(index, 'issuingTimes', e.target.value)}
                                        />
                                        {errors[`ticket_${index}_issuingTimes`] && <span className="form-error" style={{ fontSize: '0.8rem' }}>{errors[`ticket_${index}_issuingTimes`]}</span>}
                                    </div>
                                    <div>
                                        <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '4px' }}>Issuing Venues <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            className={`form-input ${errors[`ticket_${index}_issuingVenues`] ? 'input-error' : ''}`}
                                            placeholder="e.g. Main Campus"
                                            value={ticket.issuingVenues}
                                            onChange={(e) => handleTicketChange(index, 'issuingVenues', e.target.value)}
                                        />
                                        {errors[`ticket_${index}_issuingVenues`] && <span className="form-error" style={{ fontSize: '0.8rem' }}>{errors[`ticket_${index}_issuingVenues`]}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={addTicketType}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', marginTop: '4px' }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Add Another Ticket Type
                        </button>
                    </div>
                )}

                {/* Image Upload */}
                <div className="form-group">
                    <label className="form-label" htmlFor="image">
                        Event Image (Optional)
                    </label>
                    {isEdit && currentImage && (
                        <div style={{ marginBottom: '10px' }}>
                            <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 5px 0' }}>Current Image:</p>
                            <img src={`http://localhost:5000/uploaded_images/${currentImage}`} alt="Event" style={{ maxHeight: '150px', borderRadius: '8px' }} />
                        </div>
                    )}
                    <input
                        id="image"
                        type="file"
                        name="image"
                        accept="image/jpeg, image/png, image/webp"
                        className={`form-input ${errors.image && touched.image ? 'input-error' : ''}`}
                        onChange={handleFileChange}
                        onBlur={handleBlur}
                        style={{ padding: '8px' }}
                    />
                    <small style={{ display: 'block', marginTop: '4px', color: '#666', fontSize: '0.8rem' }}>
                        Supported formats: JPEG, PNG, WEBP. Max size: 5MB.
                    </small>
                    {errors.image && touched.image && (
                        <span className="form-error">{errors.image}</span>
                    )}
                </div>

                {/* Description */}
                <div className="form-group">
                    <label className="form-label" htmlFor="description">
                        Event Description <span className="required">*</span>
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        className={`form-input form-textarea ${errors.description && touched.description ? 'input-error' : ''}`}
                        placeholder="Describe the event, agenda, and special instructions..."
                        rows="5"
                        value={form.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                    />
                    {errors.description && touched.description && (
                        <span className="form-error">{errors.description}</span>
                    )}
                </div>

                {/* Actions */}
                <div className="form-actions">
                    <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting
                            ? (isEdit ? 'Updating...' : 'Creating...')
                            : (isEdit ? 'Update Event' : 'Create Event')}
                    </button>
                </div>
            </form>
        </div>
    );
}
