/**
 * Middleware to check if the authenticated user has admin role
 * This middleware should be used after verifyToken middleware
 */
const isAdmin = (req, res, next) => {
  console.log("====== isAdmin MIDDLEWARE ======");
  console.log("User object:", JSON.stringify(req.user));
  console.log("User ID:", req.user?.id);
  console.log("User email:", req.user?.email);
  console.log("User role:", req.user?.role);
  console.log("Role uppercase:", req.user?.role?.toUpperCase());
  console.log("Role is admin (case insensitive)?", req.user?.role?.toUpperCase() === 'ADMIN');
  console.log("Role type:", typeof req.user?.role);
  console.log("JWT content:", JSON.stringify(req.headers['x-auth-token']).substring(0, 30) + '...');
  
  // User should be attached to req by the verifyToken middleware
  if (!req.user) {
    console.log("No user object found in request");
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    // Log the user role for debugging
    console.log('User role:', req.user.role);
    
    // Check if user exists and has admin role (case insensitive)
    if (!req.user || req.user.role?.toUpperCase() !== 'ADMIN') {
      console.log('Access denied: Not an admin user');
      return res.status(403).json({ 
        message: 'Access denied. Admin privileges required.' 
      });
    }

    console.log("Admin authorization successful");
    console.log("====== END isAdmin MIDDLEWARE ======");
    // If user is an admin, continue to the next middleware/controller
    next();
  } catch (error) {
    console.error("Error in isAdmin middleware:", error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = isAdmin; 