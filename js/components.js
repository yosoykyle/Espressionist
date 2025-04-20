/**
 * Shared component loader for Espressionist website
 * Handles loading of shared components like navbar and footer
 */

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Load all components marked for inclusion
  loadInlineComponents()
})

/**
 * Load components directly without fetching external files
 * This solves the "Failed to fetch" issue when running locally
 */
function loadInlineComponents() {
  // Navbar component HTML
  const navbarHTML = `
    <div class="logo">
      <a href="index.html">espressionist</a>
    </div>
    <nav class="nav">
      <ul>
        <li><a href="products.html" id="nav-shop">Shop</a></li>
        <li><a href="cart.html" id="nav-cart">Cart</a></li>
        <li><a href="track.html" id="nav-track">Track Order</a></li>
        <li><a href="index.html#about" id="nav-about">About</a></li>
      </ul>
    </nav>
  `

  // Footer component HTML
  const footerHTML = `
    <div class="footer-content">
      <div class="footer-nav">
        <h3>Quick Links</h3>
        <ul>
          <li><a href="index.html">Home</a></li>
          <li><a href="products.html">Shop</a></li>
          <li><a href="cart.html">Cart</a></li>
          <li><a href="track.html">Track Order</a></li>
          <li><a href="index.html#about">About</a></li>
          <li><a href="admin-login.html">Admin</a></li>
        </ul>
      </div>
      
      <div class="footer-social">
        <h3>Connect With Us</h3>
        <p>Instagram: <a href="https://instagram.com/espressionist.ph" target="_blank" rel="noopener noreferrer">@espressionist.ph</a></p>
        <p>Facebook: <a href="https://www.facebook.com/espressionist.ph" target="_blank" rel="noopener noreferrer">facebook.com/espressionist.ph</a></p>
        <p>Linktree: <a href="https://linktr.ee/espressionist.ph" target="_blank" rel="noopener noreferrer">linktr.ee/espressionist.ph</a></p>
        <p>Email: <a href="mailto:espressionist.ph@gmail.com">espressionist.ph@gmail.com</a></p>
        <p>Phone: <a href="tel:+639959659332">0995 965 9332</a></p>  
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; <span id="current-year">2025</span> Espressionist</p>
    </div>
  `

  // Load navbar components
  document.querySelectorAll('[data-component="navbar"]').forEach((element) => {
    element.innerHTML = navbarHTML

    // Set active class based on current page
    setTimeout(() => {
      const currentPage = window.location.pathname.split("/").pop() || "index.html"

      // Clear any existing active classes
      document.querySelectorAll(".nav a").forEach((link) => {
        link.classList.remove("active")
      })

      // Set active class based on current page
      switch (currentPage) {
        case "products.html":
          document.getElementById("nav-shop")?.classList.add("active")
          break
        case "cart.html":
        case "checkout.html":
        case "success.html":
          document.getElementById("nav-cart")?.classList.add("active")
          break
        case "track.html":
          document.getElementById("nav-track")?.classList.add("active")
          break
        case "index.html":
        case "":
          // Only set About as active if the hash is #about
          if (window.location.hash === "#about") {
            document.getElementById("nav-about")?.classList.add("active")
          }
          break
      }
    }, 0)
  })

  // Load footer components
  document.querySelectorAll('[data-component="footer"]').forEach((element) => {
    element.innerHTML = footerHTML

    // Update copyright year
    setTimeout(() => {
      const yearElement = element.querySelector("#current-year")
      if (yearElement) {
        yearElement.textContent = new Date().getFullYear()
      }
    }, 0)
  })

  // Dispatch event when all components are loaded
  document.dispatchEvent(new CustomEvent("componentsLoaded"))
  console.log("All components loaded successfully")
}
