import React, { useState } from 'react';
import { apiClient, getApiBaseUrl, setApiBaseUrl } from '../services/apiClient';

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
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('30');
  const [condition, setCondition] = useState('General Health');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [serverUrl, setServerUrl] = useState(getApiBaseUrl());
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [serverSavedMsg, setServerSavedMsg] = useState('');

  const fillDemo = () => {
    setEmail('alex@example.com');
    setPassword('password123');
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      if (isRegister) {
        const data = await apiClient.post<{ token: string; user: any }>('/api/auth/register', {
          email,
          password,
          name,
          age: Number(age),
          condition,
        });
        apiClient.setToken(data.token);
      } else {
        const data = await apiClient.post<{ token: string; user: any }>('/api/auth/login', {
          email,
          password,
        });
        apiClient.setToken(data.token);
      }
      onLogin();
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials or backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-zinc-50 font-inter">
      {/* Liquid Background Elements */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-400/20 rounded-full mix-blend-multiply filter blur-[80px] animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-400/20 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-pink-400/20 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6 my-8">
        {/* Glass Card */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_0_rgba(200,50,50,0.07)] rounded-3xl p-8 md:p-10 animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center mb-6 relative">
            <button
              onClick={onBack}
              className="absolute top-0 left-0 text-zinc-400 hover:text-zinc-800 transition-colors p-1"
              title="Go Back"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl text-red-600 mb-3">
              <PulseLogo className="w-full h-full" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900">
              {isRegister ? 'Create Your Account' : 'Welcome Back'}
            </h2>
            <p className="text-zinc-500 text-sm mt-1">
              {isRegister ? 'Sign up to start tracking your health' : 'Enter your credentials to access Pulsera'}
            </p>
          </div>

          {/* Quick Demo Pill */}
          {!isRegister && (
            <div className="mb-5 bg-red-50/70 border border-red-100 rounded-xl p-2.5 flex items-center justify-between text-xs">
              <span className="text-red-800 font-medium">Testing locally?</span>
              <button
                type="button"
                onClick={fillDemo}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-2.5 py-1 rounded-lg transition-colors shadow-sm"
              >
                Use Demo Account
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-1 ml-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-zinc-200 focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-zinc-400 text-zinc-800 text-sm"
                    placeholder="Alex Rivera"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 mb-1 ml-1">Age</label>
                    <input
                      type="number"
                      required
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-zinc-200 focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-zinc-400 text-zinc-800 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 mb-1 ml-1">Condition</label>
                    <input
                      type="text"
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-zinc-200 focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-zinc-400 text-zinc-800 text-sm"
                      placeholder="Hypertension"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-1 ml-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-zinc-200 focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-zinc-400 text-zinc-800 text-sm"
                placeholder="alex@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-1 ml-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-zinc-200 focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-zinc-400 text-zinc-800 text-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 mt-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {isRegister ? 'Creating Account...' : 'Signing In...'}
                </span>
              ) : isRegister ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-zinc-500">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setErrorMessage('');
                }}
                className="font-bold text-red-600 hover:text-red-800 hover:underline"
              >
                {isRegister ? 'Sign in instead' : 'Create an account'}
              </button>
            </p>
          </div>

          {/* Server Connection Setting */}
          <div className="mt-6 pt-4 border-t border-zinc-100 text-center">
            <button
              type="button"
              onClick={() => setShowServerConfig(!showServerConfig)}
              className="text-[11px] text-zinc-400 hover:text-zinc-600 flex items-center justify-center gap-1 mx-auto"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Server: {getApiBaseUrl()}</span>
            </button>

            {showServerConfig && (
              <div className="mt-3 p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-left space-y-2 animate-in fade-in duration-200">
                <label className="block text-[10px] font-bold uppercase text-zinc-500">Backend Server URL</label>
                <input
                  type="text"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  placeholder="http://192.168.1.36:5001"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 text-xs text-zinc-800"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setServerUrl('http://192.168.1.36:5001');
                      setApiBaseUrl('http://192.168.1.36:5001');
                      setServerSavedMsg('Reset to local Wi-Fi IP');
                      setTimeout(() => setServerSavedMsg(''), 2000);
                    }}
                    className="text-[11px] text-zinc-500 hover:text-zinc-700 px-2 py-1"
                  >
                    Reset Default
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setApiBaseUrl(serverUrl);
                      setServerSavedMsg('Server URL updated!');
                      setTimeout(() => setServerSavedMsg(''), 2000);
                    }}
                    className="bg-zinc-800 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md hover:bg-zinc-900"
                  >
                    Save URL
                  </button>
                </div>
                {serverSavedMsg && <p className="text-[10px] text-green-600 text-center">{serverSavedMsg}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};