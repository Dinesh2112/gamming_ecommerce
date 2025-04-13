const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { 
  addProduct, 
  getProducts, 
  getProductById, 
  updateProduct, 
  deleteProduct 
} = require('../controllers/enhancedProductController');

// Admin middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
};

// Get all products - public route
router.get('/', getProducts);

// Get product by ID - public route
router.get('/:id', getProductById);

// Admin routes - protected
// Add new product
router.post('/', verifyToken, isAdmin, addProduct);

// Update product
router.put('/:id', verifyToken, isAdmin, updateProduct);

// Delete product
router.delete('/:id', verifyToken, isAdmin, deleteProduct);

module.exports = router;
