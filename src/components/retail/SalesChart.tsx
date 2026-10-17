import React from 'react';
import { money, shortDate } from '../../lib/format';

/** Minimal bar chart: one bar per day, hover/focus shows the value. */
export const SalesChart: React.FC<{ days: Array<{ date: string; total: number; count: number }> }> = ({ days }) => {
  const max = Math.max(1, ...days.map((d) => d.total));
  return (
    <div>
      <div className="flex h-40 items-end gap-1.5" role="img" aria-label="Sales per day">
        {days.map((d) => (
          <div key={d.date} className="group relative flex h-full flex-1 items-end">
            <div
              className="w-full rounded-t-md bg-brand-500/85 transition-colors group-hover:bg-brand-700"
              style={{ height: `${Math.max(3, (d.total / max) * 100)}%` }}
            />
            <div className="num pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2 py-1 text-xs font-semibold text-white group-hover:block">
              {shortDate(d.date)} · {money(d.total)} · {d.count} sale{d.count === 1 ? '' : 's'}
            </div>
          </div>
        ))}
      </div>
      <div className="num mt-2 flex justify-between text-xs text-muted">
        <span>{shortDate(days[0]?.date)}</span>
        <span>{shortDate(days[days.length - 1]?.date)}</span>
      </div>
    </div>
  );
};

/** Fill gaps so quiet days show as empty bars. */
export function fillDays(days: Array<{ date: string; total: number; count: number }>, start: string, end: string) {
  const map = new Map(days.map((d) => [d.date, d]));
  const out: Array<{ date: string; total: number; count: number }> = [];
  const cur = new Date(start + 'T00:00:00');
  const last = new Date(end + 'T00:00:00');
  while (cur <= last && out.length < 366) {
    const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
    out.push(map.get(key) ?? { date: key, total: 0, count: 0 });
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}
