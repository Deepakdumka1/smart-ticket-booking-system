'use client';

import { QRCodeSVG } from 'qrcode.react';
import { X } from 'lucide-react';

interface QRCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticketId: string;
    seatInfo: string;
}

export function QRCodeModal({ isOpen, onClose, ticketId, seatInfo }: QRCodeModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="relative bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-2">Ticket QR Code</h3>
                    <p className="text-slate-400 mb-6 font-mono text-sm">ID: {ticketId.slice(0, 8)}...</p>

                    <div className="bg-white p-4 rounded-xl inline-block mb-6">
                        <QRCodeSVG
                            value={JSON.stringify({ ticketId, seatInfo })}
                            size={200}
                            level="H"
                            includeMargin={false}
                        />
                    </div>

                    <div className="mt-2">
                        <p className="text-white font-medium text-lg">Seat {seatInfo}</p>
                        <p className="text-xs text-slate-500 mt-2">Scan to verify ticket</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
