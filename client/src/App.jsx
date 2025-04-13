import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import './App.css';
import './components/Navbar.css';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Signup from './components/Signup';
import Login from './components/Login';
import AIAssistant from './pages/AIAssistant';
import Dashboard from './pages/admin/Dashboard';
import ProductManagement from './pages/admin/ProductManagement';
import Home from './pages/Home';

const App = () => {
  // Check token validity on startup
  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Check if token is in proper format
          const parts = token.split('.');
          if (parts.length !== 3) {
            console.error('Invalid token format detected, clearing token');
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Error checking token, clearing for safety', error);
          localStorage.removeItem('token');
        }
      }
    };
    
    checkToken();
  }, []);
  
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:productId" element={<ProductDetails />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/products" element={<ProductManagement />} />
        </Routes>
      </main>
      <footer className="footer">
        <div className="container">
          <p className="copyright">&copy; {new Date().getFullYear()} TechGear - All rights reserved</p>
          <div className="footer-links">
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
