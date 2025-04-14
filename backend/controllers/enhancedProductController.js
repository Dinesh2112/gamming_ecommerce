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
    console.log('=== getProducts called ===');
    console.log('Fetching all products from database');
    
    const products = await prisma.product.findMany({
      include: {
        category: true
      }
    });
    
    console.log(`Found ${products.length} products in database`);
    
    if (!products || products.length === 0) {
      console.log('No products found in database, returning empty array');
      return res.json([]);
    }

    // Format products to match frontend expectations
    const formattedProducts = [];
    
    for (const product of products) {
      try {
        formattedProducts.push({
          id: product.id.toString(),
          name: product.name || 'Unnamed Product',
          description: product.description || 'No description available',
          price: product.price || 0,
          imageUrl: product.imageUrl || 'https://placehold.co/300x200/333/FFF?text=No+Image',
          category: product.category?.name || 'Uncategorized',
          stock: product.stock || 0,
          specifications: product.additionalSpecs || {},
          features: Array.isArray(product.tags) 
            ? product.tags.filter(tag => product.category && 
                !tag.includes(product.category.name) && 
                !(product.idealFor || []).includes(tag)) 
            : [],
          compatibleWith: product.compatibleWith || [],
          idealFor: Array.isArray(product.tags) 
            ? product.tags.filter(tag => (product.idealFor || []).includes(tag))
            : []
        });
      } catch (err) {
        console.error(`Error formatting product ${product.id}:`, err);
        // Continue with next product
      }
    }

    console.log(`Successfully formatted ${formattedProducts.length} products`);
    res.json(formattedProducts);
  } catch (error) {
    console.error('=== Error in getProducts ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error fetching products', 
      error: error.message 
    });
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

