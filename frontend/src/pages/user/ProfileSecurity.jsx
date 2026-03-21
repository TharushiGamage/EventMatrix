import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/userApi';
import { CheckCircle, ShieldCheck } from 'lucide-react';

const ProfileSecurity = () => {
  const { user } = useAuth();
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '', otpCode: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', ok: true });

  const showToast = (msg, ok = true) => {
    setToast({ show: true, msg, ok });
    setTimeout(() => setToast({ show: false, msg: '', ok: true }), 3500);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmNewPassword) { showToast('Passwords do not match', false); return; }
    if (passForm.newPassword.length < 6) { showToast('New password must be at least 6 characters', false); return; }
    
    try {
      await profileService.sendPasswordOtp({ currentPassword: passForm.currentPassword });
      setOtpSent(true);
      showToast('Verification code sent! Please check your mobile.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send verification code', false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    try {
      await profileService.changePassword({ 
        currentPassword: passForm.currentPassword, 
        newPassword: passForm.newPassword,
        otpCode: passForm.otpCode
      });
      showToast('Password changed successfully');
      setPassForm({ currentPassword: '', newPassword: '', confirmNewPassword: '', otpCode: '' });
      setOtpSent(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Password change failed', false);
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
        <p className="profile-section-desc">Ensure your account is using a strong password. A verification code will be sent to your mobile.</p>
        <form onSubmit={otpSent ? handlePassword : handleSendOtp} className="profile-form">
          <div className="pf-field">
            <label>Current Password</label>
            <input 
              type="password" 
              value={passForm.currentPassword} 
              onChange={e => setPassForm({ ...passForm, currentPassword: e.target.value })} 
              placeholder="••••••••" 
              disabled={otpSent}
            />
          </div>

          <div className="pf-field">
            <label>New Password</label>
            <input 
              type="password" 
              value={passForm.newPassword} 
              onChange={e => setPassForm({ ...passForm, newPassword: e.target.value })} 
              placeholder="••••••••" 
              disabled={otpSent}
            />
          </div>
          <div className="pf-field">
            <label>Confirm Password</label>
            <input 
              type="password" 
              value={passForm.confirmNewPassword} 
              onChange={e => setPassForm({ ...passForm, confirmNewPassword: e.target.value })} 
              placeholder="••••••••" 
              disabled={otpSent}
            />
          </div>

          {otpSent && (
            <div className="pf-otp-box pf-fade-in">
              <div className="pf-field">
                <label style={{ color: '#2563eb' }}>6-Digit Verification Code</label>
                <input 
                  type="text" 
                  className="pf-otp-input"
                  value={passForm.otpCode} 
                  onChange={e => setPassForm({ ...passForm, otpCode: e.target.value })} 
                  placeholder="e.g. 123456" 
                  maxLength={6}
                />
              </div>
            </div>
          )}

          <div className="pf-submit-row">
            {!otpSent ? (
              <button type="submit" className="pf-submit-btn">Send Verification Code</button>
            ) : (
              <button type="submit" className="pf-submit-btn success">Verify & Save Password</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSecurity;
