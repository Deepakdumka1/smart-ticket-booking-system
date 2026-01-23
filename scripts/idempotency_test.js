const seatId = 'B10';
const userId = 'user-idempotency-test';
const bookingId = 'booking-unique-123';
const apiUrl = 'http://localhost:3000/api/pay';
const lockUrl = 'http://localhost:3000/api/lock-seat';

async function runIdempotencyTest() {
    console.log('Starting Idempotency Test...');

    // 0. Lock Seat
    console.log('Acquiring lock...');
    const lockRes = await fetch(lockUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seatId, userId })
    });

    if (lockRes.status !== 200) {
        console.log(`❌ Failed to lock seat. Status: ${lockRes.status}`);
        const body = await lockRes.json();
        console.log(body);
        return;
    }
    console.log('Lock acquired.');

    // 1. First Request
    console.log('Sending 1st request...');
    const res1 = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seatId, userId, bookingId }),
    });
    const data1 = await res1.json();
    console.log(`1st Response: ${res1.status}`);

    if (res1.status !== 200) {
        console.log('❌ 1st request failed. Aborting.');
        console.info('Error Body:', JSON.stringify(data1, null, 2));
        return;
    }
    console.log('1st Response Data:', data1);

    // 2. Second Request (Duplicate)
    console.log('Sending 2nd request (duplicate)...');
    const res2 = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seatId, userId, bookingId }),
    });
    const data2 = await res2.json();
    console.log(`2nd Response: ${res2.status}`, data2);

    if (res2.status === 200 && data2.message.includes('idempotent')) {
        console.log('✅ TEST PASSED: Idempotency confirmed.');
    } else {
        console.log('❌ TEST FAILED: Duplicate request not handled correctly.');
    }
}

runIdempotencyTest();
