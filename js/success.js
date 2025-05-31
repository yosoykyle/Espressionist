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

  // Format and set order date using the utility function from utils.js
  const orderDate = new Date(order.date)
  document.getElementById("order-date").textContent = formatDate(orderDate)

  // Display Shipping Information
  if (order.shipping) {
    document.getElementById("shipping-name-display").textContent = order.shipping.name || "N/A";
    document.getElementById("shipping-address-display").textContent = order.shipping.address || "N/A";
    document.getElementById("shipping-phone-display").textContent = order.shipping.phone || "N/A";
    // Check if email exists in shipping, else keep default "N/A" or hide element
    const emailDisplayElement = document.getElementById("shipping-email-display");
    if (order.shipping.email) {
        emailDisplayElement.textContent = order.shipping.email;
    } else {
        // Keep default N/A or explicitly set it if needed, or hide the parent <p>
        emailDisplayElement.textContent = "N/A";
    }
  }

  // Display Itemized List of Products
  const itemsListContainer = document.getElementById("ordered-items-list");
  if (itemsListContainer && order.cart && order.cart.length > 0) {
    itemsListContainer.innerHTML = ''; // Clear previous content

    const ul = document.createElement('ul');
    ul.className = 'item-list'; // Add a class for potential styling

    order.cart.forEach(item => {
      const li = document.createElement('li');
      li.className = 'item-entry'; // Add a class for potential styling

      // Sanitize text content if it comes from user input in other parts of app
      // For now, assuming product names from our mock data are safe.
      const itemName = item.name || "Unknown Item";
      const itemQuantity = item.quantity || 0;
      const itemPrice = item.price || 0;

      li.innerHTML = `
        <span class="item-name">${itemName} (x${itemQuantity})</span>
        <span class="item-price-details">
            Price per unit: ${formatCurrency(itemPrice)} |
            Subtotal: ${formatCurrency(itemPrice * itemQuantity)}
        </span>
      `;
      ul.appendChild(li);
    });
    itemsListContainer.appendChild(ul);
  } else if (itemsListContainer) {
    itemsListContainer.innerHTML = '<p>No items found in this order.</p>';
  }

  // The line for total-items is removed as per requirement:
  // document.getElementById("total-items").textContent = `${totalItems} item${totalItems !== 1 ? "s" : ""}`

  // Show success container
  document.getElementById("success-container").style.display = "block"
}

/**
 * Show fallback message when order is not found
 */
function showFallbackMessage() {
  document.getElementById("fallback-container").style.display = "block"
}
