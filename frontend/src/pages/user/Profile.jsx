import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/userApi';
import { User, Shield, CheckCircle, LayoutDashboard, Mail, Hash, Award, ArrowRight, Calendar, Activity, Camera, Briefcase, Globe, Phone, Building, Lock } from 'lucide-react';
import './profile.css';
import './admin-settings.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '', otpCode: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [orgForm, setOrgForm] = useState({ organizationName: '', bio: '', website: '', phone: '' });
  const [toast, setToast] = useState({ show: false, msg: '', ok: true });
  const [activeTab, setActiveTab] = useState('overview'); // Will be used for both roles
  const [editProfileMode, setEditProfileMode] = useState(false);
  const [profileFormBackup, setProfileFormBackup] = useState({ name: '', email: '' });

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
      setProfileFormBackup(profileForm);
      setEditProfileMode(false);
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
 
  const [localTime, setLocalTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setLocalTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeString = localTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateString = localTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
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
              <div className="profile-local-time">
                <div className="local-time">{timeString}</div>
                <div className="local-date">{dateString}</div>
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
              <div className="settings-content">
                {!editProfileMode ? (
                  // View Mode — matches Admin Personal Information
                  <div className="view-mode-section">
                    <div className="form-section">
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
                        <h3>{isOrganizer ? 'Personal Details' : 'Personal Details'}</h3>
                        <button
                          type="button"
                          className="btn-edit"
                          onClick={() => { setProfileFormBackup(profileForm); setEditProfileMode(true); }}
                        >
                          Edit Information
                        </button>
                      </div>

                          {/* Profile image + edit control inside General Settings */}
                          <div className="profile-image-edit">
                            <label className="profile-image-circle" htmlFor="profileImageUpload">
                              {user?.profileImage && user.profileImage !== 'default.png' ? (
                                <img src={`http://localhost:5000${user.profileImage}`} alt="Profile" />
                              ) : (
                                user?.name?.charAt(0).toUpperCase()
                              )}
                              <div className="profile-image-overlay">
                                <Camera size={16} />
                              </div>
                            </label>
                            <input
                              id="profileImageUpload"
                              type="file"
                              style={{ display: 'none' }}
                              accept="image/*"
                              onChange={handleImageUpload}
                            />
                            <div className="profile-image-desc">
                              <div className="pid-title">Profile Image</div>
                              <div className="pid-note">Click the icon to change your profile picture</div>
                            </div>
                          </div>

                      <div className="view-grid">
                        <div className="view-item">
                          <label>Full Name</label>
                          <div className="view-value">
                            <User size={18} className="view-icon" />
                            <span>{profileForm.name || '-'}</span>
                          </div>
                        </div>
                        <div className="view-item">
                          <label>Email Address</label>
                          <div className="view-value">
                            <Mail size={18} className="view-icon" />
                            <span>{profileForm.email || '-'}</span>
                          </div>
                        </div>
                        <div className="view-item">
                          <label>Phone Number</label>
                          <div className="view-value">
                            <Phone size={18} className="view-icon" />
                            <span>{user?.phone || 'Not provided'}</span>
                          </div>
                        </div>
                        {isOrganizer && (
                          <div className="view-item">
                            <label>Organization Name</label>
                            <div className="view-value">
                              <Building size={18} className="view-icon" />
                              <span>{user?.organizationName || 'Not provided'}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Edit Mode — matches Admin Edit Personal Details
                  <form className="settings-form-grid" onSubmit={handleProfile}>
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
                              value={profileForm.name}
                              onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
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
                              value={profileForm.email}
                              onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="form-actions edit-mode">
                        <button
                          type="submit"
                          className="btn-primary"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => { setProfileForm(profileFormBackup); setEditProfileMode(false); }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>

              <div className="prof-section-divider"></div>

              <div className="settings-content">
                <div className="form-section">
                  <h3>Change Password</h3>
                  <p className="section-description">
                    {otpSent
                      ? 'Enter the verification code sent to your phone and your new password.'
                      : 'Verify your identity with your current password to request a verification code.'}
                  </p>
                  <form onSubmit={otpSent ? handlePassword : handleSendOtp}>
                    {!otpSent ? (
                      <div className="form-column">
                        <div className="form-group">
                          <label>Current Password</label>
                          <div className="input-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input
                              type="password"
                              placeholder="Enter your current password"
                              value={passForm.currentPassword}
                              onChange={e => setPassForm({ ...passForm, currentPassword: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="form-actions">
                          <button type="submit" className="btn-primary">
                            Request Verification Code
                          </button>
                          <p className="form-hint">A verification code will be sent to the phone number associated with your account.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="form-column">
                        <div className="otp-message-box">
                          <CheckCircle size={20} />
                          <p>Verification code sent successfully</p>
                        </div>

                        <div className="form-group">
                          <label>Verification Code</label>
                          <div className="input-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input
                              type="text"
                              placeholder="Enter 6-digit verification code"
                              maxLength="6"
                              value={passForm.otpCode}
                              onChange={e => setPassForm({ ...passForm, otpCode: e.target.value })}
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
                              value={passForm.newPassword}
                              onChange={e => setPassForm({ ...passForm, newPassword: e.target.value })}
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
                              value={passForm.confirmNewPassword}
                              onChange={e => setPassForm({ ...passForm, confirmNewPassword: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="form-actions edit-mode">
                          <button type="submit" className="btn-primary">
                            Change Password
                          </button>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => {
                              setOtpSent(false);
                              setPassForm({ currentPassword: '', newPassword: '', confirmNewPassword: '', otpCode: '' });
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
