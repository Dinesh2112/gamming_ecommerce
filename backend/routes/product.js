const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { addProduct, getProducts } = require('../controllers/productController');

// Add product (Admin only)
router.post('/add', verifyToken, addProduct);

// Get all products (any user)
router.get('/', getProducts);

module.exports = router;
