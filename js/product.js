// Product page functionality for Espressionist e-commerce site

// Import addToCart function (assuming it's in a separate module)
// If it's not in a module, you'll need to define it here.
// For example:
// function addToCart(product, quantity) {
//   // Your cart logic here
//   console.log("Adding to cart:", product, quantity);
//   return true; // Indicate success
// }

// Define addToCart function if it's not imported
// This is a placeholder, replace with your actual cart logic
const addToCart = (product, quantity) => {
  console.log("Adding to cart:", product, quantity)
  return true
}

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Set up quantity controls using the utility function from utils.js
  setupQuantityControls()

  // Add event listener for Add to Cart button
  const addToCartBtn = document.querySelector(".add-to-cart-btn-large")
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", handleAddToCart)
  }

  // Simulate product loading
  simulateProductLoading()
})

/**
 * Simulate product loading with a loading state
 */
function simulateProductLoading() {
  // Create and show loading overlay
  const loadingOverlay = document.createElement("div")
  loadingOverlay.className = "loading-overlay"
  loadingOverlay.innerHTML = `
    <div class="loading-spinner"></div>
    <div class="loading-text">Loading product details...</div>
  `
  document.body.appendChild(loadingOverlay)

  // Simulate network delay (remove in production)
  setTimeout(() => {
    // Remove loading overlay
    loadingOverlay.classList.add("toast-exit")
    setTimeout(() => {
      loadingOverlay.remove()
    }, 300)
  }, 800)
}

/**
 * Set up quantity controls (increase/decrease buttons)
 */
function setupQuantityControls() {
  const quantityInput = document.getElementById("quantity")
  const decreaseBtn = document.querySelector(".quantity-btn:first-child")
  const increaseBtn = document.querySelector(".quantity-btn:last-child")

  if (quantityInput && decreaseBtn && increaseBtn) {
    // Add ARIA labels for accessibility
    decreaseBtn.setAttribute("aria-label", "Decrease quantity")
    increaseBtn.setAttribute("aria-label", "Increase quantity")
    quantityInput.setAttribute("aria-label", "Product quantity")

    decreaseBtn.addEventListener("click", () => {
      const currentValue = Number.parseInt(quantityInput.value)
      if (currentValue > 1) {
        quantityInput.value = currentValue - 1
        // Announce quantity change for screen readers
        announceQuantityChange(currentValue - 1)
      }
    })

    increaseBtn.addEventListener("click", () => {
      const currentValue = Number.parseInt(quantityInput.value)
      quantityInput.value = currentValue + 1
      // Announce quantity change for screen readers
      announceQuantityChange(currentValue + 1)
    })

    // Ensure quantity is always at least 1
    quantityInput.addEventListener("change", () => {
      if (quantityInput.value < 1) {
        quantityInput.value = 1
        // Announce quantity change for screen readers
        announceQuantityChange(1)
      }
    })
  }
}

/**
 * Announce quantity change for screen readers
 * @param {number} quantity - The new quantity
 */
function announceQuantityChange(quantity) {
  // Create or get the live region
  let liveRegion = document.getElementById("quantity-live-region")
  if (!liveRegion) {
    liveRegion = document.createElement("div")
    liveRegion.id = "quantity-live-region"
    liveRegion.className = "sr-only"
    liveRegion.setAttribute("aria-live", "polite")
    document.body.appendChild(liveRegion)
  }

  // Update the live region
  liveRegion.textContent = `Quantity updated to ${quantity}`
}

/**
 * Handle Add to Cart button click
 */
