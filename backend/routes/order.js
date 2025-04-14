const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Get all user orders - protected route
router.get("/", verifyToken, async (req, res) => {
  try {
    console.log("Fetching orders for user ID:", req.user.id);
    
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    
    console.log(`Found ${orders.length} orders for user ID ${req.user.id}`);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      message: "Error fetching orders", 
      error: error.message, 
      userId: req.user?.id || 'unknown'
    });
  }
});

module.exports = router;
