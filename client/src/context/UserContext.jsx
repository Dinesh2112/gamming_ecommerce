// src/context/UserContext.jsx
import { createContext, useState, useEffect } from 'react';
import axios from '../axiosConfig';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if token is expired
  const isTokenExpired = () => {
    const token = localStorage.getItem('token');
    if (!token) return true;
    
    try {
      // Get the expiration timestamp from the token
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.exp) return true;
      
      // Check if token is expired
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  };

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    
    if (!token || isTokenExpired()) {
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
      return;
    }
    
    try {
      console.log('Attempting to fetch user with token:', token.substring(0, 10) + '...');
      // Simply try to get the user info directly
      const res = await axios.get('/api/auth/me');
      console.log('User data retrieved successfully:', res.data);
      setUser(res.data);
    } catch (err) {
      console.error('Error fetching user:', err.response?.data || err.message);
      
      // If token is invalid, clear it from localStorage
      if (err.response?.data?.message === 'Token is not valid') {
        console.log('Clearing invalid token from localStorage');
        localStorage.removeItem('token');
      }
      
      setUser(null); // Not logged in or token invalid
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading, logout, fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};
