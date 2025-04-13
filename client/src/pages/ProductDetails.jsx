import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../axiosConfig';
import { UserContext } from '../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShippingFast, faUndo, faShieldAlt, faClock } from '@fortawesome/free-solid-svg-icons';
import { useDispatch } from 'react-redux';
import { addToCart } from '../features/cart/cartSlice';
import './ProductDetails.css';

const ProductDetails = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showAddedMessage, setShowAddedMessage] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/products/${productId}`);
        setProduct(res.data);
        
        // Fetch related products in the same category
        if (res.data && res.data.category) {
          try {
            const relatedRes = await axios.get(`/api/products?category=${res.data.category}`);
            // Filter out current product and limit to 3
            const filtered = relatedRes.data
              .filter(p => p.id !== res.data.id)
              .slice(0, 3);
            setRelatedProducts(filtered);
          } catch (relatedErr) {
            console.error('Error fetching related products:', relatedErr);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details. Please try again later.');
        setLoading(false);
      }
    };

    fetchProductDetails();
    // Scroll to top when component mounts or productId changes
    window.scrollTo(0, 0);
  }, [productId]);

  const handleQuantityChange = (amount) => {
    const newQuantity = quantity + amount;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 10)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please login to add items to your cart');
      navigate('/login');
      return;
    }

    try {
      await axios.post('/api/cart/add', { productId, quantity });
      
      // Show success message
      const addedMessage = document.createElement('div');
      addedMessage.className = 'added-to-cart-message';
      addedMessage.textContent = 'Added to cart!';
      document.querySelector('.product-details-container').appendChild(addedMessage);
      
      // Remove message after 2 seconds
      setTimeout(() => {
        addedMessage.remove();
      }, 2000);

      dispatch(addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.imageUrl,
        quantity
      }));
      
      setShowAddedMessage(true);
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add to cart. Please try again.');
    }
  };

  // Format product specifications for better display
  const formatSpecifications = (specifications) => {
    if (!specifications) return [];
    
    // Add any default specs if they exist on the product but not in specifications
    const formatted = { ...specifications };
    
    // Add weight if it exists
    if (product.weight && !formatted.weight) {
      formatted.weight = `${product.weight} kg`;
    }
    
    // Add dimensions if they exist
    if (product.dimensions && !formatted.dimensions) {
      formatted.dimensions = product.dimensions;
    }
    
    return Object.entries(formatted);
  };

  if (loading) {
    return (
      <div className="product-details-loading">
        <div className="spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-details-error">
        <h2>Error</h2>
        <p>{error}</p>
        <Link to="/" className="back-to-products">Back to Products</Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Product Not Found</h2>
        <p>The product you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="back-to-products">Back to Products</Link>
      </div>
    );
  }

  return (
    <div className="product-details-container">
      <div className="product-details-breadcrumb">
        <Link to="/">Home</Link> {'>'} 
        <Link to={`/?category=${product.category}`}>{product.category}</Link> {'>'} 
        <span>{product.name}</span>
      </div>
      
      <div className="product-details-content">
        <div className="product-details-image-section">
          <div className="product-details-image-container">
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="product-details-image"
              onError={(e) => {
                e.target.onerror = null;
                // Try Unsplash random image as first fallback
                const fallbackUrl = `https://source.unsplash.com/random/600x400/?${product.category.toLowerCase()},computer`;
                
                // If the image is already using the fallback URL or another error occurs
                if (e.target.src === fallbackUrl) {
                  // Use a solid placeholder as final fallback
                  e.target.src = `https://placehold.co/600x400/333/FFF?text=${encodeURIComponent(product.name)}`;
                } else {
                  e.target.src = fallbackUrl;
                }
              }}
            />
          </div>
          
          {/* Product highlights */}
          <div className="product-highlights">
            <h3>Highlights</h3>
            <ul>
              {(product.highlights || product.features || []).slice(0, 3).map((highlight, index) => (
                <li key={index}>{highlight}</li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="product-details-info">
          <h1 className="product-details-name">{product.name}</h1>
          
          <div className="product-details-price-stock">
            <div className="product-details-price">₹{product.price.toFixed(2)}</div>
            <div className={`product-details-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </div>
          </div>
          
          <div className="product-short-description">
            {product.shortDescription || product.description?.substring(0, 150) + (product.description?.length > 150 ? '...' : '')}
          </div>
          
          <div className="product-details-purchase">
            <div className="product-quantity-selector">
              <button 
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="quantity-button"
              >
                -
              </button>
              <span className="quantity-value">{quantity}</span>
              <button 
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product.stock}
                className="quantity-button"
              >
                +
              </button>
            </div>
            
            <button 
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
          
          <div className="product-details-meta">
            <div className="product-details-category">
              <span className="meta-label">Category:</span>
              <span className="meta-value">{product.category}</span>
            </div>
            
            <div className="product-details-brand">
              <span className="meta-label">Brand:</span>
              <span className="meta-value">{product.brand || 'N/A'}</span>
            </div>
            
            {product.model && (
              <div className="product-details-model">
                <span className="meta-label">Model:</span>
                <span className="meta-value">{product.model}</span>
              </div>
            )}
            
            {product.sku && (
              <div className="product-details-sku">
                <span className="meta-label">SKU:</span>
                <span className="meta-value">{product.sku}</span>
              </div>
            )}
          </div>
          
          {/* Shipping & Delivery Information */}
          <div className="product-delivery-info">
            <div className="delivery-info-item">
              <span className="delivery-icon">
                <FontAwesomeIcon icon={faShippingFast} />
              </span>
              <div className="delivery-text">
                <strong>Fast Delivery</strong>
                <span>2-3 Business Days</span>
              </div>
            </div>
            <div className="delivery-info-item">
              <span className="delivery-icon">
                <FontAwesomeIcon icon={faUndo} />
              </span>
              <div className="delivery-text">
                <strong>Easy Returns</strong>
                <span>30 Day Return Policy</span>
              </div>
            </div>
            <div className="delivery-info-item">
              <span className="delivery-icon">
                <FontAwesomeIcon icon={faShieldAlt} />
              </span>
              <div className="delivery-text">
                <strong>Warranty</strong>
                <span>{product.warranty || '1 Year Manufacturer Warranty'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabbed Information Sections */}
      <div className="product-details-tabs">
        <div className="tabs-header">
          <button 
            className={`tab-button ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Description
          </button>
          <button 
            className={`tab-button ${activeTab === 'specifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('specifications')}
          >
            Specifications
          </button>
          <button 
            className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews
          </button>
          <button 
            className={`tab-button ${activeTab === 'warranty' ? 'active' : ''}`}
            onClick={() => setActiveTab('warranty')}
          >
            Warranty & Returns
          </button>
        </div>
        
        <div className="tabs-content">
          {activeTab === 'description' && (
            <div className="tab-panel description-panel">
              <h2>Product Description</h2>
              <div className="full-description">
                {product.detailedDescription || product.description}
              </div>
              
              {(product.features && product.features.length > 0) && (
                <div className="product-features-section">
                  <h3>Key Features</h3>
                  <ul className="features-list">
                    {product.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'specifications' && (
            <div className="tab-panel specifications-panel">
              <h2>Technical Specifications</h2>
              <div className="specifications-grid">
                {formatSpecifications(product.specifications).map(([key, value]) => (
                  <div className="specification-item" key={key}>
                    <div className="specification-key">{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</div>
                    <div className="specification-value">{value}</div>
                  </div>
                ))}
              </div>
              
              {/* System Requirements if applicable */}
              {product.systemRequirements && (
                <div className="system-requirements">
                  <h3>System Requirements</h3>
                  <ul className="requirements-list">
                    {Object.entries(product.systemRequirements).map(([key, value]) => (
                      <li key={key}>
                        <strong>{key}: </strong>{value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Package Contents */}
              <div className="package-contents">
                <h3>Package Contents</h3>
                <ul className="contents-list">
                  {(product.packageContents || ['1 x ' + product.name, 'User Manual']).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {activeTab === 'reviews' && (
            <div className="tab-panel reviews-panel">
              <h2>Customer Reviews</h2>
              <div className="reviews-summary">
                <div className="average-rating">
                  <div className="rating-number">4.5</div>
                  <div className="rating-stars">★★★★☆</div>
                  <div className="rating-count">Based on 24 reviews</div>
                </div>
                <div className="rating-breakdown">
                  <div className="rating-bar">
                    <span className="rating-label">5 Stars</span>
                    <div className="progress-bar">
                      <div className="progress" style={{ width: '70%' }}></div>
                    </div>
                    <span className="rating-count">18</span>
                  </div>
                  <div className="rating-bar">
                    <span className="rating-label">4 Stars</span>
                    <div className="progress-bar">
                      <div className="progress" style={{ width: '20%' }}></div>
                    </div>
                    <span className="rating-count">4</span>
                  </div>
                  <div className="rating-bar">
                    <span className="rating-label">3 Stars</span>
                    <div className="progress-bar">
                      <div className="progress" style={{ width: '5%' }}></div>
                    </div>
                    <span className="rating-count">1</span>
                  </div>
                  <div className="rating-bar">
                    <span className="rating-label">2 Stars</span>
                    <div className="progress-bar">
                      <div className="progress" style={{ width: '5%' }}></div>
                    </div>
                    <span className="rating-count">1</span>
                  </div>
                  <div className="rating-bar">
                    <span className="rating-label">1 Star</span>
                    <div className="progress-bar">
                      <div className="progress" style={{ width: '0%' }}></div>
                    </div>
                    <span className="rating-count">0</span>
                  </div>
                </div>
              </div>
              
              <div className="customer-reviews">
                <div className="review-card">
                  <div className="reviewer-info">
                    <span className="reviewer-name">John D.</span>
                    <span className="review-date">2 weeks ago</span>
                  </div>
                  <div className="review-rating">★★★★★</div>
                  <h4 className="review-title">Great product, exceeded expectations!</h4>
                  <p className="review-content">
                    This {product.name} is exactly what I needed. The quality is excellent and 
                    performance is even better than I expected. Would definitely recommend.
                  </p>
                </div>
                
                <div className="review-card">
                  <div className="reviewer-info">
                    <span className="reviewer-name">Sarah M.</span>
                    <span className="review-date">1 month ago</span>
                  </div>
                  <div className="review-rating">★★★★☆</div>
                  <h4 className="review-title">Good value for money</h4>
                  <p className="review-content">
                    The {product.name} works well for my gaming needs. It's not perfect but 
                    for the price point, it delivers good performance. The only drawback is 
                    the slightly longer loading times than expected.
                  </p>
                </div>
                
                {user ? (
                  <div className="write-review">
                    <h3>Write a Review</h3>
                    <p>Share your experience with this product</p>
                    <button className="write-review-btn">Write a Review</button>
                  </div>
                ) : (
                  <div className="login-to-review">
                    <p>Please <Link to="/login">log in</Link> to write a review</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'warranty' && (
            <div className="tab-panel warranty-panel">
              <h2>Warranty Information</h2>
              <div className="warranty-info">
                <p className="warranty-period">
                  <strong>Warranty Period:</strong> {product.warranty || '1 Year Manufacturer Warranty'}
                </p>
                <div className="warranty-details">
                  <h3>What is covered:</h3>
                  <ul>
                    <li>Manufacturing defects</li>
                    <li>Hardware failures under normal use</li>
                    <li>Technical support for product issues</li>
                  </ul>
                  
                  <h3>What is not covered:</h3>
                  <ul>
                    <li>Physical damage or accidents</li>
                    <li>Improper use or modifications</li>
                    <li>Normal wear and tear</li>
                    <li>Software issues not related to hardware</li>
                  </ul>
                </div>
                
                <div className="return-policy">
                  <h3>Return Policy</h3>
                  <p>30-day return policy for unused and unopened products. Return shipping is the responsibility of the customer unless the product is defective.</p>
                  
                  <p>For defective products received, please contact our customer support within 7 days of receiving your order.</p>
                </div>
                
                <div className="claim-warranty">
                  <h3>How to Claim Warranty</h3>
                  <ol>
                    <li>Contact customer support with your order details</li>
                    <li>Describe the issue you're experiencing</li>
                    <li>Follow the provided instructions for service or replacement</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="related-products-section">
          <h2>Related Products</h2>
          <div className="related-products-grid">
            {relatedProducts.map(relatedProduct => (
              <div 
                key={relatedProduct.id} 
                className="related-product-card"
                onClick={() => navigate(`/product/${relatedProduct.id}`)}
              >
                <div className="related-product-image">
                  <img 
                    src={relatedProduct.imageUrl} 
                    alt={relatedProduct.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://placehold.co/200x200/333/FFF?text=${encodeURIComponent(relatedProduct.name)}`;
                    }}
                  />
                </div>
                <div className="related-product-info">
                  <h4>{relatedProduct.name}</h4>
                  <div className="related-product-price">₹{relatedProduct.price.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="product-details-actions">
        <Link to="/" className="continue-shopping">Continue Shopping</Link>
      </div>
      
      {showAddedMessage && (
        <div className="added-to-cart-message">
          Product added to cart!
        </div>
      )}
    </div>
  );
};

export default ProductDetails; 