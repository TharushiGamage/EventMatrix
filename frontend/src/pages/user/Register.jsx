import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserPlus } from 'lucide-react';
import './auth.css';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', studentId: '', password: '', confirmPassword: '', phone: '' });
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const updated = { ...form, [e.target.id]: e.target.value };
    setForm(updated);
    if (e.target.id === 'password' && passwordTouched) {
      setPasswordError(validatePasswordValue(e.target.value));
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
    setEmailError(validateEmailValue(form.email));
  };

  const handleEmailChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
    if (emailTouched) setEmailError(validateEmailValue(e.target.value));
  };

  const handlePasswordBlur = () => {
    setPasswordTouched(true);
    setPasswordError(validatePasswordValue(form.password));
  };

  const handlePasswordChange = (e) => {
    const v = e.target.value || '';
    setForm({ ...form, [e.target.id]: v });
    if (passwordTouched || v.length >= 6) {
      setPasswordError(validatePasswordValue(v));
    } else {
      setPasswordError('');
    }
  };

  const handlePhoneChange = (e) => {
    const digits = (e.target.value || '').replace(/\D/g, '');
    setForm({ ...form, phone: digits });
  };

  const handlePhoneKeyDown = (e) => {
    const allowed = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab', 'Home', 'End'];
    if (allowed.includes(e.key)) return;
    if (/^\d$/.test(e.key)) return;
    e.preventDefault();
  };

  const handlePhonePaste = (e) => {
    const paste = e.clipboardData.getData('text') || '';
    const digits = paste.replace(/\D/g, '');
    if (!digits) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    setForm({ ...form, phone: (form.phone + digits).slice(0, 30) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.studentId || !form.password || !form.phone) { setError('All fields are required'); return; }
    // Email domain validation: must be a gmail address
    setEmailTouched(true);
    const eErr = validateEmailValue(form.email);
    if (eErr) { setEmailError(eErr); return; }
    // Password length validation
    setPasswordTouched(true);
    const pErr = validatePasswordValue(form.password);
    if (pErr) { setPasswordError(pErr); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      console.log('Starting registration with:', form);
      const isAdminCreatingStudent = user?.role === 'Admin';
      await register(
        { name: form.name, email: form.email, studentId: form.studentId, password: form.password, phone: form.phone },
        { persistSession: !isAdminCreatingStudent }
      );
      console.log('Registration successful');
      navigate(isAdminCreatingStudent ? '/admin' : '/feed');
    } catch (err) {
      console.error('Registration error caught:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Registration failed';
      console.log('Final error message:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-page">
        <div className="auth-card">
        <div className="auth-icon-ring">
          <UserPlus size={26} />
        </div>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join the University Event Management System</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
          <div className="auth-field">
            <label htmlFor="name">Full Name <span className="required-star">*</span></label>
            <input id="name" type="text" value={form.name} onChange={handleChange} placeholder="John Doe" />
          </div>
          <div className="auth-field">
            <label htmlFor="email">Email Address <span className="required-star">*</span></label>
            {emailError && <div className="field-error">{emailError}</div>}
            <input id="email" name="signup_email" autoComplete="off" type="email" value={form.email} onChange={handleEmailChange} onBlur={handleEmailBlur} placeholder="john@uni.edu" className={emailError ? 'input-error' : ''} />
          </div>
          <div className="auth-field">
            <label htmlFor="studentId">Student ID <span className="required-star">*</span></label>
            <input id="studentId" type="text" value={form.studentId} onChange={handleChange} placeholder="U12345678" disabled={emailTouched && !!emailError} />
          </div>
          <div className="auth-field">
            <label htmlFor="phone">Mobile Number <span className="required-star">*</span></label>
            <input id="phone" name="signup_phone" type="tel" value={form.phone} onChange={handlePhoneChange} onKeyDown={handlePhoneKeyDown} onPaste={handlePhonePaste} placeholder="5550000000" disabled={emailTouched && !!emailError} />
          </div>
          <div className="auth-field">
            <label htmlFor="password">Password <span className="required-star">*</span></label>
            {passwordError && <div className="field-error">{passwordError}</div>}
            <input id="password" name="signup_password" autoComplete="new-password" type="password" value={form.password} onChange={handlePasswordChange} onBlur={handlePasswordBlur} placeholder="••••••••" className={passwordError ? 'input-error' : ''} disabled={emailTouched && !!emailError} />
          </div>
          <div className="auth-field">
            <label htmlFor="confirmPassword">Confirm Password <span className="required-star">*</span></label>
            <input id="confirmPassword" name="signup_confirm_password" autoComplete="new-password" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" disabled={emailTouched && !!emailError} />
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
    </div>
  );
};

export default Register;
