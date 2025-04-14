// src/components/Login.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import './Auth.css';
import { toast } from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

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
      console.log('Login payload:', formData);
      
      // Use the login function from UserContext instead of direct API call
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Show toast on successful login
        toast.success('Login successful!');
        console.log('Login successful, redirecting to home');
        navigate('/'); // Redirect to home
      } else {
        // Handle login failure
        setError(result.message || 'Login failed. Please try again.');
        toast.error(result.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
      toast.error('Login failed');
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
