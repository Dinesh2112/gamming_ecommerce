// src/pages/Cart.jsx
import React, { useEffect, useState, useContext } from 'react';
import axios from '../axiosConfig';
import { UserContext } from '../context/UserContext';
import { useNavigate, Link } from 'react-router-dom';
import './Cart.css';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart, updateCartItemQuantity, clearErrors } from '../features/cart/cartSlice';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
  });
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [orderId, setOrderId] = useState(null);
  
  // Get cart errors from Redux
  const cartErrors = useSelector(state => state.cart.errors || []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      // Use the correct endpoint from the backend routes
      const res = await axios.get('/api/cart/my-cart');
      console.log('Cart data:', res.data);
      
      // Add detailed item logging for debugging
      if (res.data.cartItems && res.data.cartItems.length > 0) {
        console.log('First cart item structure:', JSON.stringify(res.data.cartItems[0], null, 2));
        console.log('Product in cart item:', res.data.cartItems[0].product);
      }
      
      // Update cart items with stock information
      const itemsWithStock = await Promise.all(
        (res.data.cartItems || []).map(async (item) => {
          try {
            // Fetch current product stock
            const productRes = await axios.get(`/api/products/${item.productId}`);
            const currentStock = productRes.data.stock || 0;
            
            // If quantity exceeds stock, adjust
            if (item.quantity > currentStock) {
              // Update quantity in backend
              if (currentStock > 0) {
                await axios.put(`/api/cart/update/${item.id}`, {
                  quantity: currentStock
                });
              }
              
              // Show warning
              toast.error(`Only ${currentStock} units of ${item.product.name} are available`);
              
              return {
                ...item,
                stock: currentStock
              };
            }
            
            return {
              ...item,
              stock: currentStock
            };
          } catch (err) {
            console.error(`Error fetching stock for product ${item.productId}:`, err);
            return item;
          }
        })
      );
      
      console.log('Cart items with stock:', itemsWithStock);
      setCartItems(itemsWithStock);
      
      // Recalculate total
      const newTotal = itemsWithStock.reduce(
        (sum, item) => sum + item.product.price * item.quantity, 
        0
      );
      console.log('Calculated total:', newTotal);
      setTotal(newTotal);
      
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
      // Pre-fill name if available from user context
      if (user.name) {
        setShippingInfo(prev => ({ ...prev, name: user.name }));
      }
    } else {
      setCartItems([]);
      setTotal(0);
      setLoading(false);
    }
  }, [user]);

  // Display toast for new cart errors
  useEffect(() => {
    if (cartErrors.length > 0) {
      cartErrors.forEach(error => {
        toast.error(error.message);
        // Clear the error after showing it
        setTimeout(() => {
          dispatch(clearErrors(error.id));
        }, 3000);
      });
    }
  }, [cartErrors, dispatch]);

  const handleRemoveItem = async (itemId) => {
    try {
      // Show loading toast
      const loadingToast = toast.loading("Removing item...");
      
      await axios.delete(`/api/cart/remove/${itemId}`);
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      // Success message
      toast.success("Item removed successfully");
      
      // Refresh cart after removing item
      fetchCart();
    } catch (err) {
      console.error('Error removing item:', err);
      
      // Display appropriate error message based on response status
      if (err.response) {
        const statusCode = err.response.status;
        const errorMessage = err.response.data?.message || "Unknown error";
        
        switch (statusCode) {
          case 400:
            toast.error(`Invalid request: ${errorMessage}`);
            break;
          case 403:
            toast.error("You don't have permission to remove this item");
            break;
          case 404:
            toast.error("Item not found. Refreshing cart...");
            fetchCart(); // Refresh cart to remove missing item
            break;
          default:
            toast.error(`Error removing item: ${errorMessage}`);
        }
      } else {
        toast.error("Network error. Please check your connection.");
      }
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity, stock) => {
    if (newQuantity < 1) return;
    
    // Check stock limit
    if (stock !== undefined && newQuantity > stock) {
      toast.error(`Only ${stock} units available`);
      newQuantity = stock;
    }
    
    try {
      // Show loading toast
      const loadingToast = toast.loading("Updating cart...");
      
      const response = await axios.put(`/api/cart/update/${itemId}`, { quantity: newQuantity });
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      // Update in Redux as well
      dispatch(updateCartItemQuantity({ id: itemId, quantity: newQuantity }));
      
      // Success message
      toast.success("Cart updated successfully");
      
      // Refresh cart after updating
      fetchCart();
    } catch (err) {
      console.error('Error updating quantity:', err);
      
      // Display appropriate error message based on response status
      if (err.response) {
        const statusCode = err.response.status;
        const errorMessage = err.response.data?.message || "Unknown error";
        
        switch (statusCode) {
          case 400:
            toast.error(`Invalid request: ${errorMessage}`);
            break;
          case 403:
            toast.error("You don't have permission to update this item");
            break;
          case 404:
            toast.error("Item not found. Refreshing cart...");
            fetchCart(); // Refresh cart to remove missing item
            break;
          default:
            toast.error(`Error updating cart: ${errorMessage}`);
        }
      } else {
        toast.error("Network error. Please check your connection.");
      }
    }
  };

  const handleShippingInfoChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleProceedToCheckout = () => {
    // Check if user is logged in first
    if (!user) {
      toast.error('Please log in to proceed to checkout');
      navigate('/login');
      return;
    }
    
    // Show checkout form
    setShowCheckoutForm(true);
  };

  const closeCheckoutForm = () => {
    setShowCheckoutForm(false);
  };

  const validateShippingInfo = () => {
    const { name, phone, street, city, state, zipCode } = shippingInfo;
    if (!name || !phone || !street || !city || !state || !zipCode) {
      return false;
    }
    return true;
  };

  const initRazorpay = async () => {
    if (!validateShippingInfo()) {
      toast.error('Please fill all the required shipping information');
      return;
    }

    try {
      setCheckoutLoading(true);
      
      // Format the total to ensure it's not too large (max 10^6 INR in paisa)
      const totalInPaisa = Math.min(Math.round(total * 100), 10000000);
      
      console.log('Creating order with shipping data:', shippingInfo);
      console.log('Cart total amount:', total);
      console.log('Amount in paisa for Razorpay:', totalInPaisa);
      
      // Create order in backend to get order ID
      const response = await axios.post('/api/cart/create-order', {
        shippingAddress: shippingInfo,
        amount: totalInPaisa // Convert to paisa (smallest currency unit)
      });
      
      console.log('Order creation response:', response.data);
      
      const { orderId, amount } = response.data;
      console.log("Order created:", orderId, amount);
      
      // Store orderId for reference
      setOrderId(orderId);
      
      // Direct implementation - more reliable than loading external script
      if (window.Razorpay) {
        openRazorpayCheckout(orderId, amount);
      } else {
        // Load Razorpay script if not already loaded
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        
        script.onload = () => {
          openRazorpayCheckout(orderId, amount);
        };
        
        script.onerror = () => {
          console.error('Failed to load Razorpay script');
          toast.error('Payment gateway failed to load');
          setCheckoutLoading(false);
        };
        
        document.body.appendChild(script);
      }
    } catch (err) {
      setCheckoutLoading(false);
      console.error('Payment initiation error:', err);
      
      if (err.response) {
        const errorMessage = err.response.data?.message || 'Server error';
        const statusCode = err.response.status;
        console.error('Full error response:', err.response.data);
        toast.error(`Error ${statusCode}: ${errorMessage}`);
      } else if (err.request) {
        toast.error('Network error. Please check your connection.');
        console.error('Network error:', err.request);
      } else {
        toast.error('Failed to initialize payment: ' + err.message);
      }
    }
  };

  const openRazorpayCheckout = (orderId, amount) => {
    const options = {
      key: 'rzp_test_Z4ZpOq2T7TkpNd',
      amount: amount,
      currency: 'INR',
      name: 'Gaming E-commerce',
      description: 'Purchase of gaming products',
      order_id: orderId,
      handler: function(response) {
        handlePaymentSuccess(response, orderId);
      },
      prefill: {
        name: shippingInfo.name,
        contact: shippingInfo.phone,
      },
      theme: {
        color: '#7983ff'
      },
      modal: {
        ondismiss: function() {
          setCheckoutLoading(false);
          toast.error('Payment cancelled');
        }
      },
      notes: {
        shipping_address: `${shippingInfo.street}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}`
      }
    };
    
    try {
      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function(response) {
        toast.error(`Payment failed: ${response.error.description}`);
        setCheckoutLoading(false);
      });
      
      razorpayInstance.open();
    } catch (err) {
      console.error('Error opening Razorpay:', err);
      toast.error('Failed to open payment form');
      setCheckoutLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentResponse, orderId) => {
    console.log('Payment successful, verifying with backend:', paymentResponse);
    
    try {
      // Verify payment with backend
      const verificationResponse = await axios.post('/api/cart/verify-payment', {
        orderId: orderId,
        paymentId: paymentResponse.razorpay_payment_id,
        signature: paymentResponse.razorpay_signature
      });
      
      console.log('Payment verification response:', verificationResponse.data);
      
      // Close checkout form and show success message
      setCheckoutLoading(false);
      setShowCheckoutForm(false);
      
      // Clear cart in Redux
      dispatch(clearCart());
      
      // Show success toast
      toast.success('Payment successful! Your order has been placed.');
      
      // Redirect to orders page after delay
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
      
    } catch (err) {
      setCheckoutLoading(false);
      console.error('Payment verification error:', err);
      
      // Add more detailed error logging
      if (err.response) {
        console.error('Error response status:', err.response.status);
        console.error('Error response data:', err.response.data);
      }
      
      // Show a more user-friendly error message and offer manual checkout
      toast.error('Payment verification failed. You can try our alternative checkout method.');
      
      // Show manual checkout option with highlighted styling
      const manualCheckoutBtn = document.querySelector('.manual-checkout-btn');
      if (manualCheckoutBtn) {
        manualCheckoutBtn.style.backgroundColor = '#ff6b6b';
        manualCheckoutBtn.style.color = 'white';
        manualCheckoutBtn.style.borderColor = '#ff6b6b';
        manualCheckoutBtn.style.animation = 'pulse 1.5s infinite';
      }
    }
  };

  // Function to handle manual checkout
  const handleManualCheckout = async () => {
    if (!validateShippingInfo()) {
      toast.error('Please fill all the required shipping information');
      return;
    }

    try {
      setCheckoutLoading(true);
      
      console.log('Sending manual checkout with shipping info:', shippingInfo);
      
      // Create a manual order
      const response = await axios.post('/api/cart/checkout', {
        shippingAddress: {
          name: shippingInfo.name,
          phone: shippingInfo.phone,
          street: shippingInfo.street,
          city: shippingInfo.city,
          state: shippingInfo.state,
          zipCode: shippingInfo.zipCode
        }
      });
      
      console.log('Manual checkout response:', response.data);
      
      // Clear cart in Redux
      dispatch(clearCart());
      
      // Clear cart and show success message
      setShowCheckoutForm(false);
      toast.success('Order placed successfully!');
      
      // Redirect to orders page after a short delay
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    } catch (err) {
      console.error('Manual checkout error:', err);
      
      // Show more detailed error information
      if (err.response) {
        console.error('Error response:', err.response.data);
        toast.error('Failed to place order: ' + (err.response?.data?.message || 'Server error'));
      } else if (err.request) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error('Failed to place order: ' + err.message);
      }
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Modified cart item render to include stock info
  const renderCartItem = (item) => (
    <div className="cart-item" key={item.id}>
      <div className="cart-item-image">
        <img 
          src={item.product.imageUrl} 
          alt={item.product.name} 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://placehold.co/300x200/333/FFF?text=${encodeURIComponent(item.product.name)}`;
          }}
        />
      </div>
      <div className="cart-item-details">
        <h3>
          <Link to={`/product/${item.productId}`}>{item.product.name}</Link>
        </h3>
        <p className="cart-item-price">₹{item.product.price !== undefined ? item.product.price.toFixed(2) : '0.00'}</p>
        
        {item.stock <= 0 && (
          <p className="out-of-stock-warning">This item is out of stock</p>
        )}
        
        {item.stock > 0 && item.stock < 5 && (
          <p className="low-stock-warning">Only {item.stock} left in stock</p>
        )}
        
        <div className="cart-item-actions">
          <div className="quantity-selector">
            <button
              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item.stock)}
              disabled={item.quantity <= 1}
            >
              -
            </button>
            <span>{item.quantity}</span>
            <button
              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.stock)}
              disabled={item.stock !== undefined && item.quantity >= item.stock}
            >
              +
            </button>
          </div>
          <button className="remove-item" onClick={() => handleRemoveItem(item.id)}>
            Remove
          </button>
        </div>
        <p className="cart-item-subtotal">
          Subtotal: ₹{item.product.price !== undefined ? (item.product.price * item.quantity).toFixed(2) : '0.00'}
        </p>
      </div>
    </div>
  );

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
            {cartItems.map((item) => renderCartItem(item))}
          </div>
          
          <div className="cart-summary-container tech-card">
            <h3 className="summary-title">Order Summary</h3>
            
            <div className="summary-details">
              <div className="summary-row">
                <span>Items ({cartItems.length}):</span>
                <span>₹{total !== undefined ? total.toFixed(2) : '0.00'}</span>
              </div>
              
              <div className="summary-row">
                <span>Shipping & Handling:</span>
                <span>₹0.00</span>
              </div>
              
              <div className="summary-divider"></div>
              
              <div className="summary-row total">
                <span>Order Total:</span>
                <span className="total-price">₹{total !== undefined ? total.toFixed(2) : '0.00'}</span>
              </div>
            </div>
            
            <button 
              className={`checkout-btn ${checkoutLoading ? 'loading' : ''}`}
              onClick={handleProceedToCheckout}
              disabled={checkoutLoading || cartItems.length === 0}
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

      {/* Checkout Form Modal */}
      {showCheckoutForm && (
        <div className="checkout-modal-overlay">
          <div className="checkout-modal tech-card">
            <button className="close-modal" onClick={closeCheckoutForm}>×</button>
            <h2 className="checkout-title">Complete Your Order</h2>
            
            <form className="checkout-form">
              {/* Shipping Information */}
              <h3 className="section-title">Shipping Details</h3>
              
              <div className="form-group">
                <label htmlFor="name">Full Name*</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={shippingInfo.name} 
                  onChange={handleShippingInfoChange} 
                  required 
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone*</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    value={shippingInfo.phone} 
                    onChange={handleShippingInfoChange} 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="zipCode">Postal Code*</label>
                  <input 
                    type="text" 
                    id="zipCode" 
                    name="zipCode" 
                    value={shippingInfo.zipCode} 
                    onChange={handleShippingInfoChange} 
                    required 
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="street">Street Address*</label>
                <input 
                  type="text" 
                  id="street" 
                  name="street" 
                  value={shippingInfo.street} 
                  onChange={handleShippingInfoChange} 
                  required 
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City*</label>
                  <input 
                    type="text" 
                    id="city" 
                    name="city" 
                    value={shippingInfo.city} 
                    onChange={handleShippingInfoChange} 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="state">State*</label>
                  <input 
                    type="text" 
                    id="state" 
                    name="state" 
                    value={shippingInfo.state} 
                    onChange={handleShippingInfoChange} 
                    required 
                  />
                </div>
              </div>
              
              {/* Payment Section */}
              <div className="payment-section">
                <h3 className="section-title">Payment</h3>
                <div className="order-total">
                  Total: <span className="order-amount">₹{total !== undefined ? total.toFixed(2) : '0.00'}</span>
                </div>
                
                <div className="razorpay-info">
                  <p>Secure payment powered by</p>
                  <img 
                    src="https://razorpay.com/assets/razorpay-logo-white.svg" 
                    alt="Razorpay" 
                    className="razorpay-logo"
                  />
                </div>
                
                <button 
                  type="button" 
                  className="pay-now-btn" 
                  onClick={initRazorpay}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? (
                    <>
                      <div className="spinner"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <line x1="2" y1="10" x2="22" y2="10" />
                      </svg>
                      Pay Now
                    </>
                  )}
                </button>

                {/* Manual checkout option */}
                <div className="manual-checkout">
                  <button 
                    type="button" 
                    className="manual-checkout-btn" 
                    onClick={handleManualCheckout}
                    disabled={checkoutLoading}
                  >
                    Place Order Without Payment
                  </button>
                  <p className="manual-note">
                    * You can pay later using cash on delivery
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
