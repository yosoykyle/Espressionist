// Checkout functionality for Espressionist e-commerce site

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Load cart data and display order summary
  loadOrderSummary()

  // Add event listener for place order button
  //document.getElementById("place-order-btn").addEventListener("click", handlePlaceOrder)

  // Set up real-time validation for form fields
  setupFormValidation()
})

/**
 * Load cart data from localStorage and display in order summary
 */
function loadOrderSummary() {
  // Get cart items from localStorage
  const cartItems = JSON.parse(localStorage.getItem("cart")) || []

  // If cart is empty, redirect to cart page
  if (cartItems.length === 0) {
    window.location.href = "cart.html"
    return
  }

  // Render order items
  renderOrderItems(cartItems)

  // Calculate and update totals
  updateOrderTotals(cartItems)
}

/**
 * Render order items in the order summary
 * @param {Array} cartItems - Array of cart items
 */
function renderOrderItems(cartItems) {
  const orderItemsElement = document.getElementById("order-items")
  orderItemsElement.innerHTML = ""

  cartItems.forEach((item) => {
    const itemTotal = item.price * item.quantity

    const orderItemHTML = `
      <div class="order-item">
        <div class="item-details">
          <div class="item-name">${item.name}</div>
          <div class="item-quantity">Quantity: ${item.quantity}</div>
        </div>
        <div class="item-price">${formatCurrency(itemTotal)}</div>
      </div>
    `

    orderItemsElement.innerHTML += orderItemHTML
  })
}

/**
 * Calculate and update order totals
 * @param {Array} cartItems - Array of cart items
 */
function updateOrderTotals(cartItems) {
  // Calculate totals using the utility function from utils.js
  const { subtotal, tax, total } = calculateCartTotals(cartItems)

  // Update the DOM
  document.getElementById("order-subtotal").textContent = formatCurrency(subtotal)
  document.getElementById("order-tax").textContent = formatCurrency(tax)
  document.getElementById("order-total").textContent = formatCurrency(total)
}

// In the setupFormValidation function, update to handle real-time validation better

function setupFormValidation() {
  // Get form elements
  const fullNameInput = document.getElementById("fullName")
  const phoneNumberInput = document.getElementById("phoneNumber")
  const addressInput = document.getElementById("address")
  const shippingForm = document.getElementById("shipping-form")

  // Add input event listeners for real-time validation
  if (fullNameInput) {
    fullNameInput.addEventListener("input", () => {
      validateField(fullNameInput, "fullName-error", validateFullName)
    })

    // Also validate on blur for better UX
    fullNameInput.addEventListener("blur", () => {
      validateField(fullNameInput, "fullName-error", validateFullName)
    })
  }

  if (phoneNumberInput) {
    phoneNumberInput.addEventListener("input", () => {
      validateField(phoneNumberInput, "phoneNumber-error", validatePhoneNumber)
    })

    phoneNumberInput.addEventListener("blur", () => {
      validateField(phoneNumberInput, "phoneNumber-error", validatePhoneNumber)
    })
  }

  if (addressInput) {
    addressInput.addEventListener("input", () => {
      validateField(addressInput, "address-error", validateAddress)
    })

    addressInput.addEventListener("blur", () => {
      validateField(addressInput, "address-error", validateAddress)
    })
  }

  // Prevent form submission if validation fails
  if (shippingForm) {
    shippingForm.addEventListener("submit", (event) => {
      event.preventDefault()

      // Validate all fields
      const isFullNameValid = validateField(fullNameInput, "fullName-error", validateFullName)
      const isPhoneNumberValid = validateField(phoneNumberInput, "phoneNumber-error", validatePhoneNumber)
      const isAddressValid = validateField(addressInput, "address-error", validateAddress)

      // Only proceed if all fields are valid
      if (isFullNameValid && isPhoneNumberValid && isAddressValid) {
        // Form is valid, proceed with submission
        handlePlaceOrder()
      } else {
        // Focus the first invalid field
        if (!isFullNameValid) fullNameInput.focus()
        else if (!isPhoneNumberValid) phoneNumberInput.focus()
        else if (!isAddressValid) addressInput.focus()
      }
    })
  }
}

