import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { getSeat } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const seatIdParam = searchParams.get('seatId');
    const seatIdsParam = searchParams.get('seatIds');

    let seatIds: string[] = [];

    if (seatIdsParam) {
        seatIds = seatIdsParam.split(',').filter(Boolean);
    } else if (seatIdParam) {
        seatIds = [seatIdParam];
    }

    if (seatIds.length === 0) {
        return NextResponse.json({ error: 'Missing seatIds' }, { status: 400 });
    }

    const seatsData = [];

    // Use pipeline to fetch everything in one go for efficiency
    const pipe = redis.pipeline();

    // First pass: validation and setup keys
    for (const id of seatIds) {
        const seat = await getSeat(id);
        if (!seat) {
            // If any seat is invalid, we could fail the whole batch or just skip.
            // Failing is safer for consistency.
            return NextResponse.json({ error: `Seat ${id} not found` }, { status: 404 });
        }

        const lockKey = `lock:seat:${id}`;
        pipe.get(lockKey);
        pipe.pttl(lockKey);
        seatsData.push({ seat });
    }

    const results = await pipe.exec();

    if (!results) {
        return NextResponse.json({ error: 'Redis error' }, { status: 500 });
    }

    const responseSeats = [];

    // Iterate results in pairs (get, pttl)
    for (let i = 0; i < seatsData.length; i++) {
        // ioredis pipeline results: [error, result]
        const res1 = results[i * 2];
        const res2 = results[i * 2 + 1];

        // Ensure we handle potential nulls if pipeline failed partially (rare)
        const lockedBy = res1 ? (res1[1] as string | null) : null;
        const ttl = res2 ? (typeof res2[1] === 'number' ? res2[1] : -1) : -1;

        const seatInfo = seatsData[i];

        responseSeats.push({
            seat: seatInfo.seat,
            lockedBy: lockedBy,
            ttl: ttl
        });
    }

    return NextResponse.json({
        seats: responseSeats
    });
}
