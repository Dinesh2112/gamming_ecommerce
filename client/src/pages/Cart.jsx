// src/pages/Cart.jsx
import React, { useEffect, useState, useContext } from 'react';
import axios from '../axiosConfig';
import { UserContext } from '../context/UserContext';
import { useNavigate, Link } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      setLoading(true);
      // Use the correct endpoint from the backend routes
      const res = await axios.get('/api/cart/my-cart');
      console.log('Cart data:', res.data);
      setCartItems(res.data.cartItems || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is logged in before fetching cart
    if (user) {
      fetchCart();
    } else {
      setCartItems([]);
      setTotal(0);
      setLoading(false);
    }
  }, [user]);

  const handleRemoveItem = async (itemId) => {
    try {
      await axios.delete(`/api/cart/remove/${itemId}`);
      // Refresh cart after removing item
      fetchCart();
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      await axios.put(`/api/cart/update/${itemId}`, { quantity: newQuantity });
      // Refresh cart after updating
      fetchCart();
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  const handleCheckout = async () => {
    try {
      setCheckoutLoading(true);
      await axios.post('/api/cart/checkout');
      
      // Success animation
      setCheckoutLoading(false);
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'checkout-success';
      successMessage.innerHTML = `
        <div class="checkout-success-icon">✓</div>
        <h3>Order Placed Successfully!</h3>
        <p>Redirecting to orders...</p>
      `;
      document.querySelector('.cart-container').appendChild(successMessage);
      
      // Redirect after delay
      setTimeout(() => {
        setCartItems([]);
        setTotal(0);
        navigate('/orders');
      }, 2000);
    } catch (err) {
      setCheckoutLoading(false);
      console.error('Checkout error:', err);
      alert('Failed to checkout');
    }
  };

  if (loading) {
    return (
      <div className="cart-loading">
        <div className="spinner"></div>
        <p>Loading your cart...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="cart-container">
        <div className="cart-auth-required">
          <div className="auth-icon">🔒</div>
          <h2>Authentication Required</h2>
          <p>Please log in to view your cart</p>
          <Link to="/login" className="primary-button">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1 className="cart-title">Your Cart</h1>
        <div className="cart-summary">
          {cartItems.length > 0 && (
            <div className="cart-count">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</div>
          )}
        </div>
      </div>
      
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added any products to your cart yet.</p>
          <Link to="/" className="primary-button">Browse Products</Link>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item tech-card">
                <div className="cart-item-image">
                  {item.product.imageUrl ? (
                    <img 
                      src={item.product.imageUrl} 
                      alt={item.product.name} 
                      onError={(e) => {
                        e.target.onerror = null; // Prevent infinite error loop
                        
                        // Try Unsplash random image as first fallback
                        const fallbackUrl = `https://source.unsplash.com/random/300x200/?${item.product.category.toLowerCase()},computer`;
                        
                        // If the image is already using the fallback URL or another error occurs
                        if (e.target.src === fallbackUrl) {
                          // Use a solid placeholder as final fallback
                          e.target.src = `https://placehold.co/300x200/333/FFF?text=${encodeURIComponent(item.product.name)}`;
                        } else {
                          e.target.src = fallbackUrl;
                        }
                      }}
                    />
                  ) : (
                    <div className="placeholder-image"></div>
                  )}
                </div>
                
                <div className="cart-item-details">
                  <h3 className="cart-item-name">{item.product.name}</h3>
                  <p className="cart-item-price">₹{item.product.price.toFixed(2)}</p>
                </div>
                
                <div className="cart-item-actions">
                  <div className="quantity-controls">
                    <button 
                      className="quantity-btn" 
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} 
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button 
                      className="quantity-btn" 
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="cart-item-subtotal">
                    <span className="subtotal-label">Subtotal:</span>
                    <span className="subtotal-value">₹{(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                  
                  <button className="remove-btn" onClick={() => handleRemoveItem(item.id)}>
                    <span className="remove-icon">×</span>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="cart-summary-container tech-card">
            <h3 className="summary-title">Order Summary</h3>
            
            <div className="summary-details">
              <div className="summary-row">
                <span>Items ({cartItems.length}):</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              
              <div className="summary-row">
                <span>Shipping & Handling:</span>
                <span>₹0.00</span>
              </div>
              
              <div className="summary-divider"></div>
              
              <div className="summary-row total">
                <span>Order Total:</span>
                <span className="total-price">₹{total.toFixed(2)}</span>
              </div>
            </div>
            
            <button 
              className={`checkout-btn ${checkoutLoading ? 'loading' : ''}`}
              onClick={handleCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? (
                <>
                  <span className="spinner"></span>
                  <span>Processing...</span>
                </>
              ) : 'Proceed to Checkout'}
            </button>
            
            <div className="cart-actions">
              <Link to="/" className="continue-shopping">Continue Shopping</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
