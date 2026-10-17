import React, { useState } from 'react';
import { Boxes, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Field, Spinner } from '../ui';

const DEMO = { identifier: 'STR-MGR-01', password: 'admin123' };

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!identifier.trim() || !password) return;
    setBusy(true);
    setError('');
    try {
      await login(identifier.trim(), password);
    } catch (err: any) {
      setError(err?.message || 'Sign in failed. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Brand side */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-brand-900 p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tag-400 text-brand-900">
            <Boxes className="h-5 w-5" />
          </div>
          <span className="text-lg font-extrabold tracking-tight">Khushbu Electronic Store</span>
        </div>

        <div>
          <h2 className="max-w-md text-4xl font-extrabold leading-[1.1] tracking-tight">
            Know what’s on the shelf before the customer asks.
          </h2>
          <p className="mt-4 max-w-md text-brand-100/80">
            Ring up sales, receive stock and watch reorder levels in one place. Every change is logged against the person who made it.
          </p>

          {/* Price-tag motif: three sample stock lines */}
          <div className="mt-10 max-w-sm rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10">
            {[
              ['Galaxy S24 Ultra', '11 in stock', 'bg-emerald-400'],
              ['iPhone 16 Pro', '3 left — reorder', 'bg-tag-400'],
              ['Sony WH-1000XM5', 'Out of stock', 'bg-rose-400'],
            ].map(([name, state, dot]) => (
              <div key={name} className="flex items-center justify-between border-b border-white/10 py-2.5 last:border-0">
                <span className="text-sm font-semibold">{name}</span>
                <span className="flex items-center gap-2 text-sm text-brand-100/80">
                  <span className={`h-2 w-2 rounded-full ${dot}`} />
                  {state}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-brand-100/60">Retail inventory & sales management</p>
      </aside>

      {/* Form side */}
      <main className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm" noValidate>
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Boxes className="h-5 w-5" />
            </div>
            <span className="text-lg font-extrabold tracking-tight">Khushbu Electronic Store</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight">Sign in</h1>
          <p className="mt-1.5 text-sm text-muted">Use your employee code or email to open the store dashboard.</p>

          <div className="mt-7 space-y-4">
            <Field label="Employee code or email" error={touched && !identifier.trim() ? 'Enter your employee code or email.' : undefined}>
              <input
                className="field"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                autoFocus
                placeholder="STR-MGR-01"
              />
            </Field>

            <Field label="Password" error={touched && !password ? 'Enter your password.' : undefined}>
              <div className="relative">
                <input
                  className="field pr-10"
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute inset-y-0 right-0 px-3 text-muted hover:text-ink"
                  aria-label={show ? 'Hide password' : 'Show password'}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
          </div>

          {error && (
            <p role="alert" className="mt-4 rounded-[10px] border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {error}
            </p>
          )}

          <button type="submit" disabled={busy} className="btn-primary mt-6 w-full !py-2.5">
            {busy ? <Spinner /> : <LogIn className="h-4 w-4" />}
            {busy ? 'Signing in…' : 'Sign in'}
          </button>

          <div className="mt-6 rounded-xl border border-dashed border-line bg-white px-4 py-3 text-sm">
            <p className="font-semibold">Demo access for reviewers</p>
            <p className="mt-0.5 text-muted">
              <span className="num">{DEMO.identifier}</span> / <span className="num">{DEMO.password}</span>
            </p>
            <button
              type="button"
              className="mt-2 text-sm font-semibold text-brand-700 hover:underline"
              onClick={() => {
                setIdentifier(DEMO.identifier);
                setPassword(DEMO.password);
              }}
            >
              Fill demo login
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
