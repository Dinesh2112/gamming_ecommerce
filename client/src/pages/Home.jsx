import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import './Home.css';

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/products');
        const products = response.data;
        const shuffled = [...products].sort(() => 0.5 - Math.random());
        setFeaturedProducts(shuffled.slice(0, 4));
        const uniqueCategories = [...new Set(products.map(product => {
          if (typeof product.category === 'object' && product.category !== null) {
            return product.category.name;
          }
          return product.category;
        }))];
        setCategories(uniqueCategories.filter(Boolean).slice(0, 4));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const goToCategory = (category) => {
    navigate(`/products?category=${encodeURIComponent(category)}`);
  };

  return (
    <div className="home-wrapper">
      {/* Hero Section: The Bridge */}
      <section className="hero">
        <div className="hero-video-box">
          <div className="hero-overlay"></div>
          <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop" alt="Hero" className="hero-bg" />
        </div>
        
        <div className="container hero-container">
          <div className="hero-content">
            <div className="status-badge">
              <span className="pulse"></span> ONLINE: NEXT-GEN HARDWARE
            </div>
            <h1 className="hero-title">
              EQUIP YOUR <span className="highlight">LEGACY</span>
            </h1>
            <p className="hero-subtitle">
              High-performance components for elite builders. Level up your productivity and dominance in the digital realm.
            </p>
            <div className="hero-btns">
              <button onClick={() => navigate('/products')} className="neon-btn">Enter Armory</button>
              <button onClick={() => navigate('/ai-assistant')} className="btn-secondary">Consult AI</button>
            </div>
          </div>
          
          <div className="hero-visual">
             <div className="floating-card glass">
               <div className="card-glint"></div>
               <div className="card-specs">
                 <div className="spec-item"><span>FPS</span><span className="val">240+</span></div>
                 <div className="spec-item"><span>TEMP</span><span className="val"> cooled</span></div>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Categories: Tactical Selection */}
      <section className="categories">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">Tactical Selection</h2>
            <p className="section-desc">Filter by component class</p>
          </div>
          
          <div className="cats-grid">
            {categories.map((cat, i) => (
              <div key={i} className="cat-card glass" onClick={() => goToCategory(cat)}>
                <div className="cat-icon-box">
                  <span className="cat-tag">LVL {i + 1}</span>
                </div>
                <h3 className="cat-name">{cat}</h3>
                <div className="cat-arrow">→</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured: Elite Gear */}
      <section className="featured">
        <div className="container">
          <div className="section-head center">
            <h2 className="section-title">Elite Gear</h2>
            <p className="section-desc">Top performers in the field</p>
          </div>
          
          {loading ? (
            <div className="loader-box"><div className="loader"></div></div>
          ) : (
            <div className="feats-grid">
              {featuredProducts.map((p) => (
                <div key={p.id} className="feat-card glass-card" onClick={() => navigate(`/product/${p.id}`)}>
                  <div className="feat-img">
                    <img src={p.imageUrl} alt={p.name} />
                    <div className="feat-price">₹{p.price.toLocaleString()}</div>
                  </div>
                  <div className="feat-info">
                    <span className="feat-brand">{p.brand}</span>
                    <h3 className="feat-name">{p.name}</h3>
                    <div className="feat-action">View Specs</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="center mt-4">
             <button onClick={() => navigate('/products')} className="btn-link">View Full Inventory →</button>
          </div>
        </div>
      </section>

      {/* Systems: Why Us */}
      <section className="systems">
        <div className="container">
          <div className="systems-grid">
             <div className="sys-item">
                <div className="sys-icon">🚚</div>
                <h4>Warp Speed Delivery</h4>
                <p>Global logistics for urgent builds.</p>
             </div>
             <div className="sys-item">
                <div className="sys-icon">🛡️</div>
                <h4>Titan Guard Warranty</h4>
                <p>3-year secure protection on all gear.</p>
             </div>
             <div className="sys-item">
                <div className="sys-icon">⚡</div>
                <h4>AI Support</h4>
                <p>24/7 automated technical assistance.</p>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
 