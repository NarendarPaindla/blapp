// Dashboard Logic

// Fetch and Render Inventory
async function updateInventory() {
    const grid = document.getElementById('inventory-grid');
    if (!grid) return;

    try {
        const res = await fetch('/api/inventory');
        const inventory = await res.json();

        grid.innerHTML = ''; // Clear loading

        // We want to show all 8 groups even if not in DB yet?
        // Let's assume the API might return partial, so we merge or just show what we have.
        // Or cleaner: iterate standard groups and find match.
        const groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

        groups.forEach(group => {
            const item = inventory.find(i => i.bloodGroup === group);
            const units = item ? item.availableUnits : 0;

            // Determine Status Color
            let statusClass = 'status-safe'; // Green
            if (units < 5) statusClass = 'status-critical'; // Red
            else if (units < 15) statusClass = 'status-moderate'; // Yellow

            const card = document.createElement('div');
            card.className = `inventory-card ${statusClass}`;
            card.innerHTML = `
                <h3>${group}</h3>
                <p><strong>${units}</strong> Units</p>
                <div class="status-indicator ${statusClass}">
                    <div class="status-bar" style="width: ${Math.min(units * 5, 100)}%"></div>
                </div>
            `;
            grid.appendChild(card);
        });

    } catch (err) {
        console.error(err);
        grid.innerHTML = '<p>Error loading inventory.</p>';
    }
}

// Update Inventory Form
const updateForm = document.getElementById('updateInventoryForm');
if (updateForm) {
    updateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            bloodGroup: document.getElementById('updateGroup').value,
            quantity: document.getElementById('updateQuantity').value,
            operation: document.getElementById('updateOperation').value
        };

        try {
            const res = await fetch('/api/inventory/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                updateInventory(); // Refresh grid
                updateForm.reset();
            } else {
                alert('Update failed');
            }
        } catch (err) {
            console.error(err);
        }
    });
}

// Search Compatible Donors
const searchBtn = document.getElementById('searchDonorsBtn');
if (searchBtn) {
    searchBtn.addEventListener('click', async () => {
        const patientGroup = document.getElementById('patientBloodGroup').value;
        const output = document.getElementById('donorParamOutput');

        if (!patientGroup) {
            alert('Please select a blood group');
            return;
        }

        output.innerHTML = '<div class="loading-spinner"></div>';

        try {
            const res = await fetch(`/api/donors/${encodeURIComponent(patientGroup)}`);
            const donors = await res.json();

            output.innerHTML = '';

            if (donors.length === 0) {
                output.innerHTML = '<p>No compatible donors found.</p>';
                return;
            }

            donors.forEach(d => {
                const el = document.createElement('div');
                el.className = 'donor-card';
                el.innerHTML = `
                    <h4>${d.name}</h4>
                    <p>Group: <strong>${d.bloodGroup}</strong></p>
                    <p>📞 ${d.phone}</p>
                    <p>📍 ${d.location}</p>
                `;
                output.appendChild(el);
            });

        } catch (err) {
            output.innerHTML = '<p>Error searching donors.</p>';
        }
    });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    updateInventory();
    // Refresh inventory every 10s
    setInterval(updateInventory, 10000);
});
