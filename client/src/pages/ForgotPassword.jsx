import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../api/index.js';
import { useToast } from '../context/ToastContext.jsx';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setSent(true);
      toast.success('Reset link sent if email exists');
    } catch (err) { toast.error('Something went wrong'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card slide-up">
        <div className="auth-header">
          <h1>Forgot Password</h1>
          <p>{sent ? 'Check your email for a reset link' : 'Enter your email to reset your password'}</p>
        </div>
        {!sent ? (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div className="text-center mt-md">
            <p className="text-muted">Didn't receive it? Check your spam folder.</p>
          </div>
        )}
        <div className="auth-footer"><Link to="/login">← Back to Login</Link></div>
      </div>
    </div>
  );
};

export default ForgotPassword;
