import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../axiosConfig';
import { UserContext } from '../context/UserContext';
import { LucideShield, LucideZap, LucideRotateCcw, LucideTruck } from 'lucide-react';
import './ProductDetails.css';

const ProductDetails = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('specs');
  const [related, setRelated] = useState([]);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/products/${productId}`);
        setProduct(res.data);
        if (res.data?.category) {
          const relRes = await axios.get(`/api/products?category=${res.data.category}`);
          setRelated(relRes.data.filter(p => p.id !== res.data.id).slice(0, 4));
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetch();
    window.scrollTo(0, 0);
  }, [productId]);

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await axios.post('/api/cart/add', { productId, quantity });
      const msg = document.createElement('div');
      msg.className = 'deployment-msg';
      msg.innerHTML = 'UNIT DEPLOYED TO LOGISTICS';
      document.body.appendChild(msg);
      setTimeout(() => msg.remove(), 2500);
    } catch (err) {
      alert('Action Interrupted');
    }
  };

  if (loading) return <div className="p-loader"><div className="loader"></div></div>;
  if (!product) return <div className="p-error">SIGNAL LOST: PRODUCT NOT FOUND</div>;

  return (
    <div className="tactical-wrapper container">
      <div className="breadcrumb glass">
        <Link to="/">COMMAND</Link> / 
        <Link to={`/products?category=${product.category}`}>ARMORY</Link> / 
        <span>{product.name.toUpperCase()}</span>
      </div>

      <div className="product-module">
        <div className="product-visuals">
          <div className="main-display glass">
            <img src={product.imageUrl} alt={product.name} />
            <div className="scan-line"></div>
          </div>
          <div className="spec-highlights">
            <div className="spec-point glass">
              <LucideZap size={18} /> <span>HIGH CALIBER</span>
            </div>
            <div className="spec-point glass">
              <LucideShield size={18} /> <span>ELITE GRADE</span>
            </div>
          </div>
        </div>

        <div className="product-intel">
          <div className="intel-header">
            <span className="brand-tag">{product.brand || 'HYPERDRIVE'}</span>
            <h1 className="unit-name">{product.name}</h1>
            <div className="price-readout">
              <span className="label">VALUATION:</span>
              <span className="value">₹{product.price.toLocaleString()}</span>
            </div>
          </div>

          <div className="status-readout glass">
            <div className="stat">
              <span className="s-label">STOCK LEVEL</span>
              <span className={`s-value ${product.stock > 0 ? 'ok' : 'crit'}`}>
                {product.stock > 0 ? `${product.stock} UNITS` : 'DEPLETED'}
              </span>
            </div>
            <div className="stat">
              <span className="s-label">SERIAL</span>
              <span className="s-value">#HD-{product.id.substring(0,6)}</span>
            </div>
          </div>

          <p className="briefing">{product.description}</p>

          <div className="purchase-ops">
            <div className="qty-control glass">
              <button onClick={() => setQuantity(q => Math.max(1, q-1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(product.stock, q+1))}>+</button>
            </div>
            <button 
              className="deploy-btn neon-btn"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              DEPLOY TO CART
            </button>
          </div>

          <div className="perks-grid">
            <div className="perk"><LucideTruck size={20}/><p>ORBITAL DELIVERY</p></div>
            <div className="perk"><LucideRotateCcw size={20}/><p>RECALL READY</p></div>
            <div className="perk"><LucideShield size={20}/><p>FULL ARMOR</p></div>
          </div>
        </div>
      </div>

      <div className="data-tabs">
        <div className="tabs-nav">
          <button className={activeTab === 'specs' ? 'active' : ''} onClick={() => setActiveTab('specs')}>TECH SPECS</button>
          <button className={activeTab === 'intel' ? 'active' : ''} onClick={() => setActiveTab('intel')}>INTEL</button>
        </div>
        <div className="tabs-body glass">
          {activeTab === 'specs' ? (
            <div className="specs-list">
              {Object.entries(product.specifications || {}).map(([k, v]) => (
                <div key={k} className="spec-row">
                  <span className="s-key">{k.toUpperCase()}</span>
                  <span className="s-val">{v}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="intel-text">{product.detailedDescription || 'No additional intel available for this unit.'}</div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div className="related-units">
          <h2 className="area-title">SIMILAR CALIBER</h2>
          <div className="related-grid">
            {related.map(r => (
              <div key={r.id} className="rel-card glass" onClick={() => navigate(`/product/${r.id}`)}>
                <img src={r.imageUrl} alt={r.name} />
                <div className="rel-info">
                  <h4>{r.name}</h4>
                  <p>₹{r.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
 