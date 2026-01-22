'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Seat } from '@/types/seat';
import { SeatGrid } from '@/components/SeatGrid';
import { useUser } from '@/hooks/useUser';
import { Loader2, ArrowRight, AlertCircle, Sparkles, MapPin, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

function SeatSelectionContent() {
    const [seats, setSeats] = useState<Seat[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [lockedSeatId, setLockedSeatId] = useState<string | null>(null);

    const userId = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const eventId = searchParams.get('eventId') || '1'; // Mock event ID handling

    const fetchSeats = useCallback(async () => {
        try {
            const res = await fetch('/api/seats', { cache: 'no-store' });
            if (!res.ok) throw new Error('Failed to fetch seats');
            const data = await res.json();
            setSeats(data.seats);

            // Check if user already has a locked seat
            if (userId) {
                const myLock = data.seats.find((s: Seat) => s.status === 'locked' && s.userId === userId);
                if (myLock) setLockedSeatId(myLock.id);
                else if (lockedSeatId) {
                    setLockedSeatId(null);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [userId, lockedSeatId]);

    useEffect(() => {
        fetchSeats();
        const interval = setInterval(fetchSeats, 2000);
        return () => clearInterval(interval);
    }, [fetchSeats]);

    const handleSeatClick = async (seatId: string) => {
        if (!userId) return;

        if (lockedSeatId) {
            if (lockedSeatId === seatId) {
                router.push(`/checkout?seatId=${seatId}`);
                return;
            }
            if (!confirm("You already have a seat locked. Switch seats?")) return;
            setError("Please complete your current booking first.");
            return;
        }

        setProcessingId(seatId);
        setError(null);

        try {
            const res = await fetch('/api/lock-seat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ seatId, userId }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to lock seat');
            }

            setLockedSeatId(seatId);
            await fetchSeats();
        } catch (err: any) {
            setError(err.message);
            fetchSeats();
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8 pb-32 relative">
            {/* Header Content */}
            <header className="max-w-7xl mx-auto mb-12 animate-enter">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                    <div>
                        <Link href="/" className="text-sm text-cyan-400 hover:text-cyan-300 mb-2 inline-block transition-colors">&larr; Back to Events</Link>
                        <h1 className="text-4xl font-bold text-white mb-2">Select Seats</h1>
                        <div className="flex items-center gap-4 text-slate-400 text-sm">
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Oct 24, 2026</span>
                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Neo-Tokyo Dome</span>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="glass px-6 py-3 rounded-full flex gap-6 text-xs md:text-sm font-medium">
                        <div className="flex items-center gap-2 text-slate-300">
                            <div className="w-3 h-3 rounded-sm border border-slate-500 opacity-50" />
                            <span>Available</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                            <div className="w-3 h-3 rounded-sm bg-slate-700 opacity-50" />
                            <span>Unavailable</span>
                        </div>
                        <div className="flex items-center gap-2 text-yellow-200">
                            <div className="w-3 h-3 rounded-sm bg-yellow-500" />
                            <span>Selected</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Stage */}
            <div className="max-w-4xl mx-auto mb-12 perspective-[1000px]">
                <div className="w-full h-16 bg-gradient-to-b from-cyan-500/0 via-cyan-500/5 to-cyan-500/20 border-t border-cyan-500/30 rounded-t-3xl flex items-center justify-center text-cyan-500/50 text-sm font-bold tracking-[0.5em] uppercase transform rotate-x-12 shadow-[0_-10px_30px_rgba(6,182,212,0.1)]">
                    Stage Screen
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="max-w-md mx-auto mb-8 glass-card border-red-500/50 p-4 flex items-center gap-3 text-red-200 animate-enter">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    {error}
                    <button onClick={() => setError(null)} className="ml-auto hover:text-white">✕</button>
                </div>
            )}

            {/* Grid */}
            <main className="max-w-7xl mx-auto flex justify-center">
                {loading && seats.length === 0 ? (
                    <div className="flex flex-col items-center py-20 text-slate-500">
                        <div className="relative">
                            <div className="w-12 h-12 border-4 border-slate-700 border-t-cyan-500 rounded-full animate-spin" />
                            <div className="absolute inset-0 bg-cyan-500/20 blur-xl animate-pulse" />
                        </div>
                        <p className="mt-4 font-medium animate-pulse">Loading seating chart...</p>
                    </div>
                ) : (
                    <SeatGrid
                        seats={seats}
                        onSeatClick={handleSeatClick}
                        currentUserId={userId}
                        processingId={processingId}
                    />
                )}
            </main>

            {/* Sticky Action Footer */}
            <div className={cn(
                "fixed bottom-0 left-0 right-0 p-6 glass border-t border-white/10 transition-transform duration-500 z-50",
                lockedSeatId ? "translate-y-0" : "translate-y-full"
            )}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center text-yellow-400 font-bold text-xl">
                            {lockedSeatId}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Seat Reserved</h3>
                            <p className="text-yellow-400/80 text-sm flex items-center gap-1">
                                <span className="animate-pulse">●</span> Complete payment to confirm
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push(`/checkout?seatId=${lockedSeatId}`)}
                        className="btn-primary flex items-center gap-2 group"
                    >
                        Proceed to Checkout
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function SeatSelectionPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="animate-spin text-cyan-500" /></div>}>
            <SeatSelectionContent />
        </Suspense>
    );
}
