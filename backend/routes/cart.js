const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// ✅ Add product to cart
router.post("/add", verifyToken, async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    return res.status(400).json({ message: "productId and quantity are required" });
  }

  try {
    const cartItem = await prisma.cartItem.create({
      data: {
        userId: req.user.id,
        productId: parseInt(productId),
        quantity: parseInt(quantity),
      },
    });
    res.status(201).json({ message: "Item added to cart", cartItem });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: "Error adding to cart", error: error.message });
  }
});

// ✅ Get all cart items for a user
router.get("/my-cart", verifyToken, async (req, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: true,
      },
    });

    const total = cartItems.reduce((acc, item) => acc + item.quantity * item.product.price, 0);
    res.json({ cartItems, total });
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart items", error: error.message });
  }
});

// ✅ Update cart item quantity
router.put('/update/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity <= 0) {
    return res.status(400).json({ message: "Quantity must be a positive number" });
  }

  try {
    const updatedItem = await prisma.cartItem.update({
      where: { id: parseInt(id) },
      data: { quantity },
    });
    res.json({ message: "Cart item updated", updatedItem });
  } catch (error) {
    res.status(500).json({ message: "Error updating cart item", error: error.message });
  }
});

// ✅ Delete single cart item
router.delete("/remove/:id", verifyToken, async (req, res) => {
  const itemId = parseInt(req.params.id);

  try {
    await prisma.cartItem.delete({ where: { id: itemId } });
    res.json({ message: "Item removed from cart" });
  } catch (error) {
    res.status(500).json({ message: "Error removing item", error: error.message });
  }
});

// ✅ Checkout and place order
router.post("/checkout", verifyToken, async (req, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0
    );

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        totalAmount,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Checkout failed", error: error.message });
  }
});

module.exports = router;
