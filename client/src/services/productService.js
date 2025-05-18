import axios from '../axiosConfig';

// Get all products
export const getAllProducts = async () => {
  try {
    const response = await axios.get('/api/products');
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Get product by ID
export const getProductById = async (id) => {
  try {
    const response = await axios.get(`/api/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};

// Add new product
export const addProduct = async (productData) => {
  try {
    const response = await axios.post('/api/products', productData);
    return response.data;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

// Update product
export const updateProduct = async (id, productData) => {
  try {
    // Ensure ID is an integer if it's a numeric string
    const productId = typeof id === 'string' ? parseInt(id) : id;
    const response = await axios.put(`/api/products/${productId}`, productData);
    return response.data;
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    throw error;
  }
};

// Delete product
export const deleteProduct = async (id) => {
  try {
    // Ensure ID is an integer if it's a numeric string
    const productId = typeof id === 'string' ? parseInt(id) : id;
    const response = await axios.delete(`/api/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    throw error;
  }
};

export default {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct
}; 