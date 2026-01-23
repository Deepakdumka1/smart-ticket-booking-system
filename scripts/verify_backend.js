// using native fetch


async function runVerification() {
    const BASE_URL = 'http://localhost:3001';
    console.log(`Starting backend verification against ${BASE_URL}...`);

    try {
        // 1. Fetch Seats
        console.log('\n1. Testing GET /api/seats...');
        const seatsRes = await fetch(`${BASE_URL}/api/seats`);
        if (!seatsRes.ok) throw new Error(`Failed to fetch seats: ${seatsRes.status} ${seatsRes.statusText}`);
        const seatsData = await seatsRes.json();
        console.log(`- Success! Fetched ${seatsData.seats.length} seats.`);

        if (seatsData.seats.length === 0) {
            console.warn('- WARNING: No seats found. Did you run the seed script in Supabase?');
            return;
        }

        // 2. Lock a Seat
        const targetSeat = seatsData.seats[0]; // Pick the first one
        console.log(`\n2. Testing POST /api/lock-seat for seat ${targetSeat.id}...`);

        // Use a random user ID
        const userId = 'verify-script-' + Date.now();

        const lockRes = await fetch(`${BASE_URL}/api/lock-seat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ seatId: targetSeat.id, userId })
        });

        const lockData = await lockRes.json();

        if (lockRes.ok) {
            console.log('- Success! Seat locked.');
        } else if (lockRes.status === 409) {
            console.log(`- Note: Seat was already locked or booked (${lockData.error}). This is expected behavior if users are active.`);
            // Try to find an available one? No, just proceed.
        } else {
            throw new Error(`Failed to lock seat: ${lockRes.status} ${JSON.stringify(lockData)}`);
        }

        // 3. Verify Lock Status
        console.log('\n3. Verifying lock updates in GET /api/seats...');
        const verifyRes = await fetch(`${BASE_URL}/api/seats`);
        const verifyData = await verifyRes.json();
        const updatedSeat = verifyData.seats.find(s => s.id === targetSeat.id);

        if (updatedSeat.status === 'locked' && updatedSeat.userId === userId) {
            console.log(`- Success! Seat ${targetSeat.id} is now locked by ${userId}.`);
        } else {
            console.error(`- FAILED: Seat status is '${updatedSeat.status}' (expected 'locked' by us).`);
            // It might be that the lock failed above, so this is consequential.
        }

        // 4. Release Seat (Cleanup)
        console.log('\n4. Testing POST /api/release-seat (Cleanup)...');
        const releaseRes = await fetch(`${BASE_URL}/api/release-seat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ seatId: targetSeat.id, userId })
        });

        if (releaseRes.ok) {
            console.log('- Success! Seat released.');
        } else {
            console.log(`- Warning: Failed to release seat: ${releaseRes.status}`);
        }

        console.log('\n✅ Verification Complete.');

    } catch (error) {
        console.error('\n❌ Verification Failed:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('Is the server running on localhost:3000?');
        }
    }
}

// Node 18+ has native fetch. If on older node, we might need to Mock or just rely on the user having node 18+.
// The user has "npm run dev" running, so their node version is likely modern.
runVerification();
