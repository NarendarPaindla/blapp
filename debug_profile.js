const http = require('http');

const PORT = 8000;
let AUTH_TOKEN = '';

// Helper for requests
function request(method, path, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const options = {
            hostname: 'localhost',
            port: PORT,
            path: '/api' + path,
            method: method,
            headers: headers
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    resolve({ status: res.statusCode, body: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, body });
                }
            });
        });

        req.on('error', err => reject(err));
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function runDebug() {
    console.log('--- Debugging Profile Update ---');

    // 1. Register a temporary user
    const email = `debug_${Date.now()}@example.com`;
    const regRes = await request('POST', '/auth/register', {
        name: 'Debug User',
        email: email,
        password: 'password123',
        phone: '1234567890',
        location: 'Debug City'
    });

    if (regRes.status !== 201) {
        console.error('Failed to register debug user:', regRes.body);
        return;
    }
    AUTH_TOKEN = regRes.body.token;
    console.log('User registered. Token acquired.');

    // 2. Attempt Profile Update (Exact payload from screenshot/analysis)
    // Note: Frontend sends string "YYYY-MM-DD" for lastDonationDate
    const payload = {
        name: 'Debug User',
        phone: '1234567890',
        location: 'Debug City',
        isDonor: true,
        bloodGroup: 'A-',
        availabilityStatus: 'Unavailable',
        lastDonationDate: '2026-01-30' // As per screenshot
    };

    console.log('Sending payload:', JSON.stringify(payload, null, 2));

    const updateRes = await request('PUT', '/users/profile', payload, AUTH_TOKEN);

    if (updateRes.status === 200) {
        console.log('✅ Update SUCCESS! (Wait, expected failure?)');
        console.log('Response:', updateRes.body);
    } else {
        console.log('❌ Update FAILED!');
        console.log('Status Code:', updateRes.status);
        console.log('Error Body:', JSON.stringify(updateRes.body, null, 2));
    }
}

runDebug();
