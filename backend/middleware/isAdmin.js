/**
 * Middleware to check if the authenticated user has admin role
 * This middleware should be used after verifyToken middleware
 */
const isAdmin = (req, res, next) => {
  console.log("====== isAdmin MIDDLEWARE ======");
  console.log("User object:", JSON.stringify(req.user));
  console.log("User role:", req.user?.role);
  console.log("Role is ADMIN?", req.user?.role === 'ADMIN');
  console.log("Role type:", typeof req.user?.role);
  
  // User should be attached to req by the verifyToken middleware
  if (!req.user) {
    console.log("No user object found in request");
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Check if user has admin role
  if (req.user.role !== 'ADMIN') {
    console.log(`Role mismatch: expected 'ADMIN', got '${req.user.role}'`);
    return res.status(403).json({ 
      message: 'Access denied. Admin role required.' 
    });
  }

  console.log("Admin authorization successful");
  console.log("====== END isAdmin MIDDLEWARE ======");
  // If user is an admin, continue to the next middleware/controller
  next();
};

module.exports = isAdmin; 