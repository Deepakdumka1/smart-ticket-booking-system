'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User, LogOut } from 'lucide-react';

export function Navbar() {
    const { user, isLoading } = useAuth();

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Failed to log out', error);
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="group flex items-center gap-2">
                            <span className="text-xl font-bold tracking-tight text-white">
                                MOVIE BOOKING<span className="text-cyan-400">Tickets</span>
                            </span>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <div className="hidden md:block">
                        <div className="flex items-baseline space-x-8">
                            <Link href="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                                Events
                            </Link>
                            <Link href="/my-tickets" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                                My Tickets
                            </Link>
                            <Link href="/support" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                                Support
                            </Link>
                        </div>
                    </div>

                    {/* Login/User Button */}
                    <div>
                        {!isLoading && (
                            user ? (
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-slate-300 hidden md:block">
                                        Hi, {user.name}
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-all border border-white/5"
                                        title="Sign Out"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    className="rounded-full bg-white/10 px-6 py-2 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/20 transition-all border border-white/5 active:scale-95 inline-block"
                                >
                                    Sign In
                                </Link>
                            )
                        )}
                    </div>
                </div>
            </div>
            {/* Glass border bottom */}
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </nav>
    );
}
