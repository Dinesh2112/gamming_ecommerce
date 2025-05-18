import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import { Navigate } from 'react-router-dom';
import './Dashboard.css';

const UserManagement = () => {
  const { user } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock user data
  const MOCK_USERS = [
    {
      id: 'user1',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      phone: '+91 9876543210',
      role: 'USER',
      createdAt: '2023-10-05T09:30:00Z',
      lastLogin: '2023-11-18T12:45:00Z',
      address: {
        addressLine1: '123 Vikaspuri',
        addressLine2: 'Near Metro Station',
        city: 'New Delhi',
        state: 'Delhi',
        postalCode: '110018',
        country: 'India'
      },
      orders: [
        {
          id: '1',
          date: '2023-11-15T10:30:00Z',
          totalAmount: 97499.98,
          status: 'delivered',
          items: 2,
          paymentMethod: 'Credit Card'
        },
        {
          id: '6',
          date: '2023-10-22T13:15:00Z',
          totalAmount: 23499.99,
          status: 'delivered',
          items: 3,
          paymentMethod: 'NetBanking'
        }
      ]
    },
    {
      id: 'user2',
      name: 'Priya Patel',
      email: 'priya.patel@example.com',
      phone: '+91 8765432109',
      role: 'USER',
      createdAt: '2023-09-15T14:20:00Z',
      lastLogin: '2023-11-16T09:10:00Z',
      address: {
        addressLine1: '456 Koramangala',
        addressLine2: '4th Block',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560034',
        country: 'India'
      },
      orders: [
        {
          id: '2',
          date: '2023-11-16T09:15:00Z',
          totalAmount: 32999.99,
          status: 'processing',
          items: 1,
          paymentMethod: 'UPI'
        }
      ]
    },
    {
      id: 'user3',
      name: 'Amit Kumar',
      email: 'amit.kumar@example.com',
      phone: '+91 7654321098',
      role: 'USER',
      createdAt: '2023-08-22T11:05:00Z',
      lastLogin: '2023-11-17T14:15:00Z',
      address: {
        addressLine1: '789 Salt Lake',
        addressLine2: 'Sector 5',
        city: 'Kolkata',
        state: 'West Bengal',
        postalCode: '700091',
        country: 'India'
      },
      orders: [
        {
          id: '3',
          date: '2023-11-17T14:20:00Z',
          totalAmount: 14499.97,
          status: 'shipped',
          items: 3,
          paymentMethod: 'NetBanking'
        },
        {
          id: '7',
          date: '2023-09-30T10:45:00Z',
          totalAmount: 8999.99,
          status: 'delivered',
          items: 1,
          paymentMethod: 'Credit Card'
        }
      ]
    },
    {
      id: 'user4',
      name: 'Neha Singh',
      email: 'neha.singh@example.com',
      phone: '+91 6543210987',
      role: 'USER',
      createdAt: '2023-11-01T16:40:00Z',
      lastLogin: '2023-11-18T16:40:00Z',
      address: {
        addressLine1: '101 Aundh',
        addressLine2: '',
        city: 'Pune',
        state: 'Maharashtra',
        postalCode: '411007',
        country: 'India'
      },
      orders: [
        {
          id: '4',
          date: '2023-11-18T16:45:00Z',
          totalAmount: 69499.98,
          status: 'pending',
          items: 2,
          paymentMethod: 'Cash on Delivery'
        }
      ]
    },
    {
      id: 'user5',
      name: 'Vikram Reddy',
      email: 'vikram.reddy@example.com',
      phone: '+91 5432109876',
      role: 'USER',
      createdAt: '2023-07-17T09:15:00Z',
      lastLogin: '2023-11-14T11:25:00Z',
      address: {
        addressLine1: '202 Jubilee Hills',
        addressLine2: 'Road No. 5',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500033',
        country: 'India'
      },
      orders: [
        {
          id: '5',
          date: '2023-11-14T11:30:00Z',
          totalAmount: 34999.99,
          status: 'delivered',
          items: 1,
          paymentMethod: 'Debit Card'
        }
      ]
    },
    {
      id: 'user6',
      name: 'Ananya Gupta',
      email: 'ananya.gupta@example.com',
      phone: '+91 4321098765',
      role: 'USER',
      createdAt: '2023-06-10T13:50:00Z',
      lastLogin: '2023-11-10T15:30:00Z',
      address: {
        addressLine1: '303 Civil Lines',
        addressLine2: '',
        city: 'Jaipur',
        state: 'Rajasthan',
        postalCode: '302006',
        country: 'India'
      },
      orders: [
        {
          id: '8',
          date: '2023-11-10T15:35:00Z',
          totalAmount: 12999.99,
          status: 'delivered',
          items: 2,
          paymentMethod: 'UPI'
        },
        {
          id: '9',
          date: '2023-08-15T11:20:00Z',
          totalAmount: 7499.99,
          status: 'delivered',
          items: 1,
          paymentMethod: 'Debit Card'
        }
      ]
    },
    {
      id: 'user7',
      name: 'Dinesh Rajan',
      email: 'dineshrajan2112@gmail.com',
      phone: '+91 9876543210',
      role: 'ADMIN',
      createdAt: '2023-05-01T10:00:00Z',
      lastLogin: '2023-11-18T09:00:00Z',
      address: {
        addressLine1: 'Admin Office',
        addressLine2: 'Tech Park',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560103',
        country: 'India'
      },
      orders: []
    }
  ];

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      try {
        // Use the full backend URL from environment variables
        const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${backendUrl}/api/admin/users`, {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          },
          signal: AbortSignal.timeout(5000)
        });
        
        // Check content type for proper error handling
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          // We can safely parse JSON
          const data = await response.json();
          
          if (response.ok) {
            console.log('Successfully fetched users:', data.length);
            setUsers(data);
            setApiAvailable(true);
            return; // Exit early on success
          } else {
            throw new Error(data.message || 'Failed to fetch users');
          }
        } else {
          // Not JSON response, API might be unavailable
          throw new Error('Backend API returned non-JSON response');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setError(`${error.message}. Using mock data instead.`);
        // Fall back to mock data
        fallbackToMockData();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback to using mock data
  const fallbackToMockData = () => {
    console.log('Using mock user data');
    setApiAvailable(false);
    setUsers(MOCK_USERS);
  };

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchUsers();
    }
  }, [user]);

  // Handle user details view
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // Close user details modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
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

  // Filter users based on search query
  const getFilteredUsers = () => {
    if (!searchQuery.trim()) {
      return users;
    }
    const query = searchQuery.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(query) || 
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query) ||
      (user.address && user.address.city && user.address.city.toLowerCase().includes(query))
    );
  };

  // Calculate total spent by user
  const calculateTotalSpent = (userOrders) => {
    if (!userOrders || userOrders.length === 0) {
      return 0;
    }
    return userOrders.reduce((total, order) => total + order.totalAmount, 0);
  };

  // Calculate user statistics
  const getUserStats = () => {
    return {
      total: users.length,
      regular: users.filter(u => u.role === 'USER').length,
      admin: users.filter(u => u.role === 'ADMIN').length,
      newThisMonth: users.filter(u => {
        const createdDate = new Date(u.createdAt);
        const currentDate = new Date();
        return createdDate.getMonth() === currentDate.getMonth() &&
               createdDate.getFullYear() === currentDate.getFullYear();
      }).length,
      activeThisWeek: users.filter(u => {
        const lastLogin = new Date(u.lastLogin);
        const currentDate = new Date();
        const oneWeekAgo = new Date(currentDate.setDate(currentDate.getDate() - 7));
        return lastLogin >= oneWeekAgo;
      }).length
    };
  };

  // Redirect if not admin
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  // Get filtered users and stats
  const filteredUsers = getFilteredUsers();
  const userStats = getUserStats();

  return (
    <div className="user-management">
      <div className="management-header">
        <h1>User Management</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search users by name, email, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button 
            className="refresh-btn" 
            onClick={fetchUsers}
          >
            Refresh
          </button>
        </div>
      </div>

      {!apiAvailable && (
        <div className="api-notice">
          <p>
            <strong>Note:</strong> Backend API for user management is not available. 
            Showing mock data for development purposes.
          </p>
        </div>
      )}

      {error && (
        <div className="management-error">
          <p>{error}</p>
          <button onClick={fetchUsers} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      <div className="user-statistics">
        <div className="stat-card">
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-value">{userStats.total}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-content">
            <h3>Regular Users</h3>
            <p className="stat-value">{userStats.regular}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-content">
            <h3>Admins</h3>
            <p className="stat-value">{userStats.admin}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-content">
            <h3>New This Month</h3>
            <p className="stat-value">{userStats.newThisMonth}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-content">
            <h3>Active This Week</h3>
            <p className="stat-value">{userStats.activeThisWeek}</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-spinner">Loading users...</div>
      ) : (
        <div className="users-table-container">
          {filteredUsers.length === 0 ? (
            <p className="no-users">No users found matching your search.</p>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Last Login</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className={user.role === 'ADMIN' ? 'admin-user' : ''}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>{formatDate(user.lastLogin)}</td>
                    <td>{user.orders ? user.orders.length : 0}</td>
                    <td>
                      ₹{calculateTotalSpent(user.orders).toLocaleString('en-IN')}
                    </td>
                    <td className="action-buttons">
                      <button 
                        className="view-btn"
                        onClick={() => handleViewUser(user)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* User Details Modal */}
      {isModalOpen && selectedUser && (
        <div className="modal-overlay">
          <div className="user-details-modal">
            <div className="modal-header">
              <h2>User Details</h2>
              <button className="close-modal-btn" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-content">
              <div className="user-info-section">
                <div className="user-profile-header">
                  <div className="user-avatar">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-identity">
                    <h3>{selectedUser.name}</h3>
                    <p className="user-email">{selectedUser.email}</p>
                    <span className={`role-badge ${selectedUser.role.toLowerCase()}`}>
                      {selectedUser.role}
                    </span>
                  </div>
                </div>

                <div className="user-details-grid">
                  <div className="user-details-section">
                    <h3>Contact Information</h3>
                    <div className="detail-row">
                      <span className="label">Phone:</span>
                      <span>{selectedUser.phone}</span>
                    </div>
                    {selectedUser.address && (
                      <>
                        <div className="detail-row">
                          <span className="label">Address:</span>
                          <span>{selectedUser.address.addressLine1}</span>
                        </div>
                        {selectedUser.address.addressLine2 && (
                          <div className="detail-row">
                            <span className="label"></span>
                            <span>{selectedUser.address.addressLine2}</span>
                          </div>
                        )}
                        <div className="detail-row">
                          <span className="label">City:</span>
                          <span>{selectedUser.address.city}, {selectedUser.address.state}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Postal Code:</span>
                          <span>{selectedUser.address.postalCode}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Country:</span>
                          <span>{selectedUser.address.country}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="user-details-section">
                    <h3>Account Information</h3>
                    <div className="detail-row">
                      <span className="label">Joined:</span>
                      <span>{formatDate(selectedUser.createdAt)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Last Login:</span>
                      <span>{formatDate(selectedUser.lastLogin)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Total Orders:</span>
                      <span>{selectedUser.orders ? selectedUser.orders.length : 0}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Total Spent:</span>
                      <span>₹{calculateTotalSpent(selectedUser.orders).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="user-orders-section">
                  <h3>Order History</h3>
                  {selectedUser.orders && selectedUser.orders.length > 0 ? (
                    <table className="orders-history-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Date</th>
                          <th>Items</th>
                          <th>Total</th>
                          <th>Payment Method</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedUser.orders.map((order) => (
                          <tr key={order.id}>
                            <td>#{order.id}</td>
                            <td>{formatDate(order.date)}</td>
                            <td>{order.items}</td>
                            <td>₹{order.totalAmount.toLocaleString('en-IN')}</td>
                            <td>{order.paymentMethod}</td>
                            <td>
                              <span className={`status-badge status-${order.status.toLowerCase()}`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="no-orders">No order history found for this user.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 