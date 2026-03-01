import React, { useEffect, useState, useContext } from 'react';
import axios from '../axiosConfig';
import { UserContext } from '../context/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/products');
        const productsData = res.data || [];
        setProducts(productsData);
        
        const categoriesSet = new Set();
        categoriesSet.add('all');
        productsData.forEach(p => {
          const cat = typeof p.category === 'object' ? p.category.name : (p.category || 'Gear');
          categoriesSet.add(cat);
        });
        setCategories(Array.from(categoriesSet));
        
        const params = new URLSearchParams(location.search);
        const catParam = params.get('category');
        if (catParam) setSelectedCategory(catParam);
        
        setLoading(false);
      } catch (err) {
        console.error(err);
        setProducts([]);
        setLoading(false);
      }
    };
    fetchProducts();
  }, [location.search]);

  useEffect(() => {
    let res = products;
    if (selectedCategory !== 'all') {
      res = res.filter(p => (typeof p.category === 'object' ? p.category.name : p.category) === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      res = res.filter(p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
    }
    setFilteredProducts(res);
  }, [products, selectedCategory, searchQuery]);

  const handleAddToCart = async (productId) => {
    if (!user) { navigate('/login'); return; }
    try {
      await axios.post('/api/cart/add', { productId, quantity: 1 });
      const el = document.getElementById(`prod-${productId}`);
      el?.classList.add('flash-success');
      setTimeout(() => el?.classList.remove('flash-success'), 1000);
    } catch (err) {
      alert('Action Failed');
    }
  };

  return (
    <div className="armory-wrapper container">
      <div className="armory-header">
        <div className="header-left">
          <h1 className="glitch-title" data-text="THE ARMORY">THE ARMORY</h1>
          <p className="sub-header">Deployment-ready hardware and accessories</p>
        </div>
        
        <div className="search-console glass">
          <input 
            type="text" 
            placeholder="Search database..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="search-glow"></span>
        </div>
      </div>

      <div className="filters-bar">
        {categories.map((cat, i) => (
          <button 
            key={i} 
            className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-zone"><div className="loader"></div></div>
      ) : (
        <div className="armory-grid">
          {filteredProducts.map(p => (
            <div key={p.id} id={`prod-${p.id}`} className="armory-card glass-card">
              <div className="card-top" onClick={() => navigate(`/product/${p.id}`)}>
                <div className="image-wrap">
                  <img src={p.imageUrl} alt={p.name} />
                  <div className="price-tag">₹{p.price.toLocaleString()}</div>
                </div>
              </div>
              
              <div className="card-bottom">
                <div className="p-meta">
                  <span className="p-cat">{typeof p.category === 'object' ? p.category.name : p.category}</span>
                  <span className={`p-stock ${p.stock > 0 ? '' : 'out'}`}>{p.stock > 0 ? 'READY' : 'DEPLETED'}</span>
                </div>
                <h3 className="p-name">{p.name}</h3>
                
                <div className="p-actions">
                  <button onClick={() => navigate(`/product/${p.id}`)} className="details-btn">Specs</button>
                  <button 
                    onClick={() => handleAddToCart(p.id)} 
                    className="add-btn neon-btn"
                    disabled={p.stock <= 0}
                  >
                    Deploy
                  </button>
                </div>
              </div>
              <div className="card-border-glow"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;

