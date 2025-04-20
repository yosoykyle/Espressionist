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
})

/**
 * Set up quantity controls (increase/decrease buttons)
 */
function setupQuantityControls() {
  const quantityInput = document.getElementById("quantity")
  const decreaseBtn = document.querySelector(".quantity-btn:first-child")
  const increaseBtn = document.querySelector(".quantity-btn:last-child")

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
 * Handle Add to Cart button click
 */
function handleAddToCart() {
  // Get product details from the page
  const productName = document.querySelector(".product-title").textContent
  const productPrice = Number.parseFloat(document.querySelector(".product-price").textContent.replace("₱", "")) || 0
  const quantity = Number.parseInt(document.getElementById("quantity").value) || 1

  // Generate a unique ID for the product (in a real app, this would come from the database)
  const productId = getUrlParameter("id") || `product-${Date.now()}`

  // Create product object
  const product = {
    id: productId,
    name: productName,
    price: productPrice,
  }

  // Add to cart using global addToCart function from storage.js
  let success = false
  if (typeof addToCart === "function") {
    success = addToCart(product, quantity)
  } else {
    console.error("addToCart function is not defined.")
    return // Exit the function if addToCart is not available
  }

  if (success) {
    // Show success message using the utility function from utils.js
    showAddToCartMessage(product, quantity)
  }
}

/**
 * Show a message when product is added to cart
 */
function showAddToCartMessage(product, quantity) {
  // Check if a message already exists
  let messageElement = document.querySelector(".add-to-cart-message")

  if (!messageElement) {
    // Create message element if it doesn't exist
    messageElement = document.createElement("div")
    messageElement.className = "add-to-cart-message"
    messageElement.innerHTML = `
      <i class="fas fa-check-circle"></i>
      Product added to cart!
      <a href="cart.html">View Cart</a>
    `

    // Add styles
    messageElement.style.position = "fixed"
    messageElement.style.top = "20px"
    messageElement.style.right = "20px"
    messageElement.style.backgroundColor = "#4caf50"
    messageElement.style.color = "white"
    messageElement.style.padding = "15px 20px"
    messageElement.style.borderRadius = "5px"
    messageElement.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)"
    messageElement.style.zIndex = "1000"
    messageElement.style.display = "flex"
    messageElement.style.alignItems = "center"
    messageElement.style.gap = "10px"

    // Style the link
    const link = messageElement.querySelector("a")
    link.style.color = "white"
    link.style.fontWeight = "bold"
    link.style.marginLeft = "10px"
    link.style.textDecoration = "underline"

    // Add to body
    document.body.appendChild(messageElement)

    // Remove after 3 seconds
    setTimeout(() => {
      messageElement.style.opacity = "0"
      messageElement.style.transition = "opacity 0.5s ease"
      setTimeout(() => {
        if (messageElement.parentNode) {
          messageElement.parentNode.removeChild(messageElement)
        }
      }, 500)
    }, 3000)
  }
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
