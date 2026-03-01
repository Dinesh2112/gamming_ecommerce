import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import './Auth.css';
import { toast } from 'react-hot-toast';
import { LucideLock, LucideMail, LucideTerminal } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        toast.success('ACCESS GRANTED');
        navigate('/');
      } else {
        toast.error(result.message || 'ACCESS DENIED');
      }
    } catch (err) {
      toast.error('UPLINK FAILURE');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass-card">
        <div className="auth-header">
          <LucideTerminal className="auth-icon-main" size={40} />
          <h2 className="glitch-title" data-text="IDENTIFICATION">IDENTIFICATION</h2>
          <p className="auth-hint">Secure Uplink Required</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="input-field glass">
            <LucideMail size={18} />
            <input 
              type="email" 
              name="email" 
              placeholder="PILOT EMAIL" 
              value={formData.email}
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="input-field glass">
            <LucideLock size={18} />
            <input 
              type="password" 
              name="password" 
              placeholder="ENCRYPTION KEY" 
              value={formData.password}
              onChange={handleChange} 
              required 
            />
          </div>

          <button type="submit" disabled={loading} className="neon-btn auth-submit">
            {loading ? 'VERIFYING...' : 'ESTABLISH LINK'}
          </button>
        </form>

        <div className="auth-footer">
          <span>NEW PILOT?</span>
          <Link to="/signup" className="auth-link">REGISTER ASSET</Link>
        </div>
      </div>
      <div className="auth-bg-fx"></div>
    </div>
  );
};

export default Login;