// Update the validateField function to return validation result
function validateField(inputElement, errorElementId, validationFunction) {
  const value = inputElement.value.trim()
  const result = validationFunction(value)

  if (!result.isValid) {
    showError(errorElementId, result.message)
    inputElement.setAttribute("aria-invalid", "true")
    inputElement.classList.add("invalid-input")
  } else {
    clearError(errorElementId)
    inputElement.removeAttribute("aria-invalid")
    inputElement.classList.remove("invalid-input")
  }

  return result.isValid
}

/**
 * Validate full name
 * @param {string} value - The value to validate
 * @returns {Object} - Object with isValid flag and error message
 */
function validateFullName(value) {
  if (!value) {
    return { isValid: false, message: "Full name is required" }
  }

  if (value.length < 2) {
    return { isValid: false, message: "Name must be at least 2 characters" }
  }

  return { isValid: true, message: "" }
}

/**
 * Validate phone number
 * @param {string} value - The value to validate
 * @returns {Object} - Object with isValid flag and error message
 */
function validatePhoneNumber(value) {
  if (!value) {
    return { isValid: false, message: "Phone number is required" }
  }

  // Check if phone number contains only digits
  if (!/^\d+$/.test(value)) {
    return { isValid: false, message: "Phone number must contain only digits" }
  }

  // Check if phone number has a reasonable length
  if (value.length < 7 || value.length > 15) {
    return { isValid: false, message: "Please enter a valid phone number" }
  }

  return { isValid: true, message: "" }
}

/**
 * Validate address
 * @param {string} value - The value to validate
 * @returns {Object} - Object with isValid flag and error message
 */
function validateAddress(value) {
  if (!value) {
    return { isValid: false, message: "Address is required" }
  }

  if (value.length < 5) {
    return { isValid: false, message: "Please enter a complete address" }
  }

  return { isValid: true, message: "" }
}

/**
 * Show error message for a specific field
 * @param {string} elementId - ID of the error element
 * @param {string} message - Error message to display
 */
function showError(elementId, message) {
  const errorEl = document.getElementById(elementId)
  if (!errorEl) return

  errorEl.textContent = message
  errorEl.style.display = "block"
  errorEl.classList.add("visible")
}

/**
 * Clear error message for a specific field
 * @param {string} elementId - ID of the error element
 */
