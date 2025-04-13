// src/components/Login.jsx
import React, { useState, useContext } from 'react';
import axios from '../axiosConfig';
import { useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser, fetchUser } = useContext(UserContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user types
    if (error) setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('Attempting to login with:', formData.email);
      const res = await axios.post('/api/auth/login', formData);
      
      if (!res.data.token) {
        setError('Login failed: No token received');
        console.error('Login failed: No token received from server');
        return;
      }
      
      // Clear any existing tokens first
      localStorage.removeItem('token');
      
      // Store the token in localStorage
      localStorage.setItem('token', res.data.token);
      console.log('Token stored successfully');
      
      // Use the fetchUser function from context to get user data
      await fetchUser();
      
      console.log('Login successful, redirecting to home');
      navigate('/'); // Redirect to home or products
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Login</h2>
          <div className="auth-subtitle">Access your TechGear account</div>
        </div>
        
        {error && (
          <div className="auth-error">
            <div className="error-icon">!</div>
            <div className="error-message">{error}</div>
          </div>
        )}
        
        <form onSubmit={handleLogin} className="auth-form">
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
                placeholder="Enter your password" 
                onChange={handleChange} 
                required 
                className="form-input"
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className={`auth-button ${loading ? 'loading' : ''}`}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Logging in...</span>
              </>
            ) : 'Login'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
