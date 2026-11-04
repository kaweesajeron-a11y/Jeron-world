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

  const SUPABASE_URL = 'https://oezmhonqmlificwoxjch.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_-SigzrDFHYfdsAV7G7KJjA_2TWAnyJg';

  const authForm = document.getElementById('authForm');
  const authStatus = document.getElementById('authStatus');
  const signOutBtn = document.getElementById('signOutBtn');
  const messageForm = document.getElementById('messageForm');
  const messageStatus = document.getElementById('messageStatus');
  const commentForm = document.getElementById('commentForm');
  const commentStatus = document.getElementById('commentStatus');
  const commentsList = document.getElementById('commentsList');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');

  if (!window.supabase || !SUPABASE_URL.includes('supabase.co') || !SUPABASE_ANON_KEY) {
    const fallbackNotice = 'Supabase connection is missing. Add your keys to script.js.';
    if (authStatus) authStatus.textContent = fallbackNotice;
    if (messageStatus) messageStatus.textContent = fallbackNotice;
    if (commentStatus) commentStatus.textContent = fallbackNotice;
    return;
  }

  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  let currentUser = null;

  const setAuthMessage = (msg, isError = false) => {
    if (!authStatus) return;
    authStatus.textContent = msg;
    authStatus.classList.toggle('error', isError);
  };

  const updateAuthUI = (user) => {
    currentUser = user;
    if (signOutBtn) signOutBtn.classList.toggle('hidden', !user);
    if (authForm) {
      const email = document.getElementById('authEmail');
      const password = document.getElementById('authPassword');
      if (email && password) {
        email.disabled = !!user;
        password.disabled = !!user;
      }
    }
    if (user) {
      setAuthMessage(`Signed in as ${user.email}`);
    } else {
      setAuthMessage('Not signed in yet.');
    }
  };

  async function loadComments() {
    if (!commentsList || !supabase) return;
    const { data, error } = await supabase.from('comments').select('*').order('created_at', { ascending: false }).limit(20);
    if (error) {
      commentsList.innerHTML = '<li class="empty">Comments unavailable. Add the Supabase tables first.</li>';
      return;
    }

    commentsList.innerHTML = '';
    if (!data || data.length === 0) {
      commentsList.innerHTML = '<li class="empty">No comments yet. Be the first.</li>';
      return;
    }

    data.forEach(item => {
      const li = document.createElement('li');
      const author = item.user_name || 'Guest';
      li.innerHTML = `<b>${author}</b><span>${new Date(item.created_at).toLocaleString()}</span><p>${(item.message || '').replace(/</g, '&lt;')}</p>`;
      commentsList.appendChild(li);
    });
  }

  async function loadChatMessages() {
    if (!chatMessages || !supabase) return;
    const { data, error } = await supabase.from('chat_messages').select('*').order('created_at', { ascending: true }).limit(30);
    if (error) {
      chatMessages.innerHTML = '<p class="empty">Chat unavailable. Add the Supabase tables first.</p>';
      return;
    }

    chatMessages.innerHTML = '';
    if (!data || data.length === 0) {
      chatMessages.innerHTML = '<p class="empty">No chat messages yet.</p>';
      return;
    }

    data.forEach(item => {
      const row = document.createElement('div');
      row.className = 'chat-item';
      row.innerHTML = `<strong>${item.user_name || 'Guest'}:</strong> <span>${(item.message || '').replace(/</g, '&lt;')}</span>`;
      chatMessages.appendChild(row);
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  async function signInWithEmail(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error && error.message && error.message.toLowerCase().includes('already registered')) {
      const loginResult = await supabase.auth.signInWithPassword({ email, password });
      if (loginResult.error) throw loginResult.error;
      return loginResult.data;
    }

    if (error) throw error;
    return data;
  }

  if (authForm) {
    authForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const emailInput = document.getElementById('authEmail');
      const passwordInput = document.getElementById('authPassword');

      if (!emailInput || !passwordInput) return;

      try {
        const { user } = await signInWithEmail(emailInput.value.trim(), passwordInput.value);
        updateAuthUI(user);
        authForm.reset();
      } catch (error) {
        setAuthMessage(error.message || 'Login failed.', true);
      }
    });
  }

  if (signOutBtn) {
    signOutBtn.addEventListener('click', async () => {
      await supabase.auth.signOut();
      updateAuthUI(null);
    });
  }

  if (messageForm) {
    messageForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const name = document.getElementById('messageName')?.value.trim();
      const text = document.getElementById('messageText')?.value.trim();
      if (!name || !text) return;

      const { error } = await supabase.from('contact_messages').insert({
        user_name: name,
        message: text
      });

      if (error) {
        messageStatus.textContent = error.message || 'Message failed to send.';
        messageStatus.classList.add('error');
      } else {
        messageStatus.textContent = 'Your message was sent.';
        messageStatus.classList.remove('error');
        messageForm.reset();
      }
    });
  }

  if (commentForm) {
    commentForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const text = document.getElementById('commentText')?.value.trim();
      if (!text) return;

      const { error } = await supabase.from('comments').insert({
        user_name: currentUser ? currentUser.email : 'Guest',
        message: text
      });

      if (error) {
        commentStatus.textContent = error.message || 'Comment failed.';
        commentStatus.classList.add('error');
      } else {
        commentStatus.textContent = 'Comment posted.';
        commentStatus.classList.remove('error');
        commentForm.reset();
        loadComments();
      }
    });
  }

  if (chatForm) {
    chatForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const value = chatInput.value.trim();
      if (!value) return;

      const { error } = await supabase.from('chat_messages').insert({
        user_name: currentUser ? currentUser.email : 'Guest',
        message: value
      });

      if (error) {
        chatMessages.innerHTML = `<p class="empty error">${error.message}</p>`;
      } else {
        chatInput.value = '';
        loadChatMessages();
      }
    });
  }

  async function initializeCommunity() {
    const { data: { user } } = await supabase.auth.getUser();
    updateAuthUI(user);
    loadComments();
    loadChatMessages();
  }

  initializeCommunity();
})();
