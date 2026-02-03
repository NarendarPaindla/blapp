const donorForm = document.getElementById('donorForm');

if (donorForm) {
    donorForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            name: document.getElementById('name').value,
            age: document.getElementById('age').value,
            bloodGroup: document.getElementById('bloodGroup').value,
            phone: document.getElementById('phone').value,
            location: document.getElementById('location').value,
            lastDonationDate: document.getElementById('lastDonationDate').value || null
        };

        try {
            const response = await fetch('/api/donors/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const result = await response.json();
                showMessage('message', `Success! Registered as ${result.availabilityStatus}`, 'success');
                donorForm.reset();
            } else {
                const err = await response.json();
                showMessage('message', `Error: ${err.message || err.error}`, 'error');
            }
        } catch (error) {
            showMessage('message', 'Network Error', 'error');
        }
    });
}
