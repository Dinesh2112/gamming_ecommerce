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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization'],
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
app.use("/api/admin/orders", require("./routes/adminOrderRoutes"));
app.use("/api/admin/users", require("./routes/adminUserRoutes"));

// AI Assistant routes
app.use("/api/ai", require("./routes/aiRoutes"));

// Root route
app.get("/", (req, res) => {
  res.send("API is running... 🚀");
});

// Direct admin user creation endpoint
app.get("/create-admin", async (req, res) => {
  try {
    const bcrypt = require("bcryptjs");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("dinesh123", salt);
    
    const adminUser = {
      id: 2,
      name: "Dinesh Rajan",
      email: "dineshrajan2112@gmail.com",
      password: hashedPassword,
      role: "ADMIN"
    };
    
    // Add to mock users array
    const { mockUsers } = require("./mockData");
    
    // Check if user already exists in mock data
    const existingUserIndex = mockUsers.findIndex(u => u.email === adminUser.email);
    if (existingUserIndex >= 0) {
      // Update existing user
      mockUsers[existingUserIndex] = adminUser;
      console.log("Updated existing admin user in mock data");
    } else {
      // Add new user
      mockUsers.push(adminUser);
      console.log("Added admin user to mock data");
    }
    
    // Try to add to database if available
    try {
      const { prisma, prismaOperation } = require("./prismaClient");
      
      await prismaOperation(async () => {
        const existingUser = await prisma.user.findUnique({
          where: { email: adminUser.email }
        });
        
        if (existingUser) {
          await prisma.user.update({
            where: { email: adminUser.email },
            data: { role: "ADMIN" }
          });
          console.log("Updated user to admin in database");
        } else {
          await prisma.user.create({
            data: {
              name: adminUser.name,
              email: adminUser.email,
              password: adminUser.password,
              role: adminUser.role
            }
          });
          console.log("Created admin user in database");
        }
        
        return true;
      });
    } catch (dbError) {
      console.error("Database operation failed:", dbError.message);
      console.log("Admin user is available in mock data even though database operation failed");
    }
    
    // Generate JWT token for the user
    const jwt = require("jsonwebtoken");
    const jwtSecret = process.env.JWT_SECRET || '8c51647b1f5fb04e8f32efe1b7093d80a86e543fce8f67174c2c8fd0c35f60fe';
    
    const token = jwt.sign(
      { 
        id: adminUser.id, 
        name: adminUser.name, 
        email: adminUser.email, 
        role: adminUser.role.toUpperCase()
      }, 
      jwtSecret, 
      { expiresIn: "1h" }
    );
    
    res.status(200).json({
      message: "Admin user created successfully",
      email: adminUser.email,
      password: "dinesh123",
      token
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({ error: error.message });
  }
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