function handleAddToCart() {
  // Get product details from the page
  const productName = document.querySelector(".product-title").textContent
  const productPrice = Number.parseFloat(document.querySelector(".product-price").textContent.replace("₱", "")) || 0
  const quantityValue = Number.parseInt(document.getElementById("quantity").value) || 1

  //  "")) || 0
  //const quantity = Number.parseInt(document.getElementById("quantity").value) || 1

  // Show loading state on button
  const addToCartBtn = document.querySelector(".add-to-cart-btn-large")
  if (addToCartBtn) {
    addToCartBtn.classList.add("btn-loading")
    addToCartBtn.disabled = true
  }

  // Generate a unique ID for the product (in a real app, this would come from the database)
  const productId = getUrlParameter("id") || `product-${Date.now()}`

  // Create product object
  const product = {
    id: productId,
    name: productName,
    price: productPrice,
  }

  // Simulate network delay (remove in production)
  setTimeout(() => {
    // Add to cart using global addToCart function from storage.js
    let success = false
    if (typeof addToCart === "function") {
      success = addToCart(product, quantityValue)
    } else {
      console.error("addToCart function is not defined.")

      // Remove loading state
      if (addToCartBtn) {
        addToCartBtn.classList.remove("btn-loading")
        addToCartBtn.disabled = false
      }

      return // Exit the function if addToCart is not available
    }

    // Remove loading state
    if (addToCartBtn) {
      addToCartBtn.classList.remove("btn-loading")
      addToCartBtn.disabled = false
    }

    if (success) {
      // Show success message using the utility function from utils.js
      showAddToCartMessage(product, quantityValue)

      // Announce for screen readers
      announceAddedToCart(product.name, quantityValue)
    }
  }, 800)
}

/**
 * Announce added to cart for screen readers
 * @param {string} productName - The name of the product
 * @param {number} quantity - The quantity added
 */
function announceAddedToCart(productName, quantity) {
  // Create or get the live region
  let liveRegion = document.getElementById("cart-live-region")
  if (!liveRegion) {
    liveRegion = document.createElement("div")
    liveRegion.id = "cart-live-region"
    liveRegion.className = "sr-only"
    liveRegion.setAttribute("aria-live", "assertive")
    document.body.appendChild(liveRegion)
  }

  // Update the live region
  liveRegion.textContent = `Added ${quantity} ${quantity === 1 ? "item" : "items"} of ${productName} to your cart.`
}

/**
 * Show a message when product is added to cart
 */
function showAddToCartMessage(product, quantity) {
  // Check if toast container exists, if not create it
  let toastContainer = document.querySelector(".toast-container")
  if (!toastContainer) {
    toastContainer = document.createElement("div")
    toastContainer.className = "toast-container"
    document.body.appendChild(toastContainer)
  }

  // Create toast element
  const toast = document.createElement("div")
  toast.className = "toast toast-success"
  toast.innerHTML = `
    <div class="toast-icon">
      <i class="fas fa-check-circle"></i>
    </div>
    <div class="toast-content">
      <div class="toast-title">Added to Cart</div>
      <div class="toast-message">${quantity} ${quantity === 1 ? "item" : "items"} of ${product.name} added to your cart.</div>
    </div>
    <a href="cart.html" class="btn btn-small">View Cart</a>
    <button class="toast-close" aria-label="Close notification">
      <i class="fas fa-times"></i>
    </button>
  `

  // Add toast to container
  toastContainer.appendChild(toast)

  // Add event listener to close button
  toast.querySelector(".toast-close").addEventListener("click", () => {
    toast.classList.add("toast-exit")
    setTimeout(() => {
      toast.remove()
    }, 300)
  })

  // Auto-remove toast after 5 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.add("toast-exit")
      setTimeout(() => {
        toast.remove()
      }, 300)
    }
  }, 5000)
}

/**
 * Gets a URL parameter by name
 * @param {string} name The name of the URL parameter
 * @param {string} url The URL to search in (optional, defaults to current URL)
 * @returns {string|null} The value of the URL parameter, or null if not found
 */
function getUrlParameter(name, url) {
  if (!url) url = window.location.href
  name = name.replace(/[[\]]/g, "\\$&")
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url)
  if (!results) return null
  if (!results[2]) return ""
  return decodeURIComponent(results[2].replace(/\+/g, " "))
}
