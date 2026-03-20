import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/userApi';
import { Search, Ban, CheckCircle, Unlock, ChevronDown, ChevronUp, Calendar, ExternalLink, Activity } from 'lucide-react';
import './admin.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, msg: '', ok: true });
  
  const [activeTab, setActiveTab] = useState('All');
  const [expandedUser, setExpandedUser] = useState(null);
  const [orgEvents, setOrgEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const tabs = ['All', 'Student', 'Organizer', 'Admin'];

  const showToast = (msg, ok = true) => {
    setToast({ show: true, msg, ok });
    setTimeout(() => setToast({ show: false, msg: '', ok: true }), 3000);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers(search);
      setUsers(res.data);
    } catch (err) {
      showToast('Failed to load users', false);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const t = setTimeout(fetchUsers, 400);
    return () => clearTimeout(t);
  }, [search]);

  const isLocked = (u) => u.lockUntil && new Date(u.lockUntil) > new Date();

  const handleRole = async (userId, role) => {
    try {
      await adminService.updateRole(userId, role);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role } : u));
      showToast(`Role updated to ${role}`);
    } catch (err) { showToast(err.response?.data?.message || 'Error', false); }
  };

  const handleStatus = async (userId, currentStatus) => {
    const status = currentStatus === 'Active' ? 'Suspended' : 'Active';
    try {
      await adminService.updateStatus(userId, status);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, status } : u));
      showToast(`User ${status.toLowerCase()}`);
    } catch (err) { showToast(err.response?.data?.message || 'Error', false); }
  };

  const handleUnlock = async (userId) => {
    try {
      await adminService.unlockUser(userId);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, lockUntil: null, loginAttempts: 0 } : u));
      showToast('Account unlocked');
    } catch (err) { showToast(err.response?.data?.message || 'Error', false); }
  };

  const toggleExpand = async (userId) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
      return;
    }
    setExpandedUser(userId);
    setLoadingEvents(true);
    setOrgEvents([]);
    try {
      const res = await adminService.getOrganizerEvents(userId);
      setOrgEvents(res.data || []);
    } catch (error) {
      showToast('Error loading organizer events', false);
    } finally {
      setLoadingEvents(false);
    }
  };

  const filteredUsers = users.filter(u => activeTab === 'All' || u.role === activeTab);

  return (
    <div className="admin-page">
      {toast.show && <div className={`admin-toast ${toast.ok ? 'toast-ok' : 'toast-err'}`}>{toast.msg}</div>}

      <div className="admin-header">
        <h1>User Management</h1>
        <p>Manage system users, track roles, and monitor organizer events.</p>
      </div>

      <div className="admin-controls-row">
        <div className="admin-tabs">
          {tabs.map(tab => (
            <button 
              key={tab} 
              className={`adm-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab); setExpandedUser(null); }}
            >
              {tab === 'All' ? 'All Users' : `${tab}s`}
              <span className="adm-tab-count">
                {users.filter(u => tab === 'All' || u.role === tab).length}
              </span>
            </button>
          ))}
        </div>

        <div className="admin-search-bar">
          <Search size={18} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-empty">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="admin-empty">No users found.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>User Identity</th>
                {activeTab === 'Organizer' ? (
                  <th>Organization Info</th>
                ) : (
                  <th>Student ID</th>
                )}
                <th>Type / Role</th>
                <th>Account Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <React.Fragment key={u._id}>
                  <tr className={expandedUser === u._id ? 'row-expanded' : ''}>
                    <td>
                      <div className="admin-user-cell">
                        <div className="admin-avatar">
                           {u.profileImage && u.profileImage !== 'default.png' ? 
                             <img src={`http://localhost:5000${u.profileImage}`} alt="" /> :
                             u.name.charAt(0).toUpperCase()
                           }
                        </div>
                        <div>
                          <div className="admin-user-name">
                            {u.role === 'Organizer' && u.organizationName ? u.organizationName : u.name}
                          </div>
                          <div className="admin-user-email">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    
                    {activeTab === 'Organizer' ? (
                      <td className="admin-sid">
                        <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                          <div>{u.phone || 'No Phone recorded'}</div>
                          {u.website && (
                            <a href={u.website} target="_blank" rel="noreferrer" className="adm-org-link">
                              {u.website} <ExternalLink size={12} style={{display:'inline'}}/>
                            </a>
                          )}
                        </div>
                      </td>
                    ) : (
                      <td className="admin-sid">{u.studentId || 'N/A'}</td>
                    )}

                    <td>
                      <select className="admin-role-select" value={u.role} onChange={e => handleRole(u._id, e.target.value)}>
                        <option>Student</option>
                        <option>Organizer</option>
                        <option>Admin</option>
                      </select>
                    </td>
                    <td>
                      <div className="admin-status-wrap">
                        <span className={`admin-status ${u.status === 'Active' ? 'status-active' : 'status-sus'}`}>{u.status}</span>
                        {isLocked(u) && <span className="admin-locked">Locked</span>}
                      </div>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button
                          className={`admin-action-btn ${u.status === 'Active' ? 'btn-sus' : 'btn-act'}`}
                          onClick={() => handleStatus(u._id, u.status)}
                          title={u.status === 'Active' ? 'Suspend' : 'Activate'}
                        >
                          {u.status === 'Active' ? <Ban size={16} /> : <CheckCircle size={16} />}
                        </button>
                        {isLocked(u) && (
                          <button className="admin-action-btn btn-unlock" onClick={() => handleUnlock(u._id)} title="Unlock">
                            <Unlock size={16} />
                          </button>
                        )}
                        {u.role === 'Organizer' && (
                          <button 
                            className="admin-action-btn btn-expand" 
                            onClick={() => toggleExpand(u._id)}
                            title="View Organized Events"
                          >
                            {expandedUser === u._id ? <ChevronUp size={16} /> : <Calendar size={16} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Row for Organizers */}
                  {expandedUser === u._id && (
                    <tr className="admin-subrow">
                      <td colSpan="5">
                        <div className="admin-events-panel fade-in">
                          <div className="aep-header">
                            <h4><Activity size={16}/> Events hosted by {u.organizationName || u.name}</h4>
                          </div>
                          <div className="aep-content">
                            {loadingEvents ? (
                              <div className="aep-loader">Loading events...</div>
                            ) : orgEvents.length === 0 ? (
                              <div className="aep-empty">This organizer has not created any events yet.</div>
                            ) : (
                              <div className="aep-grid">
                                {orgEvents.map(event => (
                                  <div key={event.id} className="aep-card">
                                    <div className="aep-card-top">
                                      <span className="aep-date">{new Date(event.date).toLocaleDateString()}</span>
                                      <span className={`aep-type ${event.isPaid ? 'paid' : 'free'}`}>{event.isPaid ? 'Paid' : 'Free'}</span>
                                    </div>
                                    <h5>{event.name}</h5>
                                    <p className="aep-venue">{event.venue}</p>
                                    <div className="aep-metrics">
                                      <span>{event.maxParticipants} max capacity</span>
                                      {event.isPaid && event.ticketPrice && <span>${event.ticketPrice}</span>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
