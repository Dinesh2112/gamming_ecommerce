const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { 
  addProduct, 
  getProducts, 
  getProductById, 
  updateProduct, 
  deleteProduct,
  getSuggestedProducts,
  createInitialProducts
} = require('../controllers/enhancedProductController');
const { 
  getAllProducts, 
  getProductById: productControllerGetProductById, 
  searchProducts, 
  getProductsByCategory,
  getFeaturedProducts,
  getRelatedProducts,
  addProduct: productControllerAddProduct,
  updateProduct: productControllerUpdateProduct,
  deleteProduct: productControllerDeleteProduct,
  getProductsWithFilters,
  getSuggestedProducts: productControllerGetSuggestedProducts
} = require('../controllers/productController');

// Admin middleware to check if user is admin
const isAdmin = (req, res, next) => {
  console.log('🛡️ Admin check - User role:', req.user?.role);
  if (req.user && req.user.role === 'ADMIN') {
    console.log('✅ Admin access granted for', req.originalUrl);
    next();
  } else {
    console.log('❌ Admin access denied for', req.originalUrl);
    res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
};

// Debug middleware to log all requests
router.use((req, res, next) => {
  console.log(`📝 [Product API] ${req.method} ${req.originalUrl}`);
  if (req.params.id) {
    console.log(`📝 [Product API] Product ID: ${req.params.id}, type: ${typeof req.params.id}`);
  }
  next();
});

// Get all products - public route
router.get('/', getProducts);

// Add a test endpoint that always works
router.get('/test-suggested', (req, res) => {
  console.log('Test suggested products endpoint called');
  const { ids } = req.query;
  
  // Log the incoming request details
  console.log('Request query:', req.query);
  console.log('Product IDs requested:', ids);
  
  // Return fixed test data that doesn't rely on database
  const testProducts = [
    {
      id: "2",
      name: "NVIDIA GeForce RTX 3080",
      description: "High-end graphics card for 4K gaming",
      price: 69999.99,
      imageUrl: "https://placehold.co/300x200/333/FFF?text=RTX+3080",
      stock: 10,
      category: "GPU",
      features: ["4K Gaming", "Ray Tracing", "High-End Gaming"],
      idealFor: ["Gaming", "Content Creation"],
      specifications: {
        memory: "10GB GDDR6X",
        powerConsumption: "320W"
      }
    },
    {
      id: "5",
      name: "NVIDIA GeForce RTX 5090",
      description: "Top-of-the-line graphics card for ultimate gaming performance",
      price: 149999.99,
      imageUrl: "https://placehold.co/300x200/333/FFF?text=RTX+5090",
      stock: 5,
      category: "GPU",
      features: ["8K Gaming", "Ray Tracing", "Professional Workloads"],
      idealFor: ["High-End Gaming", "Professional Work", "Content Creation"],
      specifications: {
        memory: "24GB GDDR6X",
        powerConsumption: "450W"
      }
    }
  ];
  
  // Filter products based on requested IDs if provided
  if (ids) {
    const requestedIds = ids.split(',');
    const filteredProducts = testProducts.filter(product => 
      requestedIds.includes(product.id)
    );
    return res.json(filteredProducts);
  }
  
  // Otherwise return all test products
  res.json(testProducts);
});

// Get suggested products by IDs - public route
// This needs to be before the /:id route to avoid conflicts
router.get('/suggested', getSuggestedProducts);

// Get product by ID - public route
router.get('/:id', getProductById);

// Create initial products - admin route
router.post('/init', verifyToken, isAdmin, async (req, res) => {
  try {
    const products = await createInitialProducts();
    res.json({ message: 'Initial products created successfully', products });
  } catch (error) {
    console.error('Error creating initial products:', error);
    res.status(500).json({ message: 'Error creating initial products', error: error.message });
  }
});

// Admin routes - protected
// Add new product
router.post('/', verifyToken, isAdmin, addProduct);

// Update product
router.put('/:id', verifyToken, isAdmin, (req, res, next) => {
  console.log('⚙️ Update product request received:', req.params.id);
  console.log('⚙️ Update data:', JSON.stringify(req.body).substring(0, 200) + '...');
  next();
}, updateProduct);

// Delete product
router.delete('/:id', verifyToken, isAdmin, (req, res, next) => {
  console.log('🗑️ Delete product request received for ID:', req.params.id);
  // Convert string ID to number if needed
  if (req.params.id && !isNaN(parseInt(req.params.id))) {
    req.params.id = parseInt(req.params.id);
    console.log('🗑️ Converted ID to number:', req.params.id);
  }
  next();  
}, deleteProduct);

module.exports = router;
