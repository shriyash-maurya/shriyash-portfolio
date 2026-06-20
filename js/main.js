/* ============================================
   MAIN.JS — Cursor, Nav, Reveal, Toast, DB
   Shriyash Kumar Maurya Portfolio
   ============================================ */

/* ---- Custom Cursor ---- */
(function () {
  const dot  = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  const isAdminPage = document.body?.dataset?.page === 'admin-dashboard' || document.body?.dataset?.page === 'admin-login';

  if (isAdminPage) {
    document.body.style.cursor = 'auto';
    if (dot) dot.style.display = 'none';
    if (ring) ring.style.display = 'none';
    return;
  }

  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
  });

  (function animRing() {
    rx += (mx - rx) * 0.13;
    ry += (my - ry) * 0.13;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(animRing);
  })();

  document.querySelectorAll('a, button, .blog-card, .project-card, .cert-card, .t-card, .clink')
    .forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });
})();

/* ---- Active Nav Link ---- */
(function () {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const currentPage = currentPath.replace(/\.html$/, '');

  document.querySelectorAll('.nav-menu a').forEach(a => {
    const hrefPath = new URL(a.href, window.location.href).pathname.split('/').pop() || 'index.html';
    const hrefPage = hrefPath.replace(/\.html$/, '');

    if (hrefPage === currentPage || (currentPage === '' && hrefPage === 'index')) {
      a.classList.add('active');
    }
  });
})();

/* ---- Mobile Hamburger ---- */
(function () {
  const btn  = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => menu.classList.toggle('open'));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));
})();

/* ---- Scroll Reveal ---- */
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.08 });
  els.forEach(el => io.observe(el));
})();

/* ---- Skill Bar Animation ---- */
(function () {
  const bars = document.querySelectorAll('.sbar-fill');
  if (!bars.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const pct = e.target.dataset.pct;
        e.target.style.width = pct + '%';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  bars.forEach(b => io.observe(b));
})();

/* ---- Toast Notification ---- */
function toast(msg) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 3200);
}
window.toast = toast;

/* ---- Simple LocalStorage "DB" ---- */
const DB = {
  _get(k)    { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch { return []; } },
  _set(k, v) { localStorage.setItem(k, JSON.stringify(v)); },

  insertBlog(title, category, excerpt) {
    const rows = this._get('blog');
    const id   = Date.now();
    const date = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    rows.push({ id, title, category, excerpt, date });
    this._set('blog', rows);
    return id;
  },
  getBlogs() { return this._get('blog'); },

  insertTestimonial(name, role, message) {
    const rows = this._get('testimonials');
    const id   = Date.now();
    rows.push({ id, name, role, message });
    this._set('testimonials', rows);
    return id;
  },
  getTestimonials() { return this._get('testimonials'); },

  insertMessage(name, email, subject, message) {
    const rows = this._get('messages');
    rows.push({ id: Date.now(), name, email, subject, message });
    this._set('messages', rows);
  }
};
window.DB = DB;
