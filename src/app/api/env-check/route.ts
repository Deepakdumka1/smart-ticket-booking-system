import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    return NextResponse.json({
        REDIS_URL: process.env.REDIS_URL,
        USE_REAL_REDIS: !!process.env.REDIS_URL
    });
}
