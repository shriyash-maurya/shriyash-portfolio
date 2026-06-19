
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('t-form');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', document.getElementById('t-name').value.trim());
        formData.append('role', document.getElementById('t-role').value.trim());
        formData.append('message', document.getElementById('t-msg').value.trim());

        try {
            const response = await fetch('../backend/add_testimonial.php', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.status === 'success') {
                alert('Thank you! Your testimonial has been submitted.');
                form.reset();
            } else {
                alert(data.message || 'Submission failed.');
            }
        } catch (err) {
            console.error(err);
            alert('Server connection failed.');
        }
    });
});
