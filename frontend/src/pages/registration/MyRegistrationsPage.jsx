import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { registrationService } from '../../services/registrationService';
import StatusBadge from '../../components/registration/StatusBadge';

const ACTIVE = ['confirmed', 'approved', 'pending'];

export default function MyRegistrationsPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [successMsg, setSuccessMsg]       = useState(state?.successMsg || '');
  const [cancelTarget, setCancelTarget]   = useState(null);
  const [cancelling, setCancelling]       = useState(false);
  const [filter, setFilter]               = useState('all'); // 'all', 'free', 'paid'
  
  const [qrTarget, setQrTarget]           = useState(null);
  const [qrLoading, setQrLoading]         = useState(false);
  const [qrError, setQrError]             = useState('');
  const [qrData, setQrData]               = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await registrationService.getMyRegistrations();
      setRegistrations(data);
    } catch {
      setError('Failed to load registrations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await registrationService.cancelRegistration(cancelTarget._id);
      setSuccessMsg('Registration cancelled successfully.');
      setCancelTarget(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Cancellation failed.');
    } finally {
      setCancelling(false);
    }
  };

  const handleViewQr = async (reg) => {
    setQrTarget(reg);
    setQrLoading(true);
    setQrError('');
    setQrData(null);
    try {
      const data = await registrationService.getQrCode(reg._id);
      setQrData(data); // { qrCodeDataUrl, token }
    } catch (err) {
      setQrError(err.response?.data?.message || 'Failed to load QR code.');
    } finally {
      setQrLoading(false);
    }
  };

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  const filteredRegistrations = registrations.filter(reg => {
    if (filter === 'free') return reg.event?.isPaid === false;
    if (filter === 'paid') return reg.event?.isPaid === true;
    return true;
  });

  return (
    <div className="reg-page">
      <div className="reg-page-header">
        <div>
          <h1 className="form-page-title">My Registrations</h1>
          <p className="form-page-subtitle">Track all your event registrations and payment statuses.</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/profile/browse-events')}>Browse Events</button>
      </div>

      <div className="reg-filter-bar">
        <button className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('all')}>All Events</button>
        <button className={`btn ${filter === 'free' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('free')}>Free Events</button>
        <button className={`btn ${filter === 'paid' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('paid')}>Paid Events</button>
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
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          <h3>No registrations yet</h3>
          <p>Browse and register for events to see them here.</p>
          <button className="btn btn-primary" onClick={() => navigate('/profile/browse-events')}>Browse Events</button>
        </div>
      ) : (
        <div className="my-reg-list">
          {filteredRegistrations.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <p>No {filter !== 'all' ? filter : ''} registrations found.</p>
            </div>
          ) : (
          filteredRegistrations.map(reg => (
            <div key={reg._id} className="my-reg-card">
              {/* Left: event info */}
              <div className="my-reg-event-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <h3 className="my-reg-event-name" style={{ margin: 0 }}>{reg.event?.name || 'Unknown Event'}</h3>
                  <span className={`badge ${reg.event?.isPaid ? 'badge-paid' : 'badge-free'}`}>
                    {reg.event?.isPaid ? 'Paid Event' : 'Free Event'}
                  </span>
                </div>
                <div className="my-reg-meta">
                  {reg.event?.date && <span>📅 {reg.event.date}</span>}
                  {reg.event?.venue && <span>📍 {reg.event.venue}</span>}
                  <span>🕐 Registered {formatDate(reg.createdAt)}</span>
                </div>
                {reg.ticketType && (
                  <div className="my-reg-ticket-wrapper" style={{ marginTop: '4px' }}>
                    <span className="my-reg-ticket">🎟 {reg.ticketType} — LKR {reg.ticketPrice?.toLocaleString()}</span>
                    {(() => {
                      const ticketInfo = reg.event?.ticketTypes?.find(t => t.name === reg.ticketType);
                      // Only show ticket issuing details if the registration is approved
                      if (ticketInfo && reg.status === 'approved') {
                        return (
                          <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '6px', background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#334155' }}>Ticket Issuing Details:</div>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                <span>📅 {ticketInfo.issuingDates}</span>
                                <span>🕐 {ticketInfo.issuingTimes}</span>
                                <span>📍 {ticketInfo.issuingVenues}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}
              </div>

              {/* Right: status + actions */}
              <div className="my-reg-right">
                <StatusBadge status={reg.status} />

                {/* View QR Code for approved paid events */}
                {reg.status === 'approved' && reg.event?.isPaid === true && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleViewQr(reg)}
                  >
                    View QR Code
                  </button>
                )}

                {/* If paid and pending but no receipt yet, allow upload */}
                {reg.status === 'pending' && !reg.receiptUrl && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate(`/pay/${reg._id}`, { state: { event: reg.event, registration: reg } })}
                  >
                    Upload Receipt
                  </button>
                )}

                {/* Show receipt thumbnail if uploaded */}
                {reg.receiptUrl && (
                  <a
                    href={`http://localhost:5000${reg.receiptUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-ghost btn-sm"
                  >
                    View Receipt
                  </a>
                )}

                {/* Review notes if rejected */}
                {reg.status === 'rejected' && reg.reviewNotes && (
                  <p className="my-reg-review-notes">
                    Reason: {reg.reviewNotes}
                  </p>
                )}

                {/* Cancel button for active registrations */}
                {ACTIVE.includes(reg.status) && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => setCancelTarget(reg)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))
          )}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelTarget && (
        <div className="modal-overlay" onClick={() => setCancelTarget(null)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-icon" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <h2 className="modal-title">Cancel Registration?</h2>
            <p className="modal-message">
              Are you sure you want to cancel your registration for <strong>"{cancelTarget.event?.name}"</strong>?
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setCancelTarget(null)} disabled={cancelling}>
                Keep it
              </button>
              <button className="btn btn-danger" onClick={handleCancel} disabled={cancelling}>
                {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrTarget && (
        <div className="modal-overlay" onClick={() => setQrTarget(null)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <h2 className="modal-title">Event Ticket Pass</h2>
            <p className="modal-message">
              <strong>{qrTarget.event?.name}</strong><br />
              {qrTarget.ticketType} Ticket
            </p>
            
            <div style={{ margin: '20px 0', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {qrLoading ? (
                <div className="spinner"></div>
              ) : qrError ? (
                <p style={{ color: 'var(--danger)' }}>{qrError}</p>
              ) : qrData ? (
                <img src={qrData.qrCodeDataUrl} alt="QR Code" style={{ width: '200px', height: '200px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              ) : null}
            </div>

            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button className="btn btn-ghost" onClick={() => setQrTarget(null)}>
                Close
              </button>
              {qrData && (
                <a 
                  href={qrData.qrCodeDataUrl} 
                  download={`Ticket-${(qrTarget.event?.name || 'Event').replace(/\s+/g, '-')}-${(qrTarget.studentName || 'Student').replace(/\s+/g, '-')}.png`}
                  className="btn btn-primary"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  Download QR Code
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
