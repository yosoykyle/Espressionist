// Track Order functionality for Espressionist e-commerce site

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Check if there's a tracking code in the URL
  const trackingCode = getUrlParameter("order")

  // If tracking code exists in URL, fill the input and trigger search
  if (trackingCode) {
    document.getElementById("tracking-code").value = trackingCode
    trackOrder()
  }

  // Add event listener for track button
  document.getElementById("track-btn").addEventListener("click", trackOrder)

  // Add event listener for Enter key in tracking code input
  document.getElementById("tracking-code").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      trackOrder()
    }
  })

  // Add event listener for ESC key to dismiss error messages
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      const errorElement = document.getElementById("error-message")
      if (errorElement && errorElement.style.display === "block") {
        dismissError()
      }
    }
  })

  // Set up real-time validation for tracking code input
  setupTrackingCodeValidation()
})

// Update the setupTrackingCodeValidation function for better real-time validation
function setupTrackingCodeValidation() {
  const trackingCodeInput = document.getElementById("tracking-code")
  const trackForm = document.querySelector(".tracking-form")

  if (trackingCodeInput) {
    // Validate on input (as user types)
    trackingCodeInput.addEventListener("input", () => {
      validateTrackingCode(trackingCodeInput.value.trim())
    })

    // Also validate on blur (when user leaves the field)
    trackingCodeInput.addEventListener("blur", () => {
      validateTrackingCode(trackingCodeInput.value.trim())
    })
  }

  // Prevent form submission if validation fails
  if (trackForm) {
    trackForm.addEventListener("submit", (event) => {
      event.preventDefault()

      const trackingCode = trackingCodeInput.value.trim()
      const isValid = validateTrackingCode(trackingCode)

      if (isValid) {
        trackOrder()
      } else {
        // Focus the tracking code input
        trackingCodeInput.focus()
      }
    })
  }

  // Add event listener for track button
  document.getElementById("track-btn").addEventListener("click", (event) => {
    event.preventDefault()

    const trackingCode = trackingCodeInput.value.trim()
    const isValid = validateTrackingCode(trackingCode)

    if (isValid) {
      trackOrder()
    } else {
      // Focus the tracking code input
      trackingCodeInput.focus()
    }
  })
}

// Update the validateTrackingCode function to return validation result
function validateTrackingCode(code) {
  // Hide any existing error messages
  document.getElementById("error-message").style.display = "none"

  // Get the tracking info element for feedback
  const trackingInfoElement = document.getElementById("tracking-info")
  const trackingCodeInput = document.getElementById("tracking-code")

  if (!code) {
    // If empty, reset to default message
    trackingInfoElement.textContent = "Enter your order tracking code below to check the status of your order."
    trackingInfoElement.classList.remove("error", "success")
    trackingCodeInput.setAttribute("aria-invalid", "false")
    trackingCodeInput.classList.remove("invalid-input")
    return false
  }

  // Basic format validation (can be customized based on your tracking code format)
  // For example, if your tracking codes always start with ESPR-
  if (code.startsWith("ESPR-") && code.length >= 11) {
    // ESPR- plus at least 6 characters
    trackingInfoElement.textContent = "Valid tracking code format."
    trackingInfoElement.classList.remove("error")
    trackingInfoElement.classList.add("success")
    trackingCodeInput.setAttribute("aria-invalid", "false")
    trackingCodeInput.classList.remove("invalid-input")
    return true
  } else {
    trackingInfoElement.textContent = "Tracking codes should start with ESPR- followed by 6 characters."
    trackingInfoElement.classList.add("error")
    trackingInfoElement.classList.remove("success")
    trackingCodeInput.setAttribute("aria-invalid", "true")
    trackingCodeInput.classList.add("invalid-input")
    return false
  }
}

