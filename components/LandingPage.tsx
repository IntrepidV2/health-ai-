import React from 'react';

interface Props {
  onGetStarted: () => void;
  onPrivacy?: () => void;
}

const PulseLogo = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="8">
        <circle cx="50" cy="50" r="45" strokeOpacity="0.2" />
        <path d="M20 50 h15 l10 -25 l10 50 l10 -25 h15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const LandingPage: React.FC<Props> = ({ onGetStarted, onPrivacy }) => {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-inter selection:bg-red-500/20 selection:text-red-700 relative overflow-hidden flex flex-col">
      
      {/* Background Shaders/Blobs */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[20%] w-[40rem] h-[40rem] bg-red-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob"></div>
          <div className="absolute top-[10%] right-[10%] w-[35rem] h-[35rem] bg-orange-300/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[-10%] left-[30%] w-[45rem] h-[45rem] bg-rose-300/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000"></div>
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* Navbar - Floating Glass */}
      <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-sm rounded-full px-6 py-3 flex items-center justify-between gap-12 max-w-2xl w-full">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 text-red-600">
                    <PulseLogo className="w-full h-full" />
                </div>
                <span className="font-bold text-lg tracking-tight">Pulsera</span>
            </div>
            
            <div className="flex items-center gap-2">
                <button 
                    onClick={onPrivacy}
                    className="text-sm font-medium text-zinc-600 hover:text-zinc-900 px-4 py-2 rounded-full hover:bg-zinc-100 transition-colors"
                >
                    Privacy
                </button>
                <button 
                    onClick={onGetStarted}
                    className="bg-zinc-900 text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-black hover:scale-105 transition-all shadow-lg shadow-zinc-900/20"
                >
                    Get Started
                </button>
            </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center pt-32 pb-20 px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 border border-red-100 text-red-600 text-xs font-bold uppercase tracking-wider mb-8 shadow-sm backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
             <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
             AI Health Intelligence
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-zinc-900 mb-6 max-w-4xl leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Vital insights. <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-orange-500 to-rose-600">
                Instant clarity.
            </span>
        </h1>
        
        <p className="text-xl text-zinc-500 max-w-xl mb-10 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-100">
            Merge your hospital records with daily vitals. Let our AI detect patterns before they become problems.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
            <button 
                onClick={onGetStarted}
                className="h-14 px-8 rounded-full bg-red-600 text-white font-bold text-lg hover:bg-red-700 transition-all shadow-xl shadow-red-500/30 hover:shadow-2xl hover:-translate-y-1 flex items-center gap-2 group"
            >
                Start Monitoring
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
            </button>
        </div>
      </section>

      {/* Feature Bento Grid - Glassmorphism */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1 */}
            <div className="group bg-white/40 backdrop-blur-md border border-white/60 p-8 rounded-3xl shadow-xl shadow-zinc-200/50 hover:bg-white/60 transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-br from-red-50 to-white rounded-2xl flex items-center justify-center text-red-600 shadow-inner mb-6 border border-white">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 012 2h2a2 2 0 012-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2">Unified Analytics</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                    Connect manual logs with hospital uploads. See your complete health timeline in one beautiful interface.
                </p>
            </div>

            {/* Card 2 - Highlighted */}
            <div className="group bg-gradient-to-br from-zinc-900 to-zinc-950 p-8 rounded-3xl shadow-2xl shadow-zinc-900/20 text-white relative overflow-hidden md:scale-105 transform transition-transform duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="w-12 h-12 bg-zinc-800/80 rounded-2xl flex items-center justify-center text-red-400 mb-6 border border-zinc-700">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Pulse AI Engine</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                    Powered by Gemini 3. Proactive risk analysis that detects subtle micro-trends before they become critical.
                </p>
            </div>

            {/* Card 3 */}
            <div className="group bg-white/40 backdrop-blur-md border border-white/60 p-8 rounded-3xl shadow-xl shadow-zinc-200/50 hover:bg-white/60 transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-br from-red-50 to-white rounded-2xl flex items-center justify-center text-red-600 shadow-inner mb-6 border border-white">
                     <PulseLogo className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2">Assistant Pulse</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                    Your personal medical companion. Ask complex questions and get grounded, simple answers instantly.
                </p>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center">
          <p className="text-zinc-400 text-sm font-medium">© 2024 Pulsera Health Inc. All rights reserved.</p>
      </footer>

    </div>
  );
};