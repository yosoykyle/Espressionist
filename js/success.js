// Success page functionality for Espressionist e-commerce site

// Import utility functions
import { getUrlParameter, findOrder, formatCurrency, formatDate } from "./utils.js"

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  const orderId = getUrlParameter("order");
  const successContainer = document.getElementById("success-container");
  const fallbackContainer = document.getElementById("fallback-container");

  // Initially hide both containers
  if (successContainer) successContainer.style.display = "none";
  if (fallbackContainer) fallbackContainer.style.display = "none";

  if (orderId) {
    console.log(`Attempting to fetch order ${orderId} from API...`);
    // Optional: Show a generic loading message or spinner here
    // For simplicity, we'll manage container visibility.

    fetch(`/api/orders/${orderId}`)
      .then(response => {
        if (!response.ok) {
          // Not a network error, but an HTTP error (4xx, 5xx)
          // We'll throw an error to be caught by the .catch block,
          // which will then try localStorage.
          return response.json().catch(() => {
            // If parsing error message from API fails, create a generic error
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
          }).then(errorData => {
             // Throw an error with the message from API or a default one
            throw new Error(errorData.message || `API request failed: ${response.status}`);
          });
        }
        return response.json();
      })
      .then(orderFromApi => {
        if (orderFromApi && typeof orderFromApi === 'object' && orderFromApi.orderId) {
          console.log(`Successfully fetched order ${orderId} from API.`);
          displayOrderDetails(orderFromApi);
        } else {
          // API returned success but data is not in expected format
          throw new Error("API returned invalid order data format.");
        }
      })
      .catch(error => {
        console.warn(`API call to /api/orders/${orderId} failed:`, error.message);
        console.log(`Attempting to find order ${orderId} in local storage as fallback.`);

        const orderFromLocalStorage = findOrder(orderId); // findOrder from utils.js
        if (orderFromLocalStorage) {
          console.log(`Order ${orderId} found in local storage.`);
          // Optionally, inform user that fallback data is shown
          alert("Displaying order details from local backup as the server couldn't be reached.");
          displayOrderDetails(orderFromLocalStorage);
        } else {
          console.error(`Order ${orderId} not found in API or local storage.`);
          showFallbackMessage();
        }
      });
  } else {
    console.error("No order ID found in URL.");
    showFallbackMessage();
  }
});

/**
 * Display order details on the page
 * @param {Object} order - Order object
 */
function displayOrderDetails(order) {
  document.getElementById("tracking-code").textContent = order.orderId;
  document.getElementById("total-amount").textContent = formatCurrency(order.total);
  const orderDate = new Date(order.date);
  document.getElementById("order-date").textContent = formatDate(orderDate);

  if (order.shipping) {
    document.getElementById("shipping-name-display").textContent = order.shipping.name || "N/A";
    document.getElementById("shipping-address-display").textContent = order.shipping.address || "N/A";
    document.getElementById("shipping-phone-display").textContent = order.shipping.phone || "N/A";
    const emailDisplayElement = document.getElementById("shipping-email-display");
    if (order.shipping.email) {
        emailDisplayElement.textContent = order.shipping.email;
    } else {
        emailDisplayElement.textContent = "N/A";
    }
  }

  const itemsListContainer = document.getElementById("ordered-items-list");
  if (itemsListContainer && order.cart && order.cart.length > 0) {
    itemsListContainer.innerHTML = '';
    const ul = document.createElement('ul');
    ul.className = 'item-list';
    order.cart.forEach(item => {
      const li = document.createElement('li');
      li.className = 'item-entry';
      const itemName = item.name || "Unknown Item";
      const itemQuantity = item.quantity || 0;
      const itemPrice = item.price || 0;
      li.innerHTML = `
        <span class="item-name">${itemName} (x${itemQuantity})</span>
        <span class="item-price-details">
            Price per unit: ${formatCurrency(itemPrice)} |
            Subtotal: ${formatCurrency(itemPrice * itemQuantity)}
        </span>`;
      ul.appendChild(li);
    });
    itemsListContainer.appendChild(ul);
  } else if (itemsListContainer) {
    itemsListContainer.innerHTML = '<p>No items found in this order.</p>';
  }

  const successContainer = document.getElementById("success-container");
  if (successContainer) successContainer.style.display = "block";
  const fallbackContainer = document.getElementById("fallback-container");
  if (fallbackContainer) fallbackContainer.style.display = "none";
}

/**
 * Show fallback message when order is not found
 */
function showFallbackMessage() {
  const successContainer = document.getElementById("success-container");
  if (successContainer) successContainer.style.display = "none";
  const fallbackContainer = document.getElementById("fallback-container");
  if (fallbackContainer) fallbackContainer.style.display = "block";
}
