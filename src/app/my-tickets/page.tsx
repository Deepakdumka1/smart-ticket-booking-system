'use client';

import { Suspense, useEffect, useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { useAuth } from '@/hooks/useAuth';
import { Seat } from '@/types/seat';
import { Ticket, Calendar, MapPin, Download, QrCode, Home, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { QRCodeModal } from '@/components/QRCodeModal';
import { downloadTicketAsImage } from '@/lib/ticketDownload';

function MyTicketsContent() {
    const userId = useUser();
    const { user } = useAuth();
    const [tickets, setTickets] = useState<Seat[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<{ id: string; seatInfo: string } | null>(null);

    useEffect(() => {
        if (!userId) return;

        const fetchTickets = async () => {
            try {
                const res = await fetch(`/api/my-tickets?userId=${userId}`, { cache: 'no-store' });
                if (!res.ok) throw new Error('Failed to fetch tickets');
                const data = await res.json();
                setTickets(data.tickets || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, [userId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center p-6 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
            </div>

            <div className="w-full max-w-4xl z-10">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
                    >
                        <Home className="w-4 h-4" />
                        <span>Back to Home</span>
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center gap-3">
                        <Ticket className="w-10 h-10 text-cyan-400" />
                        My Tickets
                    </h1>
                    <p className="text-slate-300 text-lg">
                        View and manage your booked tickets
                    </p>
                </div>

                {/* Tickets List */}
                {tickets.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <Ticket className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">No Tickets Yet</h2>
                        <p className="text-slate-400 mb-6">
                            You haven't booked any tickets yet. Start exploring events!
                        </p>
                        <Link
                            href="/"
                            className="btn-primary inline-flex items-center gap-2"
                        >
                            Browse Events
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tickets.map((ticket) => (
                            <div key={ticket.id} className="glass-card p-6 hover:scale-[1.02] transition-transform duration-300">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                                                <Ticket className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white">
                                                    Seat {ticket.row}{ticket.number}
                                                </h3>
                                                <p className="text-sm text-slate-400">
                                                    Row {ticket.row}, Seat {ticket.number}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-slate-300 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-purple-400" />
                                                <span>Booked</span>
                                            </div>
                                            {ticket.bookedAt && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-cyan-400" />
                                                    <span>
                                                        {new Date(ticket.bookedAt).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setSelectedTicket({ id: ticket.id, seatInfo: `${ticket.row}${ticket.number}` })}
                                            className="p-3 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                                            title="View QR Code"
                                        >
                                            <QrCode className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (!user) {
                                                    alert('Please sign in to download your ticket');
                                                    return;
                                                }
                                                if (ticket.bookedAt) {
                                                    downloadTicketAsImage({
                                                        ticketId: ticket.id,
                                                        seatInfo: `${ticket.row}${ticket.number}`,
                                                        row: ticket.row,
                                                        number: ticket.number,
                                                        bookedAt: ticket.bookedAt,
                                                        userName: user.name,
                                                        userEmail: user.email
                                                    });
                                                }
                                            }}
                                            className="p-3 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                                            title="Download Ticket"
                                        >
                                            <Download className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* QR Code Modal */}
            {selectedTicket && (
                <QRCodeModal
                    isOpen={!!selectedTicket}
                    onClose={() => setSelectedTicket(null)}
                    ticketId={selectedTicket.id}
                    seatInfo={selectedTicket.seatInfo}
                />
            )}
        </div>
    );
}

export default function MyTicketsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
        }>
            <MyTicketsContent />
        </Suspense>
    );
}
