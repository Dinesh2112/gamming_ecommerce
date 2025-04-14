const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // Look for x-auth-token in headers
  const token = req.header("x-auth-token");
  
  // Also check Authorization header in case the client is sending it that way
  const authHeader = req.header("Authorization");
  const bearerToken = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.slice(7) 
    : null;
  
  // Use the token from x-auth-token header if available, otherwise try Bearer token
  const finalToken = token || bearerToken;

  console.log("============= TOKEN VERIFICATION =============");
  console.log("Request path:", req.path);
  console.log("Request method:", req.method);
  console.log("All headers:", JSON.stringify(req.headers));
  console.log("x-auth-token header:", token ? `${token.substring(0, 15)}...` : "Not found");
  console.log("Authorization header:", authHeader ? `${authHeader.substring(0, 15)}...` : "Not found");
  console.log("Final token used:", finalToken ? `${finalToken.substring(0, 15)}...` : "No token available");

  // Check if no token is provided
  if (!finalToken) {
    console.log("No token provided for path:", req.path);
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // Use the same JWT secret as in userController.js
    const jwtSecret = process.env.JWT_SECRET || '8c51647b1f5fb04e8f32efe1b7093d80a86e543fce8f67174c2c8fd0c35f60fe';
    
    // Log JWT_SECRET value (only first few characters for security)
    const secretPreview = jwtSecret.substring(0, 5) + '...';
    console.log(`Using JWT_SECRET: ${secretPreview}`);
    
    // Verify the token
    const decoded = jwt.verify(finalToken, jwtSecret);
    console.log("Token verified successfully for user:", JSON.stringify(decoded));
    console.log("User role in token:", decoded.role);

    // Attach the user ID to the request
    req.user = decoded;
    console.log("User attached to request:", req.user);
    console.log("============= END TOKEN VERIFICATION =============");

    next(); // Proceed to the next middleware/route
  } catch (error) {
    console.error("Token verification error:", error.message);
    console.error("Token verification failed for path:", req.path);
    console.error("JWT_SECRET environment variable exists:", !!process.env.JWT_SECRET);
    
    // Log more details about the token
    try {
      const tokenParts = finalToken.split('.');
      if (tokenParts.length === 3) {
        const header = JSON.parse(Buffer.from(tokenParts[0], 'base64').toString());
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        console.log("Token header:", JSON.stringify(header));
        console.log("Token payload:", JSON.stringify(payload));
      }
    } catch (parseError) {
      console.error("Error parsing token:", parseError.message);
    }
    
    // Check if the error is related to invalid signature
    if (error.name === 'JsonWebTokenError' && error.message === 'invalid signature') {
      console.error("Invalid signature detected. This usually means the token was signed with a different secret.");
    } else if (error.name === 'TokenExpiredError') {
      console.error("Token has expired. Expiration time:", error.expiredAt);
      return res.status(401).json({ message: "Token has expired" });
    }
    
    console.log("============= END TOKEN VERIFICATION (FAILED) =============");
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = verifyToken;
