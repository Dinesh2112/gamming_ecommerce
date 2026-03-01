import React, { useState } from 'react';
import axios from '../axiosConfig';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';
import { toast } from 'react-hot-toast';
import { LucideUser, LucideMail, LucideLock, LucideUserPlus } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/auth/signup', formData);
      toast.success('ASSET REGISTERED');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'REGISTRATION REJECTED');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass-card">
        <div className="auth-header">
          <LucideUserPlus className="auth-icon-main" size={40} />
          <h2 className="glitch-title" data-text="REGISTRATION">REGISTRATION</h2>
          <p className="auth-hint">Initialize New Asset Protocol</p>
        </div>

        <form onSubmit={handleSignup} className="auth-form">
          <div className="input-field glass">
            <LucideUser size={18} />
            <input 
              type="text" 
              name="name" 
              placeholder="PILOT DESIGNATION" 
              value={formData.name}
              onChange={handleChange} 
              required 
            />
          </div>

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
              minLength="6"
            />
          </div>

          <button type="submit" disabled={loading} className="neon-btn auth-submit">
            {loading ? 'INITIALIZING...' : 'AUTHORIZE REGISTRATION'}
          </button>
        </form>

        <div className="auth-footer">
          <span>LINK ALREADY ESTABLISHED?</span>
          <Link to="/login" className="auth-link">ACCESS TERMINAL</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
