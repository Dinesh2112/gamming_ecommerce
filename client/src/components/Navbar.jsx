import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { LucideShield, LucideShoppingCart, LucideCpu, LucideMenu, LucideX, LucideUser, LucideLogOut, LucideClipboardList, LucideLayoutDashboard } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(UserContext);
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  
  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className={`tactical-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container container">
        <Link to="/" className="nav-logo">
          <div className="logo-hex">
            <LucideShield className="hex-icon" size={24} />
          </div>
          <span className="logo-text">HYPER<span className="glow">DRIVE</span></span>
        </Link>
        
        <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            CENTRAL HUB
          </Link>
          <Link to="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            ARMORY
          </Link>
          <Link to="/ai-assistant" className={`nav-link ai-link ${isActive('/ai-assistant') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            <LucideCpu size={16} /> AI CORE
          </Link>
        </div>
        
        <div className="nav-actions">
          <Link to="/cart" className="action-icon cart-trigger">
            <LucideShoppingCart size={22} />
          </Link>
          
          {user ? (
            <div className="user-terminal" ref={dropdownRef}>
              <div className="pilot-trigger" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <div className="pilot-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="pilot-name">{user.name.split(' ')[0]}</span>
              </div>
              
              {dropdownOpen && (
                <div className="pilot-dropdown glass">
                  <div className="dropdown-header">PILOT ACCESS</div>
                  {user.role === 'ADMIN' && (
                    <Link to="/admin/dashboard" className="drop-link" onClick={() => setDropdownOpen(false)}>
                      <LucideLayoutDashboard size={16} /> COMMAND CENTER
                    </Link>
                  )}
                  <Link to="/orders" className="drop-link" onClick={() => setDropdownOpen(false)}>
                    <LucideClipboardList size={16} /> MISSION LOG
                  </Link>
                  <div className="drop-divider"></div>
                  <button onClick={logout} className="drop-link logout">
                    <LucideLogOut size={16} /> DISCONNECT
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="nav-auth">
              <Link to="/login" className="login-trigger">SIGN IN</Link>
              <Link to="/signup" className="neon-btn signup-trigger">JOIN</Link>
            </div>
          )}
          
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <LucideX /> : <LucideMenu />}
          </button>
        </div>
      </div>
      <div className="nav-scan-line"></div>
    </nav>
  );
};

export default Navbar;
