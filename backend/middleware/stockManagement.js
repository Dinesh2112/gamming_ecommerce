const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware to update stock when an order is created
const updateStockOnPurchase = async (req, res, next) => {
  // Store the original json response method
  const originalJson = res.json;
  
  // Override the json method to intercept successful order responses
  res.json = async function(data) {
    const originalData = data;
    
    // If this is a successful order creation response
    if (data && data.id && data.items && Array.isArray(data.items)) {
      try {
        console.log('Updating stock for ordered products...');
        
        // For each item in the order, update the stock
        for (const item of data.items) {
          if (item.productId && item.quantity) {
            // Get current product stock
            const product = await prisma.product.findUnique({
              where: { id: item.productId }
            });
            
            if (product) {
              // Calculate new stock level
              const newStock = Math.max(0, product.stock - item.quantity);
              
              // Update product stock
              await prisma.product.update({
                where: { id: item.productId },
                data: { stock: newStock }
              });
              
              console.log(`Updated stock for product ${product.name} from ${product.stock} to ${newStock}`);
              
              // Check if stock is low (less than 5) and send notification
              if (newStock <= 5) {
                await createLowStockNotification(product.id, product.name, newStock);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error updating stock:', error);
        // We don't want to fail the order if stock update fails
        // Just log the error and continue
      }
    }
    
    // Call the original json method
    return originalJson.call(this, originalData);
  };
  
  next();
};

// Create a notification for admin about low stock
async function createLowStockNotification(productId, productName, currentStock) {
  try {
    await prisma.notification.create({
      data: {
        type: 'LOW_STOCK',
        message: `Low stock alert for ${productName}. Current stock: ${currentStock}`,
        read: false,
        additionalData: JSON.stringify({
          productId,
          currentStock
        })
      }
    });
    console.log(`Created low stock notification for ${productName}`);
  } catch (error) {
    console.error('Error creating low stock notification:', error);
  }
}

// Middleware to check stock availability before order creation
const validateStockAvailability = async (req, res, next) => {
  try {
    if (req.body.items && Array.isArray(req.body.items)) {
      const itemsWithInsufficientStock = [];
      
      // Check stock for each order item
      for (const item of req.body.items) {
        if (item.productId && item.quantity) {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
            select: { id: true, name: true, stock: true }
          });
          
          if (!product) {
            return res.status(404).json({ 
              message: `Product not found with id ${item.productId}` 
            });
          }
          
          if (product.stock < item.quantity) {
            itemsWithInsufficientStock.push({
              productId: product.id,
              name: product.name,
              requestedQuantity: item.quantity,
              availableStock: product.stock
            });
          }
        }
      }
      
      // If any item has insufficient stock, return error
      if (itemsWithInsufficientStock.length > 0) {
        return res.status(400).json({
          message: 'Insufficient stock for some products',
          itemsWithInsufficientStock
        });
      }
    }
    
    // All items have sufficient stock, proceed
    next();
  } catch (error) {
    console.error('Error validating stock availability:', error);
    res.status(500).json({ message: 'Error checking product stock', error: error.message });
  }
};

module.exports = {
  updateStockOnPurchase,
  validateStockAvailability
}; 