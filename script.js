(() => {
  // ===== Constants & Data (edit product images / data here) =====
   const PRODUCTS =[
  {id:1,name:"Headphones",price:1299,img:'https://shopatsc.com/cdn/shop/files/1_b36ac316-5085-4893-b60d-80b719789ca1.jpg?v=1727158985'},
  {id:2,name:"Smart Watch",price:2299,img:"https://cosmosjoy.in/cdn/shop/files/apple-watch-ultra-2-gps-cellular-49mm-titanium-case-with-orange-ocean-band-digital-o494226901-p60456.webp?v=1737714172"},
  {id:3,name:"Bluetooth Speaker",price:999,img:"https://www.boat-lifestyle.com/cdn/shop/files/Stone_SpinXPro_1_b3503890-50f6-4cd1-9138-0bd90874391e_1300x.png?v=1709717442"},
  {id:4,name:"Gaming Mouse",price:799,img:"https://arcticfox.com/cdn/shop/files/1_f87f08be-bf1b-4065-ae81-21d7c1ad0f69.jpg?v=1699270558"},
  {id:5,name:"Keyboard",price:1199,img:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1uyUCe9zwxnMkHJxwTvgDipWXlH1ySrlY5Q&s"},
  {id:6,name:"LED Monitor",price:6999,img:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEiUL2zhR3m_yCMrZJadS75w9m1nwHhm5nSg&s"},
  {id:7,name:"Power Bank",price:699,img:"https://5.imimg.com/data5/SELLER/Default/2021/12/VV/FR/CR/16347024/t-810-40000mah-power-bank.jpg"},
  {id:8,name:"USB Drive",price:399,img:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6yv2TpQwx9et3Px7HlD8mXb48R7qy6kVm2A&s"}
];

  const LS_USERS = 'sa_users';
  const LS_SESSION = 'sa_session';
  const LS_WISHLIST = 'sa_wishlist';
  const LS_ORDERS = 'sa_orders';
  const LS_REVIEWS = 'sa_reviews';


  const $ = id => document.getElementById(id);
  const q = sel => document.querySelector(sel);
  const qa = sel => Array.from(document.querySelectorAll(sel));
  const safeParse = v => (typeof v === 'string' && v.trim() !== '') ? JSON.parse(v) : v;

  function toId(x) {
    // normalize numbers and numeric strings to Number
    if (typeof x === 'number') return x;
    if (!x) return x;
    const n = Number(x);
    return Number.isNaN(n) ? x : n;
  }

  
  function toast(msg, opts = {}) {
    const t = document.createElement('div');
    t.className = 'sa-toast';
    t.textContent = msg;
    Object.assign(t.style, {
      position: 'fixed',
      right: '20px',
      bottom: '20px',
      padding: '10px 14px',
      borderRadius: '10px',
      background: opts.success ? 'linear-gradient(90deg,#7B5CFF,#5FE0C9)' : 'rgba(0,0,0,0.7)',
      color: opts.success ? '#07101a' : '#fff',
      zIndex: 9999,
      boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
      transition: 'transform .3s, opacity .3s',
    });
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(24px)'; }, 1500);
    setTimeout(() => t.remove(), 2000);
  }


  function getLS(key, fallback = []) {
    try {
      return safeParse(localStorage.getItem(key)) || fallback;
    } catch (e) {
      return fallback;
    }
  }
  function setLS(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (e) { console.error('localStorage error', e); }
  }


  function renderProducts(list = PRODUCTS) {
    const grid = $('productGrid') || $('productList');
    if (!grid) return;
    grid.innerHTML = '';
    list.forEach(p => {
      const article = document.createElement('article');
      article.className = 'product-card card glass';
      article.dataset.id = p.id;
      article.innerHTML = `
        <div class="product-media">
          <img src="${p.img}" alt="${escapeHtml(p.name)}" loading="lazy" onerror="this.onerror=null;this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=300 height=180><rect width=100% height=100% fill=%23ececec/><text x=50% y=50% dominant-baseline=middle text-anchor=middle fill=%23999 font-size=16>No+Image</text></svg>'" />
        </div>
        <div class="product-title">${escapeHtml(p.name)}</div>
        <div class="product-desc">${escapeHtml(p.desc || '')}</div>
        <div class="price-row">
          <div class="price">₹ ${p.price}</div>
          <div class="card-actions">
            <button class="btn btn-ghost btn-wish" data-id="${p.id}">♡ Wishlist</button>
            <button class="btn btn-primary btn-buy" data-id="${p.id}">Buy</button>
          </div>
        </div>
      `;
      grid.appendChild(article);
    });
  }

  function renderWishlist() {
    const target = $('wishlistList');
    if (!target) return;
    const w = getLS(LS_WISHLIST, []);
    if (!w.length) {
      target.innerHTML = '<div class="muted small">No wishlist items yet.</div>';
      return;
    }
    target.innerHTML = '';
    w.forEach(id => {
      const pid = toId(id);
      const p = PRODUCTS.find(x => toId(x.id) === pid);
      if (!p) return;
      const row = document.createElement('div');
      row.className = 'list-row';
      row.innerHTML = `
        <div><strong>${escapeHtml(p.name)}</strong><div class="muted small">₹ ${p.price}</div></div>
        <div class="row gap">
          <button class="btn btn-ghost" data-buy="${p.id}">Buy</button>
          <button class="btn btn-ghost" data-remove="${p.id}">Remove</button>
        </div>
      `;
      target.appendChild(row);
      row.querySelector('[data-buy]')?.addEventListener('click', () => buyNow(p.id));
      row.querySelector('[data-remove]')?.addEventListener('click', () => removeFromWishlist(p.id));
    });
  }

  function renderOrders() {
    const el = $('ordersList');
    if (!el) return;
    const orders = getLS(LS_ORDERS, []);
    if (!orders.length) {
      el.innerHTML = '<div class="muted small">No orders yet.</div>';
      return;
    }
    el.innerHTML = '';
    orders.forEach(o => {
      const p = PRODUCTS.find(x => toId(x.id) === toId(o.productId)) || { name: 'Unknown' };
      const row = document.createElement('div');
      row.className = 'list-row';
      row.innerHTML = `
        <div><strong>${escapeHtml(p.name)}</strong><div class="muted small">Order ${o.id} • ${new Date(o.date).toLocaleString()}</div></div>
        <div class="row gap">
          <button class="btn btn-ghost" data-report="${o.id}">Report</button>
        </div>
      `;
      el.appendChild(row);
      row.querySelector('[data-report]')?.addEventListener('click', () => autoReport('Order', o.id));
    });
  }


  function addToWishlist(pid) {
    const id = toId(pid);
    const w = getLS(LS_WISHLIST, []);
    if (w.map(toId).includes(id)) {
      toast('Already in wishlist');
      return;
    }
    // ensure product exists
    const p = PRODUCTS.find(x => toId(x.id) === id);
    if (!p) { toast('Product not found'); return; }
    w.push(p.id);
    setLS(LS_WISHLIST, w);
    renderWishlist();
    toast('Added to wishlist', { success: true });
  }

  function removeFromWishlist(pid) {
    const id = toId(pid);
    let w = getLS(LS_WISHLIST, []);
    w = w.filter(x => toId(x) !== id);
    setLS(LS_WISHLIST, w);
    renderWishlist();
    toast('Removed from wishlist');
  }

  function buyNow(pid) {
    const id = toId(pid);
    const p = PRODUCTS.find(x => toId(x.id) === id);
    if (!p) { toast('Product not found'); return; }
    const orders = getLS(LS_ORDERS, []);
    const ord = { id: 'O' + Date.now(), productId: p.id, date: new Date().toISOString() };
    orders.unshift(ord);
    setLS(LS_ORDERS, orders);
    renderOrders();
    toast(`Order placed: ${ord.id}`, { success: true });
  }

  function postReview() {
    const sel = $('reviewProduct');
    const productId = sel ? toId(sel.value) : null;
    const text = $('reviewText')?.value?.trim() || '';
    const rating = Number($('rating')?.value || 5);
    if (!text) { toast('Please write a review'); return; }
    const reviews = getLS(LS_REVIEWS, []);
    reviews.unshift({ id: 'R' + Date.now(), productId, text, rating, date: new Date().toISOString() });
    setLS(LS_REVIEWS, reviews);
    $('reviewText').value = '';
    renderReviews();
    toast('Review posted', { success: true });
  }

  function renderReviews() {
    const list = getLS(LS_REVIEWS, []);
    const el = $('reviewsList');
    if (!el) return;
    if (!list.length) { el.innerHTML = '<div class="muted small">No reviews yet.</div>'; return; }
    el.innerHTML = '';
    list.forEach(r => {
      const p = PRODUCTS.find(x => toId(x.id) === toId(r.productId)) || { name: 'Unknown product' };
      const item = document.createElement('div');
      item.className = 'review-item';
      item.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div><strong>${escapeHtml(p.name)}</strong><div class="muted small">${new Date(r.date).toLocaleString()}</div></div>
          <div class="pill">${r.rating} ★</div>
        </div>
        <div style="margin-top:8px">${escapeHtml(r.text)}</div>
      `;
      el.appendChild(item);
    });
  }

  function sendSupport() {
    const name = $('supportName')?.value?.trim();
    const email = $('supportEmail')?.value?.trim();
    const msg = $('supportMsg')?.value?.trim();
    if (!name || !email || !msg) { $('supportResult').textContent = 'Please fill all fields.'; return; }
    $('supportResult').textContent = `Message sent — we will contact ${email} soon.`;
    $('supportName').value = ''; $('supportEmail').value = ''; $('supportMsg').value = '';
    toast('Support message sent', { success: true });
  }

  function sendReport() {
    const type = $('reportType')?.value || 'Other';
    const ref = $('reportRef')?.value.trim();
    const details = $('reportDetails')?.value.trim();
    if (!details) { $('reportResult').textContent = 'Please add details.'; return; }
    $('reportResult').textContent = `Report submitted: ${type}${ref ? (' • ref:' + ref) : ''}`;
    $('reportRef').value = ''; $('reportDetails').value = '';
    toast('Report submitted', { success: true });
  }

  function autoReport(type, ref) {
    if ($('reportType')) $('reportType').value = type;
    if ($('reportRef')) $('reportRef').value = ref;
    if ($('reportDetails')) $('reportDetails').value = `Reporting issue with ${type} ${ref}`;
    document.querySelector('#support')?.scrollIntoView({ behavior: 'smooth' });
    toast('Report initialized — edit & submit on Support panel');
  }

  function getUsers() { return getLS(LS_USERS, []); }
  function setUsers(a) { setLS(LS_USERS, a); }
  function getSession() { return getLS(LS_SESSION, null); }
  function setSession(s) { setLS(LS_SESSION, s); }

  function registerUser(e) {
    if (e) e.preventDefault();
    const name = $('regName')?.value?.trim();
    const email = ($('regEmail')?.value || '').trim().toLowerCase();
    const pw = $('regPassword')?.value || '';
    const pw2 = $('regPassword2')?.value || '';
    const err = $('regError');
    if (err) { err.classList.add('hidden'); err.textContent = ''; }
    if (!name || !email || !pw) { if (err) { err.textContent = 'Please fill required fields.'; err.classList.remove('hidden'); } return; }
    if (!validateEmail(email)) { if (err) { err.textContent = 'Invalid email.'; err.classList.remove('hidden'); } return; }
    if (pw.length < 6) { if (err) { err.textContent = 'Password must be min 6 chars'; err.classList.remove('hidden'); } return; }
    if (pw !== pw2) { if (err) { err.textContent = 'Passwords do not match'; err.classList.remove('hidden'); } return; }
    const users = getUsers();
    if (users.some(u => u.email === email)) { if (err) { err.textContent = 'Email already registered'; err.classList.remove('hidden'); } return; }
    users.push({ id: 'U' + Date.now(), name, email, password: pw });
    setUsers(users);
    toast('Registration successful — you may login now', { success: true });
    setTimeout(() => location.href = 'login.html', 900);
  }

  function loginUser(e) {
    if (e) e.preventDefault();
    const email = ($('loginEmail')?.value || '').trim().toLowerCase();
    const pw = $('loginPassword')?.value || '';
    const err = $('loginError');
    if (err) { err.classList.add('hidden'); err.textContent = ''; }
    if (!email || !pw) { if (err) { err.textContent = 'Enter credentials'; err.classList.remove('hidden'); } return; }
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === pw);
    if (!user) { if (err) { err.textContent = 'Invalid email or password'; err.classList.remove('hidden'); } return; }
    setSession({ id: user.id, name: user.name, email: user.email });
    toast(`Welcome, ${user.name}`, { success: true });
    setTimeout(() => location.href = 'index.html', 600);
  }


  function setupControls() {
    // product button delegation
    const grid = $('productGrid') || $('productList');
    if (grid) {
      grid.addEventListener('click', (ev) => {
        const buy = ev.target.closest('.btn-buy');
        const wish = ev.target.closest('.btn-wish');
        if (buy) {
          const id = buy.dataset.id;
          buyNow(toId(id));
        } else if (wish) {
          const id = wish.dataset.id;
          addToWishlist(toId(id));
        }
      });
    }

    // sort control
    $('sortSel')?.addEventListener('change', () => {
      const v = $('sortSel').value;
      let list = [...PRODUCTS];
      if (v === 'price-asc') list.sort((a, b) => a.price - b.price);
      if (v === 'price-desc') list.sort((a, b) => b.price - a.price);
      renderProducts(list);
    });

    // reviews controls
    $('rating')?.addEventListener('input', () => { if ($('ratingValue')) $('ratingValue').textContent = $('rating').value; });
    $('postReview')?.addEventListener('click', postReview);
    $('clearReviews')?.addEventListener('click', () => { setLS(LS_REVIEWS, []); renderReviews(); toast('Reviews cleared'); });

    // support controls
    $('sendSupport')?.addEventListener('click', sendSupport);
    $('sendReport')?.addEventListener('click', sendReport);

    // wishlist buttons inside wishlist area
    $('wishlistList')?.addEventListener('click', (ev) => {
      const buyBtn = ev.target.closest('[data-buy]');
      const remBtn = ev.target.closest('[data-remove]');
      if (buyBtn) buyNow(toId(buyBtn.dataset.buy));
      if (remBtn) removeFromWishlist(toId(remBtn.dataset.remove));
    });

    // orders area report
    $('ordersList')?.addEventListener('click', (ev) => {
      const rep = ev.target.closest('[data-report]');
      if (rep) autoReport('Order', rep.dataset.report);
    });

    // register / login handlers
    const regForm = $('registerForm');
    if (regForm) regForm.addEventListener('submit', registerUser);
    const loginForm = $('loginForm');
    if (loginForm) loginForm.addEventListener('submit', loginUser);

    // smooth scroll + nav active
    enableSmoothNav();
  }

  function enableSmoothNav() {
    // safe init (may be called multiple times)
    const navLinks = qa('.nav-link');
    navLinks.forEach(link => {
      if (link._sa_bound) return; // avoid double-binding
      link._sa_bound = true;
      link.addEventListener('click', function (e) {
        const href = this.getAttribute('href') || '';
        if (href.startsWith('#')) {
          e.preventDefault();
          const sec = document.querySelector(href);
          if (sec) sec.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // highlight on scroll
    const sections = qa('section[id]');
    window.addEventListener('scroll', () => {
      const fromTop = window.scrollY + 140;
      sections.forEach(sec => {
        if (sec.offsetTop <= fromTop && sec.offsetTop + sec.offsetHeight > fromTop) {
          qa('.nav-link').forEach(l => l.classList.remove('active'));
          const link = document.querySelector(`.nav-link[href="#${sec.id}"]`);
          if (link) link.classList.add('active');
        }
      });
    });
  }

  function loadState() {
    if (!localStorage.getItem(LS_REVIEWS)) setLS(LS_REVIEWS, []);
    if (!localStorage.getItem(LS_ORDERS)) setLS(LS_ORDERS, []);
    if (!localStorage.getItem(LS_WISHLIST)) setLS(LS_WISHLIST, []);
  }

  function populateReviewSelect() {
    const sel = $('reviewProduct');
    if (!sel) return;
    sel.innerHTML = PRODUCTS.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('');
  }


  function escapeHtml(s) {
    if (!s) return '';
    return String(s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
  }
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

 
  document.addEventListener('DOMContentLoaded', () => {
    try {
      // basic render & wiring
      if ($('year')) $('year').textContent = new Date().getFullYear();
      renderProducts(PRODUCTS);
      setupControls();
      loadState();
      renderWishlist();
      renderOrders();
      renderReviews();
      populateReviewSelect();
    } catch (err) {
      console.error('Init error:', err);
    }
  });

  window.renderProducts = renderProducts;
  window.renderWishlist = renderWishlist;
  window.renderOrders = renderOrders;
  window.renderReviews = renderReviews;
  window.addToWishlist = addToWishlist;
  window.removeFromWishlist = removeFromWishlist;
  window.buyNow = buyNow;
  window.autoReport = autoReport;
  window.registerUser = registerUser;
  window.loginUser = loginUser;

})(); // IIFE end
