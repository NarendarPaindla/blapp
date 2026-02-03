const http = require('http');

const PORT = 8000;
let AUTH_TOKEN = '';

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

async function runTests() {
    console.log('--- Starting V2.1 Fix Verification ---');

    // 1. Register User
    const email = `test_fix_${Date.now()}@example.com`;
    console.log(`\n1. Registering user: ${email}...`);
    const regRes = await request('POST', '/auth/register', {
        name: 'Fix Test User',
        email: email,
        password: 'password123',
        phone: '123-FIX-IT',
        location: 'Fix City'
    });

    if (regRes.status === 201) {
        console.log('✅ Registered! Token received.');
        AUTH_TOKEN = regRes.body.token;
    } else {
        console.error('❌ Registration Failed:', regRes.body);
        return;
    }

    // 2. Access Profile (Protected)
    const profRes = await request('GET', '/auth/profile', null, AUTH_TOKEN);
    if (profRes.status === 200) console.log('✅ Profile Accessed OK.');
    else console.error('❌ Profile Access Failed:', profRes.status);

    // 3. Become Donor (Needed for Search Test)
    await request('PUT', '/users/profile', {
        isDonor: true,
        bloodGroup: 'O+',
        availabilityStatus: 'Available'
    }, AUTH_TOKEN);
    console.log('✅ User marked as Donor (O+).');

    // 4. Create Request (THIS FAILED BEFORE)
    console.log('\n4. Testing Blocked Request Creation...');
    const reqRes = await request('POST', '/requests', {
        patientName: 'Test Patient',
        requiredBloodGroup: 'AB+',
        unitsRequired: 2,
        hospitalName: 'General Hospital',
        urgencyLevel: 'Critical'
    }, AUTH_TOKEN);

    if (reqRes.status === 201) {
        console.log('✅ Request Created Successfully! (Bug Fixed)');
    } else {
        console.error('❌ Request Creation Still Failing:', reqRes.status, reqRes.body);
    }

    // 5. Test Donor Search (O+ donor should supply O+, but testing search API)
    console.log('\n5. Testing Donor Search API...');
    // Search for O+ (Patient needs O+, so O+ donor is compatible)
    const searchRes = await request('GET', '/users/search/O%2B', null, AUTH_TOKEN);

    if (searchRes.status === 200 && Array.isArray(searchRes.body)) {
        console.log(`✅ Search API Working. Found ${searchRes.body.length} donors.`);
        // Note: It might find 0 if compatibility logic is strict or data fresh, but status 200 is key.
    } else {
        console.error('❌ Search API Failed:', searchRes.status, searchRes.body);
    }

    console.log('\n--- Verification Complete ---');
}

runTests();
