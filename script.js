(() => {
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  const searchInput = document.getElementById('siteSearch');
  const clearButton = document.getElementById('clearSearch');
  const searchStatus = document.getElementById('searchStatus');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
    mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }));
  }

  if (searchInput) {
    const cards = Array.from(document.querySelectorAll('.searchable'));
    const runSearch = () => {
      const query = searchInput.value.trim().toLowerCase();
      let visible = 0;
      cards.forEach(card => {
        const haystack = `${card.dataset.search || ''} ${card.textContent || ''}`.toLowerCase();
        const matches = !query || haystack.includes(query);
        card.classList.toggle('is-hidden', !matches);
        if (matches) visible++;
      });
      if (searchStatus) {
        searchStatus.textContent = query ? `${visible} result${visible === 1 ? '' : 's'} found` : '';
      }
    };
    searchInput.addEventListener('input', runSearch);
    if (clearButton) clearButton.addEventListener('click', () => {
      searchInput.value = '';
      runSearch();
      searchInput.focus();
    });
  }
})();
