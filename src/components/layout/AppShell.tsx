import React, { useEffect, useState } from 'react';
import { AlertTriangle, BarChart3, Boxes, ClipboardList, LayoutDashboard, LogOut, Menu, Package, Receipt, ShoppingCart, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/retailApiService';

export type PageId = 'dashboard' | 'sale' | 'products' | 'low-stock' | 'history' | 'sales' | 'reports';

const NAV: Array<{ id: PageId; label: string; icon: React.ReactNode }> = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-[18px] w-[18px]" /> },
  { id: 'sale', label: 'New sale', icon: <ShoppingCart className="h-[18px] w-[18px]" /> },
  { id: 'products', label: 'Products', icon: <Package className="h-[18px] w-[18px]" /> },
  { id: 'low-stock', label: 'Low stock', icon: <AlertTriangle className="h-[18px] w-[18px]" /> },
  { id: 'history', label: 'Stock history', icon: <ClipboardList className="h-[18px] w-[18px]" /> },
  { id: 'sales', label: 'Sales', icon: <Receipt className="h-[18px] w-[18px]" /> },
  { id: 'reports', label: 'Reports', icon: <BarChart3 className="h-[18px] w-[18px]" /> },
];

export const AppShell: React.FC<{
  page: PageId;
  onNavigate: (p: PageId) => void;
  /** Bump to refresh the low-stock badge after stock changes. */
  stockVersion: number;
  children: React.ReactNode;
}> = ({ page, onNavigate, stockVersion, children }) => {
  const { user, roleLabel, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [lowCount, setLowCount] = useState(0);

  useEffect(() => {
    let alive = true;
    api
      .getLowStock()
      .then((l) => alive && setLowCount(l.length))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [stockVersion, page]);

  const go = (p: PageId) => {
    onNavigate(p);
    setOpen(false);
  };

  const nav = (
    <nav className="flex-1 space-y-0.5 px-3" aria-label="Main">
      {NAV.map((n) => {
        const active = n.id === page;
        return (
          <button
            key={n.id}
            onClick={() => go(n.id)}
            aria-current={active ? 'page' : undefined}
            className={`flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-semibold transition-colors ${
              active ? 'bg-white/12 text-white' : 'text-brand-100/75 hover:bg-white/6 hover:text-white'
            }`}
          >
            <span className={active ? 'text-tag-400' : ''}>{n.icon}</span>
            <span className="flex-1 text-left">{n.label}</span>
            {n.id === 'low-stock' && lowCount > 0 && (
              <span className="num rounded-full bg-tag-400 px-2 py-0.5 text-xs font-bold text-brand-900">{lowCount}</span>
            )}
          </button>
        );
      })}
    </nav>
  );

  const initials = (user?.name || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const sidebar = (
    <div className="flex h-full flex-col bg-brand-900 py-5 text-white">
      <div className="mb-6 flex items-center gap-3 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-tag-400 text-brand-900">
          <Boxes className="h-[18px] w-[18px]" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-extrabold">Khushbu Electronic</p>
          <p className="text-xs text-brand-100/60">Store manager</p>
        </div>
      </div>
      {nav}
      <div className="mx-3 mt-4 flex items-center gap-3 rounded-xl bg-white/6 p-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold">{initials}</div>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-semibold">{user?.name}</p>
          <p className="text-xs text-brand-100/60">{roleLabel}</p>
        </div>
        <button onClick={logout} className="rounded-lg p-2 text-brand-100/70 hover:bg-white/10 hover:text-white" aria-label="Sign out" title="Sign out">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:pl-64">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{sidebar}</aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-white px-4 lg:hidden">
        <button className="btn-ghost !p-2" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-extrabold">Khushbu Electronic</span>
        <span className="w-9" />
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <div className="relative h-full w-72 max-w-[85vw]">
            {sidebar}
            <button className="absolute right-3 top-4 rounded-lg p-2 text-white/80" onClick={() => setOpen(false)} aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-[1400px] p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
};
