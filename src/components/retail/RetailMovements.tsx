import React, { useMemo, useState } from 'react';
import { ClipboardList, Search } from 'lucide-react';
import { api, MovementType } from '../../services/retailApiService';
import { useAsync, useDebounced } from '../../hooks/useAsync';
import { Badge, EmptyState, ErrorBlock, LoadingBlock, PageHeader } from '../ui';
import { dateTime, num } from '../../lib/format';

const LABEL: Record<MovementType, { text: string; tone: 'green' | 'red' | 'blue' | 'amber' | 'teal' }> = {
  STOCK_RECEIVED: { text: 'Stock received', tone: 'green' },
  SALE: { text: 'Sale', tone: 'blue' },
  MANUAL_ADJUSTMENT: { text: 'Correction', tone: 'amber' },
  DAMAGE: { text: 'Damaged or lost', tone: 'red' },
  RETURN: { text: 'Customer return', tone: 'teal' },
  INITIAL_STOCK: { text: 'Opening stock', tone: 'teal' },
};

export const RetailMovements: React.FC = () => {
  const [type, setType] = useState('All');
  const [search, setSearch] = useState('');
  const q = useDebounced(search, 200).trim().toLowerCase();
  const { data, error, loading, reload } = useAsync(() => api.getMovements({ movementType: type, limit: 300 }), [type]);

  const rows = useMemo(
    () =>
      (data ?? []).filter(
        (m) => !q || [m.productName, m.sku, m.referenceId, m.performedBy?.name].some((v) => (v ?? '').toLowerCase().includes(q))
      ),
    [data, q]
  );

  return (
    <>
      <PageHeader title="Stock history" hint="Every stock change, who made it and when. Newest first." />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className="field pl-9" placeholder="Search product, SKU, invoice or person" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search stock history" />
        </div>
        <select className="field !w-auto" value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter by type">
          <option value="All">All changes</option>
          {Object.entries(LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v.text}
            </option>
          ))}
        </select>
      </div>

      {loading && !data ? (
        <LoadingBlock />
      ) : error ? (
        <ErrorBlock message={error} onRetry={reload} />
      ) : rows.length === 0 ? (
        <div className="panel">
          <EmptyState icon={<ClipboardList className="h-6 w-6" />} title="No stock changes found" hint="Sales, deliveries and adjustments appear here." />
        </div>
      ) : (
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-line bg-slate-50/70">
                <tr>
                  <th className="th">When</th>
                  <th className="th">Product</th>
                  <th className="th">Type</th>
                  <th className="th text-right">Change</th>
                  <th className="th text-right">Stock after</th>
                  <th className="th">Reference</th>
                  <th className="th">By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((m, i) => {
                  const l = LABEL[m.movementType] ?? { text: m.movementType, tone: 'teal' as const };
                  return (
                    <tr key={m._id ?? m.id ?? i} className="hover:bg-slate-50/60">
                      <td className="td whitespace-nowrap text-muted">{dateTime(m.timestamp ?? m.createdAt)}</td>
                      <td className="td">
                        <p className="font-semibold">{m.productName}</p>
                        <p className="num text-xs text-muted">{m.sku}</p>
                      </td>
                      <td className="td">
                        <Badge tone={l.tone}>{l.text}</Badge>
                      </td>
                      <td className={`td num text-right font-bold ${m.quantity >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {m.quantity > 0 ? '+' : ''}
                        {num(m.quantity)}
                      </td>
                      <td className="td num text-right">
                        <span className="text-muted">{num(m.previousStock)} → </span>
                        <span className="font-semibold">{num(m.newStock)}</span>
                      </td>
                      <td className="td num text-sm text-muted">{m.referenceId || '—'}</td>
                      <td className="td text-sm">
                        {m.performedBy?.name || '—'}
                        {m.performedBy?.role && <span className="text-xs text-muted"> · {m.performedBy.role}</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};
