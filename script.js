(() => {
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');

  if (menuToggle && mainNav) {
    const closeMenu = () => {
      mainNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    };
    menuToggle.addEventListener('click', () => {
      const open = mainNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(open));
    });
    mainNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
    const current = location.pathname.split('/').pop() || 'index.html';
    mainNav.querySelectorAll('a').forEach(a => {
      if (a.getAttribute('href') === current) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  // Accessible skip link fallback for pages that do not include one in their markup.
  if (!document.querySelector('.skip-link')) {
    const skip = document.createElement('a');
    skip.className = 'skip-link';
    skip.href = '#mainContent';
    skip.textContent = 'Skip to content';
    document.body.prepend(skip);
  }
  const main = document.querySelector('main');
  if (main && !main.id) main.id = 'mainContent';

  // Subtle reveal effects; content remains visible if motion/observer support is unavailable.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const revealItems = document.querySelectorAll('.jw-tile,.content-card,.movie-card,.section-wrap,.movie-section,.about-section,.video-feature,.jw-founder-strip,.jw-bottom-cta');
    revealItems.forEach(item => item.classList.add('reveal-ready'));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -35px 0px' });
    revealItems.forEach(item => observer.observe(item));
  }

  // Reading progress and back-to-top controls.
  const progress = document.createElement('div');
  progress.className = 'reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);
  const topButton = document.createElement('button');
  topButton.className = 'back-to-top';
  topButton.type = 'button';
  topButton.setAttribute('aria-label', 'Back to top');
  topButton.textContent = '↑';
  document.body.append(topButton);
  const updateScrollUI = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
    topButton.classList.toggle('visible', window.scrollY > 550);
  };
  window.addEventListener('scroll', updateScrollUI, { passive: true });
  topButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  updateScrollUI();

  // Homepage quick search sends visitors to the full movie discovery search.
  const homeSearchForm = document.getElementById('homeSearchForm');
  homeSearchForm?.addEventListener('submit', event => {
    event.preventDefault();
    const query = document.getElementById('homeSearch')?.value.trim();
    if (query) location.href = 'movies.html?q=' + encodeURIComponent(query);
  });

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
    const rawQuery = movieSearch?.value || '';
    const q = rawQuery.trim().toLowerCase();
    let count = 0;
    movieCards.forEach(card => {
      const categories = (card.dataset.category || '').split(/\s+/);
      const haystack = ((card.dataset.title || '') + ' ' + card.textContent).toLowerCase();
      const show = (activeFilter === 'all' || categories.includes(activeFilter)) && (!q || haystack.includes(q));
      card.hidden = !show;
      if (show) count++;
    });
    if (movieStatus) movieStatus.textContent = q
      ? count + ' catalogue result' + (count === 1 ? '' : 's') + ' for “' + rawQuery.trim() + '”. Try IMDb, TMDB or JustWatch for wider results.'
      : 'Showing ' + count + ' curated movie picks.';
    providers.forEach(link => {
      const key = link.dataset.movieProvider;
      if (providerURLs[key]) link.href = providerURLs[key](rawQuery.trim() || 'popular movies');
    });
  }
  filterButtons.forEach(button => button.addEventListener('click', () => {
    activeFilter = button.dataset.filter || 'all';
    filterButtons.forEach(item => item.classList.toggle('active', item === button));
    searchMovies();
  }));
  movieSearch?.addEventListener('input', searchMovies);
  if (movieSearch) {
    const params = new URLSearchParams(location.search);
    const initialQuery = params.get('q');
    if (initialQuery) {
      movieSearch.value = initialQuery;
      searchMovies();
      movieSearch.focus({ preventScroll: true });
    } else searchMovies();
  }

  // JERON AI calls the protected Supabase Edge Function. The OpenAI key never enters browser code.
  const aiForm = document.getElementById('jeronAiForm'), aiInput = document.getElementById('jeronAiInput');
  const aiMessages = document.getElementById('jeronAiMessages'), aiSend = document.getElementById('jeronAiSend');
  const SUPABASE_FUNCTION_URL = 'https://oezmhonqmlificwoxjch.supabase.co/functions/v1/jeron-ai';
  function addAiMessage(text, role, sources = []) {
    const item = document.createElement('div'); item.className = 'ai-message ' + (role === 'user' ? 'ai-user' : 'ai-assistant');
    const label = document.createElement('b'); label.textContent = role === 'user' ? 'YOU' : 'JERON AI';
    const body = document.createElement('p'); body.textContent = text; item.append(label, body);
    if (sources.length) { const list = document.createElement('div'); list.className = 'ai-sources';
      const heading = document.createElement('b'); heading.textContent = 'SOURCES'; list.append(heading);
      sources.slice(0,8).forEach(source => { if (!source || typeof source.url !== 'string' || !/^https?:\/\//i.test(source.url)) return;
        const link = document.createElement('a'); link.href = source.url; link.target = '_blank'; link.rel = 'noopener noreferrer';
        link.textContent = source.title || new URL(source.url).hostname; list.append(link); });
      item.append(list); }
    aiMessages.append(item); aiMessages.scrollTop = aiMessages.scrollHeight; return item;
  }
  aiForm?.addEventListener('submit', async event => {
    event.preventDefault(); const message = aiInput.value.trim(); if (!message) return;
    addAiMessage(message,'user'); aiInput.value=''; aiSend.disabled=true; aiSend.textContent='Thinking…';
    const pending=addAiMessage('Searching and preparing a helpful answer…','assistant');
    try {
      const response=await fetch(SUPABASE_FUNCTION_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message})});
      const data=await response.json().catch(()=>({}));
      if(!response.ok) throw new Error(data.error || 'Jeron AI could not respond. Please try again.');
      pending.remove(); addAiMessage(data.answer || 'I could not prepare an answer this time.','assistant',data.sources || []);
    } catch(error) { pending.remove(); addAiMessage(error.message || 'Connection problem. Please try again later.','assistant'); }
    finally { aiSend.disabled=false; aiSend.textContent='Send ↗'; aiInput.focus(); }
  });

})();