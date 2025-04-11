const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Add product to cart
// Add to cart
router.post("/add", verifyToken, async (req, res) => {
    const { productId, quantity } = req.body || {}; // 🛡 fallback
  
    console.log("productId:", productId);
    console.log("quantity:", quantity);
    console.log("userId:", req.user.id);
  
    if (!productId || !quantity) {
      return res.status(400).json({ message: "productId and quantity are required" });
    }
  
    try {
      const cartItem = await prisma.cartItem.create({
        data: {
          userId: req.user.id,
          productId,
          quantity,
        },
      });
      res.status(201).json({ message: "Item added to cart", cartItem });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Error adding to cart", error: error.message });
    }
  });
  
  module.exports = router;
  
