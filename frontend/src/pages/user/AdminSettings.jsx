import React, { useEffect, useState } from 'react';
import { profileService } from '../../services/userApi';
import { User, Mail, Phone, Building, Lock, CheckCircle } from 'lucide-react';
import './admin.css';
import './admin-settings.css';

const AdminSettings = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    organizationName: ''
  });

  const [formBackup, setFormBackup] = useState({
    name: '',
    email: '',
    phone: '',
    organizationName: ''
  });
  
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [otpState, setOtpState] = useState({
    requested: false,
    code: '',
    sending: false,
    message: ''
  });
  
  const [toast, setToast] = useState({ show: false, msg: '', ok: true });

  const showToast = (msg, ok = true) => {
    setToast({ show: true, msg, ok });
    setTimeout(() => setToast({ show: false, msg: '', ok: true }), 3000);
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await profileService.getProfile();
      const data = res.data || res;
      setProfile(data);
      const formData = {
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        organizationName: data.organizationName || ''
      };
      setForm(formData);
      setFormBackup(formData);
      setEditMode(false);
    } catch (err) {
      showToast('Failed loading profile', false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const enterEditMode = () => {
    setFormBackup(form);
    setEditMode(true);
  };

  const cancelEdit = () => {
    setForm(formBackup);
    setEditMode(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      showToast('Name and email are required', false);
      return;
    }
    try {
      setSaving(true);
      const res = await profileService.updateProfile(form);
      showToast('Profile updated successfully');
      setProfile(res.data || res);
      setFormBackup(form);
      setEditMode(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', false);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      showToast('All password fields are required', false);
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast('New passwords do not match', false);
      return;
    }
    if (passwords.newPassword.length < 6) {
      showToast('New password must be at least 6 characters', false);
      return;
    }
    if (!otpState.code) {
      showToast('Please enter the verification code', false);
      return;
    }
    try {
      setPwdSaving(true);
      await profileService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
        otpCode: otpState.code
      });
      showToast('Password changed successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setOtpState({ requested: false, code: '', sending: false, message: '' });
    } catch (err) {
      showToast(err.response?.data?.message || 'Password change failed', false);
    } finally {
      setPwdSaving(false);
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!passwords.currentPassword) {
      showToast('Please enter your current password', false);
      return;
    }
    try {
      setOtpState(prev => ({ ...prev, sending: true }));
      const res = await profileService.sendPasswordOtp({ currentPassword: passwords.currentPassword });
      setOtpState(prev => ({ 
        ...prev, 
        requested: true, 
        sending: false, 
        message: res.message || 'Verification code sent successfully'
      }));
      showToast(res.message || 'Verification code sent to your phone', true);
    } catch (err) {
      setOtpState(prev => ({ ...prev, sending: false }));
      showToast(err.response?.data?.message || 'Failed to send verification code', false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <h1>System Settings</h1>
        </div>
        <div className="admin-empty">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {toast.show && <div className={`admin-toast ${toast.ok ? 'toast-ok' : 'toast-err'}`}>{toast.msg}</div>}

      <div className="admin-header">
        <h1>System Settings</h1>
        <p>Manage your admin profile and account security settings.</p>
      </div>

      {/* Profile Header Card */}
      <div className="settings-header-card">
        <div className="settings-avatar-section">
          <div className="settings-avatar">
            {profile?.profileImage && profile.profileImage !== 'default.png' ? (
              <img src={`http://localhost:5000${profile.profileImage}`} alt="Admin" />
            ) : (
              <div className="avatar-initial">{profile?.name?.charAt(0)?.toUpperCase() || 'A'}</div>
            )}
          </div>
          <div className="settings-user-info">
            <h2>{profile?.name || 'Admin'}</h2>
            <p className="settings-role">System Administrator</p>
            <p className="settings-email">{profile?.email || 'admin@eventmatrix.com'}</p>
            {profile?.status && (
              <div className="settings-status">
                <CheckCircle size={16} className="status-icon" />
                <span className={`status-badge ${profile.status.toLowerCase()}`}>{profile.status}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="settings-tabs">
        <button
          className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <User size={18} />
          Personal Information
        </button>
        <button
          className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <Lock size={18} />
          Security
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="settings-content">
          {!editMode ? (
            // View Mode
            <div className="view-mode-section">
              <div className="form-section">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
                  <h3>Personal Details</h3>
                  <button
                    type="button"
                    className="btn-edit"
                    onClick={enterEditMode}
                  >
                    Edit Information
                  </button>
                </div>

                <div className="view-grid">
                  <div className="view-item">
                    <label>Full Name</label>
                    <div className="view-value">
                      <User size={18} className="view-icon" />
                      <span>{form.name || '-'}</span>
                    </div>
                  </div>
                  <div className="view-item">
                    <label>Email Address</label>
                    <div className="view-value">
                      <Mail size={18} className="view-icon" />
                      <span>{form.email || '-'}</span>
                    </div>
                  </div>
                  <div className="view-item">
                    <label>Phone Number</label>
                    <div className="view-value">
                      <Phone size={18} className="view-icon" />
                      <span>{form.phone || 'Not provided'}</span>
                    </div>
                  </div>
                  <div className="view-item">
                    <label>Organization Name</label>
                    <div className="view-value">
                      <Building size={18} className="view-icon" />
                      <span>{form.organizationName || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Edit Mode
            <form className="settings-form-grid" onSubmit={handleSave}>
              <div className="form-section">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
                  <h3>Edit Personal Details</h3>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <div className="input-wrapper">
                      <User size={18} className="input-icon" />
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={form.name}
                        onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <div className="input-wrapper">
                      <Mail size={18} className="input-icon" />
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={form.email}
                        onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number</label>
                    <div className="input-wrapper">
                      <Phone size={18} className="input-icon" />
                      <input
                        type="tel"
                        placeholder="Enter your phone number"
                        value={form.phone}
                        onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Organization Name</label>
                    <div className="input-wrapper">
                      <Building size={18} className="input-icon" />
                      <input
                        type="text"
                        placeholder="Organization name (optional)"
                        value={form.organizationName}
                        onChange={e => setForm(prev => ({ ...prev, organizationName: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-actions edit-mode">
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={cancelEdit}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="settings-content">
          <form className="settings-form-grid" onSubmit={otpState.requested ? handleChangePassword : handleRequestOtp}>
            <div className="form-section">
              <h3>Change Password</h3>
              <p className="section-description">
                {otpState.requested 
                  ? 'Enter the verification code sent to your phone and your new password.'
                  : 'Verify your identity with your current password to request a verification code.'}
              </p>

              {!otpState.requested ? (
                // Step 1: Request OTP
                <div className="form-column">
                  <div className="form-group">
                    <label>Current Password</label>
                    <div className="input-wrapper">
                      <Lock size={18} className="input-icon" />
                      <input
                        type="password"
                        placeholder="Enter your current password"
                        value={passwords.currentPassword}
                        onChange={e => setPasswords(prev => ({ ...prev, currentPassword: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={otpState.sending}
                    >
                      {otpState.sending ? 'Sending...' : 'Request Verification Code'}
                    </button>
                    <p className="form-hint">A verification code will be sent to the phone number associated with your account.</p>
                  </div>
                </div>
              ) : (
                // Step 2: Enter OTP and New Password
                <div className="form-column">
                  <div className="otp-message-box">
                    <CheckCircle size={20} />
                    <p>{otpState.message}</p>
                  </div>

                  <div className="form-group">
                    <label>Verification Code</label>
                    <div className="input-wrapper">
                      <Lock size={18} className="input-icon" />
                      <input
                        type="text"
                        placeholder="Enter 6-digit verification code"
                        maxLength="6"
                        value={otpState.code}
                        onChange={e => setOtpState(prev => ({ ...prev, code: e.target.value }))}
                      />
                    </div>
                    <p className="form-hint">Check your phone for the verification code</p>
                  </div>

                  <div className="form-group">
                    <label>New Password</label>
                    <div className="input-wrapper">
                      <Lock size={18} className="input-icon" />
                      <input
                        type="password"
                        placeholder="Enter a new password"
                        value={passwords.newPassword}
                        onChange={e => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
                      />
                    </div>
                    <p className="form-hint">Minimum 6 characters</p>
                  </div>

                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <div className="input-wrapper">
                      <Lock size={18} className="input-icon" />
                      <input
                        type="password"
                        placeholder="Confirm your new password"
                        value={passwords.confirmPassword}
                        onChange={e => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="form-actions edit-mode">
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={pwdSaving}
                    >
                      {pwdSaving ? 'Updating...' : 'Change Password'}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        setOtpState({ requested: false, code: '', sending: false, message: '' });
                        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      }}
                      disabled={pwdSaving}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="form-section security-info">
              <h3>Security Information</h3>
              <div className="info-item">
                <span className="info-label">Account Status</span>
                <span className={`info-value status-${profile?.status?.toLowerCase() || 'active'}`}>
                  {profile?.status || 'Active'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Role</span>
                <span className="info-value">{profile?.role || 'Admin'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Last Updated</span>
                <span className="info-value">
                  {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
