// src/context/UserContext.jsx
import { createContext, useState, useEffect } from 'react';
import axios from '../axiosConfig';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if the JWT token is expired
  const isTokenExpired = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return true;
      
      // Decode the JWT payload
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Check if the expiration time is passed
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        console.log('Token has expired');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      // If we can't decode the token, consider it expired
      return true;
    }
  };

  const fetchUser = async (token) => {
    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      console.log('Attempting to fetch user with token:', token.substring(0, 10) + '...');
      console.log('Request headers:', { 'x-auth-token': token });
      
      const response = await fetch(`${backendUrl}/api/auth/me`, {
        method: 'GET',
        headers: {
          'x-auth-token': token
        }
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('User data retrieved successfully:', userData);
        
        // Ensure admin role is uppercase for consistency throughout the app
        if (userData.role === 'admin') {
          userData.role = 'ADMIN';
          console.log('Normalized admin role to uppercase ADMIN');
        }
        
        return userData;
      } else {
        console.error('Failed to fetch user data:', response.status);
        // Clear the token if it's unauthorized
        if (response.status === 401) {
          localStorage.removeItem('token');
        }
        return null;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };
  
  // Function to handle user logout
  const logout = () => {
    // Clear token from localStorage
    localStorage.removeItem('token');
    
    // Reset user state
    setUser(null);
    
    console.log('User logged out successfully');
    
    // Optional: redirect to login page
    window.location.href = '/login';
  };

  // Function to fetch the current authenticated user on app load
  const fetchCurrentUser = async () => {
    setLoading(true);
    
    const token = localStorage.getItem('token');
    
    if (!token || isTokenExpired()) {
      console.log('Token is missing or expired, clearing user state');
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
      return;
    }
    
    try {
      // Use our updated fetchUser function
      const userData = await fetchUser(token);
      
      if (userData) {
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error in fetchCurrentUser:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle user login
  const login = async (email, password) => {
    setLoading(true);
    
    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Login failed:', errorData.message);
        
        setLoading(false);
        return { 
          success: false, 
          message: errorData.message || 'Login failed. Please check your credentials.' 
        };
      }
      
      const data = await response.json();
      
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      
      // Decode the token to check the role (just for logging purposes)
      try {
        const tokenPayload = JSON.parse(atob(data.token.split('.')[1]));
        console.log('Token payload:', tokenPayload);
        console.log('Role in token:', tokenPayload.role);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
      
      // Fetch user data with the new token
      const userData = await fetchUser(data.token);
      
      if (userData) {
        setUser(userData);
        setLoading(false);
        return { success: true };
      } else {
        localStorage.removeItem('token');
        setLoading(false);
        return { 
          success: false, 
          message: 'Failed to get user data after login.' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      return { 
        success: false, 
        message: 'Login failed due to a network error. Please try again.' 
      };
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        fetchCurrentUser
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
