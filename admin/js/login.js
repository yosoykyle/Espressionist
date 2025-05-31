document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginErrorDiv = document.getElementById('login-error');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            loginErrorDiv.style.display = 'none'; // Hide previous errors
            loginErrorDiv.textContent = '';

            const username = loginForm.username.value;
            const password = loginForm.password.value;

            if (!username || !password) {
                loginErrorDiv.textContent = 'Username and password are required.';
                loginErrorDiv.style.display = 'block';
                return;
            }

            console.log(`Attempting login for username: ${username}`);

            try {
                // Spring Security by default expects x-www-form-urlencoded
                const response = await fetch('/admin/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        username: username,
                        password: password
                    })
                });

                console.log('Login API Response Status:', response.status);

                // For a real Spring Security setup, a successful form login typically results in a redirect (status 302)
                // or a 200 OK if not redirecting immediately (e.g. if handled by JS).
                // Since this is a stub, we'll simulate success on 200 or if it's a redirect that fetch can't follow (response.redirected)
                // A real scenario would involve checking response.url or specific headers if not using `redirect: 'manual'`
                if (response.ok || response.status === 0 || response.redirected || response.status === 200 || response.status === 302) { // response.status === 0 can happen with CORS on opaque redirect
                    console.log('Login successful (mocked). Redirecting to dashboard...');
                    // In a real app, the server would set a session cookie and redirect.
                    // Here, we just navigate.
                    window.location.href = 'dashboard.html';
                } else {
                    // Try to get an error message if the server sends one (e.g. bad credentials)
                    let errorMessage = `Login failed. Status: ${response.status}`;
                    try {
                       // Assuming server might send JSON error for non-redirect cases
                       const errorData = await response.json();
                       if (errorData && errorData.message) {
                           errorMessage = errorData.message;
                       }
                    } catch (e) {
                       // If response is not JSON, use status text or generic message
                       errorMessage = response.statusText || errorMessage;
                    }
                    console.error('Login API Error:', errorMessage);
                    loginErrorDiv.textContent = `Login failed: ${errorMessage}. (This is a stub, real login depends on backend.)`;
                    loginErrorDiv.style.display = 'block';
                }
            } catch (error) {
                console.error('Network error or other issue during login:', error);
                loginErrorDiv.textContent = 'Login request failed. Check network or console. (This is a stub.)';
                loginErrorDiv.style.display = 'block';
            }
        });
    }
});
