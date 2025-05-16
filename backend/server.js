const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

// Import the prisma client with retry logic and setup function
const { prisma, prismaOperation } = require("./prismaClient");
const { setupDatabase } = require("./setupDb");

// Initialize Express app
const app = express();

// Make prisma available globally for use in controllers
global.prisma = prisma;

// CORS configuration - allow correct frontend port and Vercel domain
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'https://0048-183-87-197-87.ngrok-free.app', 'https://gamming-ecommerce.vercel.app'],
  credentials: true
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint that doesn't require database access
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "up", 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use("/api/auth", require("./routes/userRoutes")); // Add the authentication routes

// Other routes like products, cart, orders
app.use("/api/products", require("./routes/product"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/orders", require("./routes/order"));

// Admin routes
app.use("/api/admin", require("./routes/adminRoutes"));

// AI Assistant routes
app.use("/api/ai", require("./routes/aiRoutes"));

// Root route
app.get("/", (req, res) => {
  res.send("API is running... 🚀");
});

// Create sample data endpoint
app.get("/setup-db", async (req, res) => {
  try {
    console.log("Manual database setup triggered");
    const result = await setupDatabase();
    res.status(200).json({
      success: result,
      message: "Database setup process completed. Check logs for details."
    });
  } catch (error) {
    console.error("Error in /setup-db endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Database setup failed",
      error: error.message
    });
  }
});

// 404 handler - should come after all other routes
app.use((req, res, next) => {
  console.log(`[404] Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    message: "An unexpected error occurred",
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Attempt to initialize the database but don't block server startup
  setupDatabase().then(success => {
    console.log("Database initialization: ", success ? "successful" : "failed");
  }).catch(error => {
    console.error("Error during database initialization:", error);
    console.log("Server will continue running and retry database operations as needed");
  });
});
