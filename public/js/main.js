// Main Shared JS Logic

// Auth Helpers
function getUser() {
    return JSON.parse(localStorage.getItem('userInfo'));
}

function isLoggedIn() {
    return !!localStorage.getItem('userInfo');
}

function logout() {
    localStorage.removeItem('userInfo');
    window.location.href = 'index.html';
}

function authHeader() {
    const user = getUser();
    if (user && user.token) {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
        };
    } else {
        return { 'Content-Type': 'application/json' };
    }
}

// Check for Emergency Requests globally
async function checkEmergencyAlerts() {
    // Determine if we need to filter private info? 
    // Current requirement: Public summary is allowed.
    try {
        const response = await fetch('/api/requests');
        const requests = await response.json();

        if (!Array.isArray(requests)) return;

        const hasCriticlal = requests.some(req => req.urgencyLevel === 'Critical');

        const banner = document.getElementById('emergency-banner');
        if (banner) {
            if (hasCriticlal) {
                banner.classList.remove('hidden');
                // If logged in, maybe show count or link
                banner.innerHTML = `<span class="pulse-icon">⚠️</span> URGENT BLOOD REQUESTS! <a href="${isLoggedIn() ? 'user-dashboard.html' : 'login.html'}">VIEW NOW</a>`;
            } else {
                banner.classList.add('hidden');
            }
        }
    } catch (error) {
        console.error('Error fetching alerts:', error);
    }
}

// Helper to show toasts/messages
function showMessage(elementId, message, type = 'success') {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = message;
        el.className = `message-box ${type}`;
        el.style.display = 'block';
        el.style.color = type === 'error' ? 'red' : 'green';
        el.style.backgroundColor = type === 'error' ? '#ffeeee' : '#eeffee';
        el.style.padding = '10px';
        el.style.borderRadius = '5px';
        el.style.marginTop = '1rem';
        el.style.textAlign = 'center';
    }
}

// Initial checks on load
document.addEventListener('DOMContentLoaded', () => {
    checkEmergencyAlerts();
    // Poll every 30 seconds
    setInterval(checkEmergencyAlerts, 30000);

    // Setup Logout Buttons if any
    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    });
});
