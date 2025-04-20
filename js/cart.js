// Cart functionality for Espressionist e-commerce site

// Utility functions (assumed to be in utils.js or similar)
// For demonstration, we'll define them here.  In a real project,
// these would be imported.
function formatCurrency(number) {
  return "₱" + number.toFixed(2)
}

function calculateCartTotals(cartItems) {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const taxRate = 0.1 // 10% tax rate
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
  // Get cart items from localStorage
  const cartItems = JSON.parse(localStorage.getItem("cart")) || []

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
}

/**
 * Render cart items in the cart table
 * @param {Array} cartItems - Array of cart items
 */
function renderCartItems(cartItems) {
  const cartItemsElement = document.getElementById("cart-items")
  cartItemsElement.innerHTML = ""

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
            <button class="quantity-btn decrease-quantity" data-id="${item.id}">-</button>
            <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
            <button class="quantity-btn increase-quantity" data-id="${item.id}">+</button>
          </div>
        </div>
        <div class="cart-cell price-cell" data-label="Price">${formatCurrency(item.price)}</div>
        <div class="cart-cell total-cell" data-label="Total">${formatCurrency(itemTotal)}</div>
        <div class="cart-cell action-cell">
          <button class="remove-btn" data-id="${item.id}">
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
    removeCartItem(itemId)
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
    updateCartItemQuantity(itemId, newQuantity)
  }

  // Update the row total immediately for better UX
  const cartRow = input.closest(".cart-row")
  if (cartRow) {
    const priceCell = cartRow.querySelector(".price-cell")
    const totalCell = cartRow.querySelector(".total-cell")
    if (priceCell && totalCell) {
      const price = Number.parseFloat(priceCell.textContent.replace("₱", ""))
      const newTotal = price * newQuantity
      totalCell.textContent = formatCurrency(newTotal)
    }
  }
}

/**
 * Update item quantity by increment/decrement
 * @param {string} itemId - The item ID
 * @param {number} change - The quantity change (1 or -1)
 */
function updateItemQuantity(itemId, change) {
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
}

/**
 * Remove an item from the cart
 * @param {string} itemId - The item ID to remove
 */
function removeCartItem(itemId) {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || []
  const updatedCart = cartItems.filter((item) => item.id !== itemId)

  // Update localStorage
  localStorage.setItem("cart", JSON.stringify(updatedCart))

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
