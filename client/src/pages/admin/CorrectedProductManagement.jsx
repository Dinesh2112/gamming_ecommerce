import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import { Navigate } from 'react-router-dom';
import './ProductManagement.css';

// Import the existing MOCK_PRODUCTS data from the original file
// This is just a placeholder - you should import your actual mock data
const MOCK_PRODUCTS = [];

const ProductManagement = () => {
  const { user } = useContext(UserContext);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    name: '',
    price: '',
    description: '',
    imageUrl: '',
    category: '',
    stock: '',
    specifications: {
      // Generic specs that will be filled based on category selection
    },
    features: [],
    compatibleWith: [],
    idealFor: []
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [mockProductsState, setMockProductsState] = useState([...MOCK_PRODUCTS]);

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      try {
        // Use the full backend URL from environment variables
        const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${backendUrl}/api/products`, {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          },
          // Set a timeout to prevent hanging requests
          signal: AbortSignal.timeout(5000)
        });
        
        // Check content type for proper error handling
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          // We can safely parse JSON
          const data = await response.json();
          
          if (response.ok) {
            console.log('Successfully fetched products from API:', data.length);
            setProducts(data);
            setApiAvailable(true);
            return; // Exit early on success
          } else {
            throw new Error(data.message || 'Failed to fetch products');
          }
        } else {
          // Not JSON response, API might be unavailable
          throw new Error('Backend API returned non-JSON response');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
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
    console.log('Using mock product data');
    setApiAvailable(false);
    setProducts(mockProductsState);
  };

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchProducts();
    }
  }, [user]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct({
      ...currentProduct,
      [name]: value
    });
  };

  // Handle category change to update specification fields
  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setCurrentProduct({
      ...currentProduct,
      category,
      specifications: getSpecificationFields(category)
    });
  };

  // Open modal to edit product
  const handleEditProduct = (product) => {
    setIsEditMode(true);
    // Extract category name if it's an object
    const categoryValue = typeof product.category === 'object' ? product.category.name : product.category;
    
    setCurrentProduct({
      id: product.id,
      name: product.name,
      price: product.price.toString(),
      description: product.description,
      imageUrl: product.imageUrl,
      category: categoryValue,
      stock: product.stock.toString(),
      specifications: product.specifications || {},
      features: product.features || [],
      compatibleWith: product.compatibleWith || [],
      idealFor: product.idealFor || []
    });
    setIsModalOpen(true);
  };

  // Handle view details of a product
  const handleViewDetails = (product) => {
    // Extract category name if it's an object
    const categoryDisplay = typeof product.category === 'object' ? product.category.name : product.category;
    
    // Create product details HTML
    const productDetailsHTML = `
      <div class="product-details-view">
        <div class="product-image">
          <img src="${product.imageUrl}" alt="${product.name}" />
        </div>
        <div class="product-info">
          <h3>${product.name}</h3>
          <p class="product-description">${product.description}</p>
          
          <div class="product-metadata">
            <div class="product-price">
              <span class="label">Price:</span>
              <span class="value">₹${product.price.toFixed(2)}</span>
            </div>
            <div class="product-category">
              <span class="label">Category:</span>
              <span class="value">${categoryDisplay}</span>
            </div>
            <div class="product-stock">
              <span class="label">Stock:</span>
              <span class="value">${product.stock}</span>
            </div>
          </div>
          
          <!-- Add other details as needed -->
        </div>
      </div>
    `;
    
    // Create modal container
    const detailsModalContainer = document.createElement('div');
    detailsModalContainer.className = 'details-modal-container';
    
    // Add HTML to container
    detailsModalContainer.innerHTML = `
      <div class="product-details-modal">
        <div class="modal-header">
          <h2>Product Details</h2>
          <button class="close-modal-btn">×</button>
        </div>
        <div class="modal-content">
          ${productDetailsHTML}
        </div>
      </div>
    `;
    
    document.body.appendChild(detailsModalContainer);
    
    // Add event listener to close the modal
    detailsModalContainer.querySelector('.close-modal-btn').addEventListener('click', () => {
      document.body.removeChild(detailsModalContainer);
    });
  };

  // Helper function to determine stock status CSS class
  const getStockClass = (stock) => {
    if (stock <= 0) return 'out';
    if (stock < 10) return 'low';
    if (stock < 25) return 'medium';
    return 'high';
  };
  
  // Helper to get specification fields based on category - must be defined for this to work
  const getSpecificationFields = (category) => {
    // Add your implementation here from the original file
    return {};
  };

  // Redirect if not admin
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="product-management">
      <div className="management-header">
        <h1>Product Management</h1>
        <button className="add-product-btn" onClick={() => {}}>
          Add New Product
        </button>
      </div>

      {!apiAvailable && (
        <div className="api-notice">
          <p>
            <strong>Note:</strong> Backend API for product management is not available. 
            Changes will be stored temporarily in mock data mode.
          </p>
        </div>
      )}

      {error && (
        <div className="management-error">
          <p>{error}</p>
          <button onClick={fetchProducts} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="loading-spinner">Loading products...</div>
      ) : (
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Details</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-products">
                    No products found. Add your first product!
                  </td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product.id}>
                    <td>
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="product-thumbnail" 
                      />
                    </td>
                    <td>
                      <div className="product-name-with-tooltip">
                        <span>{product.name}</span>
                      </div>
                    </td>
                    <td>₹{product.price.toFixed(2)}</td>
                    <td>{typeof product.category === 'object' ? product.category.name : product.category}</td>
                    <td className={`stock-${getStockClass(product.stock)}`}>{product.stock}</td>
                    <td>
                      <button 
                        className="view-details-btn" 
                        onClick={() => handleViewDetails(product)}
                      >
                        View
                      </button>
                    </td>
                    <td className="action-buttons">
                      <button 
                        className="edit-btn" 
                        onClick={() => handleEditProduct(product)}
                      >
                        Edit
                      </button>
                      <button 
                        className="delete-btn" 
                        onClick={() => {}}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductManagement; 