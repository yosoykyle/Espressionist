// Checkout functionality for Espressionist e-commerce site

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Load cart data and display order summary
  loadOrderSummary()

  // Set up real-time validation for form fields
  setupFormValidation()
})

/**
 * Load cart data from localStorage and display in order summary
 */
function loadOrderSummary() {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || []
  if (cartItems.length === 0) {
    window.location.href = "cart.html"
    return
  }
  renderOrderItems(cartItems)
  updateOrderTotals(cartItems)
}

/**
 * Render order items in the order summary
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
      </div>`
    orderItemsElement.innerHTML += orderItemHTML
  })
}

/**
 * Calculate and update order totals
 */
function updateOrderTotals(cartItems) {
  const { subtotal, tax, total } = calculateCartTotals(cartItems)
  document.getElementById("order-subtotal").textContent = formatCurrency(subtotal)
  document.getElementById("order-tax").textContent = formatCurrency(tax)
  document.getElementById("order-total").textContent = formatCurrency(total)
}

/**
 * Sets up real-time validation for form fields and handles form submission.
 */
function setupFormValidation() {
  const fullNameInput = document.getElementById("fullName")
  const emailInput = document.getElementById("email") // New email input
  const phoneNumberInput = document.getElementById("phoneNumber")
  const addressInput = document.getElementById("address")
  const shippingForm = document.getElementById("shipping-form")

  if (fullNameInput) {
    fullNameInput.addEventListener("input", () => validateField(fullNameInput, "fullName-error", validateFullName));
    fullNameInput.addEventListener("blur", () => validateField(fullNameInput, "fullName-error", validateFullName));
  }

  if (emailInput) { // Setup for email input
    emailInput.addEventListener("input", () => validateField(emailInput, "email-error", validateEmail));
    emailInput.addEventListener("blur", () => validateField(emailInput, "email-error", validateEmail));
  }

  if (phoneNumberInput) {
    phoneNumberInput.addEventListener("input", () => validateField(phoneNumberInput, "phoneNumber-error", validatePhoneNumber));
    phoneNumberInput.addEventListener("blur", () => validateField(phoneNumberInput, "phoneNumber-error", validatePhoneNumber));
  }

  if (addressInput) {
    addressInput.addEventListener("input", () => validateField(addressInput, "address-error", validateAddress));
    addressInput.addEventListener("blur", () => validateField(addressInput, "address-error", validateAddress));
  }

  if (shippingForm) {
    shippingForm.addEventListener("submit", (event) => {
      event.preventDefault()
      const isFullNameValid = validateField(fullNameInput, "fullName-error", validateFullName)
      const isEmailValid = validateField(emailInput, "email-error", validateEmail) // Validate email
      const isPhoneNumberValid = validateField(phoneNumberInput, "phoneNumber-error", validatePhoneNumber)
      const isAddressValid = validateField(addressInput, "address-error", validateAddress)

      if (isFullNameValid && isEmailValid && isPhoneNumberValid && isAddressValid) {
        handlePlaceOrder()
      } else {
        if (!isFullNameValid) fullNameInput.focus()
        else if (!isEmailValid) emailInput.focus() // Focus email if invalid
        else if (!isPhoneNumberValid) phoneNumberInput.focus()
        else if (!isAddressValid) addressInput.focus()
      }
    })
  }
}

/**
 * Generic field validation function.
 */
function validateField(inputElement, errorElementId, validationFunction) {
  if (!inputElement) return false; // Guard against missing elements
  const value = inputElement.value.trim()
  const result = validationFunction(value)
  const errorElement = document.getElementById(errorElementId);

  if (!errorElement) return result.isValid; // If no error element, just return validity

  if (!result.isValid) {
    errorElement.textContent = result.message
    errorElement.style.display = "block"
    inputElement.setAttribute("aria-invalid", "true")
    inputElement.classList.add("invalid-input")
  } else {
    errorElement.textContent = ""
    errorElement.style.display = "none"
    inputElement.removeAttribute("aria-invalid")
    inputElement.classList.remove("invalid-input")
  }
  return result.isValid
}

// Validation functions for each field type
function validateFullName(value) {
  if (!value) return { isValid: false, message: "Full name is required" }
  if (value.length < 2) return { isValid: false, message: "Name must be at least 2 characters" }
  return { isValid: true, message: "" }
}

function validateEmail(value) {
  if (!value) return { isValid: false, message: "Email address is required" }
  // Basic regex for email validation
  if (!/\S+@\S+\.\S+/.test(value)) return { isValid: false, message: "Please enter a valid email address" }
  return { isValid: true, message: "" }
}

function validatePhoneNumber(value) {
  if (!value) return { isValid: false, message: "Phone number is required" }
  if (!/^\d+$/.test(value)) return { isValid: false, message: "Phone number must contain only digits" }
  if (value.length < 7 || value.length > 15) return { isValid: false, message: "Please enter a valid phone number" }
  return { isValid: true, message: "" }
}

function validateAddress(value) {
  if (!value) return { isValid: false, message: "Address is required" }
  if (value.length < 5) return { isValid: false, message: "Please enter a complete address" }
  return { isValid: true, message: "" }
}

// showError, clearError, clearErrors functions are effectively replaced by improved validateField logic
// Keeping them for now if validateShippingForm is still used elsewhere, but they are not used by setupFormValidation's path.

/**
 * Show error message for a specific field - Potentially redundant if validateField handles all display
 */
