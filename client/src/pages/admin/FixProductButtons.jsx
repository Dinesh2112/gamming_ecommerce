import React from 'react';

/**
 * This utility helps fix button click issues in the product management page
 * @param {Function} clickHandler - The original click handler function
 * @returns {Function} - A wrapped click handler with event prevention
 */
export const fixButtonClick = (clickHandler) => {
  // Return a wrapped click handler that properly stops event propagation
  return (e, ...args) => {
    // Stop event bubbling
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Call the original handler with all args
    return clickHandler(...args);
  };
};

/**
 * Apply this to the product management buttons to make them work properly.
 * Usage examples:
 * 
 * 1. For the View button:
 *    onClick={(e) => fixButtonClick(handleViewDetails)(e, product)}
 * 
 * 2. For the Edit button:
 *    onClick={(e) => fixButtonClick(handleEditProduct)(e, product)}
 * 
 * 3. For the Delete button:
 *    onClick={(e) => fixButtonClick(handleDeleteProduct)(e, product.id)}
 */ 