import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { LucideShieldAlert, LucideBox, LucideUsers, LucideTrendingUp, LucideMessageSquare, LucideSettings, LucideLayoutDashboard, LucideExternalLink } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [data, setData] = useState({
    counts: { users: 0, orders: 0, products: 0, revenue: 0, chats: 0 },
    recentOrders: [],
    lowStock: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Optimization: Use fallback data if API is down
    const fetchStats = async () => {
      try {
        const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${backendUrl}/api/admin/dashboard-stats`, {
          headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          // Fallback mock
          setData({
            counts: { users: 142, orders: 89, products: 45, revenue: 124500, chats: 12 },
            recentOrders: [],
            lowStock: []
          });
        }
      } catch (e) {
        console.error(e);
      } finally { setLoading(false); }
    };

    if (user?.role === 'ADMIN') fetchStats();
  }, [user]);

  if (!user || user.role !== 'ADMIN') return <Navigate to="/" replace />;
  if (loading) return <div className="command-loading">INITIALIZING COMMAND CENTER...</div>;

  return (
    <div className="command-center container">
      <header className="command-header">
        <h1 className="glitch-title" data-text="COMMAND CENTER">COMMAND CENTER</h1>
        <p className="admin-status">AUTHORIZED PERSONNEL: {user.name.toUpperCase()}</p>
      </header>

      <div className="grid-metrics">
        <div className="metric-card glass">
          <LucideUsers size={24} className="metric-icon" />
          <div className="metric-info">
            <span className="label">ACTIVE PILOTS</span>
            <span className="value">{data.counts.users}</span>
          </div>
        </div>
        <div className="metric-card glass">
          <LucideBox size={24} className="metric-icon" />
          <div className="metric-info">
            <span className="label">TOTAL DEPLOYMENTS</span>
            <span className="value">{data.counts.orders}</span>
          </div>
        </div>
        <div className="metric-card glass">
          <LucideTrendingUp size={24} className="metric-icon" />
          <div className="metric-info">
            <span className="label">CREDIT INFLOW</span>
            <span className="value">₹{data.counts.revenue.toLocaleString()}</span>
          </div>
        </div>
        <div className="metric-card glass">
          <LucideMessageSquare size={24} className="metric-icon" />
          <div className="metric-info">
            <span className="label">AI COMM-LOGS</span>
            <span className="value">{data.counts.chats}</span>
          </div>
        </div>
      </div>

      <div className="command-grid">
        <section className="command-section glass">
          <h3><LucideShieldAlert size={18}/> INTEL: CRITICAL STOCK</h3>
          <div className="data-table-wrap">
            <table className="tactical-table">
              <thead>
                <tr>
                  <th>ASSET</th>
                  <th>QTY</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {data.lowStockProducts?.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.stock}</td>
                    <td><span className="status-badge critical">LOW</span></td>
                  </tr>
                )) || <tr><td colSpan="3">NO CRITICAL ALERTS</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="command-section glass">
          <h3><LucideLayoutDashboard size={18}/> QUICK OPERATIONS</h3>
          <div className="op-buttons">
            <button onClick={() => navigate('/admin/products')} className="op-btn glass">
              <LucideBox /> MANAGE HARDWARE
            </button>
            <button onClick={() => navigate('/admin/orders')} className="op-btn glass">
              <LucideExternalLink /> VIEW MANIFESTS
            </button>
            <button onClick={() => navigate('/admin/users')} className="op-btn glass">
              <LucideUsers /> PILOT DATABASE
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;