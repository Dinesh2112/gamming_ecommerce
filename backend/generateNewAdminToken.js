/**
 * This script generates a new admin token directly,
 * bypassing password validation. For testing purposes only.
 */
const jwt = require('jsonwebtoken');

// Use same secret from environment or fallback
const jwtSecret = process.env.JWT_SECRET || '8c51647b1f5fb04e8f32efe1b7093d80a86e543fce8f67174c2c8fd0c35f60fe';

// Create a new token with ADMIN role (uppercase)
const token = jwt.sign(
  { 
    id: 1, 
    name: 'Dinesh Rajan', 
    email: 'dineshrajan123@gmail.com', 
    role: 'ADMIN' // Explicitly uppercase
  }, 
  jwtSecret, 
  {
    expiresIn: "24h" // Token expires in 24 hours
  }
);

// Decode and verify the token we just created
const decoded = jwt.verify(token, jwtSecret);

console.log('\n==================== NEW ADMIN TOKEN ====================');
console.log(token);
console.log('\n==================== TOKEN DETAILS ====================');
console.log('User ID:', decoded.id);
console.log('Name:', decoded.name);
console.log('Email:', decoded.email);
console.log('Role:', decoded.role);
console.log('Is ADMIN?', decoded.role === 'ADMIN');
console.log('Issued at:', new Date(decoded.iat * 1000).toLocaleString());
console.log('Expires at:', new Date(decoded.exp * 1000).toLocaleString());
console.log('\n==================== USAGE INSTRUCTIONS ====================');
console.log('1. Copy this token');
console.log('2. Open your browser console and run:');
console.log('   localStorage.setItem("token", "[PASTE TOKEN HERE]")');
console.log('3. Reload the page');
console.log('4. You should now be logged in as admin'); 