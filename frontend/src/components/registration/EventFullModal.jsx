// EventFullModal.jsx — shown when event capacity is reached
export default function EventFullModal({ eventName, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container event-full-modal" onClick={(e) => e.stopPropagation()}>
        {/* Warning icon */}
        <div className="modal-icon event-full-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>

        <h2 className="modal-title">Event Full</h2>
        <p className="modal-message">
          <strong>"{eventName}"</strong> has reached its maximum capacity.
          <br /><br />
          We've added you to the waiting list. You'll receive a notification as soon as a spot opens up!
        </p>

        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onClose}>Got it</button>
        </div>
      </div>
    </div>
  );
}
