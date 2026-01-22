import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lumina Tickets | Experience the Moment",
  description: "High-speed, premium ticket booking for exclusive events.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-cyan-500/30 selection:text-cyan-200`}
      >
        <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 items-center justify-between">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Link href="/" className="group flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300" />
                  <span className="text-xl font-bold tracking-tight text-white">
                    Lumina<span className="text-cyan-400">Tickets</span>
                  </span>
                </Link>
              </div>
              
              {/* Navigation */}
              <div className="hidden md:block">
                <div className="flex items-baseline space-x-8">
                  <Link href="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                    Events
                  </Link>
                  <Link href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                    My Tickets
                  </Link>
                  <Link href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                    Support
                  </Link>
                </div>
              </div>

              {/* Login Button */}
              <div>
                <button className="rounded-full bg-white/10 px-6 py-2 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/20 transition-all border border-white/5 active:scale-95">
                  Sign In
                </button>
              </div>
            </div>
          </div>
          {/* Glass border bottom */}
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </nav>

        <main className="pt-20 min-h-screen relative z-10">
          {children}
        </main>
        
        <footer className="border-t border-white/5 bg-slate-950/50 backdrop-blur-xl mt-20">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <p className="text-center text-sm text-slate-500">
                    &copy; 2026 Lumina Tickets. All rights reserved.
                </p>
            </div>
        </footer>
      </body>
    </html>
  );
}
