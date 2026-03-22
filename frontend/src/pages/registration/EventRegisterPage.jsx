import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchEventById } from '../../services/eventService';
import { registrationService } from '../../services/registrationService';
import EventFullModal from '../../components/registration/EventFullModal';

export default function EventRegisterPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');
  const [showFullModal, setShowFullModal] = useState(false);

  const [form, setForm] = useState({
    studentName:  '',
    studentEmail: '',
    studentId:    '',
    contactNo:    '',
    faculty:      '',
    ticketType:   '',
  });

  // Pre-fill from auth context
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        studentName:  user.name  || '',
        studentEmail: user.email || '',
        studentId:    user.studentId || '',
      }));
    }
  }, [user]);

  const [existingReg, setExistingReg] = useState(null);

  useEffect(() => {
    Promise.all([
      fetchEventById(eventId),
      registrationService.getMyRegistrations().catch(() => [])
    ])
      .then(([eventData, myRegs]) => {
        setEvent(eventData);
        // Find if user already has an active registration for this event
        const existing = myRegs.find(r => 
          r.event?.id === eventData.id && 
          !['cancelled', 'rejected'].includes(r.status)
        );
        if (existing) setExistingReg(existing);
      })
      .catch(() => setError('Event not found.'))
      .finally(() => setLoading(false));
  }, [eventId]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!form.contactNo.trim()) { setError('Contact number is required.'); return; }
    if (event?.isPaid && !form.ticketType) { setError('Please select a ticket type.'); return; }

    setSubmitting(true);
    try {
      const res = await registrationService.register({ ...form, eventId });

      if (res.code === 'EVENT_FULL') {
        setShowFullModal(true);
        return;
      }

      if (res.success) {
        if (event?.isPaid) {
          // Navigate to payment/receipt upload page
          navigate(`/pay/${res.data._id}`, { state: { event, registration: res.data } });
        } else {
          navigate('/my-registrations', { state: { successMsg: 'Successfully registered for the event!' } });
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="reg-page">
        <div className="empty-state"><div className="spinner" /></div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="reg-page">
        <div className="error-banner"><span>{error}</span></div>
      </div>
    );
  }

  return (
    <div className="reg-page">
      {/* Back */}
      <button className="btn btn-ghost reg-back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* Event Summary Card */}
      {event && (
        <div className="reg-event-summary">
          <div className="reg-event-summary-info">
            <h2 className="reg-event-name">{event.name}</h2>
            <div className="reg-event-meta">
              <span>📅 {event.date} &nbsp;|&nbsp; ⏰ {event.startTime} – {event.endTime}</span>
              <span>📍 {event.venue}</span>
            </div>
          </div>
          <span className={`badge ${event.isPaid ? 'badge-paid' : 'badge-free'}`}>
            {event.isPaid ? `Paid — LKR ${event.ticketPrice ?? ''}` : 'Free Event'}
          </span>
        </div>
      )}

      {existingReg ? (
        <div className="reg-form-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>
            {existingReg.status === 'confirmed' || existingReg.status === 'approved' ? '✅' : '⏳'}
          </div>
          <h2 style={{ marginBottom: '12px' }}>You are already registered!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '1.1rem' }}>
            Your registration status for this event is:{' '}
            <strong style={{ 
              textTransform: 'uppercase', 
              color: existingReg.status === 'pending' ? 'var(--warning)' : 'var(--success)',
              letterSpacing: '0.05em',
              marginLeft: '4px'
            }}>
              {existingReg.status}
            </strong>
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/my-registrations')}>
            View My Registrations
          </button>
        </div>
      ) : (
      <div className="reg-form-card">
        <div className="reg-form-header">
          <h1 className="form-page-title">Event Registration</h1>
          <p className="form-page-subtitle">
            {event?.isPaid
              ? "Fill in your details. You'll upload your payment receipt in the next step."
              : 'Fill in your details to confirm your spot.'}
          </p>
        </div>

        {error && (
          <div className="error-banner" style={{ marginBottom: '20px' }}>
            <span>{error}</span>
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        <form className="event-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name <span className="required">*</span></label>
              <input
                name="studentName"
                className="form-input"
                value={form.studentName}
                onChange={handleChange}
                required
                placeholder="Your full name"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Student ID <span className="required">*</span></label>
              <input
                name="studentId"
                className="form-input"
                value={form.studentId}
                onChange={handleChange}
                required
                placeholder="e.g. IT21001234"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email Address <span className="required">*</span></label>
              <input
                name="studentEmail"
                type="email"
                className="form-input"
                value={form.studentEmail}
                onChange={handleChange}
                required
                placeholder="your@email.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Number <span className="required">*</span></label>
              <input
                name="contactNo"
                className="form-input"
                value={form.contactNo}
                onChange={handleChange}
                required
                placeholder="e.g. 0771234567"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Faculty / Department</label>
            <input
              name="faculty"
              className="form-input"
              value={form.faculty}
              onChange={handleChange}
              placeholder="e.g. Faculty of Computing"
            />
          </div>

          {/* Ticket type — only for paid events */}
          {event?.isPaid && event.ticketTypes?.length > 0 && (
            <div className="form-group">
              <label className="form-label">Ticket Type <span className="required">*</span></label>
              <select
                name="ticketType"
                className="form-input"
                value={form.ticketType}
                onChange={handleChange}
                required
              >
                <option value="">— Select a ticket type —</option>
                {event.ticketTypes.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name} — LKR {t.price.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (
                <><div className="spinner-sm" /> Submitting…</>
              ) : event?.isPaid ? (
                'Continue to Payment →'
              ) : (
                'Confirm Registration'
              )}
            </button>
          </div>
        </form>
      </div>
      )}

      {/* Event Full Popup */}
      {showFullModal && (
        <EventFullModal
          eventName={event?.name}
          onClose={() => { setShowFullModal(false); navigate('/'); }}
        />
      )}
    </div>
  );
}
