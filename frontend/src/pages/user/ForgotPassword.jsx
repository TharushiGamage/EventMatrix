import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/userApi';
import { CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [verified, setVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', ok: true });

  const showToast = (msg, ok = true) => {
    setToast({ show: true, msg, ok });
    setTimeout(() => setToast({ show: false, msg: '', ok: true }), 3500);
  };

  const handleSendCode = async () => {
    if (!identifier) return showToast('Enter your email or phone', false);
    setSubmitting(true);
    try {
      const res = await authService.forgotPassword(identifier);
      setCodeSent(true);
      showToast(res.message || 'Verification code sent');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send code', false);
    } finally { setSubmitting(false); }
  };

  const handleVerify = async () => {
    if (!identifier || !code) return showToast('Enter identifier and code', false);
    setSubmitting(true);
    try {
      await authService.verifyResetCode({ identifier, code });
      setVerified(true);
      showToast('Code verified');
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid code', false);
    } finally { setSubmitting(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!verified) return showToast('Verify code first', false);
    if (!newPassword || !confirmPassword) return showToast('Enter passwords', false);
    if (newPassword !== confirmPassword) return showToast('Passwords do not match', false);
    setSubmitting(true);
    try {
      await authService.resetPassword({ identifier, code, newPassword, confirmPassword });
      showToast('Password reset successfully');
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      showToast(err.response?.data?.message || 'Reset failed', false);
    } finally { setSubmitting(false); }
  };

  return (
    <div className="pf-fade-in" style={{ maxWidth: 680, margin: '0 auto' }}>
      {toast.show && (
        <div className={`profile-toast ${toast.ok ? 'ptoast-ok' : 'ptoast-err'}`}>
          <CheckCircle size={18} /> {toast.msg}
        </div>
      )}

      <div className="profile-page-header" style={{ padding: '1.25rem 0' }}>
        <div>
          <h1 style={{ marginBottom: 6 }}>Forgot Password</h1>
          <p style={{ margin: 0, color: '#64748b' }}>Reset your password using your email or phone number.</p>
        </div>
      </div>

      <form className="profile-form" onSubmit={handleReset}>
        <div className="pf-field">
          <label>Email or Phone Number</label>
          <div className="pw-inline-row">
            <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="you@example.com or 0771234567" />
            <button type="button" className="pw-secondary-btn" onClick={handleSendCode} disabled={submitting}>{submitting ? 'Sending...' : 'Send Code'}</button>
          </div>
        </div>

        <div className="pf-field">
          <label>6-Digit Verification Code</label>
          <div className="pw-inline-row">
            <input type="text" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter verification code" />
            <button type="button" className="pw-secondary-btn" onClick={handleVerify} disabled={submitting || !codeSent}>Verify</button>
          </div>
        </div>

        <div className="pf-field">
          <label>New Password</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" disabled={!verified} />
        </div>

        <div className="pf-field">
          <label>Confirm Password</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" disabled={!verified} />
        </div>

        <div className="pf-submit-row">
          <button type="submit" className="pf-submit-btn success" disabled={submitting || !verified}>{submitting ? 'Resetting...' : 'Reset Password'}</button>
        </div>
      </form>
    </div>
  );
}
