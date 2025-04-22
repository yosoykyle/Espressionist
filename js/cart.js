// Cart functionality for Espressionist e-commerce site

// Utility functions (assumed to be in utils.js or similar)
// For demonstration, we'll define them here.  In a real project,
// these would be imported.
function formatCurrency(number) {
  return "₱" + number.toFixed(2)
}

function calculateCartTotals(cartItems) {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const taxRate = 0.12 // 12% tax rate
  const tax = subtotal * taxRate
  const total = subtotal + tax

  return { subtotal, tax, total }
}

function updateCartItemQuantity(itemId, newQuantity) {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || []
  const itemIndex = cartItems.findIndex((item) => item.id === itemId)

  if (itemIndex !== -1) {
    cartItems[itemIndex].quantity = newQuantity

    // Ensure quantity is at least 1
    if (cartItems[itemIndex].quantity < 1) {
      cartItems[itemIndex].quantity = 1
    }

    // Update localStorage
    localStorage.setItem("cart", JSON.stringify(cartItems))

    // Reload cart to reflect changes
    loadCart()
  }
}

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize the cart
  loadCart()

  // Add event listener for quantity changes and remove buttons
  document.getElementById("cart-items").addEventListener("click", handleCartActions)
})

/**
 * Load cart data from localStorage and render it
 */
function loadCart() {
  // Show loading state
  showLoadingState()

  // Simulate network delay (remove in production)
  setTimeout(() => {
    // Get cart items from localStorage
    const cartItems = JSON.parse(localStorage.getItem("cart")) || []

    // Hide loading state
    hideLoadingState()

    // Show/hide empty cart message or cart items based on cart content
    const emptyCartElement = document.getElementById("empty-cart")
    const cartItemsContainer = document.getElementById("cart-items-container")

    if (cartItems.length === 0) {
      emptyCartElement.style.display = "block"
      cartItemsContainer.style.display = "none"
      return
    } else {
      emptyCartElement.style.display = "none"
      cartItemsContainer.style.display = "block"
    }

    // Render cart items
    renderCartItems(cartItems)

    // Calculate and update totals
    updateCartTotals(cartItems)
  }, 500) // Simulated delay of 500ms
}

/**
 * Show loading state for cart
 */
function showLoadingState() {
  const loadingElement = document.getElementById("cart-loading")
  if (loadingElement) {
    loadingElement.style.display = "flex"
  }
}

/**
 * Hide loading state for cart
 */
function hideLoadingState() {
  const loadingElement = document.getElementById("cart-loading")
  if (loadingElement) {
    loadingElement.style.display = "none"
  }
}

/**
 * Render cart items in the cart table
 * @param {Array} cartItems - Array of cart items
 */
function renderCartItems(cartItems) {
  const cartItemsElement = document.getElementById("cart-items")
  // Clear previous content except loading element
  const loadingElement = document.getElementById("cart-loading")
  cartItemsElement.innerHTML = ""
  if (loadingElement) {
    cartItemsElement.appendChild(loadingElement)
  }

  cartItems.forEach((item) => {
    const itemTotal = item.price * item.quantity

    const cartItemHTML = `
      <div class="cart-row" data-id="${item.id}">
        <div class="cart-cell product-cell">
          <div class="cart-product-info">
            <div class="cart-product-details">
              <h3 class="cart-product-name">${item.name}</h3>
            </div>
          </div>
        </div>
        <div class="cart-cell quantity-cell">
          <div class="cart-quantity">
            <button class="quantity-btn decrease-quantity" data-id="${item.id}" aria-label="Decrease quantity">-</button>
            <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}" aria-label="Product quantity">
            <button class="quantity-btn increase-quantity" data-id="${item.id}" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <div class="cart-cell price-cell" data-label="Price">${formatCurrency(item.price)}</div>
        <div class="cart-cell total-cell" data-label="Total">${formatCurrency(itemTotal)}</div>
        <div class="cart-cell action-cell">
          <button class="remove-btn" data-id="${item.id}" aria-label="Remove ${item.name} from cart">
            <i class="fas fa-trash-alt"></i>
            <span class="remove-text">Remove</span>
          </button>
        </div>
      </div>
    `

    cartItemsElement.innerHTML += cartItemHTML
  })

  // Add event listeners for quantity inputs
  const quantityInputs = document.querySelectorAll(".quantity-input")
  quantityInputs.forEach((input) => {
    input.addEventListener("change", handleQuantityChange)
  })
}

/**
 * Handle cart actions (increase/decrease quantity, remove item)
 * @param {Event} event - The click event
 */