function showError(elementId, message) {
  const errorEl = document.getElementById(elementId)
  if (!errorEl) return
  errorEl.textContent = message
  errorEl.style.display = "block"
  // errorEl.classList.add("visible") // class "visible" might be from an older CSS version
}

/**
 * Clear error message for a specific field - Potentially redundant
 */
function clearError(elementId) {
  const errorEl = document.getElementById(elementId)
  if (!errorEl) return
  errorEl.textContent = ""
  errorEl.style.display = "none"
  // errorEl.classList.remove("visible")
}


/**
 * Validate shipping form (Considered potentially redundant if setupFormValidation is the primary validation path)
 */
function validateShippingForm() {
  const fullName = document.getElementById("fullName").value.trim()
  const email = document.getElementById("email").value.trim() // Get email
  const phoneNumber = document.getElementById("phoneNumber").value.trim()
  const address = document.getElementById("address").value.trim()
  const notes = document.getElementById("notes").value.trim()

  // This function would need to call clearErrors() if it's meant to be a standalone validator.
  // For now, assuming validateField calls within setupFormValidation handle error display.
  const isFullNameValid = validateFullName(fullName).isValid;
  const isEmailValid = validateEmail(email).isValid; // Validate email
  const isPhoneNumberValid = validatePhoneNumber(phoneNumber).isValid;
  const isAddressValid = validateAddress(address).isValid;

  const isValid = isFullNameValid && isEmailValid && isPhoneNumberValid && isAddressValid;

  return {
    isValid,
    shippingData: { // This structure is used by handlePlaceOrder
      name: fullName,
      email: email, // Include email
      phone: phoneNumber,
      address: address,
      note: notes,
    },
  }
}

/**
 * Generate a random tracking code
 */
function generateTrackingCode(length = 6, prefix = "") {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let trackingCode = prefix
  for (let i = 0; i < length; i++) {
    trackingCode += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return trackingCode
}

/**
 * Format number as currency
 */
function formatCurrency(amount) {
  return `₱${Number(amount).toFixed(2)}`
}

/**
 * Calculate cart totals
 */
function calculateCartTotals(cartItems) {
  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const tax = subtotal * 0.12
  const total = subtotal + tax
  return { subtotal, tax, total }
}

/**
 * Handles placing the order after form validation.
 */
function handlePlaceOrder() {
  // Get shipping data from form elements directly
  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim(); // Get email value
  const phoneNumber = document.getElementById("phoneNumber").value.trim();
  const address = document.getElementById("address").value.trim();
  const notes = document.getElementById("notes").value.trim();

  const shippingData = { // This is now built directly in handlePlaceOrder
    name: fullName,
    email: email, // Use email from form
    phone: phoneNumber,
    address: address,
    note: notes,
  };

  const cartItems = JSON.parse(localStorage.getItem("cart")) || []
  const { total } = calculateCartTotals(cartItems)
  const trackingCode = generateTrackingCode(6, "ESPR-")

  const order = {
    orderId: trackingCode,
    cart: cartItems,
    shipping: shippingData, // Use the shippingData object which includes email
    status: "Pending",
    date: new Date().toISOString(),
    total: total,
  }

  const payload = {
    customerName: shippingData.name,
    customerEmail: shippingData.email, // Use email from shippingData
    shippingAddress: shippingData.address,
    items: cartItems.map(item => ({
      productId: item.id,
      quantity: item.quantity
    }))
  };

  const placeOrderBtn = document.getElementById("place-order-btn");
  if(placeOrderBtn) placeOrderBtn.disabled = true; // Disable button on submit

  fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(errData => {
        throw new Error(errData.message || `API request failed with status ${response.status}`);
      }).catch(() => { // If parsing errorData fails
        throw new Error(`API request failed with status ${response.status} and no error message from server.`);
      });
    }
    return response.json();
  })
  .then(data => {
    console.log("Checkout API success:", data);
    const finalOrderCode = data.orderCode || trackingCode;
    order.orderId = finalOrderCode;

    const existingOrders = JSON.parse(localStorage.getItem("orders")) || [];
    existingOrders.push(order);
    localStorage.setItem("orders", JSON.stringify(existingOrders));
    localStorage.removeItem("cart");
    showOrderSuccessMessage(finalOrderCode);
    setTimeout(() => {
      window.location.href = `success.html?order=${finalOrderCode}`;
    }, 1000);
  })
  .catch(error => {
    console.error("Checkout API error:", error);
    const errorDisplayElement = document.getElementById("checkout-error-message");
    if (errorDisplayElement) {
      errorDisplayElement.textContent = `There was an issue placing your order: ${error.message}. Please try again.`;
      errorDisplayElement.style.display = "block";
    } else {
      alert(`There was an issue placing your order: ${error.message}. Please try again.`);
    }
    if(placeOrderBtn) placeOrderBtn.disabled = false; // Re-enable button on error
  });
}

/**
 * Show a success message when order is placed
 */
function showOrderSuccessMessage(trackingCode) {
  const messageElement = document.createElement("div")
  messageElement.className = "order-success-message"
  messageElement.innerHTML = `
    <i class="fas fa-check-circle"></i>
    Order placed successfully! Your tracking code is: <strong>${trackingCode}</strong>
    <p>Redirecting to order confirmation...</p>`
  Object.assign(messageElement.style, {
    position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
    backgroundColor: "#4caf50", color: "white", padding: "20px 30px",
    borderRadius: "5px", boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
    zIndex: "1000", textAlign: "center", maxWidth: "90%", width: "400px",
  })
  document.body.appendChild(messageElement)
}
