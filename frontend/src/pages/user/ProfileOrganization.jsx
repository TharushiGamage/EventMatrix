import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/userApi';
import { CheckCircle, Globe, Phone } from 'lucide-react';

const ProfileOrganization = () => {
  const { user, updateUser } = useAuth();
  const [orgForm, setOrgForm] = useState({ organizationName: '', bio: '', website: '', phone: '' });
  const [toast, setToast] = useState({ show: false, msg: '', ok: true });

  useEffect(() => {
    if (user) {
      setOrgForm({
        organizationName: user.organizationName || '',
        bio: user.bio || '',
        website: user.website || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const showToast = (msg, ok = true) => {
    setToast({ show: true, msg, ok });
    setTimeout(() => setToast({ show: false, msg: '', ok: true }), 3500);
  };

  const handleOrgProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await profileService.updateProfile(orgForm);
      updateUser(res.data);
      showToast('Organization profile updated');
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
          <h1>Public Profile</h1>
          <p>This information will be displayed publicly on your event pages.</p>
        </div>
      </div>

      {/* Organization Form */}
      <div className="profile-section">
        <h3 className="profile-section-title">Organization Details</h3>
        <p className="profile-section-desc">Manage how your organization appears to attendees.</p>
        <form onSubmit={handleOrgProfile} className="profile-form">
          <div className="pf-field">
            <label>Organization / Company Name</label>
            <input 
              type="text" 
              value={orgForm.organizationName} 
              onChange={e => setOrgForm({ ...orgForm, organizationName: e.target.value })} 
              placeholder="e.g. Campus Events Board"
            />
          </div>
          <div className="pf-field">
            <label>Organization Bio / Description</label>
            <textarea 
              value={orgForm.bio} 
              onChange={e => setOrgForm({ ...orgForm, bio: e.target.value })} 
              placeholder="Tell attendees about your organization..."
              rows="4"
            />
          </div>
          <div className="pf-field-row">
            <div className="pf-field">
              <label>Website URL <Globe size={14} style={{ display: 'inline', marginLeft: 4 }} /></label>
              <input 
                type="url" 
                value={orgForm.website} 
                onChange={e => setOrgForm({ ...orgForm, website: e.target.value })} 
                placeholder="https://example.com" 
              />
            </div>
            <div className="pf-field">
              <label>Contact Phone <Phone size={14} style={{ display: 'inline', marginLeft: 4 }} /></label>
              <input 
                type="tel" 
                value={orgForm.phone} 
                onChange={e => setOrgForm({ ...orgForm, phone: e.target.value })} 
                placeholder="+1 (555) 000-0000" 
              />
            </div>
          </div>
          <div className="pf-submit-row">
            <button type="submit" className="pf-submit-btn">Save Public Profile</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileOrganization;
