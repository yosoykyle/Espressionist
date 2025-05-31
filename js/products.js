// Products page functionality for Espressionist e-commerce site

let allFetchedProducts = []; // To store all products fetched from JSON or API

document.addEventListener("DOMContentLoaded", () => {
    setupCategoryTabs();
    fetchProducts(); // Initial fetch and render of all products
});

/**
 * Fetches products first from /api/products, then falls back to local mock JSON.
 */
async function fetchProducts() {
    const productGrid = document.getElementById("product-grid");
    const emptyProductsDiv = document.getElementById("empty-products");
    const loadingIndicator = document.getElementById("products-loading");
    const loadingText = loadingIndicator ? loadingIndicator.querySelector('.loading-text') : null;

    function showLoading(message) {
        if (loadingIndicator) loadingIndicator.style.display = "flex";
        if (loadingText) loadingText.textContent = message || "Loading products...";
        if (productGrid) productGrid.style.display = "none";
        if (emptyProductsDiv) emptyProductsDiv.style.display = "none";
    }

    function hideLoading() {
        if (loadingIndicator) loadingIndicator.style.display = "none";
    }

    function showError(message) {
        if (emptyProductsDiv) {
            emptyProductsDiv.innerHTML = `<p>${message}</p>`;
            emptyProductsDiv.style.display = "flex";
        }
        if (productGrid) productGrid.style.display = "none";
        hideLoading();
    }

    showLoading("Attempting to fetch products from API...");

    try {
        const response = await fetch('/api/products');
        if (!response.ok) {
            // Not a network error, but an HTTP error (4xx, 5xx)
            throw new Error(`API request failed with status ${response.status}`);
        }
        const dataFromApi = await response.json();
        if (!Array.isArray(dataFromApi)) {
            // Valid JSON, but not an array as expected
            throw new Error("API did not return a valid product list.");
        }
        allFetchedProducts = dataFromApi;
        console.log("Successfully fetched products from /api/products");
        renderProducts(allFetchedProducts);
        hideLoading();
    } catch (error) {
        console.warn("API call to /api/products failed:", error.message);
        showLoading("API failed. Attempting to load from local backup...");

        try {
            const fallbackResponse = await fetch('data/mock-products.json');
            if (!fallbackResponse.ok) {
                throw new Error(`HTTP error! status: ${fallbackResponse.status} while fetching local JSON.`);
            }
            allFetchedProducts = await fallbackResponse.json();
            if (!Array.isArray(allFetchedProducts)) {
                 throw new Error("Local mock data is not a valid product list.");
            }
            console.log("Successfully fetched products from local data/mock-products.json");
            renderProducts(allFetchedProducts);
            // Optionally, inform user that fallback data is shown
            if (loadingText) loadingText.textContent = "Displaying products from local backup.";
            // Keep loading indicator for a bit or remove immediately
             setTimeout(hideLoading, 500); // Hide after a short delay to show message
        } catch (fallbackError) {
            console.error("Error fetching products from local backup:", fallbackError.message);
            showError("Could not load products from API or local backup. Please try again later.");
        }
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
        : productsToRender.filter(product => product.category && product.category.toLowerCase() === categoryFilter.toLowerCase());

    if (filteredProducts.length === 0) {
        emptyProductsDiv.style.display = "flex";
        productGrid.style.display = "none";
        if (categoryFilter !== 'all') {
            emptyProductsDiv.innerHTML = `<p>No products found in "${categoryFilter}".</p>`;
        } else {
            emptyProductsDiv.innerHTML = `<p>No products available at the moment.</p>`;
        }
    } else {
        emptyProductsDiv.style.display = "none";
        productGrid.style.display = "grid";

        filteredProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
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
    setupAddToCartButtons();
}

/**
 * Set up category tabs functionality
 */
function setupCategoryTabs() {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const defaultCategory = "All Products";

    tabButtons.forEach((button) => {
        button.addEventListener("click", () => {
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
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        newButton.addEventListener("click", (event) => {
            const targetButton = event.currentTarget;
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
            };

            if (typeof addToCart === 'function' && typeof showAddToCartMessage === 'function') {
                const success = addToCart(product, 1);
                if (success) {
                    showAddToCartMessage(product, 1);
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
// Note: Assumes formatCurrency, addToCart, showAddToCartMessage are available globally or via imports if converted to module.
