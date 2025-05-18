import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import { Navigate } from 'react-router-dom';
import './Dashboard.css';

const OrderManagement = () => {
  const { user } = useContext(UserContext);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock order data
  const MOCK_ORDERS = [
    {
      id: '1',
      user: {
        id: 'user1',
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        phone: '+91 9876543210'
      },
      products: [
        {
          id: 'prod1',
          name: 'Gaming Laptop XR5000',
          price: 89999.99,
          quantity: 1,
          imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302'
        },
        {
          id: 'prod2',
          name: 'Mechanical Gaming Keyboard',
          price: 7499.99,
          quantity: 1,
          imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef'
        }
      ],
      totalAmount: 97499.98,
      status: 'delivered',
      paymentMethod: 'Credit Card',
      paymentStatus: 'paid',
      createdAt: '2023-11-15T10:30:00Z',
      updatedAt: '2023-11-18T14:45:00Z',
      shippingAddress: {
        addressLine1: '123 Vikaspuri',
        addressLine2: 'Near Metro Station',
        city: 'New Delhi',
        state: 'Delhi',
        postalCode: '110018',
        country: 'India'
      },
      trackingNumber: 'IND12345678901',
      deliveryNotes: 'Please leave at the reception if not at home'
    },
    {
      id: '2',
      user: {
        id: 'user2',
        name: 'Priya Patel',
        email: 'priya.patel@example.com',
        phone: '+91 8765432109'
      },
      products: [
        {
          id: 'prod3',
          name: 'Ultra-wide Gaming Monitor',
          price: 32999.99,
          quantity: 1,
          imageUrl: 'https://images.unsplash.com/photo-1616711906332-ec2e698b2663'
        }
      ],
      totalAmount: 32999.99,
      status: 'processing',
      paymentMethod: 'UPI',
      paymentStatus: 'paid',
      createdAt: '2023-11-16T09:15:00Z',
      updatedAt: '2023-11-16T09:15:00Z',
      shippingAddress: {
        addressLine1: '456 Koramangala',
        addressLine2: '4th Block',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560034',
        country: 'India'
      },
      trackingNumber: null,
      deliveryNotes: 'Call before delivery'
    },
    {
      id: '3',
      user: {
        id: 'user3',
        name: 'Amit Kumar',
        email: 'amit.kumar@example.com',
        phone: '+91 7654321098'
      },
      products: [
        {
          id: 'prod4',
          name: 'Pro Gaming Headset X7',
          price: 6499.99,
          quantity: 1,
          imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df'
        },
        {
          id: 'prod6',
          name: 'Pro Wireless Gaming Mouse',
          price: 3999.99,
          quantity: 2,
          imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7'
        }
      ],
      totalAmount: 14499.97,
      status: 'shipped',
      paymentMethod: 'NetBanking',
      paymentStatus: 'paid',
      createdAt: '2023-11-17T14:20:00Z',
      updatedAt: '2023-11-18T11:30:00Z',
      shippingAddress: {
        addressLine1: '789 Salt Lake',
        addressLine2: 'Sector 5',
        city: 'Kolkata',
        state: 'West Bengal',
        postalCode: '700091',
        country: 'India'
      },
      trackingNumber: 'IND98765432101',
      deliveryNotes: ''
    },
    {
      id: '4',
      user: {
        id: 'user4',
        name: 'Neha Singh',
        email: 'neha.singh@example.com',
        phone: '+91 6543210987'
      },
      products: [
        {
          id: 'prod5',
          name: 'NextGen Gaming Console',
          price: 49999.99,
          quantity: 1,
          imageUrl: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e'
        },
        {
          id: 'prod7',
          name: 'Premium Gaming Chair',
          price: 19499.99,
          quantity: 1,
          imageUrl: 'https://images.unsplash.com/photo-1666041866460-c9c55d8549c9'
        }
      ],
      totalAmount: 69499.98,
      status: 'pending',
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'pending',
      createdAt: '2023-11-18T16:45:00Z',
      updatedAt: '2023-11-18T16:45:00Z',
      shippingAddress: {
        addressLine1: '101 Aundh',
        addressLine2: '',
        city: 'Pune',
        state: 'Maharashtra',
        postalCode: '411007',
        country: 'India'
      },
      trackingNumber: null,
      deliveryNotes: 'Weekend delivery preferred'
    },
    {
      id: '5',
      user: {
        id: 'user5',
        name: 'Vikram Reddy',
        email: 'vikram.reddy@example.com',
        phone: '+91 5432109876'
      },
      products: [
        {
          id: 'prod8',
          name: 'VR Headset Pro X',
          price: 34999.99,
          quantity: 1,
          imageUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac'
        }
      ],
      totalAmount: 34999.99,
      status: 'delivered',
      paymentMethod: 'Debit Card',
      paymentStatus: 'paid',
      createdAt: '2023-11-14T11:30:00Z',
      updatedAt: '2023-11-16T18:20:00Z',
      shippingAddress: {
        addressLine1: '202 Jubilee Hills',
        addressLine2: 'Road No. 5',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500033',
        country: 'India'
      },
      trackingNumber: 'IND45678901234',
      deliveryNotes: ''
    }
  ];

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      try {
        const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${backendUrl}/api/admin/orders`, {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          },
          signal: AbortSignal.timeout(5000)
        });
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          
          if (response.ok) {
            console.log('Successfully fetched orders:', data);
            setOrders(data);
            setApiAvailable(true);
            return;
          } else {
            throw new Error(data.message || 'Failed to fetch orders');
          }
        } else {
          throw new Error('Backend API returned non-JSON response');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError(`${error.message}. Using mock data instead.`);
        fallbackToMockData();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback to mock data
  const fallbackToMockData = () => {
    console.log('Using mock order data');
    setApiAvailable(false);
    setOrders(MOCK_ORDERS);
  };

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchOrders();
    }
  }, [user]);

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    if (!apiAvailable) {
      // Update in mock data
      const updatedOrders = orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      
      // If we're updating the currently selected order
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      return;
    }
    
    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({ status: newStatus }),
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        // Refresh orders after update
        fetchOrders();
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setError(`${error.message}. Falling back to mock data.`);
      setApiAvailable(false);
      
      // Update in mock data
      const updatedOrders = orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
    }
  };

  // Handle viewing order details
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Close order details modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Filter orders based on status
  const getFilteredOrders = () => {
    if (filterStatus === 'all') {
      return orders;
    }
    return orders.filter(order => order.status === filterStatus);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  // Get status badge class
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'status-delivered';
      case 'shipped': return 'status-shipped';
      case 'processing': return 'status-processing';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      case 'refunded': return 'status-refunded';
      default: return '';
    }
  };

  // Calculate order statistics
  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      delivered: orders.filter(order => order.status === 'delivered').length,
      processing: orders.filter(order => order.status === 'processing').length,
      pending: orders.filter(order => order.status === 'pending').length,
      shipped: orders.filter(order => order.status === 'shipped').length,
      cancelled: orders.filter(order => order.status === 'cancelled').length,
      refunded: orders.filter(order => order.status === 'refunded').length,
    };
    
    // Calculate total revenue
    stats.totalRevenue = orders.reduce((total, order) => {
      if (order.paymentStatus === 'paid') {
        return total + order.totalAmount;
      }
      return total;
    }, 0);
    
    return stats;
  };

  // Redirect if not admin
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  const orderStats = getOrderStats();
  const filteredOrders = getFilteredOrders();

  return (
    <div className="order-management">
      <div className="management-header">
        <h1>Order Management</h1>
        <div className="order-filters">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
          <button 
            className="refresh-btn" 
            onClick={fetchOrders}
          >
            Refresh
          </button>
        </div>
      </div>

      {!apiAvailable && (
        <div className="api-notice">
          <p>
            <strong>Note:</strong> Backend API for order management is not available. 
            Showing mock data for development purposes.
          </p>
        </div>
      )}

      {error && (
        <div className="management-error">
          <p>{error}</p>
          <button onClick={fetchOrders} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      <div className="order-statistics">
        <div className="stat-card">
          <div className="stat-content">
            <h3>Total Orders</h3>
            <p className="stat-value">{orderStats.total}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-value">₹{orderStats.totalRevenue.toLocaleString('en-IN')}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-content">
            <h3>Delivered</h3>
            <p className="stat-value">{orderStats.delivered}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-content">
            <h3>Processing</h3>
            <p className="stat-value">{orderStats.processing}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-content">
            <h3>Pending</h3>
            <p className="stat-value">{orderStats.pending}</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-spinner">Loading orders...</div>
      ) : (
        <div className="orders-table-container">
          {filteredOrders.length === 0 ? (
            <p className="no-orders">No orders found matching the selected filter.</p>
          ) : (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>
                      <div className="customer-info">
                        <div className="customer-name">{order.user.name}</div>
                        <div className="customer-email">{order.user.email}</div>
                      </div>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>₹{order.totalAmount.toLocaleString('en-IN')}</td>
                    <td>
                      <div className="payment-info">
                        <div>{order.paymentMethod}</div>
                        <span className={`payment-status ${order.paymentStatus}`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button 
                        className="view-btn" 
                        onClick={() => handleViewOrder(order)}
                      >
                        View Details
                      </button>
                      <select 
                        value={order.status} 
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="status-update"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="modal-overlay">
          <div className="order-details-modal">
            <div className="modal-header">
              <h2>Order Details - #{selectedOrder.id}</h2>
              <button className="close-modal-btn" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-content">
              <div className="order-summary">
                <div className="order-status-section">
                  <div className="order-date">
                    <strong>Order Date:</strong> {formatDate(selectedOrder.createdAt)}
                  </div>
                  <div className="order-status">
                    <strong>Status:</strong> 
                    <span className={`status-badge ${getStatusClass(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>

                <div className="order-details-sections">
                  <div className="order-details-section">
                    <h3>Customer Information</h3>
                    <div className="detail-row">
                      <span>Name:</span>
                      <span>{selectedOrder.user.name}</span>
                    </div>
                    <div className="detail-row">
                      <span>Email:</span>
                      <span>{selectedOrder.user.email}</span>
                    </div>
                    <div className="detail-row">
                      <span>Phone:</span>
                      <span>{selectedOrder.user.phone}</span>
                    </div>
                  </div>

                  <div className="order-details-section">
                    <h3>Shipping Address</h3>
                    <div className="address-details">
                      <p>{selectedOrder.shippingAddress.addressLine1}</p>
                      {selectedOrder.shippingAddress.addressLine2 && (
                        <p>{selectedOrder.shippingAddress.addressLine2}</p>
                      )}
                      <p>
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                      </p>
                      <p>{selectedOrder.shippingAddress.country}</p>
                    </div>
                    {selectedOrder.deliveryNotes && (
                      <div className="delivery-notes">
                        <strong>Delivery Notes:</strong> {selectedOrder.deliveryNotes}
                      </div>
                    )}
                    {selectedOrder.trackingNumber && (
                      <div className="tracking-number">
                        <strong>Tracking Number:</strong> {selectedOrder.trackingNumber}
                      </div>
                    )}
                  </div>

                  <div className="order-details-section">
                    <h3>Payment Information</h3>
                    <div className="detail-row">
                      <span>Payment Method:</span>
                      <span>{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="detail-row">
                      <span>Payment Status:</span>
                      <span className={`payment-status ${selectedOrder.paymentStatus}`}>
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span>Total Amount:</span>
                      <span className="total-amount">₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="order-products">
                  <h3>Ordered Products</h3>
                  <table className="products-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.products.map((product) => (
                        <tr key={product.id}>
                          <td className="product-cell">
                            <div className="product-info">
                              <img 
                                src={product.imageUrl} 
                                alt={product.name} 
                                className="product-thumbnail" 
                              />
                              <span className="product-name">{product.name}</span>
                            </div>
                          </td>
                          <td>₹{product.price.toLocaleString('en-IN')}</td>
                          <td>{product.quantity}</td>
                          <td>₹{(product.price * product.quantity).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="order-total">
                        <td colSpan="3" className="total-label">Total:</td>
                        <td className="total-value">₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="order-actions">
                  <h3>Update Order Status</h3>
                  <div className="status-update-section">
                    <select 
                      value={selectedOrder.status} 
                      onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                      className="status-update-dropdown"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="refunded">Refunded</option>
                    </select>
                    <button className="update-status-btn">Update Status</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement; 