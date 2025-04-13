const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { getDashboardStats } = require('../controllers/adminController');

// Admin middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
};

// Get dashboard statistics - Admin only
router.get('/dashboard-stats', verifyToken, isAdmin, getDashboardStats);

module.exports = router; 