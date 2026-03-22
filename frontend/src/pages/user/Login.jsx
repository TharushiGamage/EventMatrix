import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn } from 'lucide-react';
import './auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    // validate email and password like registration
    setEmailTouched(true);
    const eErr = validateEmailValue(email);
    if (eErr) { setEmailError(eErr); return; }
    setPasswordTouched(true);
    const pErr = validatePasswordValue(password);
    if (pErr) { setPasswordError(pErr); return; }
    setLoading(true);
    try {
      console.log('Attempting login for:', email);
      const res = await login({ email, password });
      console.log('Login successful');

      // Redirect based on role
      const userRole = res?.data?.role || res?.role;
      if (userRole === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/profile');
      }
    } catch (err) {
      console.error('Login error caught:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Login failed';
      console.log('Final error message:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const validateEmailValue = (value) => {
    const v = (value || '').trim().toLowerCase();
    const basic = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!basic.test(v) || !v.endsWith('@gmail.com')) return 'Please enter a valid email address';
    return '';
  };

  const validatePasswordValue = (value) => {
    const v = (value || '');
    if (v.length < 7) return 'Password must be at least 7 characters';
    return '';
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    setEmailError(validateEmailValue(email));
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailTouched) setEmailError(validateEmailValue(e.target.value));
  };

  const handlePasswordBlur = () => {
    setPasswordTouched(true);
    setPasswordError(validatePasswordValue(password));
  };

  const handlePasswordChange = (e) => {
    const v = e.target.value || '';
    setPassword(v);
    if (passwordTouched || v.length >= 6) {
      setPasswordError(validatePasswordValue(v));
    } else {
      setPasswordError('');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-page">
        <div className="auth-card">
        <div className="auth-icon-ring">
          <LogIn size={26} />
        </div>
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your EventMatrix account</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
          <div className="auth-field">
            <label htmlFor="email">Email Address <span className="required-star">*</span></label>
            {emailError && <div className="field-error">{emailError}</div>}
            <input id="email" name="login_email" autoComplete="off" type="email" value={email} onChange={handleEmailChange} onBlur={handleEmailBlur} placeholder="you@university.edu" className={emailError ? 'input-error' : ''} />
          </div>
          <div className="auth-field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label htmlFor="password" style={{ marginBottom: 0 }}>Password <span className="required-star">*</span></label>
              <Link to="/forgot-password" style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>Forgot password?</Link>
            </div>
            {passwordError && <div className="field-error">{passwordError}</div>}
            <input id="password" name="login_password" autoComplete="current-password" type="password" value={password} onChange={handlePasswordChange} onBlur={handlePasswordBlur} placeholder="••••••••" className={passwordError ? 'input-error' : ''} />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
      </div>
    </div>
  );
};

export default Login;
