import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService, profileService } from '../../services/userApi';
import { CheckCircle, ShieldCheck, KeyRound } from 'lucide-react';

const ProfileSecurity = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('current');
  const [submitting, setSubmitting] = useState(false);
  const [currentFlow, setCurrentFlow] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [forgotFlow, setForgotFlow] = useState({
    identifier: user?.email || user?.phone || '',
    code: '',
    verified: false,
    newPassword: '',
    confirmPassword: '',
    codeSent: false,
  });
  const [toast, setToast] = useState({ show: false, msg: '', ok: true });

  const showToast = (msg, ok = true) => {
    setToast({ show: true, msg, ok });
    setTimeout(() => setToast({ show: false, msg: '', ok: true }), 3500);
  };

  const handleCurrentPasswordReset = async (e) => {
    e.preventDefault();

    if (!currentFlow.currentPassword || !currentFlow.newPassword || !currentFlow.confirmPassword) {
      showToast('Please complete all fields', false);
      return;
    }

    if (currentFlow.newPassword !== currentFlow.confirmPassword) {
      showToast('Passwords do not match', false);
      return;
    }

    setSubmitting(true);
    try {
      await profileService.changePasswordDirect(currentFlow);
      setCurrentFlow({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password updated successfully');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update password', false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendForgotCode = async () => {
    if (!forgotFlow.identifier) {
      showToast('Please enter your email or phone number', false);
      return;
    }

    setSubmitting(true);
    try {
      const response = await authService.forgotPassword(forgotFlow.identifier);
      setForgotFlow((prev) => ({ ...prev, codeSent: true, verified: false, code: '' }));
      showToast(response.message || 'Verification code sent successfully');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send verification code', false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyForgotCode = async () => {
    if (!forgotFlow.identifier || !forgotFlow.code) {
      showToast('Please enter email/phone and the verification code', false);
      return;
    }

    setSubmitting(true);
    try {
      await authService.verifyResetCode({ identifier: forgotFlow.identifier, code: forgotFlow.code });
      setForgotFlow((prev) => ({ ...prev, verified: true }));
      showToast('Verification code is valid');
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid verification code', false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPasswordReset = async (e) => {
    e.preventDefault();

    if (!forgotFlow.verified) {
      showToast('Please verify the code first', false);
      return;
    }

    if (!forgotFlow.newPassword || !forgotFlow.confirmPassword) {
      showToast('Please enter and confirm your new password', false);
      return;
    }

    if (forgotFlow.newPassword !== forgotFlow.confirmPassword) {
      showToast('Passwords do not match', false);
      return;
    }

    setSubmitting(true);
    try {
      await authService.resetPassword({
        identifier: forgotFlow.identifier,
        code: forgotFlow.code,
        newPassword: forgotFlow.newPassword,
        confirmPassword: forgotFlow.confirmPassword,
      });

      setForgotFlow((prev) => ({
        ...prev,
        code: '',
        verified: false,
        codeSent: false,
        newPassword: '',
        confirmPassword: '',
      }));
      showToast('Password reset successfully');
    } catch (err) {
      showToast(err.response?.data?.message || 'Password reset failed', false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pf-fade-in">
      {toast.show && (
        <div className={`profile-toast ${toast.ok ? 'ptoast-ok' : 'ptoast-err'}`}>
          <CheckCircle size={18} /> {toast.msg}
        </div>
      )}

      {/* Page Header */}
      <div className="profile-page-header">
        <div>
          <h1>Personal Security</h1>
          <p>Keep your account secure with a strong password and verification.</p>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="profile-section">
        <h3 className="profile-section-title">
          <ShieldCheck size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
          Change Password
        </h3>
        <p className="profile-section-desc">Reset your password either with your current password or with the forgot password flow.</p>

        <div className="pw-tab-row" style={{ maxWidth: 480, marginBottom: '1rem' }}>
          <button
            type="button"
            className={`pw-tab ${activeTab === 'current' ? 'active' : ''}`}
            onClick={() => setActiveTab('current')}
          >
            Use Current Password
          </button>
          <button
            type="button"
            className={`pw-tab ${activeTab === 'forgot' ? 'active' : ''}`}
            onClick={() => setActiveTab('forgot')}
          >
            Forgot Password
          </button>
        </div>

        {activeTab === 'current' ? (
          <form onSubmit={handleCurrentPasswordReset} className="profile-form">
            <div className="pf-field">
              <label>Current Password</label>
              <input
                type="password"
                value={currentFlow.currentPassword}
                onChange={(e) => setCurrentFlow((prev) => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Enter current password"
              />
            </div>

            <div className="pf-field">
              <label>New Password</label>
              <input
                type="password"
                value={currentFlow.newPassword}
                onChange={(e) => setCurrentFlow((prev) => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Enter new password"
              />
            </div>

            <div className="pf-field">
              <label>Confirm Password</label>
              <input
                type="password"
                value={currentFlow.confirmPassword}
                onChange={(e) => setCurrentFlow((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Re-enter new password"
              />
            </div>

            <div className="pf-submit-row">
              <button type="submit" className="pf-submit-btn success" disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleForgotPasswordReset} className="profile-form">
            <div className="pf-field">
              <label>Email or Phone Number</label>
              <div className="pw-inline-row">
                <input
                  type="text"
                  value={forgotFlow.identifier}
                  onChange={(e) => setForgotFlow((prev) => ({ ...prev, identifier: e.target.value }))}
                  placeholder="you@example.com or 0771234567"
                />
                <button type="button" className="pw-secondary-btn" onClick={handleSendForgotCode} disabled={submitting}>
                  {submitting ? 'Sending...' : 'Send Code'}
                </button>
              </div>
            </div>

            <div className="pf-field">
              <label>6-Digit Verification Code</label>
              <div className="pw-inline-row">
                <input
                  type="text"
                  maxLength={6}
                  value={forgotFlow.code}
                  onChange={(e) => setForgotFlow((prev) => ({ ...prev, code: e.target.value }))}
                  placeholder="Enter verification code"
                />
                <button
                  type="button"
                  className="pw-secondary-btn"
                  onClick={handleVerifyForgotCode}
                  disabled={submitting || !forgotFlow.codeSent}
                >
                  Verify
                </button>
              </div>
            </div>

            <div className="pf-field">
              <label>New Password</label>
              <input
                type="password"
                value={forgotFlow.newPassword}
                onChange={(e) => setForgotFlow((prev) => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Enter new password"
                disabled={!forgotFlow.verified}
              />
            </div>

            <div className="pf-field">
              <label>Confirm Password</label>
              <input
                type="password"
                value={forgotFlow.confirmPassword}
                onChange={(e) => setForgotFlow((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Re-enter new password"
                disabled={!forgotFlow.verified}
              />
            </div>

            <div className="pf-submit-row">
              <button type="submit" className="pf-submit-btn success" disabled={submitting || !forgotFlow.verified}>
                {submitting ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}

        <div className="profile-section-desc" style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <KeyRound size={16} />
          You can now reset password directly from this profile page.
        </div>
      </div>
    </div>
  );
};

export default ProfileSecurity;