function clearError(elementId) {
  const errorEl = document.getElementById(elementId)
  if (!errorEl) return

  errorEl.textContent = ""
  errorEl.style.display = "none"
  errorEl.classList.remove("visible")
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

  // Validate each field
  const isFullNameValid = validateField(document.getElementById("fullName"), "fullName-error", validateFullName)

  const isPhoneNumberValid = validateField(
    document.getElementById("phoneNumber"),
    "phoneNumber-error",
    validatePhoneNumber,
  )

  const isAddressValid = validateField(document.getElementById("address"), "address-error", validateAddress)

  const isValid = isFullNameValid && isPhoneNumberValid && isAddressValid

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
 * Generate a random tracking code
 * @param {number} length - Length of the tracking code
 * @param {string} prefix - Prefix for the tracking code
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
 * Format number as currency
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted currency string
 */
function formatCurrency(amount) {
  return `₱${amount.toFixed(2)}`
}

/**
 * Calculate cart totals
 * @param {Array} cartItems - Array of cart items
 * @returns {object} - Object containing subtotal, tax, and total
 */
function calculateCartTotals(cartItems) {
  // Calculate subtotal
  const subtotal = cartItems.reduce((total, item) => {
    return total + item.price * item.quantity
  }, 0)

  // Calculate tax (12% VAT)
  const tax = subtotal * 0.12

  // Calculate total
  const total = subtotal + tax

  return { subtotal, tax, total }
}

// Update the handlePlaceOrder function to use the form's submit event
function handlePlaceOrder() {
  // Get shipping data from form
  const fullName = document.getElementById("fullName").value.trim()
  const phoneNumber = document.getElementById("phoneNumber").value.trim()
  const address = document.getElementById("address").value.trim()
  const notes = document.getElementById("notes").value.trim()

  // Create shipping data object
  const shippingData = {
    name: fullName,
    phone: phoneNumber,
    address: address,
    note: notes,
  }

  // Get cart items
  const cartItems = JSON.parse(localStorage.getItem("cart")) || []

  // Calculate total
  const { total } = calculateCartTotals(cartItems)

  // Generate tracking code
  const trackingCode = generateTrackingCode(6, "ESPR-")

  // Create order object
  const order = {
    orderId: trackingCode,
    cart: cartItems,
    shipping: shippingData,
    status: "Pending",
    date: new Date().toISOString(),
    total: total,
  }

  // Get existing orders or create new array
  const orders = JSON.parse(localStorage.getItem("orders")) || []

  // Add new order
  orders.push(order)

  // Save orders to localStorage
  // localStorage.setItem("orders", JSON.stringify(orders)) // Will be moved inside fetch .then()

  // Clear cart
  // localStorage.removeItem("cart") // Will be moved inside fetch .then()

  // Construct payload for API
  const payload = {
    customerName: shippingData.name,
    customerEmail: "placeholder@example.com", // No separate email field in form, using placeholder
    shippingAddress: shippingData.address, // Assuming 'address' is the full shipping address
    items: cartItems.map(item => ({
      productId: item.id, // Using the existing item.id from cart
      quantity: item.quantity
    }))
  };

  // Show a message or spinner to indicate processing
  // For now, we'll keep showOrderSuccessMessage before fetch, but this could be improved.
  // showOrderSuccessMessage(trackingCode); // This shows success too early for an API call

  // Make API call
  fetch("/api/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
  .then(response => {
    if (!response.ok) {
      // If response is not OK, throw an error to be caught by .catch()
      return response.json().then(errData => {
        throw new Error(errData.message || `API request failed with status ${response.status}`);
      });
    }
    return response.json();
  })
  .then(data => {
    console.log("Checkout API success:", data);
    const finalOrderCode = data.orderCode || trackingCode; // Use API orderCode if available

    // Update order with finalOrderCode if different
    order.orderId = finalOrderCode;

    // Save order to localStorage (original logic)
    const existingOrders = JSON.parse(localStorage.getItem("orders")) || [];
    existingOrders.push(order);
    localStorage.setItem("orders", JSON.stringify(existingOrders));

    // Clear cart (original logic)
    localStorage.removeItem("cart");

    // Show success message (original logic, potentially using finalOrderCode)
    showOrderSuccessMessage(finalOrderCode);

    // Redirect to success page (original logic)
    setTimeout(() => {
      window.location.href = `success.html?order=${finalOrderCode}`;
    }, 1000);
  })
  .catch(error => {
    console.error("Checkout API error:", error);
    // Display a user-friendly error message on the page
    const errorDisplayElement = document.getElementById("checkout-error-message"); // Assuming an element with this ID exists or will be added
    if (errorDisplayElement) {
      errorDisplayElement.textContent = `There was an issue placing your order: ${error.message}. Please try again.`;
      errorDisplayElement.style.display = "block";
    } else {
      // Fallback if the dedicated error element doesn't exist
      alert(`There was an issue placing your order: ${error.message}. Please try again.`);
    }

    // Optionally, re-enable the place order button if it was disabled
    const placeOrderBtn = document.getElementById("place-order-btn");
    if(placeOrderBtn) placeOrderBtn.disabled = false;
  });
}

/**
 * Show a success message when order is placed
 * @param {string} trackingCode - The order tracking code
 */
function showOrderSuccessMessage(trackingCode) {
  // Create a success message element
  const messageElement = document.createElement("div")
  messageElement.className = "order-success-message"
  messageElement.innerHTML = `
    <i class="fas fa-check-circle"></i>
    Order placed successfully! Your tracking code is: <strong>${trackingCode}</strong>
    <p>Redirecting to order confirmation...</p>
  `

  // Add styles
  Object.assign(messageElement.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#4caf50",
    color: "white",
    padding: "20px 30px",
    borderRadius: "5px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
    zIndex: "1000",
    textAlign: "center",
    maxWidth: "90%",
    width: "400px",
  })

  // Add to body
  document.body.appendChild(messageElement)
}
