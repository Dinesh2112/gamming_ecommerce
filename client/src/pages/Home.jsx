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
        
        // Get random featured products
        const shuffled = [...products].sort(() => 0.5 - Math.random());
        setFeaturedProducts(shuffled.slice(0, 6));
        
        // Extract unique categories
        const uniqueCategories = [...new Set(products.map(product => product.category))];
        setCategories(uniqueCategories.filter(Boolean).slice(0, 6));
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const goToCategory = (category) => {
    const categoryName = typeof category === 'object' ? category.name : category;
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  const getCategoryIcon = (category) => {
    // Handle both string categories and category objects
    if (!category) return 'gamepad';
    
    // If category is an object, use its name property
    const categoryStr = typeof category === 'object' ? category.name : category;
    if (typeof categoryStr !== 'string') return 'gamepad';
    
    const categoryLower = categoryStr.toLowerCase();
    
    if (categoryLower.includes('graphic') || categoryLower.includes('gpu'))
      return 'microchip';
    if (categoryLower.includes('processor') || categoryLower.includes('cpu'))
      return 'microchip';
    if (categoryLower.includes('monitor') || categoryLower.includes('display'))
      return 'desktop';
    if (categoryLower.includes('keyboard'))
      return 'keyboard';
    if (categoryLower.includes('chair'))
      return 'chair';
    if (categoryLower.includes('laptop'))
      return 'laptop';
    if (categoryLower.includes('mouse'))
      return 'mouse';
    if (categoryLower.includes('headset') || categoryLower.includes('audio'))
      return 'headphones';
    if (categoryLower.includes('storage') || categoryLower.includes('ssd') || categoryLower.includes('hdd'))
      return 'hdd';
    
    return 'gamepad';
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Build Your Ultimate Gaming Setup</h1>
          <p>Discover premium components and accessories to elevate your gaming experience to the next level</p>
          <div className="hero-buttons">
            <Link to="/products" className="btn btn-primary">Browse Products</Link>
            <Link to="/ai-assistant" className="btn btn-secondary">AI Assistant</Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="section-header">
          <h2>Shop by Category</h2>
          <Link to="/products" className="view-all">View All Products</Link>
        </div>
        
        {loading ? (
          <div className="loading">Loading categories...</div>
        ) : (
          <div className="categories-grid">
            {categories.map((category, index) => {
              // Generate unique ID for each item in render to avoid key conflicts
              const uniqueId = `category-${index}-${Date.now()}`;
              return (
                <div 
                  key={uniqueId} 
                  className="category-card"
                  onClick={() => goToCategory(category)}
                >
                  <div className="category-icon">
                    <i className={`fa fa-${getCategoryIcon(category)}`}></i>
                  </div>
                  <h3>{typeof category === 'object' ? category.name : category}</h3>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Featured Products Section */}
      <section className="featured-products-section">
        <div className="section-header">
          <h2>Featured Products</h2>
          <Link to="/products" className="view-all">Browse All</Link>
        </div>
        
        {loading ? (
          <div className="loading">Loading products...</div>
        ) : (
          <div className="products-grid">
            {featuredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <Link to={`/product/${product.id}`}>
                  <div className="product-image">
                    <img 
                      src={product.imageUrl || 'https://placehold.co/300x200/333/FFF?text=Product'} 
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/300x200/333/FFF?text=Product';
                      }}
                    />
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="price">₹{product.price.toFixed(2)}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-us">
        <h2>Why Choose TechGear</h2>
        <div className="features-grid">
          <div className="feature">
            <div className="feature-icon">
              <i className="fa fa-truck"></i>
            </div>
            <h3>Fast Shipping</h3>
            <p>Free shipping on orders over ₹5000 with quick delivery across India</p>
          </div>
          <div className="feature">
            <div className="feature-icon">
              <i className="fa fa-shield"></i>
            </div>
            <h3>Quality Guarantee</h3>
            <p>All products come with manufacturer warranty and quality assurance</p>
          </div>
          <div className="feature">
            <div className="feature-icon">
              <i className="fa fa-headset"></i>
            </div>
            <h3>24/7 Support</h3>
            <p>Our gaming experts are available round the clock to assist you</p>
          </div>
          <div className="feature">
            <div className="feature-icon">
              <i className="fa fa-rotate-left"></i>
            </div>
            <h3>Easy Returns</h3>
            <p>Hassle-free 30-day return policy on most products</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 