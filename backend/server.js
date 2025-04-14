const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const { PrismaClient } = require("@prisma/client");

// Initialize Express app
const app = express();

// Initialize a single PrismaClient instance for the whole application
const prisma = new PrismaClient({
  log: ['error']
});

// Make prisma available globally for use in controllers
global.prisma = prisma;

// CORS configuration - allow correct frontend port (5173)
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'https://0048-183-87-197-87.ngrok-free.app'],
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

// 404 handler - should come after all other routes
app.use((req, res, next) => {
  console.log(`[404] Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
