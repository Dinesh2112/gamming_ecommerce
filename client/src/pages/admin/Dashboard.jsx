import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import { Navigate, useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    counts: {
      users: 0,
      orders: 0,
      products: 0,
      revenue: 0,
      chats: 0
    },
    categoryDistribution: [],
    recentOrders: [],
    lowStockProducts: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiAvailable, setApiAvailable] = useState(true);

  useEffect(() => {
    // Fetch admin dashboard statistics
    const fetchDashboardStats = async () => {
      try {
        console.log("Current user state:", JSON.stringify(user));
        console.log("User role:", user?.role);
        console.log("Is user admin?", user?.role === 'ADMIN');
        
        // Debug token content
        const token = localStorage.getItem('token');
        if (token) {
          try {
            // Decode and log token payload
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            console.log("Token payload:", tokenPayload);
            console.log("Token contains role?", !!tokenPayload.role);
            console.log("Role in token:", tokenPayload.role);
            console.log("Role is ADMIN in token?", tokenPayload.role === 'ADMIN');
            
            // Update token with correct role if needed
            if (tokenPayload.role === 'admin' && user?.role === 'ADMIN') {
              console.log("Token contains lowercase 'admin' but user has 'ADMIN'. This might cause auth issues.");
            }
          } catch (error) {
            console.error("Error decoding token:", error);
          }
        } else {
          console.log("No token found in localStorage");
        }

        setIsLoading(true);
        setError(null);

        try {
          // Set a timeout to prevent hanging requests
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          // Use the full URL for the API request
          const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const url = `${backendUrl}/api/admin/dashboard-stats`;
          
          console.log("Fetching from URL:", url);
          
          // Create headers with the token
          const headers = {
            'Content-Type': 'application/json',
            'x-auth-token': token
          };
          
          console.log("Request headers:", headers);
          
          const response = await fetch(url, {
            method: 'GET',
            headers,
            signal: controller.signal,
            credentials: 'include' // Include cookies if any
          });
          
          clearTimeout(timeoutId);
          
          console.log("Response status:", response.status);
          console.log("Response headers:", Object.fromEntries([...response.headers]));

          // Check if response is JSON
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();

            if (response.ok) {
              console.log('Successfully fetched dashboard stats:', data);
              setDashboardData(data);
              setApiAvailable(true);
            } else {
              setError(data.message || 'Failed to fetch dashboard statistics');
              console.error('Error fetching dashboard stats:', data.message);
              fallbackToMockData();
            }
          } else {
            // Backend API not available yet, use mock data
            console.log('Backend API not available, using mock data');
            fallbackToMockData();
          }
        } catch (error) {
          // Network or parsing error - use mock data
          console.error('Error fetching dashboard stats:', error);
          fallbackToMockData();
        }
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 800);
      }
    };

    const fallbackToMockData = () => {
      setApiAvailable(false);
      setDashboardData({
        counts: {
          users: 156,
          orders: 234,
          products: 45,
          revenue: 23450,
          chats: 78
        },
        categoryDistribution: [
          { name: 'Laptops', count: 12 },
          { name: 'Keyboards', count: 8 },
          { name: 'Mice', count: 10 },
          { name: 'Monitors', count: 7 },
          { name: 'Headsets', count: 8 }
        ],
        recentOrders: [
          { id: 1, customerName: 'John Doe', totalAmount: 1299.99, status: 'completed', date: new Date().toISOString() },
          { id: 2, customerName: 'Jane Smith', totalAmount: 499.99, status: 'processing', date: new Date().toISOString() },
          { id: 3, customerName: 'Bob Johnson', totalAmount: 149.99, status: 'pending', date: new Date().toISOString() }
        ],
        lowStockProducts: [
          { id: 1, name: 'Gaming Laptop XR5000', stock: 3, category: { name: 'Laptops' } },
          { id: 5, name: 'NextGen Gaming Console', stock: 2, category: { name: 'Consoles' } },
          { id: 8, name: 'VR Headset Pro X', stock: 4, category: { name: 'VR' } }
        ]
      });
    };

    if (user && user.role === 'ADMIN') {
      fetchDashboardStats();
    }
  }, [user]);

  // Navigate to product management
  const handleNavigateToProducts = () => {
    navigate('/admin/products');
  };

  // Navigate to order management
  const handleNavigateToOrders = () => {
    navigate('/admin/orders');
  };

  // Navigate to user management
  const handleNavigateToUsers = () => {
    navigate('/admin/users');
  };

  // Navigate to settings
  const handleNavigateToSettings = () => {
    navigate('/admin/settings');
  };

  // Redirect if not admin
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {user?.name}</p>
      </div>

      {!apiAvailable && (
        <div className="api-notice">
          <p>
            <strong>Note:</strong> Backend API for dashboard statistics is not available yet.
            Showing mock data for development purposes.
          </p>
        </div>
      )}

      {error && (
        <div className="dashboard-error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="dashboard-loading">Loading dashboard data...</div>
      ) : (
        <>
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-icon">👤</div>
              <div className="stat-content">
                <h3>Total Users</h3>
                <p className="stat-value">{dashboardData.counts.users}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <h3>Total Orders</h3>
                <p className="stat-value">{dashboardData.counts.orders}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🛒</div>
              <div className="stat-content">
                <h3>Products</h3>
                <p className="stat-value">{dashboardData.counts.products}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>Revenue</h3>
                <p className="stat-value">₹{dashboardData.counts.revenue.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">💬</div>
              <div className="stat-content">
                <h3>AI Chats</h3>
                <p className="stat-value">{dashboardData.counts.chats}</p>
              </div>
            </div>
          </div>

          <div className="dashboard-secondary">
            <div className="dashboard-section recent-orders">
              <h2>Recent Orders</h2>
              {dashboardData.recentOrders.length > 0 ? (
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.customerName}</td>
                        <td>₹{order.totalAmount.toFixed(2)}</td>
                        <td>
                          <span className={`status status-${order.status.toLowerCase()}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>{new Date(order.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-data">No recent orders found</p>
              )}
            </div>
            
            <div className="dashboard-section low-stock">
              <h2>Low Stock Products</h2>
              {dashboardData.lowStockProducts.length > 0 ? (
                <table className="low-stock-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.lowStockProducts.map((product) => (
                      <tr key={product.id}>
                        <td>{product.name}</td>
                        <td>{product.category.name}</td>
                        <td>
                          <span className={`stock-level ${product.stock <= 5 ? 'critical' : 'warning'}`}>
                            {product.stock}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-data">No low stock products</p>
              )}
            </div>
          </div>

          <div className="dashboard-actions">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
              <button
                className="action-button products-btn"
                onClick={handleNavigateToProducts}
              >
                <span className="action-icon">📋</span>
                <span>Manage Products</span>
              </button>
              <button
                className="action-button orders-btn"
                onClick={handleNavigateToOrders}
              >
                <span className="action-icon">🚚</span>
                <span>View Orders</span>
              </button>
              <button
                className="action-button users-btn"
                onClick={handleNavigateToUsers}
              >
                <span className="action-icon">👥</span>
                <span>User Management</span>
              </button>
              <button
                className="action-button settings-btn"
                onClick={handleNavigateToSettings}
              >
                <span className="action-icon">⚙️</span>
                <span>Settings</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard; 