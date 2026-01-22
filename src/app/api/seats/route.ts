import { NextResponse } from 'next/server';
import { getSeats, Seat } from '@/lib/db';
import { redis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const seats = getSeats();

        // Create keys for all seats to check locks
        const lockKeys = seats.map((seat) => `lock:seat:${seat.id}`);

        // Batch fetch lock statuses
        // returns array of values (userIds) or nulls
        const locks = await redis.mget(lockKeys);

        const updatedSeats = seats.map((seat, index) => {
            // If DB says booked, it's booked.
            if (seat.status === 'booked') {
                return seat;
            }

            // If DB says available, check if it's locked in Redis
            const lockedBy = locks[index];
            if (lockedBy) {
                return {
                    ...seat,
                    status: 'locked',
                    userId: lockedBy,
                };
            }

            return seat;
        });

        return NextResponse.json({ seats: updatedSeats });
    } catch (error) {
        console.error('Error fetching seats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch seats' },
            { status: 500 }
        );
    }
}
