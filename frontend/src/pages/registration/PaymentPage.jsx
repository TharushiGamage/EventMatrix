import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { registrationService } from '../../services/registrationService';
import { fetchEventById } from '../../services/eventService';

export default function PaymentPage() {
  const { registrationId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation(); // may contain { event, registration } from navigate()

  const [event, setEvent]         = useState(state?.event || null);
  const [registration]            = useState(state?.registration || null);
  const [file, setFile]           = useState(null);
  const [preview, setPreview]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);

  // If navigated directly (no state), fetch event via registration's eventId
  useEffect(() => {
    if (!event && registration?.event) {
      fetchEventById(registration.event).then(setEvent).catch(() => {});
    }
  }, [event, registration]);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError('Please attach your payment receipt image.'); return; }

    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('receipt', file);
      await registrationService.uploadReceipt(registrationId, formData);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="reg-page">
        <div className="payment-success-card">
          <div className="payment-success-icon">✅</div>
          <h2>Receipt Submitted!</h2>
          <p>
            Your payment receipt for <strong>{event?.name}</strong> has been submitted successfully.
            <br />
            Your registration is now <strong>pending organizer review</strong>. You'll receive a notification once it's processed.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/my-registrations')}>
            View My Registrations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reg-page">
      <button className="btn btn-ghost reg-back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* Event + amount summary */}
      {event && (
        <div className="reg-event-summary">
          <div className="reg-event-summary-info">
            <h2 className="reg-event-name">{event.name}</h2>
            <span className="reg-event-meta">📅 {event.date} &nbsp;|&nbsp; 📍 {event.venue}</span>
          </div>
          {registration?.ticketType && (
            <div className="payment-amount-pill">
              <span className="payment-amount-label">{registration.ticketType}</span>
              <span className="payment-amount-value">LKR {registration.ticketPrice?.toLocaleString()}</span>
            </div>
          )}
        </div>
      )}

      <div className="reg-form-card">
        <div className="reg-form-header">
          <h1 className="form-page-title">Upload Payment Receipt</h1>
          <p className="form-page-subtitle">
            Make your payment and upload a photo/screenshot of the receipt to complete registration.
          </p>
        </div>

        {/* Payment instructions box */}
        <div className="payment-instructions">
          <p className="payment-instructions-title">💳 Payment Instructions</p>
          <ul>
            <li>Transfer the amount shown above to the organizer's bank account or payment link.</li>
            <li>Take a clear screenshot or photo of the completed payment receipt.</li>
            <li>Upload it below and click <strong>Confirm Payment</strong>.</li>
          </ul>
        </div>

        {error && (
          <div className="error-banner" style={{ marginBottom: '20px' }}>
            <span>{error}</span>
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        <form className="event-form" onSubmit={handleSubmit}>
          {/* Drop zone / file input */}
          <div className="form-group">
            <label className="form-label">Payment Receipt <span className="required">*</span></label>
            <label className="receipt-dropzone" htmlFor="receipt-input">
              {preview ? (
                <img src={preview} alt="Receipt preview" className="receipt-preview-img" />
              ) : (
                <div className="receipt-dropzone-placeholder">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <p>Click to upload receipt</p>
                  <span>JPEG, PNG, WEBP — max 5 MB</span>
                </div>
              )}
            </label>
            <input
              id="receipt-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="receipt-file-input"
              onChange={handleFileChange}
            />
            {file && (
              <p className="receipt-filename">
                📎 {file.name}
                <button type="button" className="receipt-remove-btn" onClick={() => { setFile(null); setPreview(null); }}>
                  Remove
                </button>
              </p>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/my-registrations')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting || !file}>
              {submitting ? <><div className="spinner-sm" /> Uploading…</> : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
