'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { Timer } from '@/components/Timer';
import { CreditCard, Loader2, ShieldCheck, Ticket, Armchair, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

function CheckoutContent() {
    const params = useSearchParams();
    const seatId = params.get('seatId');
    const seatIds = params.get('seatIds');
    const userId = useUser();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [seatsData, setSeatsData] = useState<any[]>([]);
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Calculate total
    const pricePerSeat = 150;
    const totalAmount = seatsData.length * pricePerSeat;

    // Derived min TTL for display
    const minTTL = seatsData.length > 0 ? Math.min(...seatsData.map(s => s.ttl)) : 0;

    useEffect(() => {
        if ((!seatId && !seatIds) || !userId) {
            if (!seatId && !seatIds) return;
            return;
        }

        const checkStatus = async () => {
            try {
                // Construct query
                const query = seatIds ? `seatIds=${seatIds}` : `seatId=${seatId}`;
                const res = await fetch(`/api/seat-details?${query}`);
                const data = await res.json();

                if (data.error) throw new Error(data.error);

                // data.seats is array
                const validSeats = data.seats.filter((info: any) => {
                    return info.lockedBy === userId && info.ttl > 0;
                });

                if (validSeats.length === 0) {
                    alert("Session expired or seats lost.");
                    router.push('/seats');
                    return;
                }

                if (validSeats.length < (data.seats.length)) {
                    // Some seats were lost
                    alert("Some seats were lost due to timeout.");
                    // We could continue with partial, but let's just refresh to be safe or redirect
                    // for now, redirect
                    router.push('/seats');
                    return;
                }

                setSeatsData(validSeats);
            } catch (err) {
                console.error(err);
                router.push('/seats');
            } finally {
                setLoading(false);
            }
        };

        checkStatus();
    }, [seatId, seatIds, userId, router]);

    const handlePayment = async () => {
        setPaying(true);
        setError(null);

        // Extract IDs from current data
        const currentIds = seatsData.map(s => s.seat.id);

        try {
            const res = await fetch('/api/pay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ seatIds: currentIds, userId }),
            });

            const result = await res.json();

            if (!res.ok) throw new Error(result.error);

            router.push(`/success?seatIds=${currentIds.join(',')}`);
        } catch (err: any) {
            setError(err.message);
            setPaying(false);
        }
    };

    const handleExpire = () => {
        alert("Time expired! Seat released.");
        router.push('/seats');
    };

    if (loading || seatsData.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-white gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-cyan-400" />
                <p className="animate-pulse text-slate-400">Securing your session...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[30%] left-[20%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse-slow" />
            </div>

            <div className="w-full max-w-lg glass-card p-8 animate-enter relative z-10 border-t border-white/20">
                <header className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-900/20">
                            <Ticket className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-tight">Checkout</h1>
                            <p className="text-slate-400 text-sm">{seatsData.length} Ticket{seatsData.length > 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs uppercase text-slate-500 font-bold tracking-widest mb-1">Total</div>
                        <div className="text-2xl font-bold text-white">${totalAmount.toFixed(2)}</div>
                    </div>
                </header>

                <div className="space-y-6">
                    {/* Event Detail Card */}
                    <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                        <div className="flex items-center gap-3 text-white font-medium">
                            <Calendar className="w-5 h-5 text-purple-400" />
                            <span> Stand-up comedy 2026</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-300 text-sm">
                            <Clock className="w-4 h-4 text-slate-500" />
                            <span>Oct 24 • 20:00 •  Delhi</span>
                        </div>

                        <div className="h-px bg-white/5 my-2" />

                        {seatsData.map((data, index) => (
                            <div key={data.seat.id} className="flex items-center justify-between mb-2 last:mb-0">
                                <div className="flex items-center gap-3">
                                    <Armchair className="w-5 h-5 text-yellow-400" />
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase">Seat {index + 1}</p>
                                        <p className="text-white font-bold text-lg">{data.seat.id}</p>
                                    </div>
                                </div>
                                <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
                                    Reserved
                                </div>
                            </div>
                        ))}

                    </div>

                    {/* Timer */}
                    <div className="animate-pulse-slow">
                        <Timer initialTimeMs={minTTL} onExpire={handleExpire} />
                    </div>

                    {/* Payment Form */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs text-slate-400 font-bold uppercase tracking-widest">Cardholder Name</label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-slate-400 font-bold uppercase tracking-widest">Card Number</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="0000 0000 0000 0000"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono"
                                />
                                <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 pointer-events-none" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs text-slate-400 font-bold uppercase tracking-widest">Expiry</label>
                                <input
                                    type="text"
                                    placeholder="MM/YY"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-center"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-slate-400 font-bold uppercase tracking-widest">CVC</label>
                                <input
                                    type="text"
                                    placeholder="123"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-center"
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 text-red-200 text-sm rounded-xl border border-red-500/20 flex gap-2 items-start">
                            <span className="text-xl">⚠️</span> {error}
                        </div>
                    )}

                    <div className="pt-4">
                        <button
                            onClick={handlePayment}
                            disabled={paying}
                            className="btn-primary w-full flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {paying ? (
                                <>Processing <Loader2 className="w-5 h-5 animate-spin" /></>
                            ) : (
                                <>Pay ${totalAmount.toFixed(2)} <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform" /></>
                            )}
                        </button>

                        <div className="mt-4 flex items-center justify-center gap-2 text-slate-500 text-xs opacity-70">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <span>Payments secured by 256-bit SSL encryption</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="animate-spin text-cyan-500" /></div>}>
            <CheckoutContent />
        </Suspense>
    );
}
