/* ============================================
   CONTACT.JS — Contact form handler
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const name    = document.getElementById('c-name').value.trim();
    const email   = document.getElementById('c-email').value.trim();
    const subject = document.getElementById('c-subject').value.trim();
    const message = document.getElementById('c-msg').value.trim();

    if (!name || !email || !message) { toast('Please fill in all required fields.'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { toast('Please enter a valid email address.'); return; }

    DB.insertMessage(name, email, subject, message);
    form.reset();
    toast("Message sent! I'll get back to you soon.");

    // Show success state on button
    const btn = form.querySelector('.btn-send');
    const orig = btn.textContent;
    btn.textContent = '✓ Message Sent!';
    btn.style.background = 'var(--accent3)';
    setTimeout(() => { btn.textContent = orig; btn.style.background = ''; }, 3000);
  });
});
