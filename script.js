(() => {
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      const open = mainNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(open));
    });
    mainNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      mainNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }));
  }

  // Movie discovery: filter the local catalogue and launch wider searches.
  const movieSearch = document.getElementById('movieSearch');
  const movieStatus = document.getElementById('movieStatus');
  const movieCards = [...document.querySelectorAll('.movie-card')];
  const filterButtons = [...document.querySelectorAll('.filter-chip')];
  const providers = document.querySelectorAll('[data-movie-provider]');
  let activeFilter = 'all';
  const providerURLs = {
    google: q => 'https://www.google.com/search?q=' + encodeURIComponent(q + ' movie'),
    imdb: q => 'https://www.imdb.com/find/?q=' + encodeURIComponent(q),
    tmdb: q => 'https://www.themoviedb.org/search?query=' + encodeURIComponent(q),
    justwatch: q => 'https://www.justwatch.com/ug/search?q=' + encodeURIComponent(q)
  };
  function searchMovies() {
    const q = (movieSearch?.value || '').trim().toLowerCase();
    let count = 0;
    movieCards.forEach(card => {
      const categories = (card.dataset.category || '').split(/\s+/);
      const haystack = ((card.dataset.title || '') + ' ' + card.textContent).toLowerCase();
      const show = (activeFilter === 'all' || categories.includes(activeFilter)) && (!q || haystack.includes(q));
      card.hidden = !show;
      if (show) count++;
    });
    if (movieStatus) movieStatus.textContent = q
      ? count + ' catalogue result' + (count === 1 ? '' : 's') + ' for “' + q + '”. Use the source buttons for wider searches.'
      : 'Showing ' + count + ' curated movie picks.';
    providers.forEach(link => {
      const key = link.dataset.movieProvider;
      if (providerURLs[key]) link.href = providerURLs[key]((movieSearch?.value || '').trim() || 'popular movies');
    });
  }
  filterButtons.forEach(button => button.addEventListener('click', () => {
    activeFilter = button.dataset.filter || 'all';
    filterButtons.forEach(item => item.classList.toggle('active', item === button));
    searchMovies();
  }));
  movieSearch?.addEventListener('input', searchMovies);
  searchMovies();
})();