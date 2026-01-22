'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
    initialTimeMs: number;
    onExpire?: () => void;
}

export function Timer({ initialTimeMs, onExpire }: TimerProps) {
    const [timeLeft, setTimeLeft] = useState(initialTimeMs);

    useEffect(() => {
        setTimeLeft(initialTimeMs);
    }, [initialTimeMs]);

    useEffect(() => {
        if (timeLeft <= 0) {
            onExpire?.();
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                const next = prev - 1000;
                if (next <= 0) {
                    clearInterval(interval);
                    return 0;
                }
                return next;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft, onExpire]);

    // Format mm:ss
    const seconds = Math.ceil(timeLeft / 1000);
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;

    // Progress percentage
    const maxTime = 60000; // 60s reference
    const percent = Math.max(0, (timeLeft / maxTime) * 100);

    // Color states
    const isUrgent = percent < 30; // Last 20s approx
    const colorClass = isUrgent ? 'text-red-500' : 'text-yellow-400';
    const bgClass = isUrgent ? 'bg-red-500' : 'bg-yellow-400';

    return (
        <div className="w-full glass p-4 rounded-xl flex items-center gap-4 border border-white/5">
            <div className={`p-2 rounded-full bg-white/5 ${isUrgent ? 'animate-pulse' : ''}`}>
                <Clock className={`w-5 h-5 ${colorClass}`} />
            </div>

            <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs uppercase tracking-widest text-slate-400 font-medium">Session Expires In</span>
                    <span className={`text-xl font-mono font-bold ${colorClass}`}>
                        {m}:{s.toString().padStart(2, '0')}
                    </span>
                </div>

                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-1000 ease-linear ${bgClass} shadow-[0_0_10px_currentColor]`}
                        style={{ width: `${percent}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
