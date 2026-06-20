const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');
const logoutBtn = document.getElementById('logoutBtn');

const projectForm = document.getElementById('projectForm');
const projectList = document.getElementById('projectList');
const projectMessage = document.getElementById('projectMessage');
const formTitle = document.getElementById('formTitle');
const projectSearch = document.getElementById('projectSearch');
const projectFilter = document.getElementById('projectFilter');
const projectPagination = document.getElementById('projectPagination');

const blogForm = document.getElementById('blogForm');
const blogList = document.getElementById('blogList');
const blogMessage = document.getElementById('blogMessage');
const blogFormTitle = document.getElementById('blogFormTitle');
const blogSearch = document.getElementById('blogSearch');
const blogFilter = document.getElementById('blogFilter');
const blogPagination = document.getElementById('blogPagination');

const certificateForm = document.getElementById('certificateForm');
const certificateList = document.getElementById('certificateList');
const certificateMessage = document.getElementById('certificateMessage');
const certificateFormTitle = document.getElementById('certificateFormTitle');
const certificatePagination = document.getElementById('certificatePagination');

function showMessage(el, text, isError = false) {
  if (!el) return;
  el.textContent = text;
  el.style.color = isError ? '#ff6b6b' : '#8effc1';
}

function setupPagination(container, pageSize, items, renderFn) {
  if (!container) return;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  let currentPage = 1;

  function update() {
    const start = (currentPage - 1) * pageSize;
    const pagedItems = items.slice(start, start + pageSize);
    renderFn(pagedItems);

    container.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = String(i);
      btn.className = currentPage === i ? 'page-btn active' : 'page-btn';
      btn.addEventListener('click', () => {
        currentPage = i;
        update();
      });
      container.appendChild(btn);
    }
  }

  update();
}

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      username: document.querySelector('[name="username"]').value.trim(),
      password: document.querySelector('[name="password"]').value.trim()
    };

    const response = await fetch('../backend/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (data.status === 'success') {
      window.location.href = 'admin-dashboard.html';
    } else {
      showMessage(loginMessage, data.message || 'Login failed', true);
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await fetch('../backend/logout.php', { credentials: 'same-origin' });
    window.location.href = 'admin-login.html';
  });
}

async function loadProjects() {
  if (!projectList) return;
  projectList.innerHTML = '<p class="admin-message">Loading projects...</p>';

  try {
    const response = await fetch('../backend/admin_projects.php', { credentials: 'same-origin' });
    if (response.status === 401) {
      window.location.href = 'admin-login.html';
      return;
    }

    const data = await response.json();
    if (data.status !== 'success') {
      showMessage(projectMessage, data.message || 'Unable to load projects', true);
      return;
    }

    let allProjects = data.projects || [];

    function renderProjects(items) {
      projectList.innerHTML = '';
      if (!items.length) {
        projectList.innerHTML = '<p class="admin-message">No projects found.</p>';
        return;
      }

      items.forEach((project) => {
        const item = document.createElement('div');
        item.className = 'admin-list-item';
        item.innerHTML = `
          <div>
            <strong>${project.title}</strong>
            <p>${project.description}</p>
          </div>
          <div class="admin-list-actions">
            <button type="button" data-project-edit="${project.id}">Edit</button>
            <button type="button" data-project-delete="${project.id}" class="btn-delete">Delete</button>
          </div>
        `;
        projectList.appendChild(item);
      });
    }

    function applyProjectFilters() {
      const search = (projectSearch?.value || '').toLowerCase();
      const filter = projectFilter?.value || 'all';
      const filtered = allProjects.filter(project => {
        const matchesSearch = !search || [project.title, project.description, project.category, project.stack].join(' ').toLowerCase().includes(search);
        const matchesFilter = filter === 'all' || project.category === filter;
        return matchesSearch && matchesFilter;
      });
      setupPagination(projectPagination, 9, filtered, renderProjects);
    }

    if (projectSearch) projectSearch.addEventListener('input', applyProjectFilters);
    if (projectFilter) projectFilter.addEventListener('change', applyProjectFilters);

    applyProjectFilters();
  } catch (err) {
    showMessage(projectMessage, 'Error loading projects', true);
  }
}

