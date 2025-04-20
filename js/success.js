// Success page functionality for Espressionist e-commerce site

// Import utility functions
import { getUrlParameter, findOrder, formatCurrency, formatDate } from "./utils.js"

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Extract order ID from URL using the utility function from utils.js
  const orderId = getUrlParameter("order")

  if (orderId) {
    // Find the order in localStorage using the utility function from utils.js
    const order = findOrder(orderId)

    if (order) {
      // Display order details
      displayOrderDetails(order)
    } else {
      // Show fallback message if order not found
      showFallbackMessage()
    }
  } else {
    // Show fallback message if no order ID in URL
    showFallbackMessage()
  }
})

/**
 * Display order details on the page
 * @param {Object} order - Order object
 */
function displayOrderDetails(order) {
  // Set tracking code
  document.getElementById("tracking-code").textContent = order.orderId

  // Set total amount using the utility function from utils.js
  document.getElementById("total-amount").textContent = formatCurrency(order.total)

  // Calculate total items
  const totalItems = order.cart.reduce((total, item) => total + item.quantity, 0)
  document.getElementById("total-items").textContent = `${totalItems} item${totalItems !== 1 ? "s" : ""}`

  // Format and set order date using the utility function from utils.js
  const orderDate = new Date(order.date)
  document.getElementById("order-date").textContent = formatDate(orderDate)

  // Show success container
  document.getElementById("success-container").style.display = "block"
}

/**
 * Show fallback message when order is not found
 */
function showFallbackMessage() {
  document.getElementById("fallback-container").style.display = "block"
}