function handleCartActions(event) {
  const target = event.target

  // Handle increase quantity button
  if (target.classList.contains("increase-quantity")) {
    const itemId = target.getAttribute("data-id")
    updateItemQuantity(itemId, 1)
  }

  // Handle decrease quantity button
  if (target.classList.contains("decrease-quantity")) {
    const itemId = target.getAttribute("data-id")
    updateItemQuantity(itemId, -1)
  }

  // Handle remove button
  if (target.classList.contains("remove-btn") || target.closest(".remove-btn")) {
    const removeBtn = target.classList.contains("remove-btn") ? target : target.closest(".remove-btn")
    const itemId = removeBtn.getAttribute("data-id")

    // Add loading state to the button
    removeBtn.classList.add("btn-loading")

    // Simulate network delay (remove in production)
    setTimeout(() => {
      removeCartItem(itemId)
    }, 300)
  }
}

/**
 * Handle quantity input change
 * @param {Event} event - The change event
 */
function handleQuantityChange(event) {
  const input = event.target
  const itemId = input.getAttribute("data-id")
  const newQuantity = Number.parseInt(input.value)

  if (newQuantity < 1) {
    input.value = 1
    updateCartItemQuantity(itemId, 1)
  } else {
    // Show loading state
    const cartRow = input.closest(".cart-row")
    if (cartRow) {
      cartRow.classList.add("updating")
    }

    // Simulate network delay (remove in production)
    setTimeout(() => {
      updateCartItemQuantity(itemId, newQuantity)

      // Update the row total immediately for better UX
      const priceCell = cartRow.querySelector(".price-cell")
      const totalCell = cartRow.querySelector(".total-cell")
      if (priceCell && totalCell) {
        const price = Number.parseFloat(priceCell.textContent.replace("₱", ""))
        const newTotal = price * newQuantity
        totalCell.textContent = formatCurrency(newTotal)
      }

      // Remove loading state
      if (cartRow) {
        cartRow.classList.remove("updating")
      }
    }, 300)
  }
}

/**
 * Update item quantity by increment/decrement
 * @param {string} itemId - The item ID
 * @param {number} change - The quantity change (1 or -1)
 */
function updateItemQuantity(itemId, change) {
  // Find the quantity button that was clicked
  const button = document.querySelector(
    `.quantity-btn[data-id="${itemId}"]${change > 0 ? ".increase-quantity" : ".decrease-quantity"}`,
  )

  // Add loading state to the button
  if (button) {
    button.classList.add("btn-loading")
  }

  // Simulate network delay (remove in production)
  setTimeout(() => {
    const cartItems = JSON.parse(localStorage.getItem("cart")) || []
    const itemIndex = cartItems.findIndex((item) => item.id === itemId)

    if (itemIndex !== -1) {
      cartItems[itemIndex].quantity += change

      // Ensure quantity is at least 1
      if (cartItems[itemIndex].quantity < 1) {
        cartItems[itemIndex].quantity = 1
      }

      // Update localStorage
      localStorage.setItem("cart", JSON.stringify(cartItems))

      // Reload cart to reflect changes
      loadCart()
    }
  }, 300)
}

/**
 * Remove an item from the cart
 * @param {string} itemId - The item ID to remove
 */
function removeCartItem(itemId) {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || []
  const itemToRemove = cartItems.find((item) => item.id === itemId)
  const itemName = itemToRemove ? itemToRemove.name : "Item"

  const updatedCart = cartItems.filter((item) => item.id !== itemId)

  // Update localStorage
  localStorage.setItem("cart", JSON.stringify(updatedCart))

  // Show toast notification
  showToast("success", "Item Removed", `${itemName} has been removed from your cart.`)

  // Reload cart to reflect changes
  loadCart()
}

/**
 * Calculate and update cart totals
 * @param {Array} cartItems - Array of cart items
 */
function updateCartTotals(cartItems) {
  // Calculate totals using the utility function from utils.js
  const { subtotal, tax, total } = calculateCartTotals(cartItems)

  // Update the DOM
  document.getElementById("cart-subtotal").textContent = formatCurrency(subtotal)
  document.getElementById("cart-tax").textContent = formatCurrency(tax)
  document.getElementById("cart-total").textContent = formatCurrency(total)
}

/**
 * Show toast notification
 * @param {string} type - Type of toast (success, error, warning, info)
 * @param {string} title - Toast title
 * @param {string} message - Toast message
 */
function showToast(type, title, message) {
  // Check if toast container exists, if not create it
  let toastContainer = document.querySelector(".toast-container")
  if (!toastContainer) {
    toastContainer = document.createElement("div")
    toastContainer.className = "toast-container"
    document.body.appendChild(toastContainer)
  }

  // Create toast element
  const toast = document.createElement("div")
  toast.className = `toast toast-${type}`
  toast.innerHTML = `
    <div class="toast-icon">
      <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : type === "warning" ? "exclamation-triangle" : "info-circle"}"></i>
    </div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
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
