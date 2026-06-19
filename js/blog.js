/* ============================================
   BLOG.JS — Add and render blog posts
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
  renderPosts();

  const form = document.getElementById('blog-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const title   = document.getElementById('b-title').value.trim();
      const cat     = document.getElementById('b-cat').value;
      const excerpt = document.getElementById('b-excerpt').value.trim();
      if (!title || !excerpt) { toast('Please fill in all fields.'); return; }
      DB.insertBlog(title, cat, excerpt);
      form.reset();
      renderPosts();
      toast('Post published successfully!');
    });
  }
});

function renderPosts() {
  const container = document.getElementById('dynamic-posts');
  if (!container) return;
  const posts = DB.getBlogs();
  if (!posts.length) { container.innerHTML = ''; return; }

  container.innerHTML = posts.slice().reverse().map(p => `
    <article class="blog-card reveal visible">
      <div class="blog-meta">
        <span class="blog-cat ${p.category}">${cap(p.category)}</span>
        <span class="blog-date">${p.date}</span>
      </div>
      <h3 class="blog-title">${esc(p.title)}</h3>
      <p class="blog-excerpt">${esc(p.excerpt)}</p>
      <span class="read-link">Read More →</span>
    </article>
  `).join('');
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
