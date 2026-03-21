import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { KeyRound, ShieldAlert } from 'lucide-react';
import './auth.css';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Reset Password
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email) { setError('Please enter your email address'); return; }
    
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setSuccess(res.message || 'Verification code sent to your email/phone.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!otpCode || !newPassword || !confirmPassword) { setError('Please fill in all fields'); return; }
    if (newPassword.length < 6) { setError('New password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }

    setLoading(true);
    try {
      const res = await resetPassword({ email, otpCode, newPassword });
      setSuccess(res.message || 'Password reset successful!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-icon-ring" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            {step === 1 ? <KeyRound size={26} /> : <ShieldAlert size={26} />}
          </div>
          
          <h1 className="auth-title">
            {step === 1 ? 'Forgot Password?' : 'Enter Reset Code'}
          </h1>
          <p className="auth-subtitle">
            {step === 1 
              ? "Enter your email address and we'll send you a 6-digit reset code." 
              : `We've sent a code to ${email}. Enter it below to set a new password.`}
          </p>

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success" style={{ backgroundColor: '#dcfce3', color: '#166534', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px' }}>{success}</div>}

          {step === 1 ? (
            <form onSubmit={handleRequestOtp} className="auth-form">
              <div className="auth-field">
                <label htmlFor="email">Email Address</label>
                <input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="you@university.edu" 
                  required
                />
              </div>
              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Sending Code...' : 'Send Reset Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="auth-form">
              <div className="auth-field">
                <label htmlFor="otpCode">6-Digit Reset Code</label>
                <input 
                  id="otpCode" 
                  type="text" 
                  value={otpCode} 
                  onChange={e => setOtpCode(e.target.value)} 
                  placeholder="e.g. 123456" 
                  maxLength={6}
                  required
                />
              </div>
              <div className="auth-field">
                <label htmlFor="newPassword">New Password</label>
                <input 
                  id="newPassword" 
                  type="password" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required
                />
              </div>
              <div className="auth-field">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input 
                  id="confirmPassword" 
                  type="password" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required
                />
              </div>
              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
              <div style={{ textAlign: 'center', marginTop: '15px' }}>
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Request a new code
                </button>
              </div>
            </form>
          )}

          <p className="auth-footer">
            Remember your password? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
