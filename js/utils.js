/**
 * Utility functions for Espressionist e-commerce site
 * Contains shared helper functions used across multiple pages
 */

/**
 * Format currency to Philippine Peso
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted currency string
 */
function formatCurrency(amount) {
  return `₱${amount.toFixed(2)}`
}

/**
 * Format date to a readable string
 * @param {Date} date - Date object
 * @param {boolean} includeTime - Whether to include time in the formatted string
 * @returns {string} - Formatted date string
 */
function formatDate(date, includeTime = false) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }

  if (includeTime) {
    options.hour = "2-digit"
    options.minute = "2-digit"
  }

  return date.toLocaleDateString("en-US", options)
}

/**
 * Show a toast message with optional link
 * @param {string} message - Message to display
 * @param {string} linkText - Text for the link
 * @param {string} linkHref - URL for the link
 * @param {number} duration - Duration in ms to show the message
 */
function showToastMessage(message, linkText = "View Cart", linkHref = "cart.html", duration = 3000) {
  // Check if a message already exists
  let messageElement = document.querySelector(".toast-message")

  if (!messageElement) {
    // Create message element if it doesn't exist
    messageElement = document.createElement("div")
    messageElement.className = "toast-message"
    messageElement.innerHTML = `
      <i class="fas fa-check-circle"></i>
      ${message}
      <a href="${linkHref}">${linkText}</a>
    `

    // Add styles
    Object.assign(messageElement.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      backgroundColor: "#4caf50",
      color: "white",
      padding: "15px 20px",
      borderRadius: "5px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
      zIndex: "1000",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    })

    // Style the link
    const link = messageElement.querySelector("a")
    Object.assign(link.style, {
      color: "white",
      fontWeight: "bold",
      marginLeft: "10px",
      textDecoration: "underline",
    })

    // Add to body
    document.body.appendChild(messageElement)

    // Remove after duration
    setTimeout(() => {
      messageElement.style.opacity = "0"
      messageElement.style.transition = "opacity 0.5s ease"
      setTimeout(() => {
        if (messageElement.parentNode) {
          messageElement.parentNode.removeChild(messageElement)
        }
      }, 500)
    }, duration)
  }
}

/**
 * Show a message when product is added to cart
 * @param {Object} product - Product that was added
 * @param {number} quantity - Quantity added
 */
function showAddToCartMessage(product, quantity = 1) {
  showToastMessage("Product added to cart!", "View Cart", "cart.html", 3000)
}

/**
 * Generate a random tracking code
 * @param {number} length - Length of the tracking code
 * @param {string} prefix - Optional prefix for the tracking code
 * @returns {string} - Random tracking code
 */
function generateTrackingCode(length = 6, prefix = "") {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let trackingCode = prefix

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    trackingCode += characters.charAt(randomIndex)
  }

  return trackingCode
}

/**
 * Show form field error with auto-dismiss functionality
 * @param {string} elementId - ID of the error element
 * @param {string} message - Error message to display
 * @param {number} [duration=0] - Time in ms before auto-dismissing (0 for no auto-dismiss)
 */
function showError(elementId, message, duration = 0) {
  const errorEl = document.getElementById(elementId)
  if (!errorEl) return

  errorEl.textContent = message
  errorEl.style.display = "block"
  errorEl.classList.add("visible")

  // Auto-dismiss after duration (if not 0)
  if (duration > 0) {
    setTimeout(() => {
      errorEl.style.display = "none"
      errorEl.classList.remove("visible")
    }, duration)
  }
}

/**
 * Show error message with auto-dismiss functionality for track page
 * @param {string} message - Error message to display
 * @param {number} [duration=5000] - Time in ms before auto-dismissing (0 for no auto-dismiss)
 */
function showTrackError(message, duration = 5000) {
  const errorElement = document.getElementById("error-message")
  if (!errorElement) return

  // If a custom message is provided, update the paragraph text
  if (message) {
    const errorParagraph = errorElement.querySelector("p")
    if (errorParagraph) {
      errorParagraph.textContent = message
    }
  }

  // Remove any existing fade-out class and display the error
  errorElement.classList.remove("fade-out")
  errorElement.style.display = "block"

  // Add close button if it doesn't exist
  if (!errorElement.querySelector(".close-btn")) {
    const closeBtn = document.createElement("button")
    closeBtn.className = "close-btn"
    closeBtn.innerHTML = '<i class="fas fa-times"></i>'
    closeBtn.setAttribute("aria-label", "Close error message")
    closeBtn.onclick = () => {
      dismissError()
    }
    errorElement.appendChild(closeBtn)
  }

  // Auto-dismiss after duration (if not 0)
  if (duration > 0) {
    setTimeout(() => {
      dismissError()
    }, duration)
  }
}

