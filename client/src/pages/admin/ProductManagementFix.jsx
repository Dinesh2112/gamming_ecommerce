import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import { Navigate } from 'react-router-dom';
import './ProductManagement.css';
import { getAllProducts, addProduct, updateProduct, deleteProduct } from '../../services/productService';

// Mock product data - keep the existing mock data for fallback
const MOCK_PRODUCTS = [
  // Your existing mock products here
];

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
      
      console.log('Fetching products from backend API using productService');
      
      // Use the productService instead of fetch directly
      const data = await getAllProducts();
      console.log('Fetched', data.length, 'products from API');
      
      setProducts(data);
      setMockProductsState(data);
      setApiAvailable(true);
    } catch (error) {
      console.error('Error fetching products:', error);
      
      // If we're already in mock data mode, just display the mock data
      if (!apiAvailable) {
        setProducts(mockProductsState);
        return;
      }
      
      setError(`Failed to fetch products: ${error.message}. Using mock data.`);
      fallbackToMockData();
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

  // Handle specification change
  const handleSpecificationChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct({
      ...currentProduct,
      specifications: {
        ...currentProduct.specifications,
        [name]: value
      }
    });
  };

  // Handle comma-separated list inputs (features, compatibility, ideal for)
  const handleListChange = (e) => {
    const { name, value } = e.target;
    // Split by commas and trim whitespace
    const list = value.split(',').map(item => item.trim()).filter(item => item);
    setCurrentProduct({
      ...currentProduct,
      [name]: list
    });
  };

  // Handle product form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError(null);
      
      // Format the data for the API
      const productData = {
        ...currentProduct,
        price: parseFloat(currentProduct.price),
        stock: parseInt(currentProduct.stock)
      };
      
      if (!apiAvailable) {
        // Handle mock product data
        if (isEditMode) {
          // Update existing product
          const updatedMockProducts = mockProductsState.map(product => 
            product.id === currentProduct.id ? { ...productData } : product
          );
          setMockProductsState(updatedMockProducts);
          setProducts(updatedMockProducts);
          console.log(`Mock product ${isEditMode ? 'updated' : 'added'} successfully`);
        } else {
          // Add new product
          const newProduct = {
            ...productData,
            id: Date.now().toString()
          };
          const newMockProducts = [...mockProductsState, newProduct];
          setMockProductsState(newMockProducts);
          setProducts(newMockProducts);
        }
        setIsModalOpen(false);
        resetForm();
        return;
      }
      
      try {
        if (isEditMode) {
          // Use updateProduct from productService
          console.log('Updating product:', currentProduct.id, productData);
          
          // Ensure all required fields are properly formatted
          const sanitizedData = {
            ...productData,
            price: typeof productData.price === 'number' ? productData.price : parseFloat(productData.price) || 0,
            stock: typeof productData.stock === 'number' ? productData.stock : parseInt(productData.stock) || 0,
            // Ensure category is properly formatted
            category: typeof productData.category === 'object' ? productData.category.name : productData.category
          };
          
          await updateProduct(currentProduct.id, sanitizedData);
        } else {
          // Use addProduct from productService
          await addProduct(productData);
        }
        
        // Refresh product list
        fetchProducts();
        // Close modal
        setIsModalOpen(false);
        // Reset form
        resetForm();
      } catch (error) {
        console.error('Error with API call:', error);
        setError(`${error.message}. Switching to mock data mode.`);
        
        // Switch to mock data mode
        setApiAvailable(false);
        
        // Handle the operation with mock data
        if (isEditMode) {
          // Update existing product in mock data
          const updatedMockProducts = mockProductsState.map(product => 
            product.id === currentProduct.id ? { ...productData } : product
          );
          setMockProductsState(updatedMockProducts);
          setProducts(updatedMockProducts);
        } else {
          // Add new product to mock data
          const newProduct = {
            ...productData,
            id: Date.now().toString()
          };
          const newMockProducts = [...mockProductsState, newProduct];
          setMockProductsState(newMockProducts);
          setProducts(newMockProducts);
        }
        
        // Close modal
        setIsModalOpen(false);
        // Reset form
        resetForm();
      }
    } catch (error) {
      setError(`Error: ${error.message}`);
      console.error('Error in form submission:', error);
    }
  };

  // Handle product deletion
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      setError(null);
      
      if (!apiAvailable) {
        // Handle mock product deletion
        const filteredProducts = mockProductsState.filter(product => product.id !== id);
        setMockProductsState(filteredProducts);
        setProducts(filteredProducts);
        console.log('Mock product deleted successfully');
        return;
      }
      
      try {
        // Use deleteProduct from productService
        await deleteProduct(id);
        console.log('Product deleted successfully');
        // Refresh product list
        fetchProducts();
      } catch (error) {
        console.error('Error with delete API call:', error);
        setError(`${error.message}. Switching to mock data mode.`);
        
        // Switch to mock data mode
        setApiAvailable(false);
        
        // Delete from mock data
        const filteredProducts = mockProductsState.filter(product => product.id !== id);
        setMockProductsState(filteredProducts);
        setProducts(filteredProducts);
      }
    } catch (error) {
      setError(`Error: ${error.message}`);
      console.error('Error in product deletion:', error);
    }
  };

  // Open modal to add new product
  const handleAddProduct = () => {
    setIsEditMode(false);
    resetForm();
    setIsModalOpen(true);
  };

  // Open modal to edit product
  const handleEditProduct = (product) => {
    setIsEditMode(true);
    setCurrentProduct({
      id: product.id,
      name: product.name,
      price: product.price.toString(),
      description: product.description,
      imageUrl: product.imageUrl,
      category: product.category,
      stock: product.stock.toString(),
      specifications: product.specifications || {},
      features: product.features || [],
      compatibleWith: product.compatibleWith || [],
      idealFor: product.idealFor || []
    });
    setIsModalOpen(true);
  };

  // Reset form fields
  const resetForm = () => {
    setCurrentProduct({
      name: '',
      price: '',
      description: '',
      imageUrl: '',
      category: '',
      stock: '',
      specifications: {},
      features: [],
      compatibleWith: [],
      idealFor: []
    });
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // Helper function to determine stock status CSS class
  const getStockClass = (stock) => {
    // Convert to number and ensure it's not NaN
    const stockNum = parseInt(stock);
    if (isNaN(stockNum) || stockNum <= 0) return 'out';
    if (stockNum < 10) return 'low';
    if (stockNum < 25) return 'medium';
    return 'high';
  };

  // Helper to get specification fields based on category
  const getSpecificationFields = (category) => {
    // Keep your existing implementation
    return {};
  };

  // Format list items for display
  const formatList = (list) => {
    return Array.isArray(list) && list.length > 0 ? list.join(', ') : 'None';
  };
  
  // DetailTooltip component for showing tooltip information
  const DetailTooltip = ({ title, children }) => {
    return (
      <div className="detail-tooltip">
        <span className="tooltip-icon">i</span>
        <div className="tooltip-content">
          <h4>{title}</h4>
          {children}
        </div>
      </div>
    );
  };
  
  // View product details modal
  const handleViewDetails = (product) => {
    // Create a modal to display all product information
    const productDetailsHTML = `
      <div class="product-details-view">
        <div class="product-image">
          <img src="${product.imageUrl || 'https://via.placeholder.com/200x200?text=No+Image'}" alt="${product.name}" />
        </div>
        
        <div class="product-info">
          <h2>${product.name || 'Unnamed Product'}</h2>
          <div class="product-meta">
            <span class="price">₹${typeof product.price === 'number' && !isNaN(product.price) ? product.price.toFixed(2) : '0.00'}</span>
            <span class="stock">Stock: ${typeof product.stock === 'number' && !isNaN(product.stock) ? product.stock : 0}</span>
          </div>
          
          <div class="product-category">
            <span class="label">Category:</span>
            <span class="value">${typeof product.category === 'object' ? product.category.name : (product.category || 'Uncategorized')}</span>
          </div>
          
          <div class="product-description">
            <h3>Description</h3>
            <p>${product.description || 'No description available'}</p>
          </div>
          
          <div class="product-specs">
            <h3>Technical Specifications</h3>
            <table>
              ${Object.entries(product.specifications || {}).map(([key, value]) => `
                <tr>
                  <td class="spec-key">${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</td>
                  <td class="spec-value">${value}</td>
                </tr>
              `).join('')}
            </table>
          </div>
          
          <div class="product-features">
            <h3>Key Features</h3>
            <ul>
              ${(product.features || []).map(feature => `<li>${feature}</li>`).join('')}
            </ul>
          </div>
          
          <div class="product-compatibility">
            <h3>Compatible With</h3>
            <p>${formatList(product.compatibleWith)}</p>
          </div>
          
          <div class="product-use-cases">
            <h3>Ideal For</h3>
            <p>${formatList(product.idealFor)}</p>
          </div>
        </div>
      </div>
    `;
    
    // Show the modal with product details
    const detailsModalContainer = document.createElement('div');
    detailsModalContainer.className = 'modal-overlay';
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

  // Render the UI
  // Redirect if not admin
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="product-management">
      <div className="management-header">
        <h1>Product Management</h1>
        <button className="add-product-btn" onClick={handleAddProduct}>
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
                <th>ID</th>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-products">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td className="product-image">
                      <div className="image-container">
                        <img src={product.imageUrl || 'https://via.placeholder.com/100x100?text=No+Image'} alt={product.name} />
                      </div>
                    </td>
                    <td className="product-name">
                      <span 
                        className="view-details-btn" 
                        onClick={() => handleViewDetails(product)}
                      >
                        {product.name}
                      </span>
                    </td>
                    <td>{typeof product.category === 'object' ? product.category.name : product.category}</td>
                    <td>₹{typeof product.price === 'number' && !isNaN(product.price) ? product.price.toFixed(2) : '0.00'}</td>
                    <td className={`stock-status ${getStockClass(product.stock)}`}>
                      {product.stock}
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
                        onClick={() => handleDeleteProduct(product.id)}
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

      {/* Product Form Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{isEditMode ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="close-modal-btn" onClick={handleCloseModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="product-form">
              {/* Form fields would go here */}
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  {isEditMode ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement; 