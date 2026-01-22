import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { seatId, userId } = body;

        const lockKey = `lock:seat:${seatId}`;
        const lockedBy = await redis.get(lockKey);

        if (lockedBy === userId) {
            await redis.del(lockKey);
            return NextResponse.json({ success: true, message: 'Seat released' });
        }

        return NextResponse.json(
            { error: 'Not authorized to release this seat' },
            { status: 403 }
        );
    } catch (error) {
        return NextResponse.json({ error: 'Error releasing seat' }, { status: 500 });
    }
}
