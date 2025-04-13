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
        console.log('Fetched products:', res.data);
        const productsData = res.data || [];
        setProducts(productsData);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(productsData.map(product => product.category || 'Uncategorized'))];
        setCategories(['all', ...uniqueCategories]);
        
        // Check URL for category parameter
        const params = new URLSearchParams(location.search);
        const categoryParam = params.get('category');
        if (categoryParam) {
          setSelectedCategory(categoryParam);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch products', err);
        setProducts([]);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [location.search]);

  // Filter products based on category and search query
  useEffect(() => {
    let results = products;
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      results = results.filter(product => product.category === selectedCategory);
    }
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      results = results.filter(product => 
        product.name.toLowerCase().includes(query) ||
        (product.description && product.description.toLowerCase().includes(query)) ||
        (product.category && product.category.toLowerCase().includes(query))
      );
    }
    
    setFilteredProducts(results);
  }, [products, selectedCategory, searchQuery]);

  const handleAddToCart = async (productId) => {
    // Check if user is logged in first
    if (!user) {
      alert('Please login to add items to your cart');
      navigate('/login');
      return;
    }

    try {
      console.log("Adding product to cart with ID:", productId);
      
      const response = await axios.post(
        '/api/cart/add',
        { productId, quantity: 1 }
      );
      
      // Success animation instead of alert
      const productCard = document.getElementById(`product-${productId}`);
      if (productCard) {
        productCard.classList.add('added-to-cart');
        setTimeout(() => {
          productCard.classList.remove('added-to-cart');
        }, 1500);
      }
    } catch (err) {
      console.error('Add to cart error:', err.response?.data || err.message);
      alert('Failed to add to cart');
    }
  };
  
  // Function to handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Function to clear search
  const clearSearch = () => {
    setSearchQuery('');
  };
  
  // Function to truncate description text if it's too long
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div className="products-container">
      <div className="products-header">
        <h1 className="products-title">Gaming Products</h1>
        
        {/* Search Bar */}
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <button className="search-clear" onClick={clearSearch}>
              ×
            </button>
          )}
          <div className="search-icon">🔍</div>
        </div>
        
        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`category-filter-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'All Products' : category}
            </button>
          ))}
        </div>
      </div>
      
      {loading ? (
        <div className="products-loading">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      ) : filteredProducts && filteredProducts.length > 0 ? (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div
              id={`product-${product.id}`}
              key={product.id}
              className="product-card tech-card"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <div className="product-image-container">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="product-image" 
                    onError={(e) => {
                      e.target.onerror = null; // Prevent infinite error loop
                      
                      // Try Unsplash random image as first fallback
                      const fallbackUrl = `https://source.unsplash.com/random/300x200/?${product.category?.toLowerCase() || 'computer'},computer`;
                      
                      // If the image is already using the fallback URL or another error occurs
                      if (e.target.src === fallbackUrl) {
                        // Use a solid placeholder as final fallback
                        e.target.src = `https://placehold.co/300x200/333/FFF?text=${encodeURIComponent(product.name)}`;
                      } else {
                        e.target.src = fallbackUrl;
                      }
                    }}
                  />
                ) : (
                  <div className="product-image-placeholder">
                    <span className="placeholder-text">No Image</span>
                  </div>
                )}
                <div className="product-price">₹{product.price.toFixed(2)}</div>
              </div>
              
              <div className="product-details">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{truncateText(product.description)}</p>
                
                <div className="product-meta">
                  {product.stock > 0 ? (
                    <span className="product-stock in-stock">In Stock</span>
                  ) : (
                    <span className="product-stock out-of-stock">Out of Stock</span>
                  )}
                  
                  {product.category && (
                    <span className="product-category">{product.category}</span>
                  )}
                </div>
                
                <button 
                  className="add-to-cart-btn" 
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent navigation to product details
                    handleAddToCart(product.id);
                  }}
                  disabled={product.stock <= 0}
                >
                  <span className="btn-icon">+</span>
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-products">
          <div className="no-products-icon">¯\_(ツ)_/¯</div>
          <p>No products found matching your criteria.</p>
          {searchQuery && (
            <button className="reset-search" onClick={clearSearch}>
              Clear Search
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Products;
