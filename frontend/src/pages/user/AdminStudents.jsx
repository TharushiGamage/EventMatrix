import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/userApi';
import { Search, ChevronDown, ChevronUp, ExternalLink, Calendar } from 'lucide-react';
import './admin.css';

const AdminStudents = () => {
  const [students, setStudents] = useState([]); // { user, events[] }
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      // Fetch all students first - this ensures we get EVERY student registered in the system
      const allStudentsRes = await adminService.getUsers('', 'Student');
      const allStudents = allStudentsRes.data || [];

      // Fetch registrations data
      const registrationsRes = await adminService.getStudentRegistrations();
      const registrationData = registrationsRes.data || [];

      // Create a map of registration data by user ID
      const regMap = {};
      registrationData.forEach(item => {
        if (item.user && item.user._id) {
          regMap[item.user._id] = item.events || [];
        }
      });

      // Map all students to include event registrations (or empty array if no registrations)
      const students = allStudents.map(user => ({
        user,
        events: regMap[user._id] || []
      }));

      setStudents(students);
    } catch (err) {
      console.error('Failed to fetch student registrations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  const filtered = students.filter(s => {
    const u = s.user || {};
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (u.name || '').toLowerCase().includes(q) || (u.studentId || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
  });

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Students</h1>
        <p>All registered students and their event registrations.</p>
      </div>

      <div className="admin-controls-row">
        <div className="admin-search-bar">
          <Search size={18} className="admin-search-icon" />
          <input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-empty">Loading students...</div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">No students found.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Student ID</th>
                <th>Registered Events</th>
                <th>Account Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const u = item.user || {};
                return (
                  <React.Fragment key={u._id}>
                    <tr>
                      <td>
                        <div className="admin-user-cell">
                          <div className="admin-avatar">
                            {u.profileImage && u.profileImage !== 'default.png' ? (
                              <img src={`http://localhost:5000${u.profileImage}`} alt="" />
                            ) : (
                              (u.name || 'U').charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="admin-user-name">{u.name}</div>
                            <div className="admin-user-email">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="admin-sid">{u.studentId || 'N/A'}</td>
                      <td>
                        {item.events && item.events.length > 0 ? (
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {item.events.map(ev => (
                              <div key={ev._id} style={{ background: '#f1f5f9', padding: '0.35rem 0.6rem', borderRadius: 8, fontSize: '0.85rem', color: '#0f172a' }}>
                                {ev.name} <span style={{ opacity: 0.7, marginLeft: 6 }}>· {new Date(ev.date).toLocaleDateString()}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ color: '#64748b', fontSize: '0.9rem' }}>No registrations</div>
                        )}
                      </td>
                      <td>
                        <div className={`admin-status ${u.status === 'Active' ? 'status-active' : 'status-sus'}`}>{u.status}</div>
                      </td>
                      <td>
                        <div className="admin-actions">
                          <button className="admin-action-btn" title="View Details" onClick={() => setExpanded(expanded === u._id ? null : u._id)}>
                            {expanded === u._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {expanded === u._id && (
                      <tr className="admin-subrow">
                        <td colSpan="5">
                          <div className="admin-events-panel fade-in">
                            <div className="aep-header">
                              <h4><Calendar size={16} /> Events registered by {u.name}</h4>
                            </div>
                            <div>
                              {item.events && item.events.length > 0 ? (
                                <div className="aep-grid">
                                  {item.events.map(ev => (
                                    <div key={ev._id} className="aep-card">
                                      <div className="aep-card-top">
                                        <span className="aep-date">{new Date(ev.date).toLocaleDateString()}</span>
                                        <span className={`aep-type ${ev.isPaid ? 'paid' : 'free'}`}>{ev.isPaid ? 'Paid' : 'Free'}</span>
                                      </div>
                                      <h5>{ev.name}</h5>
                                      <p className="aep-venue">{ev.venue}</p>
                                      <div className="aep-metrics">
                                        <span>{ev.maxParticipants} max capacity</span>
                                        {ev.isPaid && ev.ticketPrice && <span>${ev.ticketPrice}</span>}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="aep-empty">No registrations found for this student.</div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminStudents;
