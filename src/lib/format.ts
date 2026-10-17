const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
const inrWhole = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

/** ₹1,299 for whole amounts, ₹1,299.50 otherwise. */
export const money = (n: number | undefined | null) => {
  const v = Number(n) || 0;
  return Number.isInteger(v) ? inrWhole.format(v) : inr.format(v);
};

export const num = (n: number | undefined | null) => new Intl.NumberFormat('en-IN').format(Number(n) || 0);

export const dateTime = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

export const shortDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—';

/** yyyy-mm-dd in local time, for <input type="date"> and API query params. */
export const isoDay = (d: Date) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};

export const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return isoDay(d);
};

export type StockStatus = 'out' | 'low' | 'ok';
export const stockStatus = (stock: number, reorder: number): StockStatus =>
  stock <= 0 ? 'out' : stock <= reorder ? 'low' : 'ok';

export const roundMoney = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function downloadCsv(filename: string, rows: Array<Array<string | number>>) {
  const esc = (v: string | number) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const blob = new Blob([rows.map((r) => r.map(esc).join(',')).join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
