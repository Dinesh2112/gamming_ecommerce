const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Add a new product (Admin only)
const addProduct = async (req, res) => {
  try {
    const { name, description, price, imageUrl, category } = req.body;

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        imageUrl,
        category
      },
    });

    res.json({ message: 'Product added successfully', product: newProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding product' });
  }
};

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching products' });
  }
};

module.exports = {
  addProduct,
  getProducts,
};
