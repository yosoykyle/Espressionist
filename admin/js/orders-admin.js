document.addEventListener('DOMContentLoaded', () => {
    const orderListFeedback = document.getElementById('order-list-feedback');
    const orderTableBody = document.getElementById('order-table-body');

    // For status update modal/form (conceptual)
    const updateStatusContainer = document.getElementById('update-status-container');
    const modalOrderIdSpan = document.getElementById('modal-order-id');
    const newStatusSelect = document.getElementById('new-status');
    const submitStatusUpdateBtn = document.getElementById('submit-status-update');
    const statusUpdateFeedback = document.getElementById('status-update-feedback');
    let currentOrderIdForUpdate = null;

    const API_BASE_URL = '/admin/api';

    // Function to load orders
    async function loadOrders() {
        orderListFeedback.textContent = 'Loading orders...';
        orderTableBody.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';
        console.log('Attempting to fetch orders from /admin/api/orders');

        try {
            const response = await fetch(`${API_BASE_URL}/orders`);
            console.log('Load Orders API Response Status:', response.status);

            if (response.ok) {
                const orders = await response.json();
                orderListFeedback.textContent = orders.length > 0 ? 'Showing orders:' : 'No orders found in the database.';
                renderOrderTable(orders);
            } else {
                const errorText = await response.text();
                console.error('Failed to load orders:', response.status, errorText);
                orderListFeedback.textContent = `Error loading orders: ${response.status}. (Stub - API not implemented)`;
                orderTableBody.innerHTML = `<tr><td colspan="6">Error loading orders. (Stub)</td></tr>`;
            }
        } catch (error) {
            console.error('Network error while loading orders:', error);
            orderListFeedback.textContent = 'Network error. Could not load orders. (Stub)';
            orderTableBody.innerHTML = `<tr><td colspan="6">Network error. (Stub)</td></tr>`;
        }
    }

    // Function to render order table
    function renderOrderTable(orders) {
       orderTableBody.innerHTML = ''; // Clear previous rows
       if (!orders || orders.length === 0) {
           orderTableBody.innerHTML = '<tr><td colspan="6">No orders found.</td></tr>';
           return;
       }
       orders.forEach(order => {
           const row = orderTableBody.insertRow();
           // Assuming 'order' object structure from API_DOCUMENTATION.md (e.g., order.customerName, order.orderDate, etc.)
           // For stub, we might not have all these details from a mock API.
           row.innerHTML = `
               <td>${order.orderCode || order.id || 'N/A'}</td>
               <td>${order.customerName || 'N/A'}</td>
               <td>${order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}</td>
               <td>${typeof order.totalWithVAT !== 'undefined' ? `₱${order.totalWithVAT.toFixed(2)}` : 'N/A'}</td>
               <td>${order.status || 'N/A'}</td>
               <td>
                   <button class="btn-admin update-status-btn" data-order-id="${order.id || order.orderCode}" data-current-status="${order.status || ''}" style="background-color:#5bc0de; margin-right:5px;">Update Status</button>
                   <button class="btn-admin archive-order-btn" data-order-id="${order.id || order.orderCode}" style="background-color:#d9534f;">Archive</button>
               </td>
           `;
       });
       attachOrderActionListeners();
    }

    function attachOrderActionListeners() {
       document.querySelectorAll('.update-status-btn').forEach(button => {
           button.addEventListener('click', (e) => {
               currentOrderIdForUpdate = e.target.dataset.orderId;
               const currentStatus = e.target.dataset.currentStatus;
               modalOrderIdSpan.textContent = currentOrderIdForUpdate;
               newStatusSelect.value = currentStatus || 'Pending'; // Default if no status
               updateStatusContainer.style.display = 'block';
               statusUpdateFeedback.textContent = '';
               console.log(`Update status clicked for order: ${currentOrderIdForUpdate}, current status: ${currentStatus}`);
           });
       });

       document.querySelectorAll('.archive-order-btn').forEach(button => {
           button.addEventListener('click', async (e) => {
               const orderId = e.target.dataset.orderId;
               console.log(`Attempting to archive order: ${orderId}`);
               if (!confirm(`Are you sure you want to archive order ID: ${orderId}?`)) return;

               try {
                   const response = await fetch(`${API_BASE_URL}/orders/${orderId}/archive`, { method: 'POST' });
                   console.log('Archive Order API Response Status:', response.status);
                   if (response.ok) {
                       alert(`Order ${orderId} archived successfully (mocked).`);
                       loadOrders(); // Refresh list
                   } else {
                       const errorText = await response.text();
                       alert(`Failed to archive order ${orderId}. Status: ${response.status}. ${errorText} (Stub)`);
                   }
               } catch (error) {
                   console.error('Network error during order archive:', error);
                   alert(`Network error archiving order ${orderId}. (Stub)`);
               }
           });
       });
    }

    if (submitStatusUpdateBtn) {
       submitStatusUpdateBtn.addEventListener('click', async () => {
           if (!currentOrderIdForUpdate) return;
           const newStatus = newStatusSelect.value;
           statusUpdateFeedback.textContent = `Attempting to update order ${currentOrderIdForUpdate} to ${newStatus}...`;
           statusUpdateFeedback.style.color = '#333'; // Reset color

           console.log(`Attempting to update order: ${currentOrderIdForUpdate} to status: ${newStatus}`);
           try {
               const response = await fetch(`${API_BASE_URL}/orders/${currentOrderIdForUpdate}/status`, {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify({ status: newStatus })
               });
               console.log('Update Status API Response Status:', response.status);
               if (response.ok) {
                   statusUpdateFeedback.textContent = `Order ${currentOrderIdForUpdate} status updated to ${newStatus} successfully (mocked).`;
                   statusUpdateFeedback.style.color = 'green';
                   loadOrders(); // Refresh
                   // updateStatusContainer.style.display = 'none'; // Optionally hide modal after success
               } else {
                   const errorText = await response.text();
                   statusUpdateFeedback.textContent = `Failed to update status for order ${currentOrderIdForUpdate}. ${errorText} (Stub)`;
                   statusUpdateFeedback.style.color = 'red';
               }
           } catch (error) {
               console.error('Network error during status update:', error);
               statusUpdateFeedback.textContent = `Network error updating status for ${currentOrderIdForUpdate}. (Stub)`;
               statusUpdateFeedback.style.color = 'red';
           }
       });
    }

    // Initial load of orders
    loadOrders();
});
