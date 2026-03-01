import React, { useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
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
import { 
  Dashboard, 
  ProductManagement, 
  OrderManagement,
  UserManagement 
} from './pages/admin';
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
          <Route path="/admin/orders" element={<OrderManagement />} />
          <Route path="/admin/users" element={<UserManagement />} />
        </Routes>
      </main>
      <footer className="footer-terminal">
        <div className="container footer-grid">
          <div className="footer-brand">
            <h3 className="glitch-title" data-text="HYPERDRIVE">HYPERDRIVE</h3>
            <p>ELITE LOGISTICS & HARDWARE DEPLOYMENT</p>
          </div>
          <div className="footer-nav">
            <div className="nav-col">
              <h5>SECTORS</h5>
              <Link to="/products?category=Monitors">VISUALS</Link>
              <Link to="/products?category=Keyboards">PERIPHERALS</Link>
              <Link to="/products?category=Mouse">OPTICS</Link>
            </div>
            <div className="nav-col">
              <h5>PROTOCOLS</h5>
              <Link to="#">PRIVACY</Link>
              <Link to="#">TERMS</Link>
              <Link to="#">SUPPORT</Link>
            </div>
          </div>
          <div className="footer-auth">
            <p className="copyright">&copy; {new Date().getFullYear()} HYPERDRIVE SYSTEMS. ALL RIGHTS RESERVED.</p>
            <div className="status-line">
              <span className="dot"></span> SYSTEM NOMINAL
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
