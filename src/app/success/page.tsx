'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Download, Home, QrCode, Share2, Ticket } from 'lucide-react';
import { useUser } from '@/hooks/useUser';

function SuccessContent() {
    const params = useSearchParams();
    const seatId = params.get('seatId');
    const seatIds = params.get('seatIds');
    const userId = useUser();

    // Determine seats to display
    const displayedSeats = seatIds
        ? seatIds.replace(/,/g, ', ')
        : (seatId || 'Unknown');

    if (!seatId && !seatIds) {
        return (
            <div className="min-h-screen grid place-items-center bg-slate-950 text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Ticket Not Found</h1>
                    <Link href="/" className="text-cyan-400 hover:underline">Return Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Confetti/Glow */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[20%] right-[30%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] left-[10%] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="flex flex-col items-center mb-8 animate-enter">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-2 text-center">Booking Confirmed!</h1>
                <p className="text-slate-400 text-center">Your digital ticket is ready.</p>
            </div>

            <div className="w-full max-w-sm relative group perspective-[1000px] animate-enter" style={{ animationDelay: '0.2s' }}>
                {/* Ticket Container */}
                <div className="bg-white rounded-3xl overflow-hidden shadow-2xl transition-transform duration-500 hover:rotate-y-12 transform-style-3d">
                    {/* Header */}
                    <div className="bg-slate-900 p-6 relative overflow-hidden border-b-4 border-cyan-500">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Ticket className="w-24 h-24 text-white transform rotate-12" />
                        </div>
                        <h2 className="text-xl font-bold text-white relative z-10"> Stand-up comedy</h2>
                        <p className="text-cyan-400 text-sm font-medium relative z-10">World Tour 2026</p>
                    </div>

                    {/* Content */}
                    <div className="p-6 bg-slate-50 relative">
                        {/* Punch holes */}
                        <div className="absolute top-[-12px] left-[-12px] w-6 h-6 bg-slate-950 rounded-full" />
                        <div className="absolute top-[-12px] right-[-12px] w-6 h-6 bg-slate-950 rounded-full" />

                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-1">Date</label>
                                <div className="text-slate-800 font-bold text-lg">Oct 24</div>
                            </div>
                            <div>
                                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-1">Time</label>
                                <div className="text-slate-800 font-bold text-lg">20:00</div>
                            </div>
                            <div className="col-span-2">
                                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-1">Seats</label>
                                <div className="text-slate-800 font-bold text-lg">{displayedSeats}</div>
                            </div>
                            <div>
                                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-1">Gate</label>
                                <div className="text-slate-800 font-bold text-lg">A4</div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-2xl">
                            <QrCode className="w-32 h-32 text-slate-900" />
                            <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest">Scan at entrance</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex gap-4 w-full max-w-sm animate-enter" style={{ animationDelay: '0.4s' }}>
                <button className="flex-1 btn-secondary flex items-center justify-center gap-2 hover:bg-white/10">
                    <Download className="w-4 h-4" /> Save
                </button>
                <Link href="/" className="flex-1 btn-primary flex items-center justify-center gap-2 bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700">
                    <Home className="w-4 h-4" /> Home
                </Link>
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
            <SuccessContent />
        </Suspense>
    );
}
