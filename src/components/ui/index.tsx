import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';

/* ---------- Toasts ---------- */
type Toast = { id: number; kind: 'success' | 'error'; text: string };
const ToastCtx = createContext<{ notify: (kind: Toast['kind'], text: string) => void }>({ notify: () => {} });
export const useToast = () => useContext(ToastCtx);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const notify = useCallback((kind: Toast['kind'], text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);

  return (
    <ToastCtx.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[70] flex w-[min(92vw,380px)] flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`sheet-in flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm shadow-lg ${
              t.kind === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-rose-200 bg-rose-50 text-rose-900'
            }`}
          >
            {t.kind === 'success' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
            <span className="flex-1">{t.text}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
};

/* ---------- Modal ---------- */
export const Modal: React.FC<{
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}> = ({ title, onClose, children, footer, wide }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
        className={`sheet-in flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl ${wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'}`}
      >
        <div className="no-print flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-base font-bold">{title}</h2>
          <button className="btn-ghost !p-1.5" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="no-print flex flex-wrap justify-end gap-2 border-t border-line px-5 py-3.5">{footer}</div>}
      </div>
    </div>
  );
};

/* ---------- Small pieces ---------- */
export const Spinner: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => <Loader2 className={`animate-spin ${className}`} />;

export const PageHeader: React.FC<{ title: string; hint?: string; actions?: React.ReactNode }> = ({ title, hint, actions }) => (
  <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
      {hint && <p className="mt-0.5 text-sm text-muted">{hint}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export const LoadingBlock: React.FC<{ label?: string }> = ({ label = 'Loading…' }) => (
  <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted">
    <Spinner /> {label}
  </div>
);

export const ErrorBlock: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-10 text-center">
    <AlertCircle className="h-6 w-6 text-rose-600" />
    <p className="max-w-md text-sm text-rose-900">{message}</p>
    {onRetry && (
      <button className="btn-secondary" onClick={onRetry}>
        Try again
      </button>
    )}
  </div>
);

export const EmptyState: React.FC<{ icon: React.ReactNode; title: string; hint?: string; action?: React.ReactNode }> = ({
  icon,
  title,
  hint,
  action,
}) => (
  <div className="flex flex-col items-center gap-2 px-4 py-14 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">{icon}</div>
    <p className="font-bold">{title}</p>
    {hint && <p className="max-w-sm text-sm text-muted">{hint}</p>}
    {action && <div className="mt-2">{action}</div>}
  </div>
);

type Tone = 'green' | 'amber' | 'red' | 'gray' | 'teal' | 'blue';
const tones: Record<Tone, string> = {
  green: 'bg-emerald-50 text-emerald-800',
  amber: 'bg-tag-50 text-tag-700',
  red: 'bg-rose-50 text-rose-800',
  gray: 'bg-slate-100 text-slate-600',
  teal: 'bg-brand-50 text-brand-700',
  blue: 'bg-sky-50 text-sky-800',
};
export const Badge: React.FC<{ tone?: Tone; children: React.ReactNode }> = ({ tone = 'gray', children }) => (
  <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>
);

export const Field: React.FC<{ label: string; hint?: string; error?: string; children: React.ReactNode }> = ({ label, hint, error, children }) => (
  <label className="block">
    <span className="mb-1 block text-sm font-semibold">{label}</span>
    {children}
    {error ? (
      <span className="mt-1 block text-xs text-rose-700">{error}</span>
    ) : (
      hint && <span className="mt-1 block text-xs text-muted">{hint}</span>
    )}
  </label>
);

export const Segmented = <T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
}) => (
  <div className="inline-flex rounded-[10px] border border-line bg-white p-0.5" role="group">
    {options.map((o) => (
      <button
        key={o.value}
        onClick={() => onChange(o.value)}
        aria-pressed={value === o.value}
        className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
          value === o.value ? 'bg-brand-600 text-white' : 'text-muted hover:text-ink'
        }`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

export const StatTile: React.FC<{ label: string; value: string; sub?: string; icon: React.ReactNode; tone?: 'teal' | 'amber' | 'blue' | 'rose' }> = ({
  label,
  value,
  sub,
  icon,
  tone = 'teal',
}) => {
  const bg = { teal: 'bg-brand-50 text-brand-700', amber: 'bg-tag-50 text-tag-700', blue: 'bg-sky-50 text-sky-700', rose: 'bg-rose-50 text-rose-700' }[tone];
  return (
    <div className="panel flex items-center gap-3.5 p-4">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bg}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-sm text-muted">{label}</p>
        <p className="num truncate text-xl font-extrabold leading-tight">{value}</p>
        {sub && <p className="text-xs text-muted">{sub}</p>}
      </div>
    </div>
  );
};

/** Horizontal bar used in simple charts. */
export const Bar: React.FC<{ pct: number; tone?: 'teal' | 'amber' | 'red' }> = ({ pct, tone = 'teal' }) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
    <div
      className={`h-full rounded-full ${tone === 'teal' ? 'bg-brand-500' : tone === 'amber' ? 'bg-tag-400' : 'bg-rose-500'}`}
      style={{ width: `${Math.max(2, Math.min(100, pct))}%` }}
    />
  </div>
);
