
import React, { useState } from 'react';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onGoHome: () => void;
}

const PulseLogo = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="8">
        <circle cx="50" cy="50" r="45" strokeOpacity="0.2" />
        <path d="M20 50 h15 l10 -25 l10 50 l10 -25 h15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView, onGoHome }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'overview', name: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { id: 'vitals', name: 'My Vitals', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 012 2h2a2 2 0 012-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'wearables', name: 'Wearables', icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z' },
    { id: 'appointments', name: 'Appointments', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'documents', name: 'Documents', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'settings', name: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  ];

  const activeItem = navItems.find(i => i.id === currentView) || navItems[0];

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-xl border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('overview')}>
            <div className="w-8 h-8 text-red-600">
                <PulseLogo className="w-full h-full" />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900">Pulsera</span>
          </div>

          {/* Navigation Dropdown Trigger */}
          <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 bg-zinc-50 hover:bg-white hover:shadow-md transition-all duration-200 group"
            >
                <span className="text-sm font-medium text-zinc-600 group-hover:text-red-600 transition-colors">
                    {activeItem.name}
                </span>
                <svg className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Fluid Dropdown Menu */}
            {isOpen && (
                <>
                <div className="fixed inset-0 z-30 bg-transparent" onClick={() => setIsOpen(false)} />
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl shadow-zinc-200/50 border border-zinc-100 p-2 z-40 animate-in slide-in-from-top-2 fade-in duration-200 flex flex-col gap-1">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => { setCurrentView(item.id); setIsOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${
                                currentView === item.id
                                    ? 'bg-red-50 text-red-600' 
                                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                            }`}
                        >
                            <svg className={`w-4 h-4 ${currentView === item.id ? 'text-red-500' : 'text-zinc-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                            </svg>
                            {item.name}
                        </button>
                    ))}
                    <div className="h-px bg-zinc-100 my-1" />
                    <button
                        onClick={onGoHome}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                    </button>
                </div>
                </>
            )}
          </div>

          {/* User Profile Mini */}
          <div className="hidden md:flex items-center gap-3 pl-6 border-l border-zinc-200">
             <div className="text-right">
                <p className="text-sm font-bold text-zinc-900">Alex Rivera</p>
                <p className="text-xs text-zinc-500">ID: 123456</p>
             </div>
             <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs border border-red-200">
                 AR
             </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
