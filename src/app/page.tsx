import Link from 'next/link';
import { Sparkles, Calendar, MapPin, Ticket, ArrowRight, Star, Music, Zap } from 'lucide-react';

export default function Home() {
  const events = [
    {
      id: 1,
      name: " Stand-up comedy",
      date: "Oct 24, 2026",
      location: " Delhi",
      image: "/stand1.jpeg",
      imageType: "file",
      price: "$150",
      status: "Selling Fast"
    },
    {
      id: 2,
      name: " Arijit Singh Live",
      date: "Nov 12, 2026",
      location: "Ambience Mall,Delhi",
      image: "/arijit.jpeg",
      imageType: "file",
      price: "$85",
      status: "Available"
    },
    {
      id: 3,
      name: "Fun NIght With Kapil",
      date: "Dec 05, 2026",
      location: "DU university ,Delhi",
      image: "/kapil.jpeg",
      imageType: "file",
      price: "$200",
      status: "Limited"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center relative overflow-hidden">
      {/* Hero Section */}
      <section className="w-full relative pt-32 pb-20 px-4 flex flex-col items-center text-center z-10">
        {/* Background Ambience */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-cyan-300 text-sm font-medium mb-8 backdrop-blur-md shadow-glow animate-float">
          <Sparkles className="w-4 h-4" />
          <span>The Future of Live Events</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-white mb-8 leading-tight">
          Experience <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]">
            The Moment
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
          Secure seats for the world's most exclusive events in real-time.
          Immersive booking, instant confirmation, zero friction.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="#events"
            className="btn-primary flex items-center gap-2 group"
          >
            <Ticket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Browse Events
          </Link>
          <button className="btn-secondary flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Music className="w-4 h-4 text-white" />
            </div>
            <span>Watch Trailer</span>
          </button>
        </div>
      </section>

      {/* Featured Events */}
      <section id="events" className="w-full max-w-7xl px-4 py-20 z-10">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Zap className="w-6 h-6 text-yellow-500" />
            Trending Now
          </h2>
          <Link href="/events" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-sm font-medium transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {events.map((event) => (
            <div key={event.id} className="glass-card group hover:-translate-y-2 transition-transform duration-300 overflow-hidden">
              {/* Image */}
              <div className="h-48 w-full relative group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                {event.imageType === 'file' ? (
                  <img 
                    src={event.image} 
                    alt={event.name}
                    className="w-full h-full object-contain bg-gradient-to-br from-slate-900/50 to-slate-800/50"
                  />
                ) : (
                  <div className={`h-full w-full bg-gradient-to-br ${event.image}`} />
                )}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/10">
                  {event.status}
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">{event.name}</h3>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">{event.price}</p>
                    <p className="text-xs text-slate-500">Starting at</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-slate-300 text-sm mb-6 pb-6 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    {event.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    4.9
                  </div>
                </div>

                <Link
                  href={`/seats?eventId=${event.id}`}
                  className="w-full block text-center py-3 rounded-lg bg-white/5 border border-white/10 text-white font-medium hover:bg-cyan-500 hover:border-cyan-500 hover:text-black transition-all duration-300"
                >
                  Select Seats
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
