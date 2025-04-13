const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.header("x-auth-token");

  console.log("============= TOKEN VERIFICATION =============");
  console.log("Request path:", req.path);
  console.log("Request method:", req.method);
  console.log("Token received:", token ? `Yes (${token.substring(0, 15)}...)` : "No");
  console.log("Headers:", JSON.stringify(req.headers));

  // Check if no token is provided
  if (!token) {
    console.log("No token provided for path:", req.path);
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // Log JWT_SECRET value (only first few characters for security)
    const secretPreview = process.env.JWT_SECRET 
      ? `${process.env.JWT_SECRET.substring(0, 5)}...` 
      : 'undefined';
    console.log(`Using JWT_SECRET: ${secretPreview}`);
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
      const tokenParts = token.split('.');
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
    res.status(400).json({ message: "Token is not valid" });
  }
};

module.exports = verifyToken;
