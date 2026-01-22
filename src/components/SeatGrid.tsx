'use client';

import { Seat } from '@/types/seat';
import { cn } from '@/lib/utils';
import { Lock, User, Armchair, Loader2 } from 'lucide-react';

interface SeatGridProps {
    seats: Seat[];
    onSeatClick: (seatId: string) => void;
    currentUserId: string | null;
    processingId: string | null; // ID of seat currently being locked (loading state)
}

export function SeatGrid({ seats, onSeatClick, currentUserId, processingId }: SeatGridProps) {
    return (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 p-8 glass-card">
            {seats.map((seat) => {
                const isMyLock = seat.status === 'locked' && seat.userId === currentUserId;
                const isLocked = seat.status === 'locked' && !isMyLock;
                const isBooked = seat.status === 'booked';
                const isProcessing = processingId === seat.id;
                const isAvailable = seat.status === 'available';

                return (
                    <button
                        key={seat.id}
                        disabled={isBooked || isLocked || isProcessing}
                        onClick={() => onSeatClick(seat.id)}
                        className={cn(
                            "group relative flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-300",

                            // Base styles
                            "border",

                            // Available
                            isAvailable && "bg-white/5 border-white/10 hover:bg-cyan-500/20 hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:scale-110 md:hover:-translate-y-1",

                            // My Lock
                            isMyLock && "bg-yellow-500/20 border-yellow-500 text-yellow-200 shadow-[0_0_20px_rgba(234,179,8,0.3)] scale-105 ring-1 ring-yellow-500/50",

                            // Others Lock
                            isLocked && "bg-slate-800/50 border-slate-700 text-slate-500 cursor-not-allowed opacity-60 grayscale",

                            // Booked
                            isBooked && "bg-red-950/30 border-red-900/50 text-red-700 cursor-not-allowed opacity-40 grayscale"
                        )}
                        aria-label={`Seat ${seat.id} ${seat.status}`}
                    >
                        {/* Status Indicator Icon */}
                        <div className="relative">
                            {isProcessing ? (
                                <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                            ) : isBooked ? (
                                <User className="w-6 h-6" />
                            ) : isLocked ? (
                                <Lock className="w-6 h-6" />
                            ) : (
                                <Armchair className={cn(
                                    "w-6 h-6 transition-colors duration-300",
                                    isAvailable ? "text-slate-400 group-hover:text-cyan-400" :
                                        isMyLock ? "text-yellow-400 fill-yellow-400/20" : ""
                                )} />
                            )}

                            {/* Pulse effect for my lock */}
                            {isMyLock && (
                                <div className="absolute inset-0 bg-yellow-400/30 blur-xl rounded-full animate-pulse-slow" />
                            )}
                        </div>

                        {/* Seat Number */}
                        <span className={cn(
                            "text-xs font-mono font-medium mt-2",
                            isAvailable ? "text-slate-500 group-hover:text-cyan-200" :
                                isMyLock ? "text-yellow-200" : "text-slate-600"
                        )}>
                            {seat.id}
                        </span>

                        {/* Tooltip on Hover */}
                        <div className="absolute bottom-full mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 whitespace-nowrap bg-slate-900 text-xs py-1 px-2 rounded border border-white/10 shadow-xl">
                            <span className={isAvailable ? "text-cyan-400" : isMyLock ? "text-yellow-400" : "text-slate-400"}>
                                {seat.status === 'locked' && isMyLock ? 'Reserved by You' : seat.status}
                            </span>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
