import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronDown, 
  faFileInvoice, 
  faTruck, 
  faBoxOpen, 
  faCreditCard, 
  faMapMarkedAlt,
  faShoppingBag,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import { UserContext } from '../context/UserContext';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({});
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Using axios with interceptor for auth headers and proper error handling
        console.log('Fetching orders for user:', user.id);
        
        const response = await axios.get('/api/orders');
        console.log('Orders data received:', response.data);
        setOrders(response.data);
        setLoading(false);
        
      } catch (err) {
        console.error('Error fetching orders:', err);
        const errorMessage = err.response?.data?.message || 'Failed to fetch orders';
        console.error('Error message:', errorMessage);
        setError(errorMessage);
        
        // Also show any additional error information
        if (err.response?.data?.error) {
          console.error('Additional error details:', err.response.data.error);
        }
        
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const toggleOrderExpand = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return 'status-processing';
      case 'shipped':
        return 'status-shipped';
      case 'delivered':
        return 'status-delivered';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="orders-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="orders-container">
        <div className="login-message">
          <FontAwesomeIcon icon={faShoppingBag} className="message-icon" />
          <h2>Please login to view your orders</h2>
          <p>
            <Link to="/login" className="login-link">Login here</Link> to see your order history
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <Link to="/" className="login-link">Return to Home</Link>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-container">
        <div className="orders-header">
          <h1>My Orders</h1>
          <p>Track and manage your purchases</p>
        </div>
        <div className="no-orders">
          <FontAwesomeIcon icon={faBoxOpen} className="message-icon" />
          <h2>You haven't placed any orders yet</h2>
          <p>Explore our products and place your first order!</p>
          <Link to="/products" className="login-link">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1><FontAwesomeIcon icon={faShoppingBag} className="header-icon" /> My Orders</h1>
        <p>Track and manage your purchases</p>
      </div>

      <div className="orders-list">
        {orders.map((order) => (
          <div className="order-card" key={order.id}>
            <div 
              className="order-header" 
              onClick={() => toggleOrderExpand(order.id)}
            >
              <div className="order-header-content">
                <span className="order-id">
                  <FontAwesomeIcon icon={faCalendarAlt} className="order-icon" /> 
                  Order #{order.id}
                </span>
                <span className="order-date">{formatDate(order.createdAt)}</span>
              </div>
              
              <span className={`order-status ${getStatusClass(order.status || 'processing')}`}>
                {order.status || 'Processing'}
              </span>
              
              <span className="order-total">
                ₹{(order.totalAmount || 0).toFixed(2)}
              </span>
              
              <FontAwesomeIcon 
                icon={faChevronDown} 
                className={`order-toggle ${expandedOrders[order.id] ? 'expanded' : ''}`} 
              />
            </div>

            <div className={`order-details ${expandedOrders[order.id] ? 'expanded' : ''}`}>
              <div className="order-content">
                <div className="order-section">
                  <h3 className="section-title">
                    <FontAwesomeIcon icon={faBoxOpen} className="section-icon" /> 
                    Items
                  </h3>
                  <div className="order-items">
                    {order.items.map((item) => (
                      <div className="order-item" key={item.id}>
                        <img 
                          src={item.product.imageUrl || 'https://placehold.co/300x200/333/FFF?text=Product'} 
                          alt={item.product.name}
                          className="item-image"
                          onError={(e) => {
                            e.target.src = 'https://placehold.co/300x200/333/FFF?text=Product';
                          }}
                        />
                        <div className="item-details">
                          <span className="item-name">{item.product.name}</span>
                          <span className="item-price">Price: ₹{item.price.toFixed(2)}</span>
                          <span className="item-quantity">Quantity: {item.quantity}</span>
                          <span className="item-subtotal">
                            Subtotal: ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="order-section">
                  <h3 className="section-title">
                    <FontAwesomeIcon icon={faMapMarkedAlt} className="section-icon" /> 
                    Shipping Address
                  </h3>
                  <div className="address-info">
                    {order.shippingAddress ? (
                      <>
                        <div className="info-row">
                          <span className="info-label">Name:</span>
                          <span className="info-value">{order.shippingAddress.name}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Address:</span>
                          <span className="info-value">
                            {order.shippingAddress.street}, {order.shippingAddress.city}, 
                            {order.shippingAddress.state} {order.shippingAddress.zipCode}
                          </span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Phone:</span>
                          <span className="info-value">{order.shippingAddress.phone}</span>
                        </div>
                      </>
                    ) : (
                      <p>No shipping address information available</p>
                    )}
                  </div>
                </div>

                <div className="order-section">
                  <h3 className="section-title">
                    <FontAwesomeIcon icon={faCreditCard} className="section-icon" /> 
                    Payment Information
                  </h3>
                  <div className="payment-info">
                    <div className="info-row">
                      <span className="info-label">Payment Method:</span>
                      <span className="info-value">{order.paymentMethod || 'Not specified'}</span>
                    </div>
                    {order.paymentId && (
                      <div className="info-row">
                        <span className="info-label">Payment ID:</span>
                        <span className="info-value">{order.paymentId}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="order-section">
                  <h3 className="section-title">Order Summary</h3>
                  <div className="order-summary">
                    <div className="summary-row">
                      <span className="summary-label">Subtotal:</span>
                      <span className="summary-value">₹{(order.subtotal || 0).toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Shipping:</span>
                      <span className="summary-value">₹{(order.shippingCost || 0).toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Tax:</span>
                      <span className="summary-value">₹{(order.tax || 0).toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Total:</span>
                      <span className="summary-value">₹{(order.totalAmount || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="order-actions">
                  <button className="action-button invoice-button">
                    <FontAwesomeIcon icon={faFileInvoice} />
                    Download Invoice
                  </button>
                  {(order.status === 'shipped' || order.status === 'processing') && (
                    <button className="action-button track-button">
                      <FontAwesomeIcon icon={faTruck} />
                      Track Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;