async function loadBlogs() {
  if (!blogList) return;
  blogList.innerHTML = '<p class="admin-message">Loading blog posts...</p>';

  try {
    const response = await fetch('../backend/blogs.php', { credentials: 'same-origin' });
    if (response.status === 401) {
      window.location.href = 'admin-login.html';
      return;
    }

    const data = await response.json();
    if (data.status !== 'success') {
      showMessage(blogMessage, data.message || 'Unable to load blog posts', true);
      return;
    }

    let allPosts = data.posts || [];

    function renderPosts(items) {
      blogList.innerHTML = '';
      if (!items.length) {
        blogList.innerHTML = '<p class="admin-message">No blog posts found.</p>';
        return;
      }

      items.forEach((post) => {
        const item = document.createElement('div');
        item.className = 'admin-list-item';
        item.innerHTML = `
          <div>
            <strong>${post.title}</strong>
            <p>${post.excerpt}</p>
          </div>
          <div class="admin-list-actions">
            <button type="button" data-blog-edit="${post.id}">Edit</button>
            <button type="button" data-blog-delete="${post.id}" class="btn-delete">Delete</button>
          </div>
        `;
        blogList.appendChild(item);
      });
    }

    function applyBlogFilters() {
      const search = (blogSearch?.value || '').toLowerCase();
      const filter = blogFilter?.value || 'all';
      const filtered = allPosts.filter(post => {
        const matchesSearch = !search || [post.title, post.excerpt, post.category, post.content].join(' ').toLowerCase().includes(search);
        const matchesFilter = filter === 'all' || post.category === filter;
        return matchesSearch && matchesFilter;
      });
      setupPagination(blogPagination, 9, filtered, renderPosts);
    }

    if (blogSearch) blogSearch.addEventListener('input', applyBlogFilters);
    if (blogFilter) blogFilter.addEventListener('change', applyBlogFilters);

    applyBlogFilters();
  } catch (err) {
    showMessage(blogMessage, 'Error loading blog posts', true);
  }
}

async function loadCertificates() {
  if (!certificateList) return;
  certificateList.innerHTML = '<p class="admin-message">Loading certificates...</p>';

  try {
    const response = await fetch('../backend/certificates.php', { credentials: 'same-origin' });
    if (response.status === 401) {
      window.location.href = 'admin-login.html';
      return;
    }

    const data = await response.json();
    if (data.status !== 'success') {
      showMessage(certificateMessage, data.message || 'Unable to load certificates', true);
      return;
    }

    const allCertificates = data.certificates || [];

    function renderCertificates(items) {
      certificateList.innerHTML = '';
      if (!items.length) {
        certificateList.innerHTML = '<p class="admin-message">No certificates found.</p>';
        return;
      }

      items.forEach((certificate) => {
        const item = document.createElement('div');
        item.className = 'admin-list-item';
        item.innerHTML = `
          <div>
            <strong>${certificate.title}</strong>
            <p>${certificate.issuer}${certificate.issue_date ? ' • ' + certificate.issue_date : ''}</p>
          </div>
          <div class="admin-list-actions">
            <button type="button" data-certificate-edit="${certificate.id}">Edit</button>
            <button type="button" data-certificate-delete="${certificate.id}" class="btn-delete">Delete</button>
          </div>
        `;
        certificateList.appendChild(item);
      });
    }

    setupPagination(certificatePagination, 8, allCertificates, renderCertificates);
  } catch (err) {
    showMessage(certificateMessage, 'Error loading certificates', true);
  }
}

if (projectForm) {
  projectForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      id: document.getElementById('projectId').value || null,
      title: document.getElementById('title').value.trim(),
      description: document.getElementById('description').value.trim(),
      category: document.getElementById('category').value,
      period: document.getElementById('period').value.trim(),
      icon: document.getElementById('icon').value.trim(),
      github_url: document.getElementById('githubUrl').value.trim(),
      live_url: document.getElementById('liveUrl').value.trim(),
      stack: document.getElementById('stack').value.trim(),
      featured: document.getElementById('featured').checked
    };

    const method = payload.id ? 'PUT' : 'POST';
    const response = await fetch('../backend/admin_projects.php', {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    showMessage(projectMessage, data.message || 'Saved', data.status !== 'success');
    if (data.status === 'success') {
      projectForm.reset();
      document.getElementById('projectId').value = '';
      if (formTitle) formTitle.textContent = 'Add New Project';
      loadProjects();
    }
  });

  projectList.addEventListener('click', async (e) => {
    const editBtn = e.target.closest('[data-project-edit]');
    const deleteBtn = e.target.closest('[data-project-delete]');

    if (editBtn) {
      const id = editBtn.dataset.projectEdit;
      const response = await fetch('../backend/admin_projects.php', { credentials: 'same-origin' });
      const data = await response.json();
      const project = data.projects.find(item => String(item.id) === id);
      if (project) {
        document.getElementById('projectId').value = project.id;
        document.getElementById('title').value = project.title;
        document.getElementById('description').value = project.description;
        document.getElementById('category').value = project.category;
        document.getElementById('period').value = project.period || '';
        document.getElementById('icon').value = project.icon || '';
        document.getElementById('githubUrl').value = project.github_url || '';
        document.getElementById('liveUrl').value = project.live_url || '';
        document.getElementById('stack').value = project.stack || '';
        document.getElementById('featured').checked = !!project.featured;
        if (formTitle) formTitle.textContent = 'Edit Project';
      }
    }

    if (deleteBtn) {
      const id = deleteBtn.dataset.projectDelete;
      const response = await fetch('../backend/admin_projects.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ id })
      });
      const data = await response.json();
      showMessage(projectMessage, data.message || 'Deleted', data.status !== 'success');
      if (data.status === 'success') loadProjects();
    }
  });

  loadProjects();
}

