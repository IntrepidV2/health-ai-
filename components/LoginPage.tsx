import React, { useState } from 'react';

interface Props {
  onLogin: () => void;
  onBack: () => void;
}

const PulseLogo = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="8">
        <circle cx="50" cy="50" r="45" strokeOpacity="0.2" />
        <path d="M20 50 h15 l10 -25 l10 50 l10 -25 h15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const LoginPage: React.FC<Props> = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
        setLoading(false);
        onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-zinc-50 font-inter">
        
      {/* Liquid Background Elements */}
      <div className="absolute inset-0 w-full h-full">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-400/20 rounded-full mix-blend-multiply filter blur-[80px] animate-blob"></div>
         <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-400/20 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-2000"></div>
         <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-pink-400/20 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Glass Card */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_0_rgba(200,50,50,0.07)] rounded-3xl p-8 md:p-10 animate-in fade-in zoom-in-95 duration-500">
            
            <div className="text-center mb-8">
                <button onClick={onBack} className="absolute top-6 left-6 text-zinc-400 hover:text-zinc-800 transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl text-red-600 mb-4">
                    <PulseLogo className="w-full h-full" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900">Welcome Back</h2>
                <p className="text-zinc-500 text-sm mt-2">Enter your credentials to access Pulsera</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5 ml-1">Email Address</label>
                    <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/80 border border-zinc-200 focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-zinc-400 text-zinc-800"
                        placeholder="alex@example.com" 
                    />
                </div>
                
                <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5 ml-1">Password</label>
                    <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/80 border border-zinc-200 focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-zinc-400 text-zinc-800"
                        placeholder="••••••••" 
                    />
                    <div className="flex justify-end mt-2">
                        <a href="#" className="text-xs font-bold text-red-600 hover:text-red-800 hover:underline">Forgot password?</a>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Signing In...
                        </span>
                    ) : 'Sign In'}
                </button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-sm text-zinc-500">
                    Don't have an account?{' '}
                    <button onClick={() => alert("Sign up is disabled for this demo.")} className="font-bold text-red-600 hover:text-red-800 hover:underline">
                        Create free account
                    </button>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};