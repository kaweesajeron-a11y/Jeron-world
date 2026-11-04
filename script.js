(() => {
  const SUPABASE_URL = 'https://oezmhonqmlificwoxjch.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_-SigzrDFHYfdsAV7G7KJjA_2TWAnyJg';
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
  const protectedPage = document.body.dataset.authRequired === 'true';
  const params = new URLSearchParams(location.search);
  const nextPage = params.get('next');
  const safeNext = nextPage && /^[a-z0-9-]+\.html$/i.test(nextPage) && nextPage !== 'community.html' ? nextPage : 'index.html';

  if (!window.supabase || !SUPABASE_URL.includes('supabase.co') || !SUPABASE_ANON_KEY) {
    if (authStatus) authStatus.textContent = 'The sign-in service could not load. Refresh the page or try again shortly.';
    if (protectedPage) location.replace('community.html?next=' + encodeURIComponent(location.pathname.split('/').pop() || 'index.html'));
    return;
  }

  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  let currentUser = null;
  const setStatus = (message, error = false) => {
    if (!authStatus) return;
    authStatus.textContent = message;
    authStatus.classList.toggle('error', error);
  };
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  function addMemberControls(user) {
    document.querySelectorAll('.member-controls').forEach(node => node.remove());
    if (!user) return;
    const nav = document.querySelector('.main-nav');
    if (!nav) return;
    const wrap = document.createElement('div');
    wrap.className = 'member-controls';
    wrap.innerHTML = '<span class="member-email"></span><button type="button" class="member-logout">Sign out</button>';
    wrap.querySelector('.member-email').textContent = user.email || 'Member';
    wrap.querySelector('.member-logout').addEventListener('click', async () => {
      await supabase.auth.signOut();
      location.replace('community.html');
    });
    nav.appendChild(wrap);
  }

  function applyUser(user) {
    currentUser = user || null;
    addMemberControls(currentUser);
    if (signOutBtn) signOutBtn.classList.toggle('hidden', !currentUser);
    if (authForm) {
      const email = document.getElementById('authEmail');
      const password = document.getElementById('authPassword');
      if (email) email.disabled = !!currentUser;
      if (password) password.disabled = !!currentUser;
    }
    if (currentUser) {
      setStatus('You are signed in as ' + currentUser.email + '. Welcome to Jeron World.');
      if (protectedPage) document.body.removeAttribute('data-auth-required');
      if (location.pathname.endsWith('community.html') && nextPage) location.replace(safeNext);
    } else {
      if (protectedPage) {
        const requested = location.pathname.split('/').pop() || 'index.html';
        location.replace('community.html?next=' + encodeURIComponent(requested));
      }
      if (authStatus) setStatus('Sign in or create an account to enter.');
    }
  }

  async function loadComments() {
    if (!commentsList) return;
    const {data,error}=await supabase.from('comments').select('*').order('created_at',{ascending:false}).limit(30);
    if(error){commentsList.innerHTML='<li class="empty">Comments are temporarily unavailable.</li>';return;}
    commentsList.innerHTML='';
    if(!data?.length){commentsList.innerHTML='<li class="empty">No comments yet. Be the first.</li>';return;}
    data.forEach(item=>{
      const li=document.createElement('li');
      li.innerHTML='<b>'+escapeHTML(item.user_name||'Member')+'</b><span>'+new Date(item.created_at).toLocaleString()+'</span><p>'+escapeHTML(item.message)+'</p>';
      commentsList.appendChild(li);
    });
  }

  async function loadChatMessages() {
    if(!chatMessages)return;
    const {data,error}=await supabase.from('chat_messages').select('*').order('created_at',{ascending:true}).limit(40);
    if(error){chatMessages.innerHTML='<p class="empty">Chat is temporarily unavailable.</p>';return;}
    chatMessages.innerHTML='';
    if(!data?.length){chatMessages.innerHTML='<p class="empty">Start the conversation.</p>';return;}
    data.forEach(item=>{
      const row=document.createElement('div');row.className='chat-item';
      row.innerHTML='<strong>'+escapeHTML(item.user_name||'Member')+':</strong> <span>'+escapeHTML(item.message)+'</span>';
      chatMessages.appendChild(row);
    });
    chatMessages.scrollTop=chatMessages.scrollHeight;
  }

  if(authForm)authForm.addEventListener('submit',async event=>{
    event.preventDefault();
    const email=document.getElementById('authEmail')?.value.trim();
    const password=document.getElementById('authPassword')?.value;
    if(!email||!password)return;
    const submit=authForm.querySelector('[type="submit"]');
    if(submit){submit.disabled=true;submit.textContent='Please wait…';}
    try{
      let result=await supabase.auth.signInWithPassword({email,password});
      if(result.error && /invalid login credentials|user not found/i.test(result.error.message||'')){
        result=await supabase.auth.signUp({email,password});
      }
      if(result.error)throw result.error;
      if(result.data.session){
        applyUser(result.data.user);
        authForm.reset();
        if(nextPage)location.replace(safeNext);
        else setStatus('Welcome in. Your Jeron World account is ready.');
      }else{
        setStatus('Check your email for the confirmation link, then return here and sign in.');
      }
    }catch(error){setStatus(error.message||'Could not sign in. Please try again.',true);}
    finally{if(submit){submit.disabled=false;submit.textContent='Enter Jeron World ↗';}}
  });

  if(signOutBtn)signOutBtn.addEventListener('click',async()=>{
    const {error}=await supabase.auth.signOut();
    if(error)setStatus(error.message,true);else{applyUser(null);setStatus('You have signed out.');}
  });

  if(messageForm)messageForm.addEventListener('submit',async event=>{
    event.preventDefault();
    if(!currentUser){setStatus('Please sign in first.',true);return;}
    const name=document.getElementById('messageName')?.value.trim();
    const message=document.getElementById('messageText')?.value.trim();
    if(!name||!message)return;
    const {error}=await supabase.from('contact_messages').insert({user_name:name,message});
    if(error){messageStatus.textContent=error.message;messageStatus.classList.add('error');}
    else{messageStatus.textContent='Message sent. Thank you!';messageStatus.classList.remove('error');messageForm.reset();}
  });

  if(commentForm)commentForm.addEventListener('submit',async event=>{
    event.preventDefault();
    if(!currentUser){commentStatus.textContent='Sign in to post a comment.';return;}
    const message=document.getElementById('commentText')?.value.trim();
    if(!message)return;
    const {error}=await supabase.from('comments').insert({user_name:currentUser.email,message});
    if(error){commentStatus.textContent=error.message;commentStatus.classList.add('error');}
    else{commentStatus.textContent='Comment posted!';commentStatus.classList.remove('error');commentForm.reset();loadComments();}
  });

  if(chatForm)chatForm.addEventListener('submit',async event=>{
    event.preventDefault();
    if(!currentUser){chatMessages.textContent='Sign in to chat.';return;}
    const message=chatInput.value.trim();if(!message)return;
    const {error}=await supabase.from('chat_messages').insert({user_name:currentUser.email,message});
    if(error){chatMessages.textContent=error.message;}else{chatInput.value='';loadChatMessages();}
  });

  supabase.auth.getSession().then(({data,error})=>{
    if(error){if(protectedPage)location.replace('community.html');return;}
    applyUser(data.session?.user||null);
    if(data.session){loadComments();loadChatMessages();}
  });
  supabase.auth.onAuthStateChange((_event,session)=>applyUser(session?.user||null));

  // Movie discovery: filter the local catalogue and launch searches on major movie databases.
  const movieSearch=document.getElementById('movieSearch');
  const movieStatus=document.getElementById('movieStatus');
  const movieCards=[...document.querySelectorAll('.movie-card')];
  const filterButtons=[...document.querySelectorAll('.filter-chip')];
  const providers=document.querySelectorAll('[data-movie-provider]');
  let activeFilter='all';
  const providerURLs={
    google:q=>'https://www.google.com/search?q='+encodeURIComponent(q+' movie'),
    imdb:q=>'https://www.imdb.com/find/?q='+encodeURIComponent(q),
    tmdb:q=>'https://www.themoviedb.org/search?query='+encodeURIComponent(q),
    justwatch:q=>'https://www.justwatch.com/ug/search?q='+encodeURIComponent(q)
  };
  function searchMovies(){
    const q=(movieSearch?.value||'').trim().toLowerCase();let count=0;
    movieCards.forEach(card=>{
      const categories=(card.dataset.category||'').split(/\s+/);
      const haystack=((card.dataset.title||'')+' '+card.textContent).toLowerCase();
      const show=(activeFilter==='all'||categories.includes(activeFilter))&&(!q||haystack.includes(q));
      card.hidden=!show;if(show)count++;
    });
    if(movieStatus)movieStatus.textContent=q?count+' catalogue result'+(count===1?'':'s')+' for “'+q+'”. Use the source buttons for wider searches.':'Showing '+count+' curated movie picks.';
    providers.forEach(link=>{
      const key=link.dataset.movieProvider;
      link.href=providerURLs[key]((movieSearch?.value||'').trim()||'popular movies');
    });
  }
  filterButtons.forEach(button=>button.addEventListener('click',()=>{
    activeFilter=button.dataset.filter||'all';
    filterButtons.forEach(item=>item.classList.toggle('active',item===button));
    searchMovies();
  }));
  movieSearch?.addEventListener('input',searchMovies);
  searchMovies();
})();