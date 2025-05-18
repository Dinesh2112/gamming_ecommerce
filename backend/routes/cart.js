const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const { PrismaClient } = require("@prisma/client");
const { validateStockAvailability, updateStockOnPurchase } = require("../middleware/stockManagement");
const crypto = require('crypto');

// Initialize Razorpay
const Razorpay = require('razorpay');
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_Z4ZpOq2T7TkpNd',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'GJjGpi32pgHNtYdSNzUB4SK3'
});

const prisma = new PrismaClient();

// ✅ Add product to cart
router.post("/add", verifyToken, async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    return res.status(400).json({ message: "productId and quantity are required" });
  }

  try {
    // First check if product exists and has enough stock
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if we have enough stock
    if (product.stock < quantity) {
      return res.status(400).json({ 
        message: "Insufficient stock", 
        availableStock: product.stock 
      });
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        userId: req.user.id,
        productId: parseInt(productId)
      }
    });

    if (existingCartItem) {
      // Update quantity instead of creating new item
      const newQuantity = existingCartItem.quantity + parseInt(quantity);
      
      // Check if total quantity exceeds stock
      if (newQuantity > product.stock) {
        return res.status(400).json({ 
          message: "Insufficient stock for requested quantity", 
          availableStock: product.stock,
          currentlyInCart: existingCartItem.quantity
        });
      }
      
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity }
      });
      
      return res.status(200).json({ 
        message: "Cart item quantity updated", 
        cartItem: updatedItem 
      });
    }

    // Create new cart item
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
    // Convert id to integer and validate
    const itemId = parseInt(id);
    if (isNaN(itemId)) {
      return res.status(400).json({ message: "Invalid cart item ID" });
    }

    // Check if the cart item exists before updating
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    // Check if user owns this cart item
    if (cartItem.userId !== req.user.id) {
      return res.status(403).json({ message: "You don't have permission to update this cart item" });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: { product: true }, // Include product details in the response
    });
    
    res.json({ message: "Cart item updated", updatedItem });
  } catch (error) {
    console.error("Cart update error:", error);
    res.status(500).json({ message: "Error updating cart item", error: error.message });
  }
});

// ✅ Delete single cart item
router.delete("/remove/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Convert id to integer and validate
    const itemId = parseInt(id);
    if (isNaN(itemId)) {
      return res.status(400).json({ message: "Invalid cart item ID" });
    }

    // Check if the cart item exists
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    // Check if user owns this cart item
    if (cartItem.userId !== req.user.id) {
      return res.status(403).json({ message: "You don't have permission to remove this cart item" });
    }

    await prisma.cartItem.delete({ where: { id: itemId } });
    res.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Cart removal error:", error);
    res.status(500).json({ message: "Error removing item", error: error.message });
  }
});

// ✅ Checkout and place order
router.post("/checkout", verifyToken, validateStockAvailability, updateStockOnPurchase, async (req, res) => {
  try {
    console.log('Manual checkout request:', req.body);
    
    const { shippingAddress } = req.body;
    
    // Validate shipping address
    if (!shippingAddress) {
      console.log('No shipping address provided');
      return res.status(400).json({ message: "Shipping address is required" });
    }
    
    const { name, phone, street, city, state, zipCode } = shippingAddress;
    if (!name || !phone || !street || !city || !state || !zipCode) {
      console.log('Incomplete shipping address:', shippingAddress);
      return res.status(400).json({ message: "Incomplete shipping address" });
    }
    
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      console.log('Cart is empty, cannot create order');
      return res.status(400).json({ message: "Cart is empty" });
    }
    
    // Double check stock availability
    const stockCheck = await Promise.all(cartItems.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { id: true, name: true, stock: true }
      });
      
      if (!product) {
        return { valid: false, message: `Product not found: ${item.productId}` };
      }
      
      if (product.stock < item.quantity) {
        return { 
          valid: false, 
          message: `Not enough stock for ${product.name}. Requested: ${item.quantity}, Available: ${product.stock}` 
        };
      }
      
      return { valid: true };
    }));
    
    const invalidItems = stockCheck.filter(item => !item.valid);
    if (invalidItems.length > 0) {
      return res.status(400).json({ 
        message: "Stock check failed", 
        errors: invalidItems.map(item => item.message)
      });
    }

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0
    );
    
    console.log('Creating order with total amount:', totalAmount);

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        totalAmount,
        paymentMethod: 'Manual',
        paymentStatus: 'COMPLETED',
        status: 'CONFIRMED',
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
        shippingAddress: {
          create: {
            name,
            phone,
            street,
            city,
            state,
            zipCode,
          }
        }
      },
      include: {
        items: true,
        shippingAddress: true
      },
    });

    console.log('Order created successfully:', order.id);

    // Update product stock
    await Promise.all(cartItems.map(async (item) => {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });
    }));

    // Clear the cart after successful order creation
    await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });

    console.log('Cart cleared for user:', req.user.id);

    res.status(201).json({ 
      message: "Order placed successfully", 
      order 
    });
  } catch (error) {
    console.error('=== Checkout error ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: "Checkout failed", 
      error: error.message 
    });
  }
});

