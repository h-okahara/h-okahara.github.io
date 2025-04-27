document.addEventListener("DOMContentLoaded", function() {
  // Get current language from localStorage or default to the site's default language
  let currentLang = localStorage.getItem("siteLang") || "en";
  
  // Set up language toggle
  const langToggle = document.getElementById("language-toggle");
  if (langToggle) {
    // Set initial state
    updateLanguageToggle();
    
    // Add event listener
    langToggle.addEventListener("click", function() {
      currentLang = currentLang === "en" ? "ja" : "en";
      localStorage.setItem("siteLang", currentLang);
      updateLanguageToggle();
      updatePageContent();
    });
  }
  
  // Update language toggle button text
  function updateLanguageToggle() {
    if (langToggle) {
      langToggle.textContent = currentLang === "en" ? "日本語" : "English";
    }
  }
  
  // Update content based on language
  function updatePageContent() {
    document.querySelectorAll("[data-lang-en], [data-lang-ja]").forEach(el => {
      if (el.hasAttribute(`data-lang-${currentLang}`)) {
        // Show content for current language
        el.style.display = "";
        if (el.hasAttribute("data-lang-original")) {
          // Restore original content if available
          el.innerHTML = el.getAttribute("data-lang-original");
        }
      } else {
        // Hide content for other languages
        if (!el.hasAttribute("data-lang-original")) {
          el.setAttribute("data-lang-original", el.innerHTML);
        }
        el.style.display = "none";
      }
    });
  }
  
  // Initialize page with correct language
  updatePageContent();
});
