const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

// Import the prisma client with retry logic
const { prisma } = require("./prismaClient");

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

// Temporary admin user creation route (REMOVE AFTER USE)
app.get("/create-admin", async (req, res) => {
  try {
    const bcrypt = require("bcryptjs");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("dinesh123", salt);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: "dineshrajan2112@gmail.com" }
    });
    
    if (existingUser) {
      // Update the user to be admin
      await prisma.user.update({
        where: { email: "dineshrajan2112@gmail.com" },
        data: { role: "ADMIN" }
      });
      
      return res.status(200).json({
        message: "Existing user updated to admin",
        email: "dineshrajan2112@gmail.com",
        password: "dinesh123"
      });
    }
    
    // Create new admin
    const user = await prisma.user.create({
      data: {
        name: "Dinesh Rajan",
        email: "dineshrajan2112@gmail.com",
        password: hashedPassword,
        role: "ADMIN"
      }
    });
    
    res.status(201).json({
      message: "Admin user created",
      email: "dineshrajan2112@gmail.com",
      password: "dinesh123"
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({ error: error.message });
  }
});

// 404 handler - should come after all other routes
app.use((req, res, next) => {
  console.log(`[404] Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
