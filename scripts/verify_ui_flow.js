// Native fetch in Node 18+

const baseUrl = 'http://localhost:3000';
const seatIds = ['A10', 'A11'];
const userId = 'user-ui-test';

async function verifyFlow() {
    console.log('--- Verifying Payment UI Flow ---');

    // 1. Simulate Checkout Page Load (GET /api/seat-details)
    // We first lock the seats to make them "valid" for checkout
    console.log('1. Locking seats...');
    for (const id of seatIds) {
        await fetch(`${baseUrl}/api/lock-seat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ seatId: id, userId })
        });
    }

    console.log(`2. Fetching details for checkout: ${seatIds.join(',')}`);
    const detailsRes = await fetch(`${baseUrl}/api/seat-details?seatIds=${seatIds.join(',')}`);
    const details = await detailsRes.json();

    if (details.error) {
        console.error('❌ Failed to fetch details:', details.error);
        return;
    }

    const validSeats = details.seats.filter(s => s.lockedBy === userId);
    console.log(`   Found ${validSeats.length} valid locked seats for user.`);
    if (validSeats.length !== 2) {
        console.error('❌ Mismatch in locked seats.');
        console.log('Full Details Response:', JSON.stringify(details, null, 2));
        return;
    }

    // 2. Simulate Payment (POST /api/pay)
    console.log('3. Submitting Payment...');
    const payRes = await fetch(`${baseUrl}/api/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seatIds, userId })
    });
    const payResult = await payRes.json();

    if (!payRes.ok) {
        console.error('❌ Payment failed:', payResult);
        return;
    }
    console.log('   Payment success:', payResult.message);

    // 3. Verify Final State (Simulate Success Page Data)
    // Success page just reads params, but let's check DB state to be sure
    console.log('4. Verifying DB state...');
    const verifyRes = await fetch(`${baseUrl}/api/seat-details?seatIds=${seatIds.join(',')}`);
    const verifyData = await verifyRes.json();

    const bookedSeats = verifyData.seats.filter(s => s.seat.status === 'booked' && s.seat.userId === userId);
    console.log(`   Found ${bookedSeats.length} booked seats.`);

    if (bookedSeats.length === 2) {
        console.log('✅ UI Flow & Backend Logic Verified.');
    } else {
        console.error('❌ State verification failed.');
    }
}

verifyFlow();
