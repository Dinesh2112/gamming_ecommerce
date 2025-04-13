/**
 * Authentication utility functions
 */

/**
 * Decode JWT token and return payload
 * @param {string} token - JWT token string
 * @returns {object|null} - Decoded token payload or null if invalid
 */
export const decodeToken = (token) => {
  if (!token) return null;
  
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token string
 * @returns {boolean} - True if token is expired or invalid
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true;
  
  const currentTime = Date.now() / 1000;
  return payload.exp < currentTime;
};

/**
 * Verify if the current token contains admin role
 * @returns {boolean} - True if user has admin role in token
 */
export const verifyAdminRole = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  const payload = decodeToken(token);
  console.log("Token payload in verifyAdminRole:", payload);
  
  if (!payload || isTokenExpired(token)) {
    console.log("Token is invalid or expired");
    return false;
  }
  
  const hasAdminRole = payload.role === 'ADMIN';
  console.log("User has ADMIN role?", hasAdminRole);
  return hasAdminRole;
};

/**
 * Log out user by removing token and reloading page
 */
export const forceLogout = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};

/**
 * Log token details to console for debugging
 */
export const debugToken = () => {
  const token = localStorage.getItem('token');
  console.log("===== TOKEN DEBUG =====");
  
  if (!token) {
    console.log("No token found");
    return null;
  }
  
  const payload = decodeToken(token);
  console.log("Token found:", token.substring(0, 15) + "...");
  console.log("Decoded payload:", payload);
  
  if (isTokenExpired(token)) {
    console.log("Token is EXPIRED");
  } else {
    const expTime = new Date(payload.exp * 1000);
    console.log("Token expires at:", expTime.toLocaleString());
  }
  
  if (payload && payload.role) {
    console.log("User role:", payload.role);
    console.log("Is admin?", payload.role === 'ADMIN');
  } else {
    console.log("No role in token");
  }
  
  console.log("===== END TOKEN DEBUG =====");
  return payload;
}; 