// Get suggested products by IDs
const getSuggestedProducts = async (req, res) => {
  try {
    console.log('=== getSuggestedProducts called ===');
    console.log('Request query:', req.query);
    console.log('Request URL:', req.originalUrl);
    console.log('Request method:', req.method);
    
    const { ids } = req.query;
    
    if (!ids) {
      console.log('No IDs provided in request');
      return res.status(400).json({ message: 'Product IDs are required' });
    }
    
    // Convert comma-separated string of IDs to array of numbers
    const productIds = ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    
    console.log('Parsed product IDs:', productIds);
    
    if (productIds.length === 0) {
      console.log('No valid IDs provided');
      return res.json([]);
    }
    
    try {
      // Fetch products with their category
      const products = await prisma.product.findMany({
        where: {
          id: {
            in: productIds
          }
        },
        include: {
          category: true
        }
      });
      
      console.log(`Found ${products.length} products in database`);
      console.log('Products found:', JSON.stringify(products.map(p => ({ id: p.id, name: p.name })), null, 2));
      
      if (!products || products.length === 0) {
        console.log('No products found for IDs:', productIds);
        return res.json([]);
      }
      
      // Map product IDs found in the database
      const foundIds = products.map(p => p.id);
      console.log('Found product IDs:', foundIds);
      
      // Find missing products
      const missingIds = productIds.filter(id => !foundIds.includes(id));
      if (missingIds.length > 0) {
        console.log('Some products were not found:', missingIds);
      }
      
      // Format products to match frontend expectations
      const formattedProducts = [];
      
      for (const product of products) {
        try {
          console.log(`Formatting product ${product.id}: ${product.name}`);
          
          // Parse additionalSpecs if it exists
          let additionalSpecs = {};
          
          if (product.additionalSpecs) {
            try {
              // Prisma automatically converts Json fields to objects
              additionalSpecs = product.additionalSpecs;
              console.log(`additionalSpecs for product ${product.id}:`, additionalSpecs);
            } catch (e) {
              console.error(`Error accessing additionalSpecs for product ${product.id}:`, e);
              additionalSpecs = {};
            }
          } else {
            console.log(`No additionalSpecs for product ${product.id}`);
          }
          
          // Handle image URL
          let imageUrl = product.imageUrl;
          if (!imageUrl) {
            console.log(`No image URL for product ${product.id}`);
            imageUrl = 'https://placehold.co/300x200/333/FFF?text=No+Image';
          } else if (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
            console.log(`Converting relative URL to absolute for product ${product.id}`);
            imageUrl = `http://localhost:5000${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
          }
          
          // Safely handle tags (String[] in schema)
          let tags = [];
          if (product.tags && Array.isArray(product.tags)) {
            tags = product.tags;
          } else if (product.tags && typeof product.tags === 'string') {
            // In case tags is stored as comma-separated string
            tags = product.tags.split(',').map(tag => tag.trim());
          }
          
          // Get idealFor from additionalSpecs or default to empty array
          const idealFor = additionalSpecs?.idealFor && Array.isArray(additionalSpecs.idealFor) 
            ? additionalSpecs.idealFor 
            : [];
          
          const formattedProduct = {
            id: product.id.toString(),
            name: product.name || 'Unnamed Product',
            description: product.description || 'No description available',
            price: typeof product.price === 'number' ? product.price : 0,
            imageUrl: imageUrl,
            category: product.category?.name || 'Uncategorized',
            stock: typeof product.stock === 'number' ? product.stock : 0,
            specifications: additionalSpecs || {},
            features: tags,
            idealFor: idealFor
          };
          
          console.log(`Successfully formatted product ${product.id}`);
          formattedProducts.push(formattedProduct);
        } catch (error) {
          console.error(`Error formatting product ${product?.id || 'unknown'}:`, error);
          console.error('Problem product:', JSON.stringify(product, null, 2));
          // Continue with next product rather than failing the entire request
        }
      }
      
      console.log(`Successfully formatted ${formattedProducts.length} products`);
      console.log('Returning formatted products:', JSON.stringify(formattedProducts.map(p => ({ id: p.id, name: p.name })), null, 2));
      
      // Return the formatted products
      return res.json(formattedProducts);
    } catch (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({
        message: 'Database error when fetching products',
        error: dbError.message
      });
    }
  } catch (error) {
    console.error('=== Error in getSuggestedProducts ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ 
      message: 'Error fetching suggested products', 
      error: error.message
    });
  }
};

// Create initial products
const createInitialProducts = async () => {
  console.log('Creating initial products');
  
  // First, check if there are any products already
  const existingProducts = await prisma.product.count();
  
  if (existingProducts > 0) {
    console.log(`Found ${existingProducts} existing products, skipping initialization`);
    return {
      message: 'Products already exist',
      created: false
    };
  }

  // Create a GPU category if it doesn't exist
  let gpuCategory = await prisma.category.findFirst({
    where: { name: 'GPU' }
  });

  if (!gpuCategory) {
    gpuCategory = await prisma.category.create({
      data: {
        name: 'GPU',
        description: 'Graphics Processing Units for gaming and professional work'
      }
    });
    console.log('Created GPU category');
  }

  // Create initial products
  const products = [];

  // Product 1: NVIDIA GeForce RTX 3080
  products.push(await prisma.product.create({
    data: {
      name: 'NVIDIA GeForce RTX 3080',
      description: 'High-end graphics card for 4K gaming with ray tracing capabilities',
      price: 69999.99,
      imageUrl: 'https://placehold.co/300x200/333/FFF?text=RTX+3080',
      stock: 10,
      categoryId: gpuCategory.id,
      brand: 'NVIDIA',
      additionalSpecs: {
        memory: '10GB GDDR6X',
        powerConsumption: '320W',
        ports: ['HDMI 2.1', 'DisplayPort 1.4a'],
        architecture: 'Ampere',
        boostClock: '1.71 GHz',
        recommendedPSU: '750W',
        idealFor: ['4K Gaming', 'Ray Tracing', 'Content Creation']
      },
      tags: ['4K Gaming', 'Ray Tracing', 'High-End Gaming', 'Content Creation', 'GPU']
    }
  }));
  console.log('Created RTX 3080 product');

  // Product 2: NVIDIA GeForce RTX 5090
  products.push(await prisma.product.create({
    data: {
      name: 'NVIDIA GeForce RTX 5090',
      description: 'Top-of-the-line graphics card for ultimate gaming performance',
      price: 149999.99,
      imageUrl: 'https://placehold.co/300x200/333/FFF?text=RTX+5090',
      stock: 5,
      categoryId: gpuCategory.id,
      brand: 'NVIDIA',
      additionalSpecs: {
        memory: '24GB GDDR6X',
        powerConsumption: '450W',
        ports: ['HDMI 2.1', 'DisplayPort 1.4a'],
        architecture: 'Next-Gen',
        boostClock: '2.2 GHz',
        recommendedPSU: '1000W',
        idealFor: ['8K Gaming', 'Professional Work', 'Content Creation']
      },
      tags: ['8K Gaming', 'Ray Tracing', 'Professional Workloads', 'High-End Gaming', 'Professional Work', 'Content Creation', 'GPU']
    }
  }));
  console.log('Created RTX 5090 product');
  
  return {
    message: 'Initial products created successfully',
    created: true,
    products
  };
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
