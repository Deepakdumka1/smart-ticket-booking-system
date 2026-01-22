import { Seat, SeatStatus } from '@/types/seat';
export type { Seat, SeatStatus };

// Initial seed data
const generateSeats = (): Seat[] => {
    const seats: Seat[] = [];
    const rows = ['A', 'B'];
    const cols = 20;

    rows.forEach((row) => {
        for (let i = 1; i <= cols; i++) {
            seats.push({
                id: `${row}${i}`,
                row,
                number: i,
                status: 'available',
            });
        }
    });
    return seats;
};

// Singleton DB store
const globalForDb = global as unknown as { seatDb: Seat[] };

export const seatDb = globalForDb.seatDb || generateSeats();

if (process.env.NODE_ENV !== 'production') globalForDb.seatDb = seatDb;

// Helper functions (simulating ORM methods)
export const getSeats = () => seatDb;

export const getSeat = (id: string) => seatDb.find((s) => s.id === id);

export const updateSeatStatus = (id: string, status: SeatStatus, userId?: string) => {
    const seat = seatDb.find((s) => s.id === id);
    if (seat) {
        seat.status = status;
        if (userId) seat.userId = userId;
        if (status === 'locked') seat.lockedAt = Date.now();
        else if (status === 'available') {
            delete seat.userId;
            delete seat.lockedAt;
        }
    }
    return seat;
};
