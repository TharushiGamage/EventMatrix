import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserPlus } from 'lucide-react';
import './auth.css';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', studentId: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.studentId || !form.password) { setError('All fields are required'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, studentId: form.studentId, password: form.password });
      navigate('/user-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-icon-ring">
          <UserPlus size={26} />
        </div>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join the University Event Management System</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="name">Full Name</label>
            <input id="name" type="text" value={form.name} onChange={handleChange} placeholder="John Doe" />
          </div>
          <div className="auth-grid-2">
            <div className="auth-field">
              <label htmlFor="email">Email Address</label>
              <input id="email" type="email" value={form.email} onChange={handleChange} placeholder="john@uni.edu" />
            </div>
            <div className="auth-field">
              <label htmlFor="studentId">Student ID</label>
              <input id="studentId" type="text" value={form.studentId} onChange={handleChange} placeholder="U12345678" />
            </div>
          </div>
          <div className="auth-grid-2">
            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" />
            </div>
            <div className="auth-field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input id="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" />
            </div>
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Register Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
