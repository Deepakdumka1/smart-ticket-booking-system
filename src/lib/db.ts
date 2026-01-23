import { supabase } from '@/lib/supabase';
import { Seat, SeatStatus } from '@/types/seat';

export type { Seat, SeatStatus };

export const getSeats = async (): Promise<Seat[]> => {
    const { data, error } = await supabase
        .from('seats')
        .select('*')
        .order('row')
        .order('number');

    if (error) {
        console.error('Error fetching seats:', error);
        return [];
    }

    return (data || []).map((s: any) => ({
        id: s.id,
        row: s.row,
        number: s.number,
        status: s.status,
        userId: s.user_id,
        lockedAt: s.locked_at,
        bookedAt: s.booked_at
    }));
};

export const getSeat = async (id: string): Promise<Seat | undefined> => {
    const { data, error } = await supabase
        .from('seats')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) {
        // console.error(`Error fetching seat ${id}:`, error); // specific row might not exist
        return undefined;
    }
    const s = data as any;
    return {
        id: s.id,
        row: s.row,
        number: s.number,
        status: s.status,
        userId: s.user_id,
        lockedAt: s.locked_at,
        bookedAt: s.booked_at
    };
};

// Idempotency Store (Using Bookings Table)
export const checkIdempotency = async (key: string) => {
    // We treat the booking 'id' as the idempotency key
    const { data } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', key)
        .single();

    if (data) {
        return {
            userId: data.user_id,
            timestamp: data.created_at, // Mapping standard
            seatIds: data.seat_ids
        };
    }
    return undefined;
};

export const saveIdempotency = async (key: string, data: { userId: string; timestamp: number; seatIds: string[] }) => {
    const { error } = await supabase.from('bookings').insert({
        id: key,
        user_id: data.userId,
        seat_ids: data.seatIds,
        created_at: data.timestamp,
        amount: 0, // Mock amount or calculate based on seats
        payment_status: 'confirmed'
    });

    if (error) console.error('Error saving idempotency:', error);
};

// Atomic Update Simulation (Using Optimistic Locking via Supabase)
export const updateSeatStatusAtomic = async (
    id: string,
    newStatus: SeatStatus,
    expectedStatus: SeatStatus | SeatStatus[],
    userId: string,
    idempotencyKey?: string
): Promise<{ success: boolean; error?: string }> => {
    // 1. Fetch current to verify state first (Optimization)
    const seat = await getSeat(id);
    if (!seat) {
        return { success: false, error: 'Seat not found' };
    }

    const expected = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
    if (!expected.includes(seat.status)) {
        return { success: false, error: `Race condition: Seat is ${seat.status}, expected ${expected.join(' or ')}` };
    }

    // 2. User verification 
    if (expected.includes('locked') && seat.status === 'locked' && seat.userId !== userId) {
        return { success: false, error: 'Seat locked by another user' };
    }

    // 3. Prepare Update Payload
    const updates: any = {
        status: newStatus,
        user_id: userId
    };

    if (newStatus === 'locked') {
        updates.locked_at = Date.now();
    } else if (newStatus === 'available') {
        updates.user_id = null;
        updates.locked_at = null;
    } else if (newStatus === 'booked') {
        updates.booked_at = Date.now();
    }

    // 4. Perform Update with condition matches (Optimistic Lock)
    // Supabase JS doesn't support complex WHERE clauses in update easily without RLS or specific filter chaining.
    // We filter by ID and the STATUS we just read, limiting race window.
    // Ideally we want atomic: UPDATE ... WHERE id=... AND status IN (...)
    // .eq('id', id).in('status', expected)

    // Note: If multiple statuses are expected, we rely on the one we just read (seat.status)
    // This is valid: if seat.status changed between read and update, the update will fail (matched count 0)

    const { data, error } = await supabase
        .from('seats')
        .update(updates)
        .eq('id', id)
        .eq('status', seat.status) // The status we SAW, must be the status we CHANGE.
        .select();

    if (error) {
        return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
        // Optimistic lock failed
        return { success: false, error: 'Race condition: Seat status changed during transaction' };
    }

    return { success: true };
};

// Helper for simple update (non-atomic or strict)
export const updateSeatStatus = async (id: string, status: SeatStatus, userId?: string) => {
    await updateSeatStatusAtomic(id, status, ['available', 'locked', 'booked'], userId || 'admin');
    const updated = await getSeat(id);
    return updated;
};
