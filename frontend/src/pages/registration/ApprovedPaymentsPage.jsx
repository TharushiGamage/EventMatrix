import { useState, useEffect, useCallback } from 'react';
import { registrationService } from '../../services/registrationService';
import StatusBadge from '../../components/registration/StatusBadge';

export default function ApprovedPaymentsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [successMsg, setSuccessMsg]       = useState('');

  // Per-row state for notes + loading
  const [reviewState, setReviewState] = useState({}); // { [id]: { notes, submitting } }
  const [previewImg, setPreviewImg]   = useState(null);
  const [eventFilter, setEventFilter] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await registrationService.getApprovedRegistrations();
      setRegistrations(data);
    } catch {
      setError('Failed to load pending registrations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const setNotes = (id, notes) => {
    setReviewState(prev => ({ ...prev, [id]: { ...prev[id], notes } }));
  };

  const handleReview = async (id, action) => {
    const notes = reviewState[id]?.notes || '';
    setReviewState(prev => ({ ...prev, [id]: { ...prev[id], submitting: true } }));
    try {
      await registrationService.reviewRegistration(id, action, notes);
      setSuccessMsg(`Registration ${action === 'approve' ? 'approved' : 'rejected'} and student notified.`);
      load(); // refresh list
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed. Please try again.');
    } finally {
      setReviewState(prev => ({ ...prev, [id]: { ...prev[id], submitting: false } }));
    }
  };

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const filteredRegistrations = registrations.filter(reg => 
    !eventFilter || (reg.event?.name || '').toLowerCase().includes(eventFilter.toLowerCase())
  );

  return (
    <div className="approved-page">
      <div className="approved-header">
        <div>
          <p className="approved-kicker">Receipts overview</p>
          <h1 className="approved-title">Approved Registrations</h1>
          <p className="approved-subtitle">A curated view of verified payments and student details.</p>
        </div>
        <div className="approved-count-chip">{filteredRegistrations.length} approved</div>
      </div>

      <div className="approved-controls">
        <div className="approved-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Filter by event name..."
            value={eventFilter}
            onChange={e => setEventFilter(e.target.value)}
          />
        </div>
      </div>

      {successMsg && (
        <div className="success-banner">
          <span>✅ {successMsg}</span>
          <button onClick={() => setSuccessMsg('')}>×</button>
        </div>
      )}
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {loading ? (
        <div className="empty-state"><div className="spinner" /></div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="empty-state">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <h3>No matches found!</h3>
          <p>No approved registrations match your search criteria.</p>
        </div>
      ) : (
        <div className="approved-grid">
          {filteredRegistrations.map(reg => {
            const rowState = reviewState[reg._id] || {};
            return (
              <div key={reg._id} className="approved-card">
                <div className="approved-card-top">
                  <div>
                    <div className="approved-event-name">{reg.event?.name}</div>
                    <div className="approved-meta-row">
                      <span className="approved-chip">📅 {reg.event?.date || 'Date TBD'}</span>
                      <span className="approved-chip">📍 {reg.event?.venue || 'Venue TBD'}</span>
                      {reg.ticketType && (
                        <span className="approved-chip">🎟️ {reg.ticketType}{reg.ticketPrice ? ` · LKR ${reg.ticketPrice?.toLocaleString()}` : ''}</span>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={reg.status} />
                </div>

                <div className="approved-body">
                  <div className="approved-details">
                    <div className="approved-field">
                      <span className="approved-label">Student</span>
                      <span className="approved-value">{reg.studentName}</span>
                    </div>
                    <div className="approved-field">
                      <span className="approved-label">Student ID</span>
                      <span className="approved-value">{reg.studentId}</span>
                    </div>
                    <div className="approved-field">
                      <span className="approved-label">Email</span>
                      <span className="approved-value">{reg.studentEmail}</span>
                    </div>
                    <div className="approved-field">
                      <span className="approved-label">Contact</span>
                      <span className="approved-value">{reg.contactNo}</span>
                    </div>
                    <div className="approved-field">
                      <span className="approved-label">Submitted</span>
                      <span className="approved-value">{formatDate(reg.createdAt)}</span>
                    </div>
                    {reg.reviewNotes && (
                      <div className="approved-field approved-notes">
                        <span className="approved-label">Review Notes</span>
                        <span className="approved-value">{reg.reviewNotes}</span>
                      </div>
                    )}
                  </div>

                  <div className="approved-receipt">
                    <p className="approved-label">Payment Receipt</p>
                    {reg.receiptUrl ? (
                      <div
                        className="approved-receipt-thumb"
                        style={{ backgroundImage: `url(http://localhost:5000${reg.receiptUrl})` }}
                        onClick={() => setPreviewImg(`http://localhost:5000${reg.receiptUrl}`)}
                        title="Click to enlarge"
                      >
                        <span className="approved-receipt-overlay">Tap to open</span>
                      </div>
                    ) : (
                      <div className="approved-receipt-empty">No receipt uploaded</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fullscreen receipt preview */}
      {previewImg && (
        <div className="modal-overlay" onClick={() => setPreviewImg(null)}>
          <div className="receipt-fullscreen-wrapper" onClick={e => e.stopPropagation()}>
            <button className="receipt-fullscreen-close" onClick={() => setPreviewImg(null)}>×</button>
            <img src={previewImg} alt="Receipt fullscreen" className="receipt-fullscreen-img" />
          </div>
        </div>
      )}
    </div>
  );
}
