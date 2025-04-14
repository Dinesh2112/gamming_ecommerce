// src/components/Signup.jsx
import React, { useState } from 'react';
import axios from '../axiosConfig';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';
import { toast } from 'react-hot-toast';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user types
    if (error) setError('');
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('Signup attempt:', formData.email);
      const res = await axios.post('/api/auth/signup', formData);
      console.log('Signup successful!');
      
      // Show success toast
      toast.success('Account created successfully!');
      
      // Redirect to login page with success message
      navigate('/login', { 
        state: { message: 'Account created successfully! Please login.' } 
      });
    } catch (err) {
      console.error('Signup error:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || 'Signup failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Create Account</h2>
          <div className="auth-subtitle">Join TechGear community</div>
        </div>
        
        {error && (
          <div className="auth-error">
            <div className="error-icon">!</div>
            <div className="error-message">{error}</div>
          </div>
        )}
        
        <form onSubmit={handleSignup} className="auth-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">Name</label>
            <div className="input-container">
              <span className="input-icon">👤</span>
              <input 
                type="text" 
                id="name"
                name="name" 
                value={formData.name}
                placeholder="Enter your full name" 
                onChange={handleChange} 
                required 
                className="form-input"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <div className="input-container">
              <span className="input-icon">✉</span>
              <input 
                type="email" 
                id="email"
                name="email" 
                value={formData.email}
                placeholder="Enter your email" 
                onChange={handleChange} 
                required 
                className="form-input"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-container">
              <span className="input-icon">🔒</span>
              <input 
                type="password" 
                id="password"
                name="password" 
                value={formData.password}
                placeholder="Create a strong password" 
                onChange={handleChange} 
                required 
                minLength="6"
                className="form-input"
              />
            </div>
            <small className="form-hint">Password must be at least 6 characters</small>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className={`auth-button ${loading ? 'loading' : ''}`}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Creating account...</span>
              </>
            ) : 'Sign Up'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" className="auth-link">Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
