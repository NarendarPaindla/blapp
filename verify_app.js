const http = require('http');

const PORT = 8000; // As per user logs
const BASE_URL = `http://localhost:${PORT}/api`;

function request(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: PORT,
            path: '/api' + path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    resolve({ status: res.statusCode, body: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, body: body });
                }
            });
        });

        req.on('error', (e) => reject(e));

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function runTests() {
    console.log(`Starting E2E API Tests on Port ${PORT}...\n`);

    // 1. Register Donor
    console.log('1. Testing Donor Registration...');
    const donor = {
        name: "Test User",
        age: 25,
        bloodGroup: "O+",
        phone: "9876543210",
        location: "Test City",
        lastDonationDate: null
    };

    try {
        const regRes = await request('POST', '/donors/register', donor);
        if (regRes.status === 201) {
            console.log('✅ Donor Registered Successfully:', regRes.body.name);
        } else {
            console.error('❌ Donor Registration Failed:', regRes.body);
        }
    } catch (e) { console.error('❌ Connection Error:', e.message); }

    // 2. Check Inventory (Initial)
    console.log('\n2. Checking Inventory...');
    try {
        const invRes = await request('GET', '/inventory');
        console.log('✅ Inventory Fetched. Count:', invRes.body.length);
    } catch (e) { console.error('❌ Error:', e.message); }

    // 3. Update Inventory
    console.log('\n3. Updating Inventory (Add O+)...');
    try {
        const updateRes = await request('PUT', '/inventory/update', {
            bloodGroup: "O+",
            quantity: 10,
            operation: "add"
        });
        if (updateRes.status === 200) {
            console.log('✅ Inventory Updated:', updateRes.body.availableUnits, 'units');
        } else {
            console.error('❌ Update Failed:', updateRes.body);
        }
    } catch (e) { console.error('❌ Error:', e.message); }

    // 4. Create Emergency Request
    console.log('\n4. Creating Emergency Request...');
    try {
        const reqRes = await request('POST', '/requests', {
            patientName: "Emergency Patient",
            requiredBloodGroup: "O+",
            unitsRequired: 2,
            hospitalName: "City Hospital",
            urgencyLevel: "Critical"
        });
        if (reqRes.status === 201) {
            console.log('✅ Request Created. Urgency:', reqRes.body.urgencyLevel);
        } else {
            console.log('❌ Request Creation Failed:', reqRes.status, reqRes.body);
        }
    } catch (e) { console.error('❌ Error:', e.message); }

    console.log('\nTests Completed.');
}

runTests();
