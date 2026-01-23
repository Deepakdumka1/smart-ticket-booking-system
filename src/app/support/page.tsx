'use client';

import { MessageCircle, Mail, Phone, HelpCircle, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

export default function SupportPage() {
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
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Home</span>
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center gap-3">
                        <MessageCircle className="w-10 h-10 text-cyan-400" />
                        Support
                    </h1>
                    <p className="text-slate-300 text-lg">
                        We're here to help you with any questions or issues
                    </p>
                </div>

                {/* Contact Methods */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="glass-card p-6 hover:scale-[1.02] transition-transform duration-300">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                                <Mail className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Email Support</h3>
                                <p className="text-sm text-slate-400">Get help via email</p>
                            </div>
                        </div>
                        <a
                            href="mailto:support@moviebooking.com"
                            className="text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                            support@moviebooking.com
                        </a>
                    </div>

                    <div className="glass-card p-6 hover:scale-[1.02] transition-transform duration-300">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                                <Phone className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Phone Support</h3>
                                <p className="text-sm text-slate-400">Call us directly</p>
                            </div>
                        </div>
                        <a
                            href="tel:+1-800-555-0123"
                            className="text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                            +1 (800) 555-0123
                        </a>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="glass-card p-6 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <HelpCircle className="w-6 h-6 text-cyan-400" />
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        <div className="border-b border-white/5 pb-4">
                            <h3 className="text-lg font-semibold text-white mb-2">
                                How do I book tickets?
                            </h3>
                            <p className="text-slate-300">
                                Browse our events on the home page, select an event, choose your seats, and complete the checkout process.
                            </p>
                        </div>
                        <div className="border-b border-white/5 pb-4">
                            <h3 className="text-lg font-semibold text-white mb-2">
                                Can I cancel my booking?
                            </h3>
                            <p className="text-slate-300">
                                Cancellation policies vary by event. Please contact our support team for assistance with cancellations.
                            </p>
                        </div>
                        <div className="border-b border-white/5 pb-4">
                            <h3 className="text-lg font-semibold text-white mb-2">
                                How do I view my tickets?
                            </h3>
                            <p className="text-slate-300">
                                You can view all your booked tickets in the "My Tickets" section. Each ticket includes a QR code for entry.
                            </p>
                        </div>
                        <div className="pb-4">
                            <h3 className="text-lg font-semibold text-white mb-2">
                                What payment methods do you accept?
                            </h3>
                            <p className="text-slate-300">
                                We accept all major credit cards, debit cards, and digital payment methods through our secure checkout.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="glass-card p-6">
                    <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>
                    <form className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                                placeholder="Your name"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                                placeholder="your.email@example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                                Message
                            </label>
                            <textarea
                                id="message"
                                rows={5}
                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                                placeholder="How can we help you?"
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            <Send className="w-5 h-5" />
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
