document.addEventListener('DOMContentLoaded', () => {
    const logoutLink = document.getElementById('logout-link');

    if (logoutLink) {
        logoutLink.addEventListener('click', async (event) => {
            event.preventDefault();
            console.log('Attempting logout...');

            try {
                const response = await fetch('/logout', { // Standard Spring Security logout path
                    method: 'POST',
                    // Spring Security's default logout often requires a CSRF token if CSRF is enabled.
                    // For this stub, we'll assume CSRF is either disabled or handled in a way that
                    // a simple POST works for demonstration. If CSRF is needed, headers would be required.
                });

                console.log('Logout API Response Status:', response.status);

                // A successful logout typically redirects to the login page.
                // response.ok might be true, or response.redirected might be true.
                if (response.ok || response.redirected || response.status === 200 || response.status === 302) {
                    console.log('Logout successful (mocked). Redirecting to login page...');
                    window.location.href = 'login.html';
                } else {
                    let errorMessage = `Logout failed. Status: ${response.status}`;
                    try {
                       const errorData = await response.json();
                       if(errorData && errorData.message){
                           errorMessage = errorData.message;
                       }
                    } catch(e) {
                       errorMessage = response.statusText || errorMessage;
                    }
                    console.error('Logout API Error:', errorMessage);
                    alert(`Logout failed: ${errorMessage}. (This is a stub. You will be redirected to login.)`);
                    window.location.href = 'login.html'; // Force redirect even on error for stub
                }
            } catch (error) {
                console.error('Network error or other issue during logout:', error);
                alert('Logout request failed. Check network or console. (This is a stub. You will be redirected to login.)');
                window.location.href = 'login.html'; // Force redirect even on error for stub
            }
        });
    }
});
