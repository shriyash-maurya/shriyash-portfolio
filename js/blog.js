/* ============================================
   BLOG.JS — Search, filter & paginate blog posts
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
  loadPosts();
});

async function loadPosts() {
  const container = document.getElementById('blogList');
  const pagination = document.getElementById('blogPagination');
  const searchInput = document.getElementById('blogSearch');
  const categorySelect = document.getElementById('blogFilter');
  if (!container) return;

  try {
    const response = await fetch('../backend/blogs.php', { credentials: 'same-origin' });
    const data = await response.json();

    if (data.status !== 'success' || !Array.isArray(data.posts)) {
      container.innerHTML = '<p class="admin-message">Unable to load posts right now.</p>';
      return;
    }

    if (!data.posts.length) {
      container.innerHTML = '<p class="admin-message">No blog posts yet.</p>';
      return;
    }

    const posts = data.posts;
    const pageSize = 9;
    let currentPage = 1;

    function setupPagination(items) {
      if (!pagination) return;
      const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
      currentPage = Math.min(currentPage, totalPages);
      pagination.innerHTML = '';

      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `page-btn${currentPage === i ? ' active' : ''}`;
        btn.textContent = String(i);
        btn.addEventListener('click', () => {
          currentPage = i;
          renderPage(items);
        });
        pagination.appendChild(btn);
      }
    }

    function renderPage(items) {
      const start = (currentPage - 1) * pageSize;
      const visibleItems = items.slice(start, start + pageSize);
      container.innerHTML = '';

      if (!visibleItems.length) {
        container.innerHTML = '<p class="admin-message">No posts found.</p>';
        return;
      }

      container.innerHTML = visibleItems.map(post => {
        const date = new Date(post.created_at).toLocaleDateString('en-IN', {
          year: 'numeric', month: 'short', day: 'numeric'
        });
        const content = post.content ? `<p class="blog-excerpt">${escHtml(post.content)}</p>` : '';
        return `
          <article class="blog-card reveal visible">
            <div class="blog-meta">
              <span class="blog-cat ${escAttr(post.category)}">${cap(post.category)}</span>
              <span class="blog-date">${escHtml(date)}</span>
            </div>
            <h3 class="blog-title">${escHtml(post.title)}</h3>
            <p class="blog-excerpt">${escHtml(post.excerpt)}</p>
            ${content}
            <span class="read-link">Read More →</span>
          </article>
        `;
      }).join('');

      setupPagination(items);
    }

    function applyFilters() {
      const search = (searchInput?.value || '').trim().toLowerCase();
      const selectedCategory = categorySelect?.value || 'all';
      const filtered = posts.filter(post => {
        const text = [post.title, post.excerpt, post.content, post.category].join(' ').toLowerCase();
        const matchesSearch = !search || text.includes(search);
        const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
        return matchesSearch && matchesCategory;
      });

      currentPage = 1;
      renderPage(filtered);
    }

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (categorySelect) categorySelect.addEventListener('change', applyFilters);

    applyFilters();
  } catch (error) {
    container.innerHTML = '<p class="admin-message">Unable to load posts right now.</p>';
  }
}

function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
function escHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
function escAttr(value) {
  return escHtml(value).replaceAll(' ', '-');
}
