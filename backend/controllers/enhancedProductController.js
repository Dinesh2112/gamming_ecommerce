const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Add a new product (Admin only)
const addProduct = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      imageUrl, 
      category,
      stock,
      specifications,
      features,
      compatibleWith,
      idealFor 
    } = req.body;

    // Check if category exists, if not create it
    let categoryObj = await prisma.category.findFirst({
      where: { name: category }
    });

    if (!categoryObj) {
      categoryObj = await prisma.category.create({
        data: {
          name: category,
          description: `Products in the ${category} category`
        }
      });
    }

    // Process additional specifications as JSON
    const additionalSpecs = specifications || {};
    
    // Create tags from features and idealFor
    const tags = [
      ...features || [],
      ...idealFor || [],
      category
    ];

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        imageUrl,
        stock: parseInt(stock) || 0,
        categoryId: categoryObj.id,
        brand: 'Generic', // Default brand
        additionalSpecs: additionalSpecs,
        tags: tags
      },
    });

    res.json({ message: 'Product added successfully', product: newProduct });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Error adding product', error: error.message });
  }
};

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true
      }
    });

    // Format products to match frontend expectations
    const formattedProducts = products.map(product => ({
      id: product.id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl || 'https://via.placeholder.com/300',
      category: product.category.name,
      stock: product.stock,
      specifications: product.additionalSpecs || {},
      features: product.tags.filter(tag => !tag.includes(product.category.name) && !product.idealFor?.includes(tag)) || [],
      compatibleWith: product.compatibleWith || [],
      idealFor: product.tags.filter(tag => product.idealFor?.includes(tag)) || []
    }));

    res.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

// Get a single product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true
      }
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Format product to match frontend expectations
    const formattedProduct = {
      id: product.id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl || 'https://via.placeholder.com/300',
      category: product.category.name,
      stock: product.stock,
      specifications: product.additionalSpecs || {},
      features: product.tags.filter(tag => !tag.includes(product.category.name) && !product.idealFor?.includes(tag)) || [],
      compatibleWith: product.compatibleWith || [],
      idealFor: product.tags.filter(tag => product.idealFor?.includes(tag)) || []
    };
    
    res.json(formattedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
};

// Update a product (Admin only)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      price, 
      imageUrl, 
      category,
      stock,
      specifications,
      features,
      compatibleWith,
      idealFor 
    } = req.body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if category exists, if not create it
    let categoryObj = await prisma.category.findFirst({
      where: { name: category }
    });

    if (!categoryObj) {
      categoryObj = await prisma.category.create({
        data: {
          name: category,
          description: `Products in the ${category} category`
        }
      });
    }

    // Process additional specifications as JSON
    const additionalSpecs = specifications || {};
    
    // Create tags from features and idealFor
    const tags = [
      ...features || [],
      ...idealFor || [],
      category
    ];

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        price: parseFloat(price),
        imageUrl,
        stock: parseInt(stock) || 0,
        categoryId: categoryObj.id,
        additionalSpecs: additionalSpecs,
        tags: tags
      },
      include: {
        category: true
      }
    });

    // Format the response
    const formattedProduct = {
      id: updatedProduct.id.toString(),
      name: updatedProduct.name,
      description: updatedProduct.description,
      price: updatedProduct.price,
      imageUrl: updatedProduct.imageUrl,
      category: updatedProduct.category.name,
      stock: updatedProduct.stock,
      specifications: updatedProduct.additionalSpecs,
      features: updatedProduct.tags.filter(tag => !tag.includes(updatedProduct.category.name) && !idealFor?.includes(tag)),
      compatibleWith: compatibleWith || [],
      idealFor: idealFor || []
    };

    res.json({ 
      message: 'Product updated successfully', 
      product: formattedProduct 
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

// Delete a product (Admin only)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete the product
    await prisma.product.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};

module.exports = {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