// Update the trackOrder function to use validation
function trackOrder() {
  // Hide previous results and error messages
  document.getElementById("order-results").style.display = "none"
  document.getElementById("error-message").style.display = "none"

  // Get tracking code from input
  const trackingCode = document.getElementById("tracking-code").value.trim()

  // Validate tracking code
  if (!validateTrackingCode(trackingCode)) {
    showTrackError("Please enter a valid tracking code")

    // Focus the input field for better UX
    document.getElementById("tracking-code").focus()
    return
  }

  // Show a loading indicator (optional, but good UX)
  const trackingInfoElement = document.getElementById("tracking-info");
  trackingInfoElement.textContent = "Searching for your order...";
  trackingInfoElement.classList.remove("error", "success");
  // Consider adding a spinner icon here

  fetch(`/api/orders/${trackingCode}`)
    .then(response => {
      if (!response.ok) {
        // If response is not OK, prepare to throw an error
        // Try to parse JSON for a message, otherwise use status text
        return response.json().catch(() => {
          // If parsing error message fails, create a generic error
          throw new Error(`Order not found or server error: ${response.statusText} (Status: ${response.status})`);
        }).then(errorData => {
          // Throw an error with the message from API or a default one
          throw new Error(errorData.message || `Order not found (Status: ${response.status})`);
        });
      }
      return response.json();
    })
    .then(orderDataFromApi => {
      if (orderDataFromApi) {
        displayOrderInfo(orderDataFromApi);
        document.getElementById("order-results").style.display = "block";
        trackingInfoElement.textContent = "Order found! Details are displayed below.";
        trackingInfoElement.classList.add("success");
        trackingInfoElement.classList.remove("error");
        document.getElementById("order-results").scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        // This case might not be reached if API returns 404 for not found, handled by .catch
        showTrackError("Order details could not be retrieved from the server.");
        trackingInfoElement.textContent = "Could not retrieve order details.";
        trackingInfoElement.classList.add("error");
      }
    })
    .catch(error => {
      console.error("Error fetching order status:", error);
      showTrackError(error.message || "Could not fetch order details. Please try again later.");
      trackingInfoElement.textContent = error.message || "Failed to fetch order details.";
      trackingInfoElement.classList.add("error");
      trackingInfoElement.classList.remove("success");

      // Optional: Fallback to localStorage if API fails (as per subtask note)
      // console.log("Attempting fallback to localStorage...");
      // const localOrder = findOrder(trackingCode);
      // if (localOrder) {
      //   displayOrderInfo(localOrder);
      //   document.getElementById("order-results").style.display = "block";
      //   trackingInfoElement.textContent = "Order found in local backup. Displaying local data.";
      //   trackingInfoElement.classList.add("success");
      //   trackingInfoElement.classList.remove("error");
      //   showTrackError("Displaying local data as server is unavailable."); // Inform user
      // } else {
      //   showTrackError(error.message + " (And not found in local backup)");
      // }
    });
}

/**
 * Display order information
 * @param {Object} order - Order object
 */
function displayOrderInfo(order) {
  // Set order ID
  document.getElementById("result-order-id").textContent = order.orderId

  // Set order status with appropriate class
  const statusElement = document.getElementById("order-status")
  statusElement.textContent = order.status
  statusElement.className = "status-badge status-" + order.status.toLowerCase()

  // Set order date using the utility function from utils.js
  document.getElementById("order-date").textContent = formatDate(new Date(order.date))

  // Set order total using the utility function from utils.js
  document.getElementById("order-total").textContent = formatCurrency(order.total)

  // Set shipping information
  document.getElementById("shipping-name").textContent = order.shipping.name
  document.getElementById("shipping-phone").textContent = order.shipping.phone
  document.getElementById("shipping-address").textContent = order.shipping.address

  // Set shipping note if exists
  const noteRow = document.getElementById("shipping-note-row")
  if (order.shipping.note && order.shipping.note.trim() !== "") {
    document.getElementById("shipping-note").textContent = order.shipping.note
    noteRow.style.display = "flex"
  } else {
    noteRow.style.display = "none"
  }

  // Display Itemized List of Products
  const itemsListContainer = document.getElementById("tracked-items-list");
  if (itemsListContainer && order.cart && order.cart.length > 0) {
    itemsListContainer.innerHTML = ''; // Clear previous content

    const ul = document.createElement('ul');
    ul.className = 'item-list'; // Add a class for potential styling

    order.cart.forEach(item => {
      const li = document.createElement('li');
      li.className = 'item-entry'; // Add a class for potential styling

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
}

/**
 * Format date to a readable string
 * @param {Date} date - Date object
 * @returns {string} - Formatted date string
 */
function formatDate(date) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }

  return date.toLocaleDateString("en-US", options)
}

/**
 * Format number to currency string
 * @param {number} number - Number to format
 * @returns {string} - Formatted currency string
 */
function formatCurrency(number) {
  return `₱${number.toFixed(2)}`
}

/**
 * Get URL parameter by name
 * @param {string} name - Parameter name
 * @returns {string|null} - Parameter value
 */
function getUrlParameter(name) {
  name = name.replace(/[[]/, "\\[").replace(/[\]]/, "\\]")
  const regex = new RegExp("[\\?&]" + name + "=([^&#]*)")
  const results = regex.exec(location.search)
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "))
}

/**
 * Show track error message
 * @param {string} message - Error message to display
 */
function showTrackError(message) {
  const errorElement = document.getElementById("error-message")

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

  // Set aria-invalid on the input
  document.getElementById("tracking-code").setAttribute("aria-invalid", "true")

  // Scroll to error message
  errorElement.scrollIntoView({ behavior: "smooth", block: "center" })
}

/**
 * Dismiss error message with animation
 */
function dismissError() {
  const errorElement = document.getElementById("error-message")
  errorElement.classList.add("fade-out")

  // Remove from DOM after animation completes
  setTimeout(() => {
    errorElement.style.display = "none"
    errorElement.classList.remove("fade-out")
  }, 300) // Match the animation duration
}

/**
 * Find order in localStorage by tracking code
 * @param {string} trackingCode - Tracking code to search for
 * @returns {Object|null} - Order object or null if not found
 */
function findOrder(trackingCode) {
  const orders = JSON.parse(localStorage.getItem("orders")) || []
  return orders.find((order) => order.orderId === trackingCode) || null
}
