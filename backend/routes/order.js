const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

router.get("/", verifyToken, async (req, res) => {
  try {
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

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
});

module.exports = router;
