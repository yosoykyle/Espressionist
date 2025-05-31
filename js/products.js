// Products page functionality for Espressionist e-commerce site

let allFetchedProducts = []; // To store all products fetched from JSON

document.addEventListener("DOMContentLoaded", () => {
    setupCategoryTabs();
    fetchProducts(); // Initial fetch and render of all products
    // setupAddToCartButtons() will be called by renderProducts after products are on the page
});

/**
 * Fetches products from the mock JSON file.
 */
async function fetchProducts() {
    const productGrid = document.getElementById("product-grid");
    const emptyProductsDiv = document.getElementById("empty-products");
    const loadingIndicator = document.getElementById("products-loading");

    if (loadingIndicator) loadingIndicator.style.display = "flex"; // Use flex as per its CSS
    if (productGrid) productGrid.style.display = "none";
    if (emptyProductsDiv) emptyProductsDiv.style.display = "none";

    try {
        const response = await fetch('data/mock-products.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allFetchedProducts = await response.json();
        renderProducts(allFetchedProducts); // Render all products initially
    } catch (error) {
        console.error("Error fetching products:", error);
        if (emptyProductsDiv) {
            emptyProductsDiv.innerHTML = `<p>Could not load products. Please try again later.</p>`;
            emptyProductsDiv.style.display = "flex";
        }
        if (productGrid) productGrid.style.display = "none";
    } finally {
        if (loadingIndicator) loadingIndicator.style.display = "none";
    }
}

/**
 * Renders products in the grid, optionally filtering by category.
 * @param {Array<Object>} productsToRender - The array of product objects to render.
 * @param {string} categoryFilter - The category to filter by (e.g., "Coffee & Tea"). Defaults to 'all'.
 */
function renderProducts(productsToRender, categoryFilter = 'all') {
    const productGrid = document.getElementById("product-grid");
    const emptyProductsDiv = document.getElementById("empty-products");

    if (!productGrid || !emptyProductsDiv) {
        console.error("Required DOM elements (product-grid or empty-products) not found.");
        return;
    }

    productGrid.innerHTML = ''; // Clear existing products

    const filteredProducts = categoryFilter === 'all'
        ? productsToRender
        : productsToRender.filter(product => product.category.toLowerCase() === categoryFilter.toLowerCase());

    if (filteredProducts.length === 0) {
        emptyProductsDiv.style.display = "flex"; // Use flex as per its CSS
        productGrid.style.display = "none";
    } else {
        emptyProductsDiv.style.display = "none";
        productGrid.style.display = "grid"; // Assuming it's a grid

        filteredProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            // Use formatCurrency if available, otherwise fallback to simple formatting
            const displayPrice = typeof formatCurrency === 'function' ? formatCurrency(product.price) : `₱${product.price.toFixed(2)}`;

            productCard.innerHTML = `
                <div class="product-image-container">
                    <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">${displayPrice}</p>
                    <p class="product-stock">Stock: ${product.stockQuantity}</p>
                    ${product.description ? `<p class="product-description">${product.description}</p>` : ''}
                </div>
                <div class="product-actions">
                    <button class="add-to-cart-btn"
                            data-product-id="${product.id}"
                            data-product-name="${product.name}"
                            data-product-price="${product.price}"
                            aria-label="Add ${product.name} to cart">
                        Add to Cart
                    </button>
                </div>
            `;
            productGrid.appendChild(productCard);
        });
    }
    setupAddToCartButtons(); // Re-attach event listeners to newly created buttons
}

/**
 * Set up category tabs functionality
 */
function setupCategoryTabs() {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const defaultCategory = "All Products"; // Or derive from the first active tab

    tabButtons.forEach((button) => {
        button.addEventListener("click", () => {
            // Special case for "Book a Spot"
            if (button.dataset.category && button.dataset.category.toLowerCase() === "book a spot") {
                 window.location.href = "index.html#about";
                 return;
            }

            tabButtons.forEach((tab) => tab.classList.remove("active"));
            button.classList.add("active");

            const selectedCategory = button.dataset.category || defaultCategory;
            renderProducts(allFetchedProducts, selectedCategory === "All Products" ? "all" : selectedCategory);
        });
    });

    // Ensure "All Products" tab is active by default if it exists
    const allProductsTab = Array.from(tabButtons).find(tab => (tab.dataset.category || "").toLowerCase() === "all products");
    if (allProductsTab && !document.querySelector(".tab-btn.active")) {
        allProductsTab.classList.add("active");
    }
}

/**
 * Set up Add to Cart buttons for dynamically generated product cards.
 */
function setupAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");

    addToCartButtons.forEach((button) => {
        // Remove existing listeners to prevent duplicates if called multiple times
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        newButton.addEventListener("click", (event) => {
            const targetButton = event.currentTarget; // Use currentTarget
            const productId = targetButton.dataset.productId;
            const productName = targetButton.dataset.productName;
            const productPrice = parseFloat(targetButton.dataset.productPrice);

            if (!productId || !productName || isNaN(productPrice)) {
                console.error("Product data missing from button:", targetButton.dataset);
                alert("Could not add product to cart, data is missing.");
                return;
            }

            const product = {
                id: productId,
                name: productName,
                price: productPrice,
                // quantity will be handled by addToCart function in storage.js
            };

            // Assuming addToCart and showAddToCartMessage are global functions
            // from storage.js and utils.js respectively.
            if (typeof addToCart === 'function' && typeof showAddToCartMessage === 'function') {
                const success = addToCart(product, 1); // addToCart from storage.js handles quantity
                if (success) {
                    showAddToCartMessage(product, 1); // showAddToCartMessage from utils.js
                } else {
                    alert("Failed to add product to cart.");
                }
            } else {
                console.error("addToCart or showAddToCartMessage function is not available globally.");
                alert("Error: Cart functionality is currently unavailable.");
            }
        });
    });
}

// Note: The local placeholder `addToCart` and `showAddToCartMessage` functions that were
// previously in this file should be removed if `storage.js` and `utils.js` are providing them globally.
// This script assumes they are available. If `js/utils.js` and `js/storage.js` use ES6 modules,
// this file (`products.js`) would also need to be a module and use imports.
// For now, proceeding with assumption of global availability based on current project structure.
