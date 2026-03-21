import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/userApi';
import { CheckCircle, User } from 'lucide-react';

const ProfileGeneral = () => {
  const { user, updateUser } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: '', email: '', studentId: '', phone: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', ok: true });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        studentId: user.studentId || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const showToast = (msg, ok = true, inline = false, center = false) => {
    setToast({ show: true, msg, ok, inline, center });
    if (!center) {
      setTimeout(() => setToast({ show: false, msg: '', ok: true, inline: false, center: false }), 3500);
    }
  };

  const dismissToast = () => {
    setToast({ show: false, msg: '', ok: true, inline: false, center: false });
  };

  const handleProfile = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const res = await profileService.updateProfile(profileForm);
      updateUser(res.data);
      showToast('Profile updated successfully', true, false, true);
      setIsEditing(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', false);
    }
  };

  return (
    <div className="pf-fade-in">
      {toast.show && !toast.inline && !toast.center && (
        <div className={`profile-toast ${toast.ok ? 'ptoast-ok' : 'ptoast-err'}`}>
          <CheckCircle size={18} /> {toast.msg}
        </div>
      )}

      {toast.show && toast.center && (
        <div className={`profile-center-toast ${toast.ok ? 'ptoast-ok' : 'ptoast-err'}`}>
          <div className="profile-center-toast-content">
            <CheckCircle size={24} />
            <span style={{ marginLeft: 12, fontSize: '1.05rem', fontWeight: 600 }}>{toast.msg}</span>
          </div>
          <button type="button" className="profile-center-toast-btn" onClick={dismissToast}>OK</button>
        </div>
      )}

      {/* Page Header */}
      <div className="profile-page-header">
        <div>
          <h1>General Settings</h1>
          <p>Manage your personal account details.</p>
        </div>
      </div>

      {/* Update Profile Section */}
      <div className="profile-section-wrapper">
        {toast.show && toast.inline && (
          <div className={`profile-inline-toast ${toast.ok ? 'ptoast-ok' : 'ptoast-err'}`}>
            <CheckCircle size={16} />
            <span style={{ marginLeft: 8 }}>{toast.msg}</span>
          </div>
        )}
        <button
          type="button"
          className="section-edit-btn-outside pf-submit-btn"
          onClick={() => setIsEditing(true)}
          aria-label="Enable edit profile"
          disabled={isEditing}
        >
          {isEditing ? 'Editing' : 'Edit'}
        </button>
        <div className="profile-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
              <strong style={{ fontSize: '1rem' }}>Personal Information</strong>
            </div>
          </div>
        <form onSubmit={handleProfile} className="profile-form">
          <div className="pf-field">
            <label>Full Name</label>
            <input 
              className="input-with-edit"
              type="text" 
              readOnly={!isEditing}
              value={profileForm.name} 
              onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} 
              placeholder="e.g. Jane Doe"
            />
          </div>
          <div className="pf-field">
            <label>Email Address</label>
            <input
              className="input-with-edit"
              type="email"
              readOnly={!isEditing}
              value={profileForm.email}
              onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
              placeholder="you@university.edu"
            />
          </div>
          <div className="pf-field">
            <label>Student ID</label>
            <input
              className="input-with-edit"
              type="text"
              readOnly={!isEditing}
              value={profileForm.studentId}
              onChange={e => setProfileForm({ ...profileForm, studentId: e.target.value })}
              placeholder="e.g. U12345678"
            />
          </div>
          <div className="pf-field">
            <label>Mobile Number</label>
            <input
              className="input-with-edit"
              type="tel"
              readOnly={!isEditing}
              value={profileForm.phone}
              onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <div className="pf-submit-row">
            <button type="submit" className="pf-submit-btn" disabled={!isEditing}>Save Changes</button>
          </div>
        </form>
      </div>
    </div>
    </div>
  );
};

export default ProfileGeneral;
