import { useState, useEffect } from 'react';
import { adminService } from '../../services/userApi';
import { Search, Ban, CheckCircle, Unlock } from 'lucide-react';
import './admin.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, msg: '', ok: true });

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

  return (
    <div className="admin-page">
      {toast.show && <div className={`admin-toast ${toast.ok ? 'toast-ok' : 'toast-err'}`}>{toast.msg}</div>}

      <div className="admin-header">
        <h1>User Management</h1>
        <p>Manage system users, roles, and account statuses.</p>
      </div>

      <div className="admin-search-bar">
        <Search size={18} className="admin-search-icon" />
        <input
          type="text"
          placeholder="Search by name, email, or student ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-empty">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="admin-empty">No users found.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Student ID</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div className="admin-user-cell">
                      <div className="admin-avatar">{u.name.charAt(0)}</div>
                      <div>
                        <div className="admin-user-name">{u.name}</div>
                        <div className="admin-user-email">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="admin-sid">{u.studentId}</td>
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
