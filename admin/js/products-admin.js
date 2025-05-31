document.addEventListener('DOMContentLoaded', () => {
    const productListFeedback = document.getElementById('product-list-feedback');
    const productTableBody = document.getElementById('product-table-body');
    const productForm = document.getElementById('product-form');
    const productFormTitle = document.getElementById('product-form-title');
    const productFormFeedback = document.getElementById('product-form-feedback');
    const clearFormBtn = document.getElementById('clear-form-btn');

    const API_BASE_URL = '/admin/api'; // Or just /admin if paths are different

    // Function to load products
    async function loadProducts() {
        productListFeedback.textContent = 'Loading products...';
        productTableBody.innerHTML = '<tr><td colspan="6">Loading...</td></tr>'; // Clear table
        console.log('Attempting to fetch products from /admin/api/products');

        try {
            const response = await fetch(`${API_BASE_URL}/products`);
            console.log('Load Products API Response Status:', response.status);

            if (response.ok) {
                const products = await response.json();
                productListFeedback.textContent = products.length > 0 ? 'Showing products:' : 'No products found in the database.';
                renderProductTable(products);
            } else {
                const errorText = await response.text();
                console.error('Failed to load products:', response.status, errorText);
                productListFeedback.textContent = `Error loading products: ${response.status}. (Stub - API not implemented)`;
                productTableBody.innerHTML = `<tr><td colspan="6">Error loading products. (Stub)</td></tr>`;
            }
        } catch (error) {
            console.error('Network error while loading products:', error);
            productListFeedback.textContent = 'Network error. Could not load products. (Stub)';
            productTableBody.innerHTML = `<tr><td colspan="6">Network error. (Stub)</td></tr>`;
        }
    }

    // Function to render product table
    function renderProductTable(products) {
       productTableBody.innerHTML = ''; // Clear previous rows
       if (!products || products.length === 0) {
           productTableBody.innerHTML = '<tr><td colspan="6">No products found.</td></tr>';
           return;
       }
       products.forEach(product => {
           const row = productTableBody.insertRow();
           row.innerHTML = `
               <td>${product.id || 'N/A'}</td>
               <td>${product.name || 'N/A'}</td>
               <td>${product.price || 'N/A'}</td>
               <td>${product.quantity || 'N/A'}</td>
               <td>${product.category || 'N/A'}</td>
               <td>
                   <button class="btn-admin edit-btn" data-id="${product.id}" style="background-color:#f0ad4e; margin-right:5px;">Edit</button>
                   <button class="btn-admin archive-btn" data-id="${product.id}" style="background-color:#d9534f;">Archive</button>
               </td>
           `;
       });
       attachTableButtonListeners();
    }

    function attachTableButtonListeners() {
       document.querySelectorAll('.edit-btn').forEach(button => {
           button.addEventListener('click', (e) => {
               const productId = e.target.dataset.id;
               // For stub, just log. Real app would fetch product and populate form.
               console.log(`Edit product clicked: ${productId}. (Stub - Populate form)`);
               alert(`Edit product ${productId} (Stub). Form population not implemented.`);
               // Example: fetchProductForEdit(productId);
           });
       });

       document.querySelectorAll('.archive-btn').forEach(button => {
           button.addEventListener('click', async (e) => {
               const productId = e.target.dataset.id;
               console.log(`Attempting to archive product: ${productId}`);
               if (!confirm(`Are you sure you want to archive product ID: ${productId}?`)) return;

               try {
                   const response = await fetch(`${API_BASE_URL}/products/archive/${productId}`, { method: 'POST' });
                   console.log('Archive Product API Response Status:', response.status);
                   if (response.ok) {
                       alert(`Product ${productId} archived successfully (mocked).`);
                       loadProducts(); // Refresh list
                   } else {
                       const errorText = await response.text();
                       alert(`Failed to archive product ${productId}. Status: ${response.status}. ${errorText} (Stub)`);
                   }
               } catch (error) {
                   console.error('Network error during archive:', error);
                   alert(`Network error archiving product ${productId}. (Stub)`);
               }
           });
       });
    }

    // Handle product form submission (Add/Update)
    if (productForm) {
        productForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            productFormFeedback.style.display = 'none';
            productFormFeedback.textContent = '';

            const formData = new FormData(productForm);
            const productData = Object.fromEntries(formData.entries());

            // Basic validation for stub
            if (!productData.name || !productData.price || !productData.quantity || !productData.category) {
               productFormFeedback.textContent = 'Name, Price, Quantity, and Category are required.';
               productFormFeedback.style.display = 'block';
               return;
            }

            const endpoint = `${API_BASE_URL}/products/save`;
            console.log('Attempting to save product:', productData, 'to endpoint:', endpoint);

            try {
                // For /save, API_DOCUMENTATION.md suggests multipart/form-data
                // but for stub simplicity with JSON, we might send JSON if image is just a URL.
                // If actual file upload is needed, FormData without Object.fromEntries is better.
                // Let's stick to FormData as per API doc for this stub if it were real, but for pure stub, JSON is easier if no file.
                // The spec implies /save is for products, which might include image files.
                // However, the HTML form currently only has imageURL.
                // For a pure stub without actual file upload, sending JSON is simpler.
                // If the API strictly expects multipart, this would need adjustment.
                // Let's assume JSON for the stub if image is just a URL.
                // If API_DOCUMENTATION.md specified multipart for /admin/api/products/save even with URL, then use FormData.
                // The current HTML structure (imageUrl as text input) leans towards JSON for the stub.
                // API_DOCUMENTATION.md says: POST /admin/api/products/save (multipart/form-data)
                // So, will use FormData.

                const response = await fetch(endpoint, {
                    method: 'POST',
                    body: formData // FormData directly
                });

                console.log('Save Product API Response Status:', response.status);

                if (response.ok) {
                    const result = await response.json(); // Assuming server sends back the saved/updated product or a success message
                    console.log('Product saved successfully (mocked):', result);
                    productFormFeedback.textContent = `Product saved successfully! (ID: ${result.id || 'N/A'}) (Stub)`;
                    productFormFeedback.style.color = 'green'; // Use a less alarming color for success
                    productFormFeedback.style.display = 'block';
                    productForm.reset();
                    document.getElementById('productId').value = ''; // Ensure hidden ID is also cleared
                    productFormTitle.textContent = 'Add New Product';
                    loadProducts(); // Refresh the list
                } else {
                    const errorText = await response.text();
                    console.error('Failed to save product:', response.status, errorText);
                    productFormFeedback.textContent = `Error saving product: ${response.status}. ${errorText} (Stub)`;
                    productFormFeedback.style.color = 'red'; // Default error color
                    productFormFeedback.style.display = 'block';
                }
            } catch (error) {
                console.error('Network error while saving product:', error);
                productFormFeedback.textContent = 'Network error. Could not save product. (Stub)';
                productFormFeedback.style.color = 'red'; // Default error color
                productFormFeedback.style.display = 'block';
            }
        });
    }

    if(clearFormBtn) {
       clearFormBtn.addEventListener('click', () => {
           productForm.reset();
           document.getElementById('productId').value = ''; // Clear hidden ID
           productFormTitle.textContent = 'Add New Product';
           productFormFeedback.style.display = 'none';
       });
    }

    // Initial load of products
    loadProducts();
});
