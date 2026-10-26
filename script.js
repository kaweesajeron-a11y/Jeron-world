### 2. Upgraded Engine Script (`script.js`)
```javascript
/**
 * JERON WORLD - Premium Interactive UI Controller
 */
document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  // --- DOM Elements System Cache ---
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  const filterButtons = document.querySelectorAll(".filter-button");
  const mediaCards = document.querySelectorAll(".media-card, .search-item");
  const searchInput = document.getElementById("siteSearch");
  const yearPlaceholder = document.getElementById("year");

  let activeCategoryFilter = "all";
  let activeSearchQuery = "";

  // --- Navigation Toggle Subsystem ---
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const isExpanded = navLinks.classList.toggle("open");
      
      // Sync Accessibility Roles
      menuToggle.setAttribute("aria-expanded", String(isExpanded));
      menuToggle.setAttribute("aria-label", isExpanded ? "Close navigation" : "Open navigation");
      menuToggle.textContent = isExpanded ? "✕" : "☰";
    });

    // Smart Close when linking within view
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (navLinks.classList.contains("open")) {
          navLinks.classList.remove("open");
          menuToggle.setAttribute("aria-expanded", "false");
          menuToggle.setAttribute("aria-label", "Open navigation");
          menuToggle.textContent = "☰";
        }
      });
    });
  }

  // --- Integrated Filter & Search Processing Deck ---
  function evaluateCardVisibility() {
    let visibleCount = 0;

    mediaCards.forEach((card) => {
      // 1. Evaluate Filtering Category
      const cardCategory = card.dataset.category || "";
      const matchesFilter = activeCategoryFilter === "all" || cardCategory === activeCategoryFilter;

      // 2. Evaluate Text Search Context
      const searchContextText = card.textContent.toLowerCase();
      const matchesSearch = searchContextText.includes(activeSearchQuery);

      // 3. Coordinate State Matrix Output
      if (matchesFilter && matchesSearch) {
        card.style.display = "";
        card.removeAttribute("hidden");
        visibleCount++;
      } else {
        card.style.display = "none";
        card.setAttribute("hidden", "true");
      }
    });

    // Real-time Status Dispatcher for UX clarity
    const statusBox = document.getElementById("jw-search-status");
    if (statusBox) {
      if (activeSearchQuery.length > 0) {
        statusBox.textContent = `Found ${visibleCount} match${visibleCount === 1 ? "" : "es"} for "${activeSearchQuery}"`;
      } else {
        statusBox.textContent = "";
      }
    }
  }

  // --- Filter Row Listener Registration ---
  if (filterButtons.length > 0) {
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const selectedFilter = button.dataset.filter || "all";

        // Performance Check
        if (activeCategoryFilter === selectedFilter) return;

        filterButtons.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");

        activeCategoryFilter = selectedFilter;
        evaluateCardVisibility();
      });
    });
  }

  // --- Real-time Search Input Listener System ---
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      activeSearchQuery = e.target.value.toLowerCase().trim();
      evaluateCardVisibility();
    });
  }

  // --- Dynamic Chronos (Year Tracker) Engine ---
  if (yearPlaceholder) {
    yearPlaceholder.textContent = new Date().getFullYear();
  }
});
