// Emergency Logic

// Handle Request Submission
const requestForm = document.getElementById('requestForm');
if (requestForm) {
    requestForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            patientName: document.getElementById('patientName').value,
            requiredBloodGroup: document.getElementById('reqBloodGroup').value,
            unitsRequired: document.getElementById('units').value,
            hospitalName: document.getElementById('hospital').value,
            urgencyLevel: document.getElementById('urgency').value
        };

        try {
            const res = await fetch('/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                alert('Request Created Successfully');
                requestForm.reset();
                loadRequests(); // Refresh list
            } else {
                alert('Error creating request');
            }
        } catch (err) {
            console.error(err);
        }
    });
}

// Load Requests
async function loadRequests() {
    const list = document.getElementById('requestList');
    if (!list) return;

    try {
        const res = await fetch('/api/requests');
        const requests = await res.json();

        list.innerHTML = '';

        if (requests.length === 0) {
            list.innerHTML = '<p>No active requests.</p>';
            return;
        }

        requests.forEach(req => {
            const urgencyClass = req.urgencyLevel.toLowerCase(); // normal, urgent, critical
            const card = document.createElement('div');
            card.className = `request-card ${urgencyClass}`;

            card.innerHTML = `
                <div class="request-header">
                    <h3>Blood Needed: ${req.requiredBloodGroup} (${req.unitsRequired} Units)</h3>
                    <span class="badge badge-${urgencyClass}">${req.urgencyLevel}</span>
                </div>
                <p><strong>Patient:</strong> ${req.patientName}</p>
                <p><strong>Hospital:</strong> ${req.hospitalName}</p>
                <p><small>${new Date(req.createdAt).toLocaleString()}</small></p>
            `;
            list.appendChild(card);
        });

    } catch (err) {
        console.error(err);
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    loadRequests();
    // Poll every 10s
    setInterval(loadRequests, 10000);
});
