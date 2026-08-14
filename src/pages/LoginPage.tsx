import React, { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('sarah.j@hopecommunitypantry.org');
  const [password, setPassword] = useState('••••••••••••');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      onLogin(email);
    }, 500);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-5 font-sans relative"
      style={{
        backgroundImage: 'url(/login-bg-pattern.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Light overlay to ensure form readability over the pattern */}
      <div className="absolute inset-0 bg-[#f5f5f7]/80 backdrop-blur-[1px]"></div>
      
      <div className="max-w-sm w-full relative z-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border border-[#e5e5ea] shadow-sm">
            <img src="/accessbelt-official-logo.png" alt="AccessBelt" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight font-display">
            Sign in to AccessBelt
          </h1>
          <p className="text-[14px] text-[#86868b] mt-1">
            Operator portal for pantry management
          </p>
        </div>

        {/* Login Card */}
        <div className="card p-6 bg-white shadow-sm">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-[#ff3b30]/10 border border-[#ff3b30]/20 text-[#ff3b30] text-[13px] font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#86868b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@organization.org"
                  className="w-full pl-10 pr-4 py-2.5 text-[14px] rounded-xl border border-[#e5e5ea] focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 bg-white placeholder:text-[#86868b]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[13px] font-semibold text-[#1d1d1f]">Password</label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Password reset link sent to your email."); }} className="text-[12px] font-semibold text-[#0071e3] hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#86868b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-[14px] rounded-xl border border-[#e5e5ea] focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 bg-white placeholder:text-[#86868b]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-[#0071e3] hover:bg-[#0077ed] text-white text-[14px] font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-xs mt-2"
            >
              {isSubmitting ? (
                <span>Signing in…</span>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo helper */}
          <div className="mt-5 pt-4 border-t border-[#e5e5ea] flex items-center justify-between">
            <span className="text-[12px] text-[#86868b]">Demo mode</span>
            <button
              onClick={() => {
                setEmail('sarah.j@hopecommunitypantry.org');
                setPassword('demo-accessbelt-2026');
              }}
              className="text-[12px] font-semibold text-[#0071e3] hover:underline cursor-pointer"
            >
              Autofill credentials
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-[12px] text-center text-[#86868b] mt-6">
          AccessBelt Network © 2026
        </p>
      </div>
    </div>
  );
};
