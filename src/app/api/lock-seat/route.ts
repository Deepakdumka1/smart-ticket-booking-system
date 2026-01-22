import { NextResponse } from 'next/server';
import { getSeat } from '@/lib/db';
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
            return NextResponse.json(
                { error: 'Seat is already booked' },
                { status: 409 }
            );
        }

        // Try to acquire lock
        // SET key value NX PX milliseconds
        // Standard Redis atomic lock: SET resource user_id PX 60000 NX
        const lockKey = `lock:seat:${seatId}`;
        const result = await redis.set(lockKey, userId, 'PX', 60000, 'NX');

        if (result !== 'OK') {
            return NextResponse.json(
                { error: 'Seat is currently locked by another user' },
                { status: 409 }
            );
        }

        return NextResponse.json({ success: true, message: 'Seat locked secured' });
    } catch (error) {
        console.error('Error locking seat:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
