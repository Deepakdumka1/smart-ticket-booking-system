const seatId = 'A7'; // Fresh seat
const userIdPrefix = 'user-stress-';
const concurrentRequests = 500;
const apiUrl = 'http://localhost:3000/api/pay';
const lockUrl = 'http://localhost:3000/api/lock-seat';

async function runStressTest() {
    console.log(`Starting stress test: ${concurrentRequests} concurrent requests for seat ${seatId}`);

    const promises = [];

    for (let i = 0; i < concurrentRequests; i++) {
        const userId = `${userIdPrefix}${i}`;
        const payload = {
            seatId: seatId,
            userId: userId,
        };

        promises.push(
            (async () => {
                // 1. Try to lock
                try {
                    const lockRes = await fetch(lockUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ seatId, userId })
                    });

                    if (lockRes.status === 200) {
                        // 2. If locked, try to pay
                        const payRes = await fetch(apiUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload),
                        });
                        const payBody = await payRes.json();
                        return { status: payRes.status, body: payBody, phase: 'pay' };
                    } else {
                        return { status: lockRes.status, body: await lockRes.json(), phase: 'lock' }; // Expect 409
                    }
                } catch (err) {
                    return { status: 'error', error: err.message };
                }
            })()
        );
    }

    const results = await Promise.all(promises);

    let successCount = 0;
    let lockFailures = 0; // 409 at lock
    let payFailures = 0;  // 409/403 at pay
    let errorCount = 0;

    results.forEach((r) => {
        if (r.status === 200 && r.phase === 'pay') successCount++;
        else if (r.phase === 'lock' && r.status === 409) lockFailures++;
        else if (r.status === 'error') errorCount++;
        else payFailures++;
    });

    console.log('--- Results ---');
    console.log(`Total Requests: ${concurrentRequests}`);
    console.log(`Success (Booked): ${successCount}`);
    console.log(`Lock Failures (409): ${lockFailures}`);
    console.log(`Pay Failures: ${payFailures}`);
    console.log(`Errors: ${errorCount}`);

    // We expect EXACTLY 1 success.
    // The rest should fail at Lock phase (most likely) or Pay phase (race condition catch).
    if (successCount === 1) {
        console.log('✅ TEST PASSED: Exactly one successful booking.');
    } else {
        console.log(`❌ TEST FAILED: Success count is ${successCount}`);
    }
}

runStressTest();
