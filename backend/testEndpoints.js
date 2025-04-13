// Script to trace all registered routes in our Express app
const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

// Create a new test app to log all routes
const logApp = express();

// Set up middleware
logApp.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
logApp.use(express.json());

// Store all routes here
const routes = [];

// Monkey patch the app.use and logApp methods to log the routes
const originalUse = logApp.use;
logApp.use = function() {
  const args = Array.from(arguments);
  
  // If this is a route registration
  if (args.length >= 2) {
    const path = args[0];
    const handler = args[1];
    
    // If the handler is a Router
    if (handler.name === 'router') {
      // Extract all routes from the router
      const router = handler;
      const stack = router.stack || [];
      
      stack.forEach(layer => {
        if (layer.route) {
          const route = layer.route;
          const routePath = path + route.path;
          const methods = Object.keys(route.methods).map(m => m.toUpperCase()).join(', ');
          
          routes.push({
            path: routePath,
            methods,
            handler: route.stack[0].name
          });
        }
      });
    }
  }
  
  return originalUse.apply(logApp, args);
};

// Register all routes the same way as in server.js
logApp.use("/api/auth", require("./routes/userRoutes"));
logApp.use("/api/products", require("./routes/product"));
logApp.use("/api/cart", require("./routes/cart"));
logApp.use("/api/orders", require("./routes/order"));
logApp.use("/api/ai", require("./routes/aiRoutes"));

// Print all registered routes
console.log("=== REGISTERED ROUTES ===");
routes.forEach(route => {
  console.log(`${route.methods} ${route.path}`);
});
console.log("=== END ROUTES ===");

// Create a simplified version of the server for testing
const testServer = () => {
  const app = express();
  app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
  }));
  app.use(express.json());
  
  // Register only the AI routes
  app.use("/api/ai", require("./routes/aiRoutes"));
  
  return app;
};

// Start the test server
const server = testServer().listen(5001, () => {
  console.log("Test server running on port 5001");
  console.log("Test the endpoints directly using curl or a browser");
  console.log("Press Ctrl+C to stop the server");
}); 