/**
 * Dismiss error message with animation
 */
function dismissError() {
  const errorElement = document.getElementById("error-message")
  if (!errorElement) return

  errorElement.classList.add("fade-out")

  // Remove from DOM after animation completes
  setTimeout(() => {
    errorElement.style.display = "none"
    errorElement.classList.remove("fade-out")
  }, 300) // Match the animation duration
}

/**
 * Clear all error messages
 */
function clearErrors() {
  document.querySelectorAll(".error-message").forEach((el) => {
    el.textContent = ""
    el.style.display = "none"
    el.classList.remove("visible")
  })
}

/**
 * Setup quantity controls (increase/decrease buttons)
 * @param {string} inputId - ID of the quantity input element
 * @param {string} decreaseSelector - Selector for decrease button
 * @param {string} increaseSelector - Selector for increase button
 */
function setupQuantityControls(
  inputId = "quantity",
  decreaseSelector = ".quantity-btn:first-child",
  increaseSelector = ".quantity-btn:last-child",
) {
  const quantityInput = document.getElementById(inputId)
  const decreaseBtn = document.querySelector(decreaseSelector)
  const increaseBtn = document.querySelector(increaseSelector)

  if (quantityInput && decreaseBtn && increaseBtn) {
    decreaseBtn.addEventListener("click", () => {
      const currentValue = Number.parseInt(quantityInput.value)
      if (currentValue > 1) {
        quantityInput.value = currentValue - 1
      }
    })

    increaseBtn.addEventListener("click", () => {
      const currentValue = Number.parseInt(quantityInput.value)
      quantityInput.value = currentValue + 1
    })

    // Ensure quantity is always at least 1
    quantityInput.addEventListener("change", () => {
      if (quantityInput.value < 1) {
        quantityInput.value = 1
      }
    })
  }
}

/**
 * Calculate cart totals
 * @param {Array} cartItems - Array of cart items
 * @returns {Object} - Object with subtotal, tax, and total
 */
function calculateCartTotals(cartItems) {
  const subtotal = cartItems.reduce((total, item) => {
    return total + item.price * item.quantity
  }, 0)

  const tax = subtotal * 0.12 // 12% VAT
  const total = subtotal + tax

  return {
    subtotal,
    tax,
    total,
  }
}

/**
 * Validate shipping form
 * @returns {Object} - Object with isValid flag and shipping data
 */
function validateShippingForm() {
  const fullName = document.getElementById("fullName").value.trim()
  const phoneNumber = document.getElementById("phoneNumber").value.trim()
  const address = document.getElementById("address").value.trim()
  const notes = document.getElementById("notes").value.trim()

  // Clear all error messages first
  clearErrors()

  let isValid = true

  // Validate full name
  if (fullName === "") {
    showError("fullName-error", "Full name is required")
    isValid = false
  }

  // Validate phone number
  if (phoneNumber === "") {
    showError("phoneNumber-error", "Phone number is required")
    isValid = false
  } else if (!/^\d+$/.test(phoneNumber)) {
    showError("phoneNumber-error", "Phone number must contain only digits")
    isValid = false
  }

  // Validate address
  if (address === "") {
    showError("address-error", "Address is required")
    isValid = false
  }

  return {
    isValid,
    shippingData: {
      name: fullName,
      phone: phoneNumber,
      address: address,
      note: notes,
    },
  }
}

/**
 * Get URL parameter by name
 * @param {string} name - Parameter name
 * @returns {string|null} - Parameter value or null if not found
 */
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(name)
}

/**
 * Find order in localStorage by tracking code or order ID
 * @param {string} orderId - Order ID or tracking code to search for
 * @returns {Object|null} - Order object or null if not found
 */
function findOrder(orderId) {
  const orders = JSON.parse(localStorage.getItem("orders")) || []
  return orders.find((order) => order.orderId === orderId) || null
}

export {
  getUrlParameter,
  findOrder,
  formatCurrency,
  formatDate,
  showToastMessage,
  showAddToCartMessage,
  generateTrackingCode,
  showError,
  showTrackError,
  dismissError,
  clearErrors,
  setupQuantityControls,
  calculateCartTotals,
  validateShippingForm,
}
