import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/userApi';
import { CheckCircle, User } from 'lucide-react';

const ProfileGeneral = () => {
  const { user, updateUser } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: '', email: '', studentId: '', phone: '' });
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
          <h1>General Settings</h1>
          <p>Manage your personal account details.</p>
        </div>
      </div>

      {/* Update Profile Section */}
      <div className="profile-section">
        <h3 className="profile-section-title">
          <User size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
          Update Profile
        </h3>
        <p className="profile-section-desc">Update your personal information below.</p>
        <form onSubmit={handleProfile} className="profile-form">
          <div className="pf-field">
            <label>Full Name</label>
            <input 
              type="text" 
              value={profileForm.name} 
              onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} 
              placeholder="e.g. Jane Doe"
            />
          </div>
          <div className="pf-field">
            <label>Email Address</label>
            <input 
              type="email" 
              value={profileForm.email} 
              onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} 
              placeholder="you@university.edu"
            />
          </div>
          <div className="pf-field">
            <label>Student ID</label>
            <input 
              type="text" 
              value={profileForm.studentId} 
              onChange={e => setProfileForm({ ...profileForm, studentId: e.target.value })} 
              placeholder="e.g. U12345678"
            />
          </div>
          <div className="pf-field">
            <label>Mobile Number</label>
            <input 
              type="tel" 
              value={profileForm.phone} 
              onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} 
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <div className="pf-submit-row">
            <button type="submit" className="pf-submit-btn">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileGeneral;
