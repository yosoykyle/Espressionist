// Past Orders functionality for Espressionist e-commerce site
import { formatDate, formatCurrency } from './utils.js';

/**
 * Simulates retrieving orders for a given user ID.
 * In this frontend-only application, user-specific data is not implemented.
 * This function will return all orders stored in localStorage, regardless of the userId.
 * @param {string} userId - The user ID (currently not used for filtering).
 * @returns {Array<Object>|null} - Array of order objects or null if none found.
 */
export function getOrdersByUserId(userId) {
    console.log(`Fetching orders for userId: ${userId}. Note: In the current frontend implementation, all localStorage orders are returned as user-specific data is not available.`);
    return getAllOrders();
}

document.addEventListener("DOMContentLoaded", () => {
    const orderListContainer = document.getElementById("order-list-container");
    const loadingSpinner = document.getElementById("loading-spinner");
    const noOrdersMessage = document.getElementById("no-orders-message");

    // Show loading spinner
    if (loadingSpinner) loadingSpinner.style.display = "block";
    if (orderListContainer) orderListContainer.innerHTML = ''; // Clear any static content

    // Simulate a short delay for loading, e.g., if fetching from a real API
    setTimeout(() => {
        const orders = getAllOrders();

        if (loadingSpinner) loadingSpinner.style.display = "none";

        if (orders && orders.length > 0) {
            displayPastOrders(orders, orderListContainer);
        } else {
            if (noOrdersMessage) noOrdersMessage.style.display = "block";
            // Ensure container is empty if no orders message is shown
            if (orderListContainer) orderListContainer.innerHTML = '';
            // Append noOrdersMessage to container if it's not already inside
            if (noOrdersMessage && orderListContainer && !orderListContainer.contains(noOrdersMessage)) {
                 orderListContainer.appendChild(noOrdersMessage);
            }
        }
    }, 500); // 0.5 second delay
});

/**
 * Retrieve all orders from localStorage.
 * @returns {Array<Object>|null} - Array of order objects or null if none found.
 */
function getAllOrders() {
    const ordersString = localStorage.getItem("orders");
    if (ordersString) {
        try {
            const ordersArray = JSON.parse(ordersString);
            // Sort orders by date, most recent first
            ordersArray.sort((a, b) => new Date(b.date) - new Date(a.date));
            return ordersArray;
        } catch (error) {
            console.error("Error parsing orders from localStorage:", error);
            return null;
        }
    }
    return null;
}

/*
 * Display past orders in the provided container.
 * @param {Array<Object>} orders - Array of order objects.
 * @param {HTMLElement} container - The HTML element to display orders in.
 */
function displayPastOrders(orders, container) {
    if (!container) return; // Ensure container exists
    container.innerHTML = ""; // Clear previous content (e.g., loading spinner or no orders message)

    orders.forEach(order => {
        const orderItem = document.createElement("div");
        orderItem.classList.add("order-item");

        const formattedDate = formatDate(new Date(order.date));
        const formattedTotal = formatCurrency(order.total);

        orderItem.innerHTML = `
            <div class="order-item-header">
                <span class="order-item-id">Order ID: ${order.orderId}</span>
                <span class="order-item-date">${formattedDate}</span>
            </div>
            <div class="order-item-details">
                <p><span class="label">Status:</span> <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></p>
                <p><span class="label">Total:</span> ${formattedTotal}</p>
            </div>
            <a href="track.html?order=${order.orderId}" class="view-details-btn">View Details</a>
        `;
        container.appendChild(orderItem);
    });
}
