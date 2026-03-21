import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/userApi';
import { User, Shield, CheckCircle, LayoutDashboard, Mail, Hash, Award, ArrowRight, Calendar, Activity, Camera, Briefcase, Globe, Phone, Building } from 'lucide-react';
import './profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '', otpCode: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [orgForm, setOrgForm] = useState({ organizationName: '', bio: '', website: '', phone: '' });
  const [toast, setToast] = useState({ show: false, msg: '', ok: true });
  const [activeTab, setActiveTab] = useState('overview'); // Will be used for both roles

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || '', email: user.email || '' });
      if (user.role === 'Organizer') {
        setOrgForm({
          organizationName: user.organizationName || '',
          bio: user.bio || '',
          website: user.website || '',
          phone: user.phone || ''
        });
      }
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('profileImage', file);
    try {
      const res = await profileService.uploadProfileImage(formData);
      updateUser(res.data);
      showToast('Profile image updated successfully');
    } catch (err) {
      showToast(err.response?.data?.message || 'Image upload failed', false);
    }
  };

  const isOrganizer = user?.role === 'Organizer';

  return (
    <div className={`profile-container ${isOrganizer ? 'organizer-workspace' : ''}`}>
      <div className="profile-page">
        {toast.show && (
          <div className={`profile-toast ${toast.ok ? 'toast-ok' : 'toast-err'}`}>
            <CheckCircle size={18} /> {toast.msg}
          </div>
        )}

        {/* Premium Hero with Banner */}
        <div className="profile-hero-modern">
          <div className="profile-banner"></div>
          <div className="profile-header-content">
            <label className="profile-avatar-large" htmlFor="avatarUpload">
              {user?.profileImage && user.profileImage !== 'default.png' ? (
                <img src={`http://localhost:5000${user.profileImage}`} alt="Profile Avatar" />
              ) : (
                user?.name?.charAt(0).toUpperCase()
              )}
              <div className="avatar-overlay">
                <Camera size={24} />
                <span>Upload</span>
              </div>
              <input 
                type="file" 
                id="avatarUpload" 
                style={{ display: 'none' }} 
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
            <div className="profile-identity">
              <h1>{isOrganizer && user?.organizationName ? user.organizationName : user?.name}</h1>
              <p>{isOrganizer ? (user?.website || 'Creator Studio') : user?.email}</p>
              <div className="profile-badges">
                <span className="badge-role">{user?.role}</span>
                {!isOrganizer && <span className="badge-id">ID: {user?.studentId}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Modern Tabs */}
        <div className="profile-tabs-horizontal">
          <button 
            className={`prof-tab-hz ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={18} /> {isOrganizer ? 'Creator Dashboard' : 'Overview'}
          </button>

          {isOrganizer && (
            <button 
              className={`prof-tab-hz ${activeTab === 'org-profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('org-profile')}
            >
              <Building size={18} /> Public Profile
            </button>
          )}

          <button 
            className={`prof-tab-hz ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <User size={18} /> {isOrganizer ? 'Personal Settings' : 'General Info'}
          </button>
          
        </div>

        {/* Full-width Content Area */}
        <div className="profile-content-full">
          
          {/* ---------------- OVERVIEW TAB ---------------- */}
          {activeTab === 'overview' && (
            <div className="profile-card-modern fade-in">
              <div className="card-header-modern">
                <h2>{isOrganizer ? 'Creator Dashboard Overview' : 'Dashboard Overview'}</h2>
                <p>{isOrganizer ? 'High-level metrics and quick actions for your events.' : 'A high-level view of your account status and quick actions.'}</p>
              </div>
              
              {isOrganizer ? (
                /* Organizer Stats Grid */
                <div className="org-stats-grid">
                  <div className="org-stat-box">
                    <div className="org-stat-value">0</div>
                    <div className="org-stat-label">Active Events</div>
                    <div className="org-stat-trend positive">+0% from last month</div>
                  </div>
                  <div className="org-stat-box">
                    <div className="org-stat-value">0</div>
                    <div className="org-stat-label">Total Tickets Sold</div>
                    <div className="org-stat-trend">Standard Tier</div>
                  </div>
                  <div className="org-stat-box">
                    <div className="org-stat-value">$0.00</div>
                    <div className="org-stat-label">Total Revenue</div>
                    <div className="org-stat-trend">Manage Payouts</div>
                  </div>
                </div>
              ) : (
                /* Student/Admin Stats Grid */
                <div className="prof-stats-grid">
                  <div className="prof-stat-box">
                    <Mail size={22} className="prof-stat-icon" />
                    <div>
                      <div className="prof-stat-label">Registered Email</div>
                      <div className="prof-stat-value">{user?.email}</div>
                    </div>
                  </div>
                  <div className="prof-stat-box">
                    <Hash size={22} className="prof-stat-icon" />
                    <div>
                      <div className="prof-stat-label">Student ID</div>
                      <div className="prof-stat-value">{user?.studentId}</div>
                    </div>
                  </div>
                  <div className="prof-stat-box">
                    <Award size={22} className="prof-stat-icon" />
                    <div>
                      <div className="prof-stat-label">System Role</div>
                      <div className="prof-stat-value">{user?.role}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="prof-section-divider"></div>

              {/* Quick Actions */}
              <h3 className="prof-sub-heading">Quick Actions</h3>
              <div className="prof-actions-grid">
                
                {isOrganizer ? (
                  <>
                    <Link to="/create" className="prof-action-card highlight org-cta">
                      <div className="pac-icon"><Calendar size={24} /></div>
                      <div className="pac-text">
                        <h4>Create New Event</h4>
                        <p>Launch a new experience for your audience.</p>
                      </div>
                      <ArrowRight size={18} className="pac-arrow" />
                    </Link>
                    <Link to="/my-events" className="prof-action-card">
                      <div className="pac-icon"><Briefcase size={24} /></div>
                      <div className="pac-text">
                        <h4>Manage My Events</h4>
                        <p>View attendees, edit details, and track sales.</p>
                      </div>
                      <ArrowRight size={18} className="pac-arrow" />
                    </Link>
                  </>
                ) : (
                  <Link to="/" className="prof-action-card">
                    <div className="pac-icon"><Calendar size={24} /></div>
                    <div className="pac-text">
                      <h4>Browse Events</h4>
                      <p>View and register for upcoming events.</p>
                    </div>
                    <ArrowRight size={18} className="pac-arrow" />
                  </Link>
                )}

                {user?.role === 'Admin' && (
                  <Link to="/admin/users" className="prof-action-card highlight">
                    <div className="pac-icon"><Shield size={24} /></div>
                    <div className="pac-text">
                      <h4>Admin Panel</h4>
                      <p>Manage users and system settings.</p>
                    </div>
                    <ArrowRight size={18} className="pac-arrow" />
                  </Link>
                )}
              </div>

              <div className="prof-section-divider"></div>

              {/* Recent Activity Placeholder */}
              <h3 className="prof-sub-heading">Recent Activity</h3>
              <div className="prof-activity-list">
                <div className="prof-activity-item">
                  <div className="pa-dot"></div>
                  <div className="pa-content">
                    <span className="pa-text">Successfully logged into your account</span>
                    <span className="pa-time">Just now</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ---------------- ORG PROFILE TAB ---------------- */}
          {activeTab === 'org-profile' && isOrganizer && (
            <div className="profile-card-modern fade-in">
              <div className="card-header-modern">
                <h2>Public Organization Profile</h2>
                <p>This information will be displayed publicly on your event pages.</p>
              </div>
              <form onSubmit={handleOrgProfile} className="profile-form-modern">
                <div className="pf-group">
                  <label>Organization / Company Name</label>
                  <input 
                    type="text" 
                    value={orgForm.organizationName} 
                    onChange={e => setOrgForm({ ...orgForm, organizationName: e.target.value })} 
                    placeholder="e.g. Campus Events Board"
                  />
                </div>
                <div className="pf-group">
                  <label>Organization Bio / Description</label>
                  <textarea 
                    value={orgForm.bio} 
                    onChange={e => setOrgForm({ ...orgForm, bio: e.target.value })} 
                    placeholder="Tell attendees about your organization..."
                    rows="4"
                  />
                </div>
                <div className="pf-group-split">
                  <div className="pf-group">
                    <label>Website URL <Globe size={14} style={{display:'inline', marginLeft:4}} /></label>
                    <input 
                      type="url" 
                      value={orgForm.website} 
                      onChange={e => setOrgForm({ ...orgForm, website: e.target.value })} 
                      placeholder="https://example.com" 
                    />
                  </div>
                  <div className="pf-group">
                    <label>Contact Phone <Phone size={14} style={{display:'inline', marginLeft:4}} /></label>
                    <input 
                      type="tel" 
                      value={orgForm.phone} 
                      onChange={e => setOrgForm({ ...orgForm, phone: e.target.value })} 
                      placeholder="+1 (555) 000-0000" 
                    />
                  </div>
                </div>
                <div className="pf-action-row">
                  <button type="submit" className="pf-btn-modern">Save Public Profile</button>
                </div>
              </form>
            </div>
          )}

          {/* ---------------- GENERAL INFO TAB ---------------- */}
          {activeTab === 'general' && (
            <div className="profile-card-modern fade-in">
              <div className="card-header-modern">
                <h2>{isOrganizer ? 'Personal Settings' : 'Update Information'}</h2>
                <p>Manage your underlying personal account details.</p>
              </div>
              <form onSubmit={handleProfile} className="profile-form-modern">
                <div className="pf-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    value={profileForm.name} 
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} 
                    placeholder="e.g. Jane Doe"
                  />
                </div>
                <div className="pf-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    value={profileForm.email} 
                    onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} 
                    placeholder="you@university.edu"
                  />
                </div>
                <div className="pf-action-row">
                  <button type="submit" className="pf-btn-modern">Save Changes</button>
                </div>
              </form>

              <div className="prof-section-divider"></div>

              <div className="card-header-modern">
                <h2>Change Password</h2>
                <p>Ensure your account is using a long, random password to stay secure. A verification code will be sent to your mobile.</p>
              </div>
              <form onSubmit={otpSent ? handlePassword : handleSendOtp} className="profile-form-modern">
                <div className="pf-group">
                  <label>Current Password</label>
                  <input 
                    type="password" 
                    value={passForm.currentPassword} 
                    onChange={e => setPassForm({ ...passForm, currentPassword: e.target.value })} 
                    placeholder="••••••••" 
                    disabled={otpSent}
                  />
                </div>

                <div className="pf-group-split">
                  <div className="pf-group">
                    <label>New Password</label>
                    <input 
                      type="password" 
                      value={passForm.newPassword} 
                      onChange={e => setPassForm({ ...passForm, newPassword: e.target.value })} 
                      placeholder="••••••••" 
                      disabled={otpSent}
                    />
                  </div>
                  <div className="pf-group">
                    <label>Confirm Password</label>
                    <input 
                      type="password" 
                      value={passForm.confirmNewPassword} 
                      onChange={e => setPassForm({ ...passForm, confirmNewPassword: e.target.value })} 
                      placeholder="••••••••" 
                      disabled={otpSent}
                    />
                  </div>
                </div>

                {otpSent && (
                  <div className="pf-group fade-in" style={{ marginTop: '0.5rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <label style={{ color: '#2563eb', marginBottom: '0.5rem' }}>6-Digit Verification Code</label>
                    <input 
                      type="text" 
                      value={passForm.otpCode} 
                      onChange={e => setPassForm({ ...passForm, otpCode: e.target.value })} 
                      placeholder="e.g. 123456" 
                      style={{ fontSize: '1.25rem', letterSpacing: '0.2rem', textAlign: 'center', fontWeight: 'bold' }}
                      maxLength={6}
                    />
                  </div>
                )}

                <div className="pf-action-row">
                  {!otpSent ? (
                    <button type="submit" className="pf-btn-modern">Send Verification Code</button>
                  ) : (
                    <button type="submit" className="pf-btn-modern" style={{ background: '#16a34a' }}>Verify & Save Password</button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
