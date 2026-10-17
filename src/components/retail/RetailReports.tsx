import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { api } from '../../services/retailApiService';
import { useAsync } from '../../hooks/useAsync';
import { EmptyState, ErrorBlock, LoadingBlock, PageHeader, Segmented, StatTile, Bar } from '../ui';
import { daysAgo, downloadCsv, isoDay, money, num } from '../../lib/format';
import { SalesChart, fillDays } from './SalesChart';
import { salesToCsv } from './RetailSalesHistory';
import { IndianRupee, Percent, Receipt, TrendingUp } from 'lucide-react';

type Preset = '7' | '30' | '90' | 'custom';

export const RetailReports: React.FC = () => {
  const [preset, setPreset] = useState<Preset>('30');
  const [from, setFrom] = useState(daysAgo(29));
  const [to, setTo] = useState(isoDay(new Date()));

  const pick = (p: Preset) => {
    setPreset(p);
    if (p !== 'custom') {
      setFrom(daysAgo(Number(p) - 1));
      setTo(isoDay(new Date()));
    }
  };

  const invalid = !from || !to || from > to;

  const { data, error, loading, reload } = useAsync(
    async () => {
      if (invalid) return null;
      const [sales, profit] = await Promise.all([api.getSalesReport({ startDate: from, endDate: to }), api.getProfitReport({ startDate: from, endDate: to })]);
      return { sales, profit };
    },
    [from, to]
  );

  const exportCsv = async () => {
    const list = await api.getSales({ startDate: from, endDate: to, limit: 5000 });
    downloadCsv(`sales-${from}-to-${to}.csv`, salesToCsv(list));
  };

  return (
    <>
      <PageHeader
        title="Reports"
        hint="Sales and profit for any date range."
        actions={
          <button className="btn-secondary" onClick={exportCsv} disabled={invalid || !data?.sales.transactionCount}>
            <Download className="h-4 w-4" /> Download CSV
          </button>
        }
      />

      <div className="mb-5 flex flex-wrap items-end gap-3">
        <Segmented<Preset>
          value={preset}
          onChange={pick}
          options={[
            { value: '7', label: '7 days' },
            { value: '30', label: '30 days' },
            { value: '90', label: '90 days' },
            { value: 'custom', label: 'Custom' },
          ]}
        />
        {preset === 'custom' && (
          <>
            <label className="text-xs font-semibold text-muted">
              From
              <input type="date" className="field mt-1" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
            </label>
            <label className="text-xs font-semibold text-muted">
              To
              <input type="date" className="field mt-1" value={to} min={from} onChange={(e) => setTo(e.target.value)} />
            </label>
          </>
        )}
      </div>

      {invalid ? (
        <p className="text-sm text-rose-700">Choose a start date that is on or before the end date.</p>
      ) : loading && !data ? (
        <LoadingBlock />
      ) : error || !data ? (
        <ErrorBlock message={error ?? 'Could not load reports.'} onRetry={reload} />
      ) : data.sales.transactionCount === 0 ? (
        <div className="panel">
          <EmptyState icon={<TrendingUp className="h-6 w-6" />} title="No sales in this range" hint="Pick a wider range or record a sale." />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile label="Total sales" value={money(data.sales.totalRevenue)} sub={`${num(data.sales.totalUnitsSold)} units`} icon={<IndianRupee className="h-5 w-5" />} />
            <StatTile label="Transactions" value={num(data.sales.transactionCount)} sub={`Avg ${money(data.sales.averageOrderValue)}`} icon={<Receipt className="h-5 w-5" />} tone="blue" />
            <StatTile label="Gross profit" value={money(data.profit.grossProfit)} sub="After discounts, before tax" icon={<TrendingUp className="h-5 w-5" />} tone="teal" />
            <StatTile label="Margin" value={`${data.profit.marginPercent}%`} sub={`Cost of goods ${money(data.profit.totalCost)}`} icon={<Percent className="h-5 w-5" />} tone="amber" />
          </div>

          <section className="panel p-5">
            <h2 className="mb-4 font-bold">Sales per day</h2>
            <SalesChart days={fillDays(data.sales.salesByDay, from, to)} />
            {data.sales.summary && (
              <dl className="num mt-5 grid gap-3 border-t border-line pt-4 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-muted">Before discount & tax</dt>
                  <dd className="font-bold">{money(data.sales.summary.totalSubtotal)}</dd>
                </div>
                <div>
                  <dt className="text-muted">Discounts given</dt>
                  <dd className="font-bold">{money(data.sales.summary.totalDiscount)}</dd>
                </div>
                <div>
                  <dt className="text-muted">Tax collected</dt>
                  <dd className="font-bold">{money(data.sales.summary.totalTax)}</dd>
                </div>
              </dl>
            )}
          </section>

          <div className="grid gap-5 lg:grid-cols-2">
            <section className="panel overflow-hidden">
              <h2 className="p-5 pb-3 font-bold">Top-selling products</h2>
              <table className="w-full">
                <thead className="border-y border-line bg-slate-50/70">
                  <tr>
                    <th className="th">Product</th>
                    <th className="th text-right">Units</th>
                    <th className="th text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.sales.topProducts.map((p) => (
                    <tr key={p.sku}>
                      <td className="td">
                        <p className="font-semibold">{p.name}</p>
                        <p className="num text-xs text-muted">{p.sku}</p>
                      </td>
                      <td className="td num text-right">{num(p.quantity)}</td>
                      <td className="td num text-right font-semibold">{money(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="panel p-5">
              <h2 className="mb-4 font-bold">Profit by category</h2>
              <ul className="space-y-4">
                {data.profit.categoryBreakdown.map((c) => (
                  <li key={c.category}>
                    <div className="mb-1 flex justify-between gap-2 text-sm">
                      <span className="font-semibold">{c.category}</span>
                      <span className="num text-muted">
                        {money(c.profit)} · {c.marginPercent}%
                      </span>
                    </div>
                    <Bar pct={Math.max(0, c.marginPercent)} />
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      )}
    </>
  );
};
