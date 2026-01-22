import { NextResponse } from 'next/server';
import { getSeat, updateSeatStatus } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { seatId, userId } = body;

        if (!seatId || !userId) {
            return NextResponse.json(
                { error: 'Missing seatId or userId' },
                { status: 400 }
            );
        }

        const seat = getSeat(seatId);
        if (!seat) {
            return NextResponse.json(
                { error: 'Seat not found' },
                { status: 404 }
            );
        }

        if (seat.status === 'booked') {
            // Idempotency: if already booked by this user, return success
            if (seat.userId === userId) {
                return NextResponse.json({ success: true, message: 'Payment already processed' });
            }
            return NextResponse.json(
                { error: 'Seat is already booked' },
                { status: 409 }
            );
        }

        // Verify lock ownership
        const lockKey = `lock:seat:${seatId}`;
        const lockedBy = await redis.get(lockKey);

        if (lockedBy !== userId) {
            return NextResponse.json(
                { error: 'Lock expired or seat locked by another user' },
                { status: 403 }
            );
        }

        // Simulate payment delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Finalize booking
        updateSeatStatus(seatId, 'booked', userId);

        // Release lock (cleanup)
        await redis.del(lockKey);

        return NextResponse.json({ success: true, message: 'Booking confirmed' });
    } catch (error) {
        console.error('Error processing payment:', error);
        return NextResponse.json(
            { error: 'Payment failed' },
            { status: 500 }
        );
    }
}
