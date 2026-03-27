import { useState, useRef, useEffect } from 'react';
import { registrationService } from '../../services/registrationService';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function QrValidationPage() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { success: boolean, data?: object, message?: string }
  const [showScanner, setShowScanner] = useState(false);
  const inputRef = useRef(null);

  // Automatically parse '?token=xxx' from URL if present (useful if they scan with a regular QR app that opens a link)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      setToken(urlToken);
      validateToken(urlToken);
      // Clean up URL so they can scan another without refreshing
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      inputRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner('reader', {
        qrbox: { width: 250, height: 250 },
        fps: 5,
      });

      scanner.render(
        (text) => {
          scanner.clear();
          setShowScanner(false);
          setToken(text);
          validateToken(text);
        },
        (error) => {
          // ignore scan errors, they happen continuously until a code is found
        }
      );

      return () => {
        scanner.clear().catch(error => {
            console.error("Failed to clear html5QrcodeScanner. ", error);
        });
      };
    }
  }, [showScanner]);

  const validateToken = async (tokenToUse) => {
    let actualToken = (tokenToUse || token).trim();
    if (!actualToken) return;

    // Check if the scanned input is a JSON string and extract the token if present
    try {
      const parsed = JSON.parse(actualToken);
      if (parsed && parsed.token) {
        actualToken = parsed.token;
      }
    } catch (e) {
      // Not a JSON string, fallback to using it as-is
    }

    setLoading(true);
    setResult(null);

    try {
      const data = await registrationService.validateQrCode(actualToken);
      setResult({ success: true, data });
      setToken(''); // clear field for next scan
      inputRef.current?.focus();
    } catch (err) {
      setResult({ 
        success: false, 
        message: err.response?.data?.message || 'Validation failed. Invalid token.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    validateToken();
  };

  return (
    <div className="reg-page">
      <div className="reg-page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="form-page-title">Validate Ticket Scanner</h1>
          <p className="form-page-subtitle">Enter or scan a QR Token to verify a student's registration.</p>
        </div>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
          <input
            ref={inputRef}
            type="text"
            className="input"
            style={{ flex: 1, padding: '12px' }}
            placeholder="Click here and scan QR code, or paste token..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
            disabled={loading}
          />
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowScanner(!showScanner)}
            style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19V7a2 2 0 0 0-2-2h-3.17a2 2 0 0 1-1.66-.9l-.34-.5A2 2 0 0 0 14.17 3h-4.34a2 2 0 0 0-1.66.9l-.34.5A2 2 0 0 1 6.17 5H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2Z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            {showScanner ? 'Cancel Camera' : 'Scan with Camera'}
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading || !token.trim()}>
            {loading ? 'Validating...' : 'Validate'}
          </button>
        </form>

        {showScanner && (
          <div style={{ marginBottom: '32px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <div id="reader" style={{ width: '100%' }}></div>
          </div>
        )}

        {/* Results Area */}
        {result && (
          <div className="validation-result-card" style={{ 
            padding: '24px', 
            borderRadius: '12px', 
            border: `2px solid ${result.success ? '#10b981' : '#ef4444'}`,
            background: result.success ? '#ecfdf5' : '#fef2f2',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
          }}>
            {!result.success ? (
              <div style={{ textAlign: 'center', color: '#b91c1c' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>❌</div>
                <h2>Invalid Ticket</h2>
                <p>{result.message}</p>
              </div>
            ) : (
              <div>
                <div style={{ textAlign: 'center', color: '#047857', marginBottom: '24px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
                  <h2 style={{ margin: 0 }}>Valid Ticket</h2>
                  <div style={{ fontWeight: '600', marginTop: '8px' }}>
                    Registration Status: <span style={{ textTransform: 'uppercase' }}>{result.data.status}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#ffffff', padding: '16px', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Student Name</div>
                    <div style={{ fontWeight: '500', color: '#1e293b' }}>{result.data.studentName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Student ID</div>
                    <div style={{ fontWeight: '500', color: '#1e293b' }}>{result.data.studentId}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Email</div>
                    <div style={{ fontWeight: '500', color: '#1e293b' }}>{result.data.email}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Contact</div>
                    <div style={{ fontWeight: '500', color: '#1e293b' }}>{result.data.contactNo}</div>
                  </div>
                  
                  <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e2e8f0', margin: '8px 0' }}></div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Event</div>
                    <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '1.1rem' }}>{result.data.eventName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Ticket Type</div>
                    <div style={{ fontWeight: '500', color: '#1e293b' }}>{result.data.ticketType || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Price Paid</div>
                    <div style={{ fontWeight: '500', color: '#1e293b' }}>LKR {result.data.ticketPrice?.toLocaleString()}</div>
                  </div>
                </div>

                {/* Issuing Details */}
                <div style={{ marginTop: '16px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Ticket Issuing Information</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.9rem' }}>
                    <div><strong>Date:</strong> {result.data.issuingDetails.dates}</div>
                    <div><strong>Time:</strong> {result.data.issuingDetails.times}</div>
                    <div style={{ gridColumn: '1 / -1' }}><strong>Venue:</strong> {result.data.issuingDetails.venues}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
