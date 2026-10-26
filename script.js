const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  menuToggle.textContent = isOpen ? "✕" : "☰";
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    menuToggle.textContent = "☰";
  });
});

const filterButtons = document.querySelectorAll(".filter-button");
const musicCards = document.querySelectorAll(".music-grid .media-card");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    musicCards.forEach((card) => {
      const shouldShow = filter === "all" || card.dataset.category === filter;
      card.hidden = !shouldShow;
    });
  });
});

document.getElementById("year").textContent = new Date().getFullYear();
* JERON WORLD - DARK NEON THEME */
#entertainment-hub {
  background: #090811;
  color: #f8f7ff;
  padding: 20px;
  font-family: Arial, sans-serif;
}

#entertainment-hub * {
  box-sizing: border-box;
}

#entertainment-hub .jw-hero {
  text-align: center;
  padding: 65px 15px;
  border: 1px solid #39265f;
  border-radius: 20px;
  background:
    radial-gradient(ellipse at top, #38215e, #090811 70%);
}

#entertainment-hub .jw-hero h1 {
  font-size: clamp(30px, 6vw, 58px);
  margin: 15px 0;
}

#entertainment-hub .jw-hero h1 span {
  color: #c4a1ff;
}

#entertainment-hub .jw-label {
  color: #d0b4ff;
  letter-spacing: 3px;
  font-size: 12px;
}

#entertainment-hub .jw-button {
  display: inline-block;
  margin-top: 18px;
  padding: 13px 22px;
  border-radius: 10px;
  background: #8b5cf6;
  color: white;
  text-decoration: none;
  font-weight: bold;
}

#entertainment-hub .jw-section {
  padding: 35px 0;
  scroll-margin-top: 20px;
}

#entertainment-hub .jw-section h2 {
  color: #d4baff;
  margin-bottom: 20px;
}

#entertainment-hub #jw-search {
  display: block;
  width: 100%;
  padding: 16px;
  border: 1px solid #7953bc;
  border-radius: 12px;
  background: #171323;
  color: white;
  font-size: 16px;
  outline-offset: 3px;
}

#entertainment-hub #jw-search:focus {
  outline: 2px solid #b794ff;
}

#entertainment-hub .jw-grid {
  display: grid;
  grid-template-columns:
    repeat(auto-fit, minmax(min(100%, 180px), 1fr));
  gap: 18px;
}

#entertainment-hub .jw-card {
  padding: 15px;
  border: 1px solid #302640;
  border-radius: 15px;
  background: #15121f;
  transition: transform 0.2s, border-color 0.2s;
  overflow-wrap: anywhere;
}

#entertainment-hub .jw-card:hover {
  transform: translateY(-4px);
  border-color: #9c70ff;
}

#entertainment-hub .jw-card img {
  width: 100%;
  height: 250px;
  display: block;
  object-fit: cover;
  border-radius: 10px;
}

#entertainment-hub .jw-card h3 {
  color: #e1d2ff;
  margin-bottom: 8px;
}

#entertainment-hub .jw-card p {
  color: #c4bfd0;
  line-height: 1.6;
}

#entertainment-hub .jw-card a {
  color: #c9aaff;
  font-weight: bold;
}

#entertainment-hub .jw-socials {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

#entertainment-hub .jw-socials a {
  display: inline-block;
  padding: 13px 16px;
  border: 1px solid #49366c;
  border-radius: 10px;
  background: #1b1628;
  color: white;
  text-decoration: none;
}

#entertainment-hub .jw-socials a:hover {
  background: #6336b8;
}

#entertainment-hub #jw-search-status {
  color: #d4baff;
  font-size: 14px;
  min-height: 20px;
}
