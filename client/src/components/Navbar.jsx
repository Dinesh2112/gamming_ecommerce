import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const Navbar = () => {
  const { user, logout } = useContext(UserContext);
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const isActive = (path) => location.pathname === path;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="tech-logo">TECH</span>
          <span className="gear-logo">GEAR</span>
        </Link>
        
        <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          <Link to="/" className={`navbar-link ${isActive('/') ? 'active' : ''}`}>
            <span className="navbar-icon">⌂</span>
            <span>Home</span>
          </Link>
          
          <Link to="/products" className={`navbar-link ${isActive('/products') ? 'active' : ''}`}>
            <span className="navbar-icon">⚙</span>
            <span>Products</span>
          </Link>
          
          <Link to="/cart" className={`navbar-link ${isActive('/cart') ? 'active' : ''}`}>
            <span className="navbar-icon">🛒</span>
            <span>Cart</span>
          </Link>
          
          <Link to="/orders" className={`navbar-link ${isActive('/orders') ? 'active' : ''}`}>
            <span className="navbar-icon">📦</span>
            <span>Orders</span>
          </Link>
          
          <Link to="/ai-assistant" className={`navbar-link ai-link ${isActive('/ai-assistant') ? 'active' : ''}`}>
            <span className="navbar-icon">🤖</span>
            <span>AI Assistant</span>
          </Link>
        </div>
        
        <div className="navbar-auth">
          {user ? (
            <div className="user-info" ref={dropdownRef}>
              <span className="user-greeting">
                Hello, <span className="user-name" onClick={toggleDropdown} style={{ cursor: 'pointer' }}>
                  {user.name} {dropdownOpen ? '▲' : '▼'}
                </span>
                {user.role === 'ADMIN' && <span className="admin-badge">ADMIN</span>}
              </span>
              
              {dropdownOpen && (
                <div className="user-dropdown">
                  {user.role === 'ADMIN' && (
                    <Link to="/admin/dashboard" className="dropdown-item">
                      Dashboard
                    </Link>
                  )}
                  <button 
                    onClick={logout} 
                    className="dropdown-item logout-item"
                  >
                    Logout
                  </button>
                </div>
              )}
              
              {/* Keep the logout button visible even when dropdown is closed */}
              {!dropdownOpen && (
                <button 
                  onClick={logout} 
                  className="logout-btn"
                >
                  Logout
                </button>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/signup" className="signup-btn">Sign Up</Link>
              <Link to="/login" className="login-btn">Login</Link>
            </div>
          )}
        </div>
        
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <div className={`hamburger ${menuOpen ? 'active' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
