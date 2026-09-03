import React from 'react';

interface Props {
  onBack: () => void;
}

const PulseLogo = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="8">
        <circle cx="50" cy="50" r="45" strokeOpacity="0.2" />
        <path d="M20 50 h15 l10 -25 l10 50 l10 -25 h15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const PrivacyPage: React.FC<Props> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-white font-inter text-zinc-900">
      <nav className="fixed w-full z-50 top-0 start-0 border-b border-zinc-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 text-red-600">
                <PulseLogo className="w-full h-full" />
            </div>
            <span className="self-center text-xl font-bold tracking-tight text-zinc-900">Pulsera</span>
          </div>
          <button 
            onClick={onBack}
            className="text-sm font-bold text-zinc-500 hover:text-red-600 transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </nav>

      <main className="pt-32 pb-20 max-w-3xl mx-auto px-6">
        <div className="mb-12">
            <h1 className="text-4xl font-black text-zinc-900 mb-6 tracking-tight">Your Privacy is Our Priority</h1>
            <p className="text-xl text-zinc-500 leading-relaxed font-medium">
                At Pulsera, we believe that your health data belongs to you—and only you. 
                We have built our platform with a privacy-first architecture to ensure your sensitive medical information remains secure, private, and under your control.
            </p>
        </div>

        <div className="space-y-12">
            <section>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-50 rounded-lg text-red-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-900">No Data Selling</h2>
                </div>
                <div className="pl-14">
                    <p className="text-zinc-600 mb-4 leading-relaxed">
                        Pulsera <strong className="text-zinc-900">does not store or sell your medical data</strong> to third parties, advertisers, or insurance companies. 
                        We generate revenue through our premium software subscription, not by monetizing your personal health history.
                    </p>
                </div>
            </section>

            <section>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-900">Encryption & Security</h2>
                </div>
                <div className="pl-14">
                    <p className="text-zinc-600 mb-4 leading-relaxed">
                        All data transmitted between your device and our servers is encrypted using industry-standard TLS 1.3 protocols. Data at rest is encrypted using AES-256 standards.
                        Only you and the medical professionals you explicitly authorize have access to your decryption keys.
                    </p>
                </div>
            </section>

            <section>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-900">Permission-Based Sharing</h2>
                </div>
                <div className="pl-14">
                    <p className="text-zinc-600 mb-4 leading-relaxed">
                        Your data is yours. You can choose to share specific reports with your doctor or revoke access at any time. 
                        Pulsera acts as a secure custodian, not an owner. We never share your data without your explicit, one-time permission for each instance.
                    </p>
                </div>
            </section>
        </div>

        <div className="mt-16 pt-8 border-t border-zinc-200 text-center">
            <p className="text-zinc-400 text-sm">
                For more details, please contact our Data Protection Officer at <a href="#" className="text-red-600 underline font-semibold">privacy@pulsera.health</a>
            </p>
        </div>
      </main>
    </div>
  );
};