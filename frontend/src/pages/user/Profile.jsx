import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/userApi';
import './profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [toast, setToast] = useState({ show: false, msg: '', ok: true });

  useEffect(() => {
    if (user) setProfileForm({ name: user.name || '', email: user.email || '' });
  }, [user]);

  const showToast = (msg, ok = true) => {
    setToast({ show: true, msg, ok });
    setTimeout(() => setToast({ show: false, msg: '', ok: true }), 3500);
  };

  const handleProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await profileService.updateProfile(profileForm);
      updateUser(res.data);
      showToast('Profile updated successfully');
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmNewPassword) { showToast('Passwords do not match', false); return; }
    if (passForm.newPassword.length < 6) { showToast('New password must be at least 6 characters', false); return; }
    try {
      await profileService.changePassword({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      showToast('Password changed successfully');
      setPassForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      showToast(err.response?.data?.message || 'Password change failed', false);
    }
  };

  return (
    <div className="profile-page">
      {toast.show && <div className={`profile-toast ${toast.ok ? 'toast-ok' : 'toast-err'}`}>{toast.msg}</div>}

      <div className="profile-hero">
        <div className="profile-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
        <div>
          <h1>{user?.name}</h1>
          <p>{user?.email}</p>
          <span className="profile-role-tag">{user?.role}</span>
          <span className="profile-id-tag">ID: {user?.studentId}</span>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-card">
          <h2>Update Information</h2>
          <form onSubmit={handleProfile} className="profile-form">
            <div className="pf-field">
              <label>Full Name</label>
              <input type="text" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} />
            </div>
            <div className="pf-field">
              <label>Email Address</label>
              <input type="email" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} />
            </div>
            <button type="submit" className="pf-btn">Update Profile</button>
          </form>
        </div>

        <div className="profile-card">
          <h2>Change Password</h2>
          <form onSubmit={handlePassword} className="profile-form">
            <div className="pf-field">
              <label>Current Password</label>
              <input type="password" value={passForm.currentPassword} onChange={e => setPassForm({ ...passForm, currentPassword: e.target.value })} placeholder="••••••••" />
            </div>
            <div className="pf-field">
              <label>New Password</label>
              <input type="password" value={passForm.newPassword} onChange={e => setPassForm({ ...passForm, newPassword: e.target.value })} placeholder="••••••••" />
            </div>
            <div className="pf-field">
              <label>Confirm New Password</label>
              <input type="password" value={passForm.confirmNewPassword} onChange={e => setPassForm({ ...passForm, confirmNewPassword: e.target.value })} placeholder="••••••••" />
            </div>
            <button type="submit" className="pf-btn">Change Password</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
