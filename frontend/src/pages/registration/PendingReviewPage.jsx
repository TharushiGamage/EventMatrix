import { useState, useEffect, useCallback } from 'react';
import { registrationService } from '../../services/registrationService';
import StatusBadge from '../../components/registration/StatusBadge';

export default function PendingReviewPage() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [successMsg, setSuccessMsg]       = useState('');

  // Per-row state for notes + loading
  const [reviewState, setReviewState] = useState({}); // { [id]: { notes, submitting } }
  const [previewImg, setPreviewImg]   = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await registrationService.getPendingRegistrations();
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

  return (
    <div className="reg-page">
      <div className="reg-page-header">
        <div>
          <h1 className="form-page-title">Pending Registrations</h1>
          <p className="form-page-subtitle">
            Review payment receipts and approve or reject student registrations.
          </p>
        </div>
        <span className="pending-count-badge">{registrations.length} pending</span>
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
      ) : registrations.length === 0 ? (
        <div className="empty-state">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <h3>All caught up!</h3>
          <p>No pending registrations to review.</p>
        </div>
      ) : (
        <div className="pending-list">
          {registrations.map(reg => {
            const rowState = reviewState[reg._id] || {};
            return (
              <div key={reg._id} className="pending-card">

                {/* ── Header ── */}
                <div className="pending-card-header">
                  <div>
                    <h3 className="pending-event-name">{reg.event?.name}</h3>
                    <p className="pending-event-meta">
                      📅 {reg.event?.date} &nbsp;|&nbsp; 📍 {reg.event?.venue}
                    </p>
                  </div>
                  <StatusBadge status={reg.status} />
                </div>

                {/* ── Student Details ── */}
                <div className="pending-student-grid">
                  <div className="pending-detail-item">
                    <span className="pending-detail-label">Student Name</span>
                    <span className="pending-detail-value">{reg.studentName}</span>
                  </div>
                  <div className="pending-detail-item">
                    <span className="pending-detail-label">Student ID</span>
                    <span className="pending-detail-value">{reg.studentId}</span>
                  </div>
                  <div className="pending-detail-item">
                    <span className="pending-detail-label">Email</span>
                    <span className="pending-detail-value">{reg.studentEmail}</span>
                  </div>
                  <div className="pending-detail-item">
                    <span className="pending-detail-label">Contact</span>
                    <span className="pending-detail-value">{reg.contactNo}</span>
                  </div>
                  {reg.ticketType && (
                    <div className="pending-detail-item">
                      <span className="pending-detail-label">Ticket Type</span>
                      <span className="pending-detail-value">
                        {reg.ticketType} — LKR {reg.ticketPrice?.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="pending-detail-item">
                    <span className="pending-detail-label">Submitted</span>
                    <span className="pending-detail-value">{formatDate(reg.createdAt)}</span>
                  </div>
                </div>

                {/* ── Receipt Preview ── */}
                {reg.receiptUrl ? (
                  <div className="pending-receipt-section">
                    <p className="pending-detail-label" style={{ marginBottom: '8px' }}>Payment Receipt</p>
                    <img
                      src={`http://localhost:5000${reg.receiptUrl}`}
                      alt="Payment Receipt"
                      className="pending-receipt-thumb"
                      onClick={() => setPreviewImg(`http://localhost:5000${reg.receiptUrl}`)}
                      title="Click to enlarge"
                    />
                    <span className="pending-receipt-hint">Click image to enlarge</span>
                  </div>
                ) : (
                  <div className="pending-no-receipt">
                    ⚠️ No receipt uploaded yet
                  </div>
                )}

                {/* ── Review Notes + Actions ── */}
                <div className="pending-actions-section">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Review Notes (optional)</label>
                    <input
                      className="form-input"
                      placeholder="e.g. Payment amount incorrect, duplicate receipt…"
                      value={rowState.notes || ''}
                      onChange={(e) => setNotes(reg._id, e.target.value)}
                    />
                  </div>
                  <div className="pending-action-buttons">
                    <button
                      className="btn btn-danger"
                      disabled={rowState.submitting}
                      onClick={() => handleReview(reg._id, 'reject')}
                    >
                      {rowState.submitting ? '…' : '✕ Reject'}
                    </button>
                    <button
                      className="btn btn-success"
                      disabled={rowState.submitting}
                      onClick={() => handleReview(reg._id, 'approve')}
                    >
                      {rowState.submitting ? '…' : '✓ Approve'}
                    </button>
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
