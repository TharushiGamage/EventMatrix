import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User as UserIcon, Shield, Calendar, ArrowRight } from 'lucide-react';
import './dashboard.css';

const UserDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="udash-page">
      <div className="udash-header">
        <h1>Welcome, <span>{user.name}</span>!</h1>
        <p>University Event Management System • <strong>{user.role}</strong></p>
      </div>

      <div className="udash-grid">
        <Link to="/profile" className="udash-card">
          <div className="udash-icon udash-icon-purple">
            <UserIcon size={28} />
          </div>
          <div className="udash-text">
            <h3>My Profile</h3>
            <p>Manage your account details and change your password.</p>
          </div>
          <ArrowRight size={20} className="udash-arrow" />
        </Link>

        <Link to="/" className="udash-card">
          <div className="udash-icon udash-icon-cyan">
            <Calendar size={28} />
          </div>
          <div className="udash-text">
            <h3>Browse Events</h3>
            <p>View and register for upcoming university events.</p>
          </div>
          <ArrowRight size={20} className="udash-arrow" />
        </Link>

        {user.role === 'Admin' && (
          <Link to="/admin/users" className="udash-card udash-card-highlight">
            <div className="udash-icon udash-icon-blue">
              <Shield size={28} />
            </div>
            <div className="udash-text">
              <h3>Admin Panel</h3>
              <p>Manage users, roles, and account statuses.</p>
            </div>
            <ArrowRight size={20} className="udash-arrow" />
          </Link>
        )}
      </div>

      <div className="udash-info-strip">
        <div className="info-item"><span className="info-label">Email</span><span>{user.email}</span></div>
        <div className="info-item"><span className="info-label">Student ID</span><span>{user.studentId}</span></div>
        <div className="info-item"><span className="info-label">Role</span><span className="role-pill">{user.role}</span></div>
      </div>
    </div>
  );
};

export default UserDashboard;