if (blogForm) {
  blogForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      id: document.getElementById('blogId').value || null,
      title: document.getElementById('blogTitle').value.trim(),
      category: document.getElementById('blogCategory').value,
      excerpt: document.getElementById('blogExcerpt').value.trim(),
      content: document.getElementById('blogContent').value.trim()
    };

    const method = payload.id ? 'PUT' : 'POST';
    const response = await fetch('../backend/blogs.php', {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    showMessage(blogMessage, data.message || 'Saved', data.status !== 'success');
    if (data.status === 'success') {
      blogForm.reset();
      document.getElementById('blogId').value = '';
      if (blogFormTitle) blogFormTitle.textContent = 'Add New Blog Post';
      loadBlogs();
    }
  });

  blogList.addEventListener('click', async (e) => {
    const editBtn = e.target.closest('[data-blog-edit]');
    const deleteBtn = e.target.closest('[data-blog-delete]');

    if (editBtn) {
      const id = editBtn.dataset.blogEdit;
      const response = await fetch('../backend/blogs.php', { credentials: 'same-origin' });
      const data = await response.json();
      const post = data.posts.find(item => String(item.id) === id);
      if (post) {
        document.getElementById('blogId').value = post.id;
        document.getElementById('blogTitle').value = post.title;
        document.getElementById('blogCategory').value = post.category;
        document.getElementById('blogExcerpt').value = post.excerpt;
        document.getElementById('blogContent').value = post.content || '';
        if (blogFormTitle) blogFormTitle.textContent = 'Edit Blog Post';
      }
    }

    if (deleteBtn) {
      const id = deleteBtn.dataset.blogDelete;
      const response = await fetch('../backend/blogs.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ id })
      });
      const data = await response.json();
      showMessage(blogMessage, data.message || 'Deleted', data.status !== 'success');
      if (data.status === 'success') loadBlogs();
    }
  });

  loadBlogs();
}

if (certificateForm) {
  certificateForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(certificateForm);
    const id = document.getElementById('certificateId').value;
    if (id) {
      formData.set('certificateId', id);
    }

    const response = await fetch('../backend/certificates.php', {
      method: 'POST',
      credentials: 'same-origin',
      body: formData
    });
    const data = await response.json();

    showMessage(certificateMessage, data.message || 'Saved', data.status !== 'success');
    if (data.status === 'success') {
      certificateForm.reset();
      document.getElementById('certificateId').value = '';
      if (certificateFormTitle) certificateFormTitle.textContent = 'Add New Certificate';
      loadCertificates();
    }
  });

  certificateList.addEventListener('click', async (e) => {
    const editBtn = e.target.closest('[data-certificate-edit]');
    const deleteBtn = e.target.closest('[data-certificate-delete]');

    if (editBtn) {
      const id = editBtn.dataset.certificateEdit;
      const response = await fetch('../backend/certificates.php', { credentials: 'same-origin' });
      const data = await response.json();
      const certificate = data.certificates.find(item => String(item.id) === id);
      if (certificate) {
        document.getElementById('certificateId').value = certificate.id;
        document.getElementById('certificateTitle').value = certificate.title || '';
        document.getElementById('certificateIssuer').value = certificate.issuer || '';
        document.getElementById('certificateDate').value = certificate.issue_date || '';
        document.getElementById('certificateIcon').value = certificate.icon || '';
        document.getElementById('certificateExternalUrl').value = certificate.external_url || '';
        if (certificateFormTitle) certificateFormTitle.textContent = 'Edit Certificate';
      }
    }

    if (deleteBtn) {
      const id = deleteBtn.dataset.certificateDelete;
      const response = await fetch('../backend/certificates.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ id })
      });
      const data = await response.json();
      showMessage(certificateMessage, data.message || 'Deleted', data.status !== 'success');
      if (data.status === 'success') loadCertificates();
    }
  });

  loadCertificates();
}
