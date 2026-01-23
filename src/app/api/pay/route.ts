import { NextResponse } from 'next/server';
import { getSeat, updateSeatStatusAtomic, checkIdempotency, saveIdempotency } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { seatId, seatIds, userId } = body;

        // Normalize to array
        let targetSeatIds: string[] = [];
        if (seatIds && Array.isArray(seatIds)) {
            targetSeatIds = seatIds;
        } else if (seatId) {
            targetSeatIds = [seatId];
        }

        if (targetSeatIds.length === 0 || !userId) {
            return NextResponse.json(
                { error: 'Missing seatIds or userId' },
                { status: 400 }
            );
        }

        const seatsToBook = [];

        // 1. Validation Phase
        for (const id of targetSeatIds) {
            const seat = await getSeat(id);
            if (!seat) {
                return NextResponse.json({ error: `Seat ${id} not found` }, { status: 404 });
            }
        }

        // 1.5 Idempotency Check
        // If bookingId is provided, check if already processed
        const bookingId = body.bookingId;
        if (bookingId) {
            const existing = await checkIdempotency(bookingId);
            if (existing) {
                // Check if this user owns the booking
                if (existing.userId === userId) {
                    return NextResponse.json({
                        success: true,
                        message: 'Booking confirmed (idempotent)',
                        data: existing
                    });
                }
                // If locking logic permitted retry, we might continue, but for now assume conflict
            }
        }

        // 2. Lock Verification Phase & Sort to avoid deadlocks
        targetSeatIds.sort();

        const lockKeys = targetSeatIds.map(id => `lock:seat:${id}`);
        const currentLocks = await redis.mget(lockKeys);

        for (let i = 0; i < targetSeatIds.length; i++) {
            const seatId = targetSeatIds[i];
            const lockedBy = currentLocks[i];

            // Allow if locked by us OR if not locked but arguably available (though flow usually requires lock first)
            // Strict flow: Must be locked by user.
            if (lockedBy !== userId) {
                // Check actual DB status just to be sure it wasn't already finalized by a race
                const seat = await getSeat(seatId);
                if (seat?.status === 'booked' && seat.userId === userId) {
                    continue; // Allow if we already won the race (partial success retry?)
                }

                return NextResponse.json(
                    { error: `Lock expired or seat ${seatId} locked by another user` },
                    { status: 403 }
                );
            }
        }

        // Simulate payment delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // 3. Execution Phase (Atomic Updates)
        const bookedSeatIds: string[] = [];

        for (const id of targetSeatIds) {
            // Attempt to transition from 'locked' (or 'available' if we relax rules) to 'booked'
            // We expect it to be 'locked' by us.
            // But due to race, lock might have expired in Redis during the 2s delay.
            // The atomic DB check will save us if we verify user ownership or re-check lock?
            // Since our DB logic checks "expected status", we expect it to be "locked" AND owned by user.

            // However, db.ts updateSeatStatusAtomic logic: 
            // if expected is 'locked', it checks seat.status === 'locked' && seat.userId === userId.
            // This is perfect.

            const result = await updateSeatStatusAtomic(id, 'booked', ['locked', 'available'], userId);

            if (!result.success) {
                // ROLLBACK ALL PREVIOUS
                // In a real DB, we'd use a transaction. Here we manually revert.
                console.error(`Booking failed for ${id}: ${result.error}`);

                // Revert previous
                for (const bookedId of bookedSeatIds) {
                    await updateSeatStatusAtomic(bookedId, 'available', 'booked', userId); // Or revert to locked?
                    // Releasing to available is safer for now to avoid stuck locks.
                }

                return NextResponse.json(
                    { error: `Booking failed for seat ${id}. Integrity maintained. Please retry.` },
                    { status: 409 }
                );
            }
            bookedSeatIds.push(id);
        }

        // 4. Cleanup & Finalize
        try {
            const pipe = redis.pipeline();
            for (const id of targetSeatIds) {
                pipe.del(`lock:seat:${id}`);
            }
            await pipe.exec();
        } catch (cleanupErr) {
            console.error('Cleanup warning:', cleanupErr);
        }

        // 5. Save Idempotency
        if (bookingId) {
            await saveIdempotency(bookingId, {
                userId,
                timestamp: Date.now(),
                seatIds: targetSeatIds
            });
        }

        return NextResponse.json({ success: true, message: 'Booking confirmed' });
    } catch (error) {
        console.error('Error processing payment:', error);
        return NextResponse.json(
            { error: 'Payment failed' },
            { status: 500 }
        );
    }
}
