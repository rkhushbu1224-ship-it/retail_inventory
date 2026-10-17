import React, { useState } from 'react';
import { AlertTriangle, IndianRupee, PackageCheck, Receipt, ShoppingCart, TrendingUp } from 'lucide-react';
import { api } from '../../services/retailApiService';
import { useAsync } from '../../hooks/useAsync';
import { Badge, EmptyState, ErrorBlock, LoadingBlock, PageHeader, Segmented, StatTile } from '../ui';
import { daysAgo, isoDay, money, num, dateTime } from '../../lib/format';
import { SalesChart, fillDays } from './SalesChart';
import { useAuth } from '../../context/AuthContext';
import type { PageId } from '../layout/AppShell';

type Range = '7' | '30' | '90';

export const RetailDashboard: React.FC<{ onNavigate: (p: PageId) => void; stockVersion: number }> = ({ onNavigate, stockVersion }) => {
  const { user } = useAuth();
  const [range, setRange] = useState<Range>('30');
  const start = daysAgo(Number(range) - 1);
  const end = isoDay(new Date());

  const { data, error, loading, reload } = useAsync(
    async () => {
      const [report, low, recent] = await Promise.all([
        api.getSalesReport({ startDate: start, endDate: end }),
        api.getLowStock(),
        api.getSales({ limit: 6 }),
      ]);
      return { report, low, recent };
    },
    [range, stockVersion]
  );

  const first = user?.name?.split(' ')[0] ?? '';

  return (
    <>
      <PageHeader
        title={`Hello${first ? `, ${first}` : ''}`}
        hint="Here’s how the store is doing."
        actions={
          <>
            <Segmented<Range>
              value={range}
              onChange={setRange}
              options={[
                { value: '7', label: '7 days' },
                { value: '30', label: '30 days' },
                { value: '90', label: '90 days' },
              ]}
            />
            <button className="btn-primary" onClick={() => onNavigate('sale')}>
              <ShoppingCart className="h-4 w-4" /> New sale
            </button>
          </>
        }
      />

      {loading && !data ? (
        <LoadingBlock />
      ) : error || !data ? (
        <ErrorBlock message={error ?? 'Could not load the dashboard.'} onRetry={reload} />
      ) : (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile label="Total sales" value={money(data.report.totalRevenue)} sub={`Last ${range} days`} icon={<IndianRupee className="h-5 w-5" />} />
            <StatTile label="Transactions" value={num(data.report.transactionCount)} sub={`Avg ${money(data.report.averageOrderValue)}`} icon={<Receipt className="h-5 w-5" />} tone="blue" />
            <StatTile label="Units sold" value={num(data.report.totalUnitsSold)} icon={<PackageCheck className="h-5 w-5" />} tone="teal" />
            <StatTile
              label="Low-stock products"
              value={num(data.low.length)}
              sub={data.low.length ? `${data.low.filter((p) => p.availableStock === 0).length} out of stock` : 'All stocked'}
              icon={<AlertTriangle className="h-5 w-5" />}
              tone="amber"
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
            <section className="panel p-5">
              <h2 className="mb-4 font-bold">Sales per day</h2>
              {data.report.transactionCount === 0 ? (
                <EmptyState icon={<TrendingUp className="h-6 w-6" />} title="No sales in this period" hint="Complete a sale and it will show up here." />
              ) : (
                <SalesChart days={fillDays(data.report.salesByDay, start, end)} />
              )}
            </section>

            <section className="panel p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-bold">Low stock</h2>
                <button className="text-sm font-semibold text-brand-700 hover:underline" onClick={() => onNavigate('low-stock')}>
                  View all
                </button>
              </div>
              {data.low.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted">Nothing is running low.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {data.low.slice(0, 5).map((p) => (
                    <li key={p._id ?? p.id ?? p.sku} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{p.name}</p>
                        <p className="num text-xs text-muted">Reorder at {num(p.reorderLevel)}</p>
                      </div>
                      {p.availableStock === 0 ? <Badge tone="red">Out</Badge> : <Badge tone="amber">{num(p.availableStock)} left</Badge>}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
            <section className="panel p-5">
              <h2 className="mb-3 font-bold">Top-selling products</h2>
              {data.report.topProducts.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted">No sales yet in this period.</p>
              ) : (
                <ol className="space-y-3">
                  {data.report.topProducts.slice(0, 5).map((p, i) => {
                    const top = data.report.topProducts[0].quantity || 1;
                    return (
                      <li key={p.sku} className="flex items-center gap-3">
                        <span className="num flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">{i + 1}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between gap-2 text-sm">
                            <span className="truncate font-semibold">{p.name}</span>
                            <span className="num shrink-0 text-muted">{num(p.quantity)} sold</span>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-brand-500" style={{ width: `${(p.quantity / top) * 100}%` }} />
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>

            <section className="panel p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-bold">Recent sales</h2>
                <button className="text-sm font-semibold text-brand-700 hover:underline" onClick={() => onNavigate('sales')}>
                  View all
                </button>
              </div>
              {data.recent.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted">No sales recorded yet.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {data.recent.map((s) => (
                    <li key={s._id ?? s.id ?? s.invoiceNumber} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="min-w-0">
                        <p className="num text-sm font-semibold">{s.invoiceNumber}</p>
                        <p className="truncate text-xs text-muted">
                          {s.customerName || 'Walk-in customer'} · {dateTime(s.createdAt)}
                        </p>
                      </div>
                      <p className="num text-sm font-bold">{money(s.totalAmount)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      )}
    </>
  );
};
