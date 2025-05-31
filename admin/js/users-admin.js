document.addEventListener('DOMContentLoaded', () => {
    const userListFeedback = document.getElementById('user-list-feedback');
    const userTableBody = document.getElementById('user-table-body');
    const userForm = document.getElementById('user-form');
    const userFormTitle = document.getElementById('user-form-title');
    const userFormFeedback = document.getElementById('user-form-feedback');
    const clearUserFormBtn = document.getElementById('clear-user-form-btn');

    const API_BASE_URL = '/admin/api'; // Or /admin if paths are different

    // Function to load users
    async function loadUsers() {
        userListFeedback.textContent = 'Loading users...';
        userTableBody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';
        console.log('Attempting to fetch users from /admin/api/users');

        try {
            const response = await fetch(`${API_BASE_URL}/users`);
            console.log('Load Users API Response Status:', response.status);

            if (response.ok) {
                const users = await response.json();
                userListFeedback.textContent = users.length > 0 ? 'Showing admin users:' : 'No admin users found.';
                renderUserTable(users);
            } else {
                const errorText = await response.text();
                console.error('Failed to load users:', response.status, errorText);
                userListFeedback.textContent = `Error loading users: ${response.status}. (Stub - API not implemented)`;
                userTableBody.innerHTML = `<tr><td colspan="5">Error loading users. (Stub)</td></tr>`;
            }
        } catch (error) {
            console.error('Network error while loading users:', error);
            userListFeedback.textContent = 'Network error. Could not load users. (Stub)';
            userTableBody.innerHTML = `<tr><td colspan="5">Network error. (Stub)</td></tr>`;
        }
    }

    // Function to render user table
    function renderUserTable(users) {
       userTableBody.innerHTML = '';
       if (!users || users.length === 0) {
           userTableBody.innerHTML = '<tr><td colspan="5">No admin users found.</td></tr>';
           return;
       }
       users.forEach(user => {
           const row = userTableBody.insertRow();
           row.innerHTML = `
               <td>${user.id || 'N/A'}</td>
               <td>${user.username || 'N/A'}</td>
               <td>${user.email || 'N/A'}</td>
               <td>${user.name || 'N/A'}</td>
               <td>
                   <button class="btn-admin edit-user-btn" data-user-id="${user.id}" style="background-color:#f0ad4e; margin-right:5px;">Edit</button>
                   <button class="btn-admin delete-user-btn" data-user-id="${user.id}" data-username="${user.username}" style="background-color:#d9534f;">Delete</button>
               </td>
           `;
       });
       attachUserActionListeners();
    }

    function attachUserActionListeners() {
       document.querySelectorAll('.edit-user-btn').forEach(button => {
           button.addEventListener('click', (e) => {
               const userId = e.target.dataset.userId;
               // For stub, just log. Real app would fetch user and populate form.
               console.log(`Edit user clicked: ${userId}. (Stub - Populate form)`);
               alert(`Edit user ${userId} (Stub). Form population not implemented.`);
               // Example: fetchUserForEdit(userId);
           });
       });

       document.querySelectorAll('.delete-user-btn').forEach(button => {
           button.addEventListener('click', async (e) => {
               const userId = e.target.dataset.userId;
               const username = e.target.dataset.username;
               console.log(`Attempting to delete user: ${userId} (${username})`);
               if (!confirm(`Are you sure you want to delete admin user: ${username} (ID: ${userId})?
This action cannot be undone.\`)) return;

               try {
                   // API_DOCUMENTATION.md suggests POST /admin/users/delete/{userId}
                   // Form based, so no specific body needed beyond CSRF if enabled.
                   const response = await fetch(`/admin/users/delete/${userId}`, { method: 'POST' });
                   console.log('Delete User API Response Status:', response.status);
                   if (response.ok || response.status === 204) { // 204 No Content is also a success
                       alert(`User ${username} deleted successfully (mocked).`);
                       loadUsers(); // Refresh list
                   } else {
                        const errorText = await response.text();
                        alert(`Failed to delete user ${username}. Status: ${response.status}. ${errorText} (Stub)`);
                   }
               } catch (error) {
                   console.error('Network error during user deletion:', error);
                   alert(`Network error deleting user ${username}. (Stub)`);
               }
           });
       });
    }

    // Handle user form submission (Add/Update)
    if (userForm) {
        userForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            userFormFeedback.style.display = 'none';
            userFormFeedback.textContent = '';
            userFormFeedback.style.color = 'red'; // Default to error color

            const formData = new FormData(userForm);
            const userData = Object.fromEntries(formData.entries());

            if (!userData.username || !userData.email) {
               userFormFeedback.textContent = 'Username and Email are required.';
               userFormFeedback.style.display = 'block';
               return;
            }
            if (userData.id === "" && !userData.password) { // New user, password required
               userFormFeedback.textContent = 'Password is required for new users.';
               userFormFeedback.style.display = 'block';
               return;
            }
            if (userData.password !== userData.confirmPassword) {
               userFormFeedback.textContent = 'Passwords do not match.';
               userFormFeedback.style.display = 'block';
               return;
            }

            // Remove confirmPassword from data to be sent if it exists
            delete userData.confirmPassword;
            if(userData.password === "") delete userData.password; // Don't send empty password for updates

            const endpoint = '/admin/users/save'; // API_DOCUMENTATION.md suggests this path
            console.log('Attempting to save user:', userData, 'to endpoint:', endpoint);

            try {
                // API_DOCUMENTATION.md suggests application/x-www-form-urlencoded for this
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
                    body: new URLSearchParams(userData)
                });
                console.log('Save User API Response Status:', response.status);

                if (response.ok) {
                    // Assuming redirect or simple success for form post
                    console.log('User saved successfully (mocked).');
                    userFormFeedback.textContent = 'User saved successfully! (Stub)';
                    userFormFeedback.style.color = 'green';
                    userFormFeedback.style.display = 'block';
                    userForm.reset();
                    document.getElementById('userId').value = ''; // Clear hidden ID
                    userFormTitle.textContent = 'Add New Admin User';
                    loadUsers(); // Refresh
                } else {
                    const errorText = await response.text();
                    console.error('Failed to save user:', response.status, errorText);
                    userFormFeedback.textContent = `Error saving user: ${response.status}. ${errorText} (Stub)`;
                    userFormFeedback.style.display = 'block';
                }
            } catch (error) {
                console.error('Network error while saving user:', error);
                userFormFeedback.textContent = 'Network error. Could not save user. (Stub)';
                userFormFeedback.style.display = 'block';
            }
        });
    }

    if(clearUserFormBtn) {
       clearUserFormBtn.addEventListener('click', () => {
           userForm.reset();
           document.getElementById('userId').value = '';
           userFormTitle.textContent = 'Add New Admin User';
           userFormFeedback.style.display = 'none';
           userFormFeedback.style.color = 'red'; // Reset color
       });
    }

    // Initial load
    loadUsers();
});
