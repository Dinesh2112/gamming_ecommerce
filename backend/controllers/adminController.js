const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get dashboard statistics
 */
const getDashboardStats = async (req, res) => {
  try {
    // Access the global Prisma instance
    const prisma = global.prisma;
    
    // Get counts for various entities
    const [
      productCount,
      userCount,
      orderCount,
      totalRevenue,
      chatCount,
      categories
    ] = await Promise.all([
      // Count products
      prisma.product.count(),
      
      // Count users
      prisma.user.count(),
      
      // Count orders
      prisma.order.count(),
      
      // Calculate total revenue (sum of order totals)
      prisma.order.aggregate({
        _sum: {
          totalAmount: true
        }
      }),
      
      // Count AI chats
      prisma.aIChat.count(),
      
      // Get product counts by category
      prisma.category.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: { products: true }
          }
        }
      })
    ]);
    
    // Format category data for the dashboard
    const categoryData = categories.map(category => ({
      name: category.name,
      count: category._count.products
    }));
    
    // Get 5 recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });
    
    // Format recent orders for the dashboard
    const formattedRecentOrders = recentOrders.map(order => ({
      id: order.id,
      customerName: order.user.name,
      customerEmail: order.user.email,
      totalAmount: order.totalAmount,
      status: order.status,
      items: order.items.length,
      date: order.createdAt
    }));
    
    // Get low stock products (stock less than 10)
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: { lt: 10 }
      },
      select: {
        id: true,
        name: true,
        stock: true,
        category: {
          select: {
            name: true
          }
        }
      },
      take: 5
    });
    
    // Return dashboard stats as JSON
    res.json({
      counts: {
        products: productCount,
        users: userCount,
        orders: orderCount,
        chats: chatCount,
        revenue: totalRevenue._sum.totalAmount || 0
      },
      categoryDistribution: categoryData,
      recentOrders: formattedRecentOrders,
      lowStockProducts: lowStockProducts
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ 
      message: 'Error fetching dashboard statistics',
      error: error.message 
    });
  }
};

/**
 * Create a new product
 */
const createProduct = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      categoryId, 
      stock, 
      images,
      specifications,
      featured = false
    } = req.body;

    // Validate required fields
    if (!name || !description || !price || !categoryId) {
      return res.status(400).json({ 
        message: 'Name, description, price, and category are required' 
      });
    }

    // Check if category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!categoryExists) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock || 0),
        featured,
        images: images || [],
        specifications: specifications || {},
        category: {
          connect: { id: categoryId }
        }
      },
      include: {
        category: true
      }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Failed to create product' });
  }
};

/**
 * Get all products with pagination
 */
const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', categoryId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where clause
    const where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    // Get products with pagination
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          category: true
        }
      }),
      prisma.product.count({ where })
    ]);
    
    res.status(200).json({
      products,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

/**
 * Get a product by ID
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true
      }
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
};

/**
 * Update a product
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      price, 
      categoryId, 
      stock, 
      images,
      specifications,
      featured
    } = req.body;
    
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });
    
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Prepare update data
    const updateData = {};
    
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (featured !== undefined) updateData.featured = featured;
    if (images !== undefined) updateData.images = images;
    if (specifications !== undefined) updateData.specifications = specifications;
    
    // Update category if provided
    if (categoryId) {
      // Check if category exists
      const categoryExists = await prisma.category.findUnique({
        where: { id: categoryId }
      });
      
      if (!categoryExists) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      updateData.category = {
        connect: { id: categoryId }
      };
    }
    
    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true
      }
    });
    
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
};

/**
 * Delete a product
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });
    
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Delete product
    await prisma.product.delete({
      where: { id }
    });
    
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
};

/**
 * Get all categories
 */
const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

/**
 * Create a new category
 */
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    // Check if category with same name already exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        }
      }
    });
    
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }
    
    // Create category
    const category = await prisma.category.create({
      data: {
        name,
        description: description || ''
      }
    });
    
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Failed to create category' });
  }
};

module.exports = {
  getDashboardStats,
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getAllCategories,
  createCategory
}; 