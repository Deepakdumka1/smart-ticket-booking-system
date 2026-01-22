import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { getSeat } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const seatId = searchParams.get('seatId');

    if (!seatId) {
        return NextResponse.json({ error: 'Missing seatId' }, { status: 400 });
    }

    const seat = getSeat(seatId);
    if (!seat) {
        return NextResponse.json({ error: 'Seat not found' }, { status: 404 });
    }

    const lockKey = `lock:seat:${seatId}`;

    // Pipeline to get value and TTL
    const pipe = redis.pipeline();
    pipe.get(lockKey);
    pipe.pttl(lockKey);

    const results = await pipe.exec();

    // results[0] -> [err, value]
    // results[1] -> [err, ttl]

    if (!results) {
        return NextResponse.json({ error: 'Redis error' }, { status: 500 });
    }

    const [getError, lockedBy] = results[0];
    const [ttlError, ttl] = results[1];

    return NextResponse.json({
        seat,
        lockedBy,
        ttl: typeof ttl === 'number' ? ttl : -1
    });
}
