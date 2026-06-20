document.addEventListener('DOMContentLoaded', async function () {
  const grid = document.getElementById('officialCertificates');
  if (!grid) return;

  try {
    const response = await fetch('../backend/certificates.php', { credentials: 'same-origin' });
    const data = await response.json();
    const certificates = Array.isArray(data.certificates) ? data.certificates : [];

    if (!certificates.length) {
      grid.innerHTML = '<p class="admin-message">No certificates added yet.</p>';
      return;
    }

    grid.innerHTML = certificates.map((certificate) => {
      const title = escapeHtml(certificate.title || 'Certificate');
      const issuer = escapeHtml(certificate.issuer || '');
      const icon = escapeHtml(certificate.icon || '🎓');
      const date = certificate.issue_date
        ? `<div class="cert-date">📅 ${escapeHtml(certificate.issue_date)}</div>`
        : '<div class="cert-date">📅 Verified</div>';
      const link = certificate.external_url || certificate.certificate_url || '#';

      return `
        <a class="cert-card" href="${escapeHtml(link)}" target="_blank" rel="noreferrer" title="${title}">
          <div class="cert-logo">${icon}</div>
          <h3 class="cert-title">${title}</h3>
          <div class="cert-issuer">${issuer}</div>
          ${date}
        </a>
      `;
    }).join('');
  } catch (error) {
    grid.innerHTML = '<p class="admin-message">Unable to load certificates right now.</p>';
  }
});

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
