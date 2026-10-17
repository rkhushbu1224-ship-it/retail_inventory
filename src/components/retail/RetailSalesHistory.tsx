import React, { useState } from 'react';
import { Download, Receipt, Search } from 'lucide-react';
import { api, Sale } from '../../services/retailApiService';
import { useAsync, useDebounced } from '../../hooks/useAsync';
import { Badge, EmptyState, ErrorBlock, LoadingBlock, PageHeader } from '../ui';
import { dateTime, downloadCsv, isoDay, money, num } from '../../lib/format';
import { RetailInvoiceModal } from './RetailInvoiceModal';

export const salesToCsv = (sales: Sale[]) => [
  ['Invoice', 'Date', 'Customer', 'Phone', 'Payment', 'Items', 'Subtotal', 'Discount', 'Tax', 'Total', 'Sold by'],
  ...sales.map((s) => [
    s.invoiceNumber,
    new Date(s.createdAt).toISOString(),
    s.customerName ?? '',
    s.customerPhone ?? '',
    s.paymentMethod,
    s.items.reduce((n, i) => n + i.quantity, 0),
    s.subtotal,
    s.discountAmount,
    s.taxAmount,
    s.totalAmount,
    s.soldBy?.name ?? '',
  ]),
];

export const RetailSalesHistory: React.FC = () => {
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [open, setOpen] = useState<Sale | null>(null);
  const q = useDebounced(search);

  const { data, error, loading, reload } = useAsync(
    () => api.getSales({ search: q, startDate: from || undefined, endDate: to || undefined, limit: 500 }),
    [q, from, to]
  );
  const sales = data ?? [];
  const invalidRange = !!from && !!to && from > to;

  return (
    <>
      <PageHeader
        title="Sales"
        hint="Every invoice, newest first. Click a row to view or print it."
        actions={
          <button className="btn-secondary" disabled={sales.length === 0} onClick={() => downloadCsv(`sales-${isoDay(new Date())}.csv`, salesToCsv(sales))}>
            <Download className="h-4 w-4" /> Download CSV
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className="field pl-9" placeholder="Invoice number, customer or phone" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search sales" />
        </div>
        <label className="text-xs font-semibold text-muted">
          From
          <input type="date" className="field mt-1" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className="text-xs font-semibold text-muted">
          To
          <input type="date" className="field mt-1" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} />
        </label>
        {(from || to) && (
          <button className="btn-ghost" onClick={() => (setFrom(''), setTo(''))}>
            Clear dates
          </button>
        )}
      </div>
      {invalidRange && <p className="mb-3 text-sm text-rose-700">The start date is after the end date.</p>}

      {loading && !data ? (
        <LoadingBlock />
      ) : error ? (
        <ErrorBlock message={error} onRetry={reload} />
      ) : sales.length === 0 ? (
        <div className="panel">
          <EmptyState icon={<Receipt className="h-6 w-6" />} title="No sales found" hint="Completed sales will be listed here." />
        </div>
      ) : (
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-line bg-slate-50/70">
                <tr>
                  <th className="th">Invoice</th>
                  <th className="th">Date</th>
                  <th className="th">Customer</th>
                  <th className="th text-right">Items</th>
                  <th className="th">Payment</th>
                  <th className="th text-right">Total</th>
                  <th className="th">Sold by</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {sales.map((s) => (
                  <tr
                    key={s._id ?? s.id ?? s.invoiceNumber}
                    className="cursor-pointer hover:bg-slate-50/70"
                    onClick={() => setOpen(s)}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setOpen(s)}
                  >
                    <td className="td num font-semibold text-brand-700">{s.invoiceNumber}</td>
                    <td className="td whitespace-nowrap text-muted">{dateTime(s.createdAt)}</td>
                    <td className="td">{s.customerName || 'Walk-in customer'}</td>
                    <td className="td num text-right">{num(s.items.reduce((n, i) => n + i.quantity, 0))}</td>
                    <td className="td">
                      <Badge tone="gray">{s.paymentMethod}</Badge>
                    </td>
                    <td className="td num text-right font-bold">{money(s.totalAmount)}</td>
                    <td className="td text-sm text-muted">{s.soldBy?.name || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {sales.length > 0 && (
        <p className="num mt-3 text-sm text-muted">
          {sales.length} invoice{sales.length === 1 ? '' : 's'} · {money(sales.reduce((s, x) => s + x.totalAmount, 0))} total
        </p>
      )}

      {open && <RetailInvoiceModal sale={open} onClose={() => setOpen(null)} />}
    </>
  );
};
