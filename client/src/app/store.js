import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '../features/cart/cartSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    // Add other reducers here as needed
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store; 