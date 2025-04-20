/**
 * Storage utility functions for Espressionist e-commerce site
 * Handles localStorage operations for cart and orders
 */

/**
 * Get cart items from localStorage
 * @returns {Array} Array of cart items
 */
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || []
}

/**
 * Save cart items to localStorage
 * @param {Array} cartItems - Array of cart items to save
 */
function saveCart(cartItems) {
  localStorage.setItem("cart", JSON.stringify(cartItems))
}

/**
 * Add item to cart
 * @param {Object} product - Product to add to cart
 * @param {number} quantity - Quantity to add
 * @returns {boolean} - True if added successfully, false if error
 */
function addToCart(product, quantity = 1) {
  try {
    const cart = getCart()

    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex((item) => item.id === product.id)

    if (existingItemIndex !== -1) {
      // Update quantity if product already exists
      cart[existingItemIndex].quantity += quantity
    } else {
      // Add new product to cart
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
      })
    }

    saveCart(cart)
    return true
  } catch (error) {
    console.error("Error adding to cart:", error)
    return false
  }
}

/**
 * Update item quantity in cart
 * @param {string} productId - Product ID to update
 * @param {number} quantity - New quantity
 * @returns {boolean} - True if updated successfully, false if error
 */
function updateCartItemQuantity(productId, quantity) {
  try {
    const cart = getCart()
    const itemIndex = cart.findIndex((item) => item.id === productId)

    if (itemIndex !== -1) {
      cart[itemIndex].quantity = quantity
      saveCart(cart)
      return true
    }
    return false
  } catch (error) {
    console.error("Error updating cart item:", error)
    return false
  }
}

/**
 * Remove item from cart
 * @param {string} productId - Product ID to remove
 * @returns {boolean} - True if removed successfully, false if error
 */
function removeFromCart(productId) {
  try {
    const cart = getCart()
    const updatedCart = cart.filter((item) => item.id !== productId)
    saveCart(updatedCart)
    return true
  } catch (error) {
    console.error("Error removing from cart:", error)
    return false
  }
}

/**
 * Clear the entire cart
 * @returns {boolean} - True if cleared successfully, false if error
 */
function clearCart() {
  try {
    localStorage.removeItem("cart")
    return true
  } catch (error) {
    console.error("Error clearing cart:", error)
    return false
  }
}

/**
 * Get cart count (total number of items)
 * @returns {number} - Total number of items in cart
 */
function getCartCount() {
  const cart = getCart()
  return cart.reduce((total, item) => total + item.quantity, 0)
}

/**
 * Calculate cart total
 * @returns {Object} - Object with subtotal, tax, and total
 */
function calculateCartTotal() {
  const cart = getCart()
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const tax = subtotal * 0.12 // 12% VAT
  const total = subtotal + tax

  return {
    subtotal,
    tax,
    total,
  }
}
