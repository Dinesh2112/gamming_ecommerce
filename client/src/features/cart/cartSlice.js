import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    totalQuantity: 0,
    totalAmount: 0,
    errors: []
  },
  reducers: {
    addToCart(state, action) {
      const newItem = action.payload;
      const existingItem = state.items.find(item => item.id === newItem.id);
      
      // Clear any previous errors
      state.errors = state.errors.filter(err => err.id !== newItem.id);
      
      // Check stock availability
      const requestedQuantity = (existingItem ? existingItem.quantity : 0) + (newItem.quantity || 1);
      if (newItem.stock !== undefined && requestedQuantity > newItem.stock) {
        // Add error message
        state.errors.push({
          id: newItem.id,
          message: `Only ${newItem.stock} units available for ${newItem.name}`,
          timestamp: Date.now()
        });
        
        // If the item exists, update its quantity to the maximum available
        if (existingItem && newItem.stock > 0) {
          existingItem.quantity = newItem.stock;
          existingItem.totalPrice = existingItem.price * newItem.stock;
        }
        
        // If trying to add a new item but stock is 0, don't add it
        if (!existingItem && newItem.stock <= 0) {
          return;
        }
        
        // If trying to add a new item and some stock is available
        if (!existingItem && newItem.stock > 0) {
          state.items.push({
            id: newItem.id,
            name: newItem.name,
            price: newItem.price,
            quantity: newItem.stock,
            totalPrice: newItem.price * newItem.stock,
            image: newItem.image,
            stock: newItem.stock
          });
        }
      } else {
        // Normal case - sufficient stock
        if (!existingItem) {
          state.items.push({
            id: newItem.id,
            name: newItem.name,
            price: newItem.price,
            quantity: newItem.quantity || 1,
            totalPrice: newItem.price * (newItem.quantity || 1),
            image: newItem.image,
            stock: newItem.stock
          });
        } else {
          existingItem.quantity += newItem.quantity || 1;
          existingItem.totalPrice = existingItem.price * existingItem.quantity;
          // Update the stock info if provided
          if (newItem.stock !== undefined) {
            existingItem.stock = newItem.stock;
          }
        }
      }
      
      // Update cart totals
      state.totalQuantity = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalAmount = state.items.reduce((total, item) => total + item.totalPrice, 0);
    },
    
    removeFromCart(state, action) {
      const id = action.payload;
      state.items = state.items.filter(item => item.id !== id);
      
      // Clear any errors related to this item
      state.errors = state.errors.filter(err => err.id !== id);
      
      // Update cart totals
      state.totalQuantity = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalAmount = state.items.reduce((total, item) => total + item.totalPrice, 0);
    },
    
    updateCartItemQuantity(state, action) {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      
      // Clear any previous errors for this item
      state.errors = state.errors.filter(err => err.id !== id);
      
      if (item) {
        // Check stock availability
        if (item.stock !== undefined && quantity > item.stock) {
          // Add error message
          state.errors.push({
            id: item.id,
            message: `Only ${item.stock} units available for ${item.name}`,
            timestamp: Date.now()
          });
          
          // Set to maximum available
          if (item.stock > 0) {
            item.quantity = item.stock;
            item.totalPrice = item.price * item.stock;
          }
        } else {
          // Normal case - sufficient stock or stock info not provided
          item.quantity = quantity;
          item.totalPrice = item.price * quantity;
        }
        
        // Update cart totals
        state.totalQuantity = state.items.reduce((total, item) => total + item.quantity, 0);
        state.totalAmount = state.items.reduce((total, item) => total + item.totalPrice, 0);
      }
    },
    
    clearCart(state) {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
      state.errors = [];
    },
    
    clearErrors(state, action) {
      if (action.payload) {
        // Clear specific error by ID
        state.errors = state.errors.filter(err => err.id !== action.payload);
      } else {
        // Clear all errors
        state.errors = [];
      }
    }
  }
});

export const { 
  addToCart, 
  removeFromCart, 
  updateCartItemQuantity, 
  clearCart,
  clearErrors
} = cartSlice.actions;
export default cartSlice.reducer; 