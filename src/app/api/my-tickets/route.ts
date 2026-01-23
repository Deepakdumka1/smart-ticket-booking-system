import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'userId is required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('seats')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'booked')
            .order('booked_at', { ascending: false });

        if (error) {
            throw error;
        }

        const tickets = data.map((s: any) => ({
            id: s.id,
            row: s.row,
            number: s.number,
            status: s.status,
            userId: s.user_id,
            lockedAt: s.locked_at,
            bookedAt: s.booked_at
        }));

        return NextResponse.json({ tickets });
    } catch (error) {
        console.error('Error fetching user tickets:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tickets' },
            { status: 500 }
        );
    }
}
