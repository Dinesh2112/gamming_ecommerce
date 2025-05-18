// This is a simplified fix for the ProductManagement component
// Just update your button click handlers to use this approach

/**
 * For the Edit button, update it to:
 * 
 * <button 
 *   type="button"
 *   className="edit-btn" 
 *   onClick={(e) => {
 *     // Prevent event bubbling
 *     e.preventDefault();
 *     e.stopPropagation();
 *     // Then call your handler
 *     handleEditProduct(product);
 *   }}
 * >
 *   Edit
 * </button>
 * 
 * Do the same for View and Delete buttons
 */ 