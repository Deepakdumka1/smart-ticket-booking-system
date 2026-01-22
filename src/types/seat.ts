export type SeatStatus = 'available' | 'locked' | 'booked';

export interface Seat {
    id: string;
    row: string;
    number: number;
    status: SeatStatus;
    userId?: string;
    lockedAt?: number;
}