// ✅ Create Razorpay order
router.post("/create-order", verifyToken, async (req, res) => {
  try {
    const { shippingAddress, amount } = req.body;
    
    console.log('Creating order with data:', { 
      shippingAddress: { ...shippingAddress, name: shippingAddress?.name }, 
      amount 
    });
    
    if (!shippingAddress) {
      return res.status(400).json({ message: "Shipping address is required" });
    }
    
    // Validate shipping address
    const { name, phone, street, city, state, zipCode } = shippingAddress;
    if (!name || !phone || !street || !city || !state || !zipCode) {
      return res.status(400).json({ message: "Incomplete shipping address" });
    }
    
    // Fetch cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true },
    });

    console.log('Found cart items:', cartItems.length);

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Calculate total from cart items
    const total = cartItems.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0
    );
    
    console.log('Cart total:', total);
    
    // Ensure Razorpay is initialized with the correct keys
    console.log('Razorpay key ID:', process.env.RAZORPAY_KEY_ID?.substring(0, 10) + '...');
    console.log('Razorpay key secret exists:', !!process.env.RAZORPAY_KEY_SECRET);
    
    // Initialize Razorpay with environment variables
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    
    // Create Razorpay order
    try {
      // Limit the amount to a reasonable value to avoid errors
      const safeAmount = Math.min(Math.round(total * 100), 1000000); // Max 10,000 INR
      
      const razorpayOrderOptions = {
        amount: safeAmount,
        currency: 'INR',
        receipt: `order_rcpt_${Date.now()}_${req.user.id}`,
        notes: {
          userId: req.user.id,
        }
      };
      
      console.log('Razorpay order options:', razorpayOrderOptions);
      
      const razorpayOrder = await razorpay.orders.create(razorpayOrderOptions);
      
      console.log('Razorpay order created:', razorpayOrder);
      
      // Save pre-order in database for later verification
      const order = await prisma.order.create({
        data: {
          userId: req.user.id,
          razorpayOrderId: razorpayOrder.id,
          status: 'PENDING',
          totalAmount: total,
          paymentMethod: 'Razorpay',
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
          shippingAddress: {
            create: {
              name,
              phone,
              street,
              city,
              state,
              zipCode,
            }
          }
        },
      });
      
      console.log('Database order created with ID:', order.id);
      
      res.json({
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        dbOrderId: order.id
      });
    } catch (razorpayError) {
      console.error('Razorpay order creation error:', razorpayError);
      
      // Log more detailed error information
      if (razorpayError.statusCode) {
        console.error('Razorpay API status code:', razorpayError.statusCode);
      }
      if (razorpayError.error) {
        console.error('Razorpay API error:', razorpayError.error);
      }
      
      return res.status(500).json({ 
        message: "Failed to create Razorpay order", 
        error: razorpayError.message || 'Unknown Razorpay error' 
      });
    }
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: "Failed to create order", error: error.message });
  }
});

// ✅ Verify payment
router.post("/verify-payment", verifyToken, async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;
    
    console.log('Verifying payment with data:', { 
      orderId: orderId?.substring(0, 15) + '...',
      paymentId: paymentId?.substring(0, 15) + '...',
      signatureLength: signature?.length || 0
    });
    
    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ message: "Missing payment details" });
    }
    
    // Verify signature
    try {
      const text = orderId + "|" + paymentId;
      const secretKey = process.env.RAZORPAY_KEY_SECRET || 'GJjGpi32pgHNtYdSNzUB4SK3';
      
      console.log('Using secretKey:', secretKey?.substring(0, 5) + '...');
      console.log('Generating signature for text:', text?.substring(0, 15) + '...');
      
      const generatedSignature = crypto
        .createHmac("sha256", secretKey)
        .update(text)
        .digest("hex");
      
      const isSignatureValid = generatedSignature === signature;
      
      console.log('Signature verification:', { 
        expected: generatedSignature?.substring(0, 15) + '...',
        received: signature?.substring(0, 15) + '...',
        isValid: isSignatureValid
      });
      
      if (!isSignatureValid) {
        return res.status(400).json({ message: "Invalid payment signature" });
      }
    } catch (signatureError) {
      console.error('Error during signature verification:', signatureError);
      return res.status(400).json({ message: "Signature verification failed", error: signatureError.message });
    }
    
    // Find order
    let order;
    try {
      // First try finding by the Razorpay order ID
      order = await prisma.order.findFirst({
        where: { razorpayOrderId: orderId, userId: req.user.id },
      });
      
      // If not found, create a new order from the cart data
      if (!order) {
        console.log('Order not found in database, creating from cart...');
        
        // Get cart items
        const cartItems = await prisma.cartItem.findMany({
          where: { userId: req.user.id },
          include: { product: true },
        });
        
        if (cartItems.length === 0) {
          return res.status(400).json({ message: "Cart is empty, cannot create order" });
        }
        
        const totalAmount = cartItems.reduce(
          (sum, item) => sum + item.quantity * item.product.price, 0
        );
        
        // Create the order
        order = await prisma.order.create({
          data: {
            userId: req.user.id,
            razorpayOrderId: orderId,
            status: 'PENDING',
            totalAmount,
            paymentId: paymentId,
            items: {
              create: cartItems.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.product.price,
              })),
            },
          },
        });
      }
      
      console.log('Order found/created:', order.id);
      
      // Update order status to CONFIRMED
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'CONFIRMED',
          paymentId: paymentId,
          paymentStatus: 'COMPLETED'
        },
      });
      
      console.log('Order updated:', updatedOrder.id);
      
      // Clear cart
      await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });
      
      res.json({ 
        message: "Payment verified successfully",
        orderId: order.id,
        paymentId: paymentId
      });
    } catch (orderError) {
      console.error('Error processing order:', orderError);
      return res.status(500).json({ message: "Failed to process order", error: orderError.message });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: "Failed to verify payment", error: error.message });
  }
});

module.exports = router;
