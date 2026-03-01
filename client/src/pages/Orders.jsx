import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from '../axiosConfig';
import { UserContext } from '../context/UserContext';
import { LucideHistory, LucideChevronDown, LucideChevronUp, LucidePackage, LucideTruck, LucideCheckCircle, LucideShield } from 'lucide-react';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      try {
        const res = await axios.get('/api/orders');
        setOrders(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [user]);

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  if (!user) return <div className="orders-gate container"><h1>UNAUTHORIZED</h1><p>Mission history restricted to verified personnel.</p><Link to="/login" className="neon-btn">LOGIN</Link></div>;
  if (loading) return <div className="mission-loading"><div className="loader"></div></div>;

  return (
    <div className="mission-history container">
      <div className="history-header">
        <h1 className="glitch-title" data-text="MISSION HISTORY">MISSION HISTORY</h1>
        <div className="op-count">{orders.length} COMPLETED OPERATIONS</div>
      </div>

      {orders.length === 0 ? (
        <div className="empty-history glass">
          <LucideHistory size={60} />
          <h3>NO OPERATIONS LOGGED</h3>
          <p>Begin your first deployment to see history here.</p>
          <Link to="/products" className="neon-btn">DEPLOY</Link>
        </div>
      ) : (
        <div className="operations-list">
          {orders.map(op => (
            <div key={op.id} className={`op-card glass-card ${expanded[op.id] ? 'active' : ''}`}>
              <div className="op-header" onClick={() => toggle(op.id)}>
                <div className="op-main-info">
                  <span className="op-id">OP-#{String(op.id).substring(0,8).toUpperCase()}</span>
                  <span className="op-date">{new Date(op.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="op-status-wrap">
                  <span className={`op-status ${op.status.toLowerCase()}`}>{op.status.toUpperCase()}</span>
                  <span className="op-total">₹{op.totalAmount.toLocaleString()}</span>
                </div>
                {expanded[op.id] ? <LucideChevronUp /> : <LucideChevronDown />}
              </div>

              {expanded[op.id] && (
                <div className="op-details">
                  <div className="op-section hardware">
                    <h5><LucidePackage size={16}/> HARDWARE DEPLOYED</h5>
                    {op.items.map(item => (
                      <div key={item.id} className="op-item">
                        <img src={item.product?.imageUrl || 'https://via.placeholder.com/50'} alt={item.product?.name} />
                        <div className="item-meta">
                          <h6>{item.product?.name || 'Unknown Unit'}</h6>
                          <p>{item.quantity} UNITS @ ₹{item.price.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="op-meta-grid">
                    <div className="op-section coordinates">
                      <h5><LucideTruck size={16}/> DROP COORDINATES</h5>
                      <p>{op.shippingAddress?.name}</p>
                      <p>{op.shippingAddress?.street}, {op.shippingAddress?.city}</p>
                      <p>{op.shippingAddress?.state}, {op.shippingAddress?.zipCode}</p>
                    </div>
                    <div className="op-section security">
                      <h5><LucideShield size={16}/> SECURITY & PAYMENT</h5>
                      <p>METHOD: {op.paymentMethod || 'SECURE CHANNEL'}</p>
                      <p>TXID: {op.paymentId || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;