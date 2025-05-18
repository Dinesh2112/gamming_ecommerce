const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Import the prisma client with retry logic
const { prismaOperation } = require("../prismaClient");
// Import mockProducts data for fallback
const { mockProducts } = require("../mockData");

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

// Get all products or filter by category
const getProducts = async (req, res) => {
  console.log("=== getProducts called ===");
  try {
    const { category } = req.query;
    
    console.log("Fetching all products from database");
    
    let products;
    
    try {
      if (category) {
        console.log(`Filtering by category: ${category}`);
        
        // Use prismaOperation to handle connection issues
        products = await prismaOperation(async () => {
          return await prisma.product.findMany({
            where: {
              category: {
                name: category
              }
            },
            include: {
              category: true
            }
          });
        });
      } else {
        // Use prismaOperation to handle connection issues
        products = await prismaOperation(async () => {
          return await prisma.product.findMany({
            include: {
              category: true
            }
          });
        });
      }
      
      console.log(`Found ${products.length} products from database`);
      
      // Add stock availability information to each product
      products = products.map(product => ({
        ...product,
        inStock: product.stock > 0,
        stockStatus: product.stock > 10 ? 'In Stock' : 
                   product.stock > 0 ? `Only ${product.stock} left` : 
                   'Out of Stock'
      }));
    } catch (dbError) {
      console.error("Database error in getProducts:", dbError.message);
      console.log("Falling back to mock products");
      
      // Use mock data when database is unavailable
      products = [...mockProducts];
      if (category) {
        products = products.filter(p => p.category.name === category);
      }
      
      console.log(`Using ${products.length} mock products`);
    }
    
    res.json(products);
  } catch (error) {
    console.log("=== Error in getProducts ===");
    console.log("Error message: ", error.message);
    console.log("Error stack:", error.stack);
    
    // Last resort fallback to mock data
    console.log("Critical error. Using mock data as last resort.");
    res.json(mockProducts);
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
      inStock: product.stock > 0,
      stockStatus: product.stock > 10 ? 'In Stock' : 
                 product.stock > 0 ? `Only ${product.stock} left` : 
                 'Out of Stock',
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

    console.log('⏺️ Updating product:', id);
    console.log('⏺️ Update data:', { name, price, category, stock });

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      console.log('❌ Product not found with ID:', id);
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if category exists, if not create it
    let categoryObj = await prisma.category.findFirst({
      where: { name: category }
    });

    if (!categoryObj) {
      console.log('➕ Creating new category:', category);
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

    console.log('✅ Product updated successfully:', updatedProduct.id);

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
    console.error('❌ Error updating product:', error);
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

// Delete a product (Admin only)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('⏺️ Deleting product:', id);

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      console.log('❌ Product not found with ID:', id);
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete the product
    await prisma.product.delete({
      where: { id: parseInt(id) }
    });

    console.log('✅ Product deleted successfully:', id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};

// Get products by IDs (for AI assistant suggestions)
const getSuggestedProducts = async (req, res) => {
  try {
    const { ids } = req.query;
    
    if (!ids) {
      return res.status(400).json({ message: 'Product IDs are required' });
    }
    
    // Parse the comma-separated IDs to integers
    const productIds = ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    
    console.log(`Fetching suggested products with IDs: ${productIds.join(', ')}`);
    
    // Use the prismaOperation wrapper to handle connection issues
    const products = await prismaOperation(async () => {
      return await prisma.product.findMany({
        where: {
          id: {
            in: productIds
          }
        },
        include: {
          category: true
        }
      });
    });
    
    console.log(`Found ${products.length} products out of ${productIds.length} requested IDs`);
    
    // Map the products to the expected format
    const formattedProducts = products.map(product => {
      try {
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          imageUrl: product.imageUrl || 'https://placehold.co/300x200/333/FFF?text=No+Image',
          category: product.category?.name || 'Uncategorized',
          stock: product.stock || 0,
          specifications: product.additionalSpecs || {},
          // Extract features from tags if available
          features: Array.isArray(product.tags) ? product.tags : []
        };
      } catch (error) {
        console.error(`Error formatting product ${product.id}:`, error);
        return null;
      }
    }).filter(Boolean); // Remove any null values
    
    res.json(formattedProducts);
  } catch (error) {
    console.error('Error in getSuggestedProducts:', error);
    res.status(500).json({ message: 'Error fetching suggested products', error: error.message });
  }
};

// Create initial products if none exist
const createInitialProducts = async () => {
  try {
    console.log("Creating initial products");
    
    // Use prismaOperation wrapper to handle connection issues
    const count = await prismaOperation(async () => {
      return await prisma.product.count();
    });
    
    if (count > 0) {
      console.log(`Found ${count} existing products, skipping initialization`);
      return;
    }
    
    // Check if we have necessary categories
    const gpuCategory = await prismaOperation(async () => {
      return await prisma.category.upsert({
        where: { name: "GPUs" },
        update: {},
        create: {
          name: "GPUs",
          description: "Graphics Processing Units for gaming and professional use"
        }
      });
    });

    // More initialization code... keep using prismaOperation where appropriate
    
    // Create initial products
    await prismaOperation(async () => {
      return await prisma.product.create({
        data: {
          name: "NVIDIA GeForce RTX 3080",
          description: "High-end graphics card for 4K gaming and content creation",
          price: 69999,
          imageUrl: "/images/products/rtx3080.jpg",
          stock: 15,
          categoryId: gpuCategory.id,
          brand: "NVIDIA",
          model: "RTX 3080",
          clockSpeed: 1.71,
          cores: 8704,
          vram: 10,
          rayTracingSupport: true,
          powerConsumption: 320,
          additionalSpecs: {
            "architecture": "Ampere",
            "memoryType": "GDDR6X",
            "memoryBandwidth": "760 GB/s",
            "maxResolution": "7680 x 4320",
            "connectors": "HDMI 2.1, 3x DisplayPort 1.4a"
          },
          tags: ["RTX", "4K Gaming", "Ray Tracing", "DLSS", "VR Ready"]
        }
      });
    });

    // Additional products...
    
    console.log("Initial products created successfully");

  } catch (error) {
    console.error("Error during auto-initialization:", error);
  }
};

module.exports = {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getSuggestedProducts,
  createInitialProducts
};

// Auto-initialize products when the server starts
(async () => {
  try {
    const result = await createInitialProducts();
    console.log('Auto-initialization result:', result);
  } catch (error) {
    console.error('Error during auto-initialization:', error);
  }
})();
