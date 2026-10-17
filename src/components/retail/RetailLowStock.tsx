import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, PackagePlus, PackageX } from 'lucide-react';
import { api, LowStockProduct } from '../../services/retailApiService';
import { useAsync } from '../../hooks/useAsync';
import { Badge, Bar, EmptyState, ErrorBlock, LoadingBlock, PageHeader, StatTile, useToast } from '../ui';
import { num } from '../../lib/format';
import { AdjustmentModal } from './AdjustmentModal';

export const RetailLowStock: React.FC<{ onStockChanged: () => void }> = ({ onStockChanged }) => {
  const { notify } = useToast();
  const { data, error, loading, reload } = useAsync(() => api.getLowStock(), []);
  const [restock, setRestock] = useState<LowStockProduct | null>(null);

  const list = data ?? [];
  const out = list.filter((p) => p.availableStock === 0).length;

  return (
    <>
      <PageHeader title="Low stock" hint="Products at or below their reorder level, lowest stock first." />

      {loading && !data ? (
        <LoadingBlock />
      ) : error ? (
        <ErrorBlock message={error} onRetry={reload} />
      ) : list.length === 0 ? (
        <div className="panel">
          <EmptyState icon={<CheckCircle2 className="h-6 w-6" />} title="Everything is above its reorder level" hint="Products will show up here as soon as they run low." />
        </div>
      ) : (
        <>
          <div className="mb-5 grid gap-3 sm:grid-cols-2">
            <StatTile label="Need reordering" value={num(list.length)} icon={<AlertTriangle className="h-5 w-5" />} tone="amber" />
            <StatTile label="Out of stock" value={num(out)} icon={<PackageX className="h-5 w-5" />} tone="rose" />
          </div>

          <div className="panel divide-y divide-line">
            {list.map((p) => {
              const isOut = p.availableStock === 0;
              const pct = p.reorderLevel > 0 ? (p.availableStock / p.reorderLevel) * 100 : 0;
              return (
                <div key={p._id ?? p.id ?? p.sku} className="flex flex-wrap items-center gap-x-6 gap-y-3 p-4">
                  <div className="min-w-[200px] flex-1">
                    <p className="font-semibold">{p.name}</p>
                    <p className="num text-xs text-muted">
                      {p.sku} · {p.category}
                    </p>
                  </div>
                  <div className="w-44">
                    <div className="num mb-1 flex justify-between text-sm">
                      <span className="font-bold">{num(p.availableStock)} left</span>
                      <span className="text-muted">reorder at {num(p.reorderLevel)}</span>
                    </div>
                    <Bar pct={pct} tone={isOut ? 'red' : 'amber'} />
                  </div>
                  <div className="w-28 text-sm">
                    <p className="text-xs text-muted">Short by</p>
                    <p className="num font-bold">{num(p.deficit)} {p.unit}</p>
                  </div>
                  <div className="w-32">{isOut ? <Badge tone="red">Out of stock</Badge> : <Badge tone="amber">Reorder soon</Badge>}</div>
                  <button className="btn-primary" onClick={() => setRestock(p)}>
                    <PackagePlus className="h-4 w-4" /> Receive stock
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {restock && (
        <AdjustmentModal
          product={restock}
          defaultType="STOCK_RECEIVED"
          onClose={() => setRestock(null)}
          onDone={(m) => {
            notify('success', m);
            setRestock(null);
            reload();
            onStockChanged();
          }}
        />
      )}
    </>
  );
};
