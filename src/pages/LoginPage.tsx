import React, { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export const LoginPage: React.FC = () => {
  const { signIn, mode } = useAuth();
  const isDemo = mode === 'Demo Data';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await signIn(email, password);
    } catch (err) {
      // Never echo which half was wrong — that confirms whether an account exists.
      setError(
        err instanceof Error && err.message.includes('auth/')
          ? 'That email and password combination was not recognised.'
          : 'Could not sign you in. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="absolute inset-0 bg-sunken/80 backdrop-blur-[1px]"></div>
      
      <div className="max-w-sm w-full relative z-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border border-line shadow-sm">
            <img src="/accessbelt-official-logo.png" alt="AccessBelt" className="w-full h-full object-cover" />
          </div>
          <h1 className="page-title">Sign in to AccessBelt</h1>
          <p className="page-subtitle">Operator portal</p>
        </div>

        {/* Login Card */}
        <div className="card p-6 bg-surface shadow-sm">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-danger-tint border border-danger/20 text-danger-text text-sm font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="field-label">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-fg-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@organization.org"
                  className="w-full py-2.5 pl-10 pr-4"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-fg">Password</label>
                <a href="#forgot" className="text-xs font-semibold text-accent-text hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-fg-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full py-2.5 pl-10 pr-4"
                />
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn btn-primary mt-2 w-full">
              {isSubmitting ? (
                <span>Signing in…</span>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {isDemo && (
            <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
              <span className="meta">Demonstration mode</span>
              <button
                type="button"
                onClick={() => {
                  setEmail('operator@example.org');
                  setPassword('demo');
                }}
                className="text-xs font-semibold text-accent-text hover:underline"
              >
                Fill sample details
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-xs text-center text-fg-muted mt-6">
          AccessBelt Network · 2026
        </p>
      </div>
    </div>
  );
};
