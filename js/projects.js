/* ============================================
   PROJECTS.JS — Filter, search & paginate projects
   ============================================ */

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

document.addEventListener('DOMContentLoaded', function () {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const grid = document.getElementById('projectsGrid');
  const searchInput = document.getElementById('projectSearch');
  const categorySelect = document.getElementById('projectCategory');
  const pagination = document.getElementById('projectPagination');
  const pageSize = 9;

  let allProjects = [];
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
        renderProjects(items);
      });
      pagination.appendChild(btn);
    }
  }

  function renderProjects(items) {
    if (!grid) return;

    const start = (currentPage - 1) * pageSize;
    const visibleItems = items.slice(start, start + pageSize);

    grid.innerHTML = '';
    if (!visibleItems.length) {
      grid.innerHTML = '<p class="admin-message">No projects available yet.</p>';
      return;
    }

    grid.innerHTML = visibleItems.map((project) => {
      const tags = (project.stack || []).map(tag => `<span class="chip">${escapeHtml(tag)}</span>`).join('');
      const featured = project.featured ? '<span class="featured-label">Featured</span>' : '';
      const icon = project.icon || '📁';
      const github = project.github_url ? `<a class="proj-link" href="${escapeHtml(project.github_url)}" target="_blank" rel="noreferrer" title="GitHub">⌥</a>` : '';
      const live = project.live_url ? `<a class="proj-link" href="${escapeHtml(project.live_url)}" target="_blank" rel="noreferrer" title="Live Demo">↗</a>` : '';

      return `
        <div class="project-card reveal" data-cat="${escapeHtml(project.category)}" style="transition:all 0.3s">
          ${featured}
          <div class="project-card-top">
            <div class="project-icon" style="background:rgba(0,212,255,0.10)">${escapeHtml(icon)}</div>
            <div class="project-links">${github}${live}</div>
          </div>
          <div class="project-card-body">
            <h3 class="project-title">${escapeHtml(project.title)}</h3>
            <p class="project-desc">${escapeHtml(project.description)}</p>
            ${project.period ? `<div class="project-meta" style="font-size:0.78rem;color:var(--muted);margin-bottom:0.5rem;">${escapeHtml(project.period)}</div>` : ''}
            <div class="project-stack">${tags}</div>
          </div>
        </div>
      `;
    }).join('');

    setupPagination(items);
  }

  function applyFilters() {
    const search = (searchInput?.value || '').trim().toLowerCase();
    const category = categorySelect?.value || 'all';
    const filtered = allProjects.filter((project) => {
      const text = [project.title, project.description, project.category, project.stack].join(' ').toLowerCase();
      const matchesSearch = !search || text.includes(search);
      const matchesCategory = category === 'all' || project.category === category;
      return matchesSearch && matchesCategory;
    });

    currentPage = 1;
    renderProjects(filtered);
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      if (categorySelect) {
        categorySelect.value = this.dataset.filter;
      }
      applyFilters();
    });
  });

  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (categorySelect) categorySelect.addEventListener('change', () => {
    filterBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.filter === categorySelect.value));
    applyFilters();
  });

  if (grid) {
    fetch('../backend/get_projects.php', { credentials: 'same-origin' })
      .then(res => res.json())
      .then(data => {
        allProjects = data.projects || [];
        applyFilters();
      })
      .catch(() => {
        allProjects = [];
        renderProjects([]);
      });
  }
});
