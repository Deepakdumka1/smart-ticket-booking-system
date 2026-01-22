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
    const userId = useUser();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!seatId || !userId) {
            if (!seatId) return;
            return;
        }

        const checkStatus = async () => {
            try {
                const res = await fetch(`/api/seat-details?seatId=${seatId}`);
                const info = await res.json();

                if (info.error) throw new Error(info.error);

                if (info.lockedBy !== userId) {
                    alert("Session expired or seat lost.");
                    router.push('/seats');
                    return;
                }

                if (info.ttl <= 0) {
                    alert("Time expired!");
                    router.push('/seats');
                    return;
                }

                setData(info);
            } catch (err) {
                console.error(err);
                router.push('/seats');
            } finally {
                setLoading(false);
            }
        };

        checkStatus();
    }, [seatId, userId, router]);

    const handlePayment = async () => {
        setPaying(true);
        setError(null);

        try {
            const res = await fetch('/api/pay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ seatId, userId }),
            });

            const result = await res.json();

            if (!res.ok) throw new Error(result.error);

            router.push(`/success?seatId=${seatId}`);
        } catch (err: any) {
            setError(err.message);
            setPaying(false);
        }
    };

    const handleExpire = () => {
        alert("Time expired! Seat released.");
        router.push('/seats');
    };

    if (loading || !data) {
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
                            <p className="text-slate-400 text-sm">Review Ticket Details</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs uppercase text-slate-500 font-bold tracking-widest mb-1">Total</div>
                        <div className="text-2xl font-bold text-white">$150.00</div>
                    </div>
                </header>

                <div className="space-y-6">
                    {/* Event Detail Card */}
                    <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                        <div className="flex items-center gap-3 text-white font-medium">
                            <Calendar className="w-5 h-5 text-purple-400" />
                            <span>Cosmic Symphony 2026</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-300 text-sm">
                            <Clock className="w-4 h-4 text-slate-500" />
                            <span>Oct 24 • 20:00 • Neo-Tokyo Dome</span>
                        </div>

                        <div className="h-px bg-white/5 my-2" />

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Armchair className="w-5 h-5 text-yellow-400" />
                                <div>
                                    <p className="text-xs text-slate-500 uppercase">Seat</p>
                                    <p className="text-white font-bold text-lg">{data.seat.id}</p>
                                </div>
                            </div>
                            <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
                                Reserved
                            </div>
                        </div>
                    </div>

                    {/* Timer */}
                    <div className="animate-pulse-slow">
                        <Timer initialTimeMs={data.ttl} onExpire={handleExpire} />
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
                                <>Pay $150.00 <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform" /></>
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
