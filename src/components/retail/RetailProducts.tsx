import React, { useMemo, useState } from 'react';
import { Package, Pencil, Plus, Power, Search, SlidersHorizontal } from 'lucide-react';
import { api, Product, productId } from '../../services/retailApiService';
import { useAuth } from '../../context/AuthContext';
import { useAsync, useDebounced } from '../../hooks/useAsync';
import { Badge, EmptyState, ErrorBlock, LoadingBlock, PageHeader, Segmented, useToast } from '../ui';
import { money, num, stockStatus } from '../../lib/format';
import { ProductModal } from './ProductModal';
import { AdjustmentModal } from './AdjustmentModal';

type StatusFilter = 'all' | 'ok' | 'low' | 'out' | 'inactive';

export const StockBadge: React.FC<{ product: Product }> = ({ product }) => {
  if (!product.isActive) return <Badge tone="gray">Inactive</Badge>;
  const s = stockStatus(product.availableStock, product.reorderLevel);
  return s === 'out' ? <Badge tone="red">Out of stock</Badge> : s === 'low' ? <Badge tone="amber">Low stock</Badge> : <Badge tone="green">In stock</Badge>;
};

export const RetailProducts: React.FC<{ onStockChanged: () => void }> = ({ onStockChanged }) => {
  const { isAdmin } = useAuth();
  const { notify } = useToast();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [editing, setEditing] = useState<Product | null>(null);
  const [adding, setAdding] = useState(false);
  const [adjusting, setAdjusting] = useState<Product | null>(null);
  const q = useDebounced(search);

  const { data, error, loading, reload } = useAsync(() => api.getProducts({ search: q, category }), [q, category]);
  const { data: catData } = useAsync(() => api.getProducts(), []);
  const categories = catData?.categories ?? [];

  const rows = useMemo(() => {
    const list = data?.products ?? [];
    return list.filter((p) => {
      if (status === 'all') return true;
      if (status === 'inactive') return !p.isActive;
      if (!p.isActive) return false;
      return stockStatus(p.availableStock, p.reorderLevel) === status;
    });
  }, [data, status]);

  const afterChange = (msg: string) => {
    notify('success', msg);
    setAdding(false);
    setEditing(null);
    setAdjusting(null);
    reload();
    onStockChanged();
  };

  const toggle = async (p: Product) => {
    try {
      const r = await api.toggleProductActive(productId(p));
      notify('success', r.message);
      reload();
      onStockChanged();
    } catch (e: any) {
      notify('error', e.message);
    }
  };

  return (
    <>
      <PageHeader
        title="Products"
        hint="Everything you sell, with price and stock on hand."
        actions={
          isAdmin && (
            <button className="btn-primary" onClick={() => setAdding(true)}>
              <Plus className="h-4 w-4" /> Add product
            </button>
          )
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className="field pl-9" placeholder="Search by name or SKU" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search products" />
        </div>
        <select className="field !w-auto" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
          <option value="All">All categories</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <Segmented<StatusFilter>
          value={status}
          onChange={setStatus}
          options={[
            { value: 'all', label: 'All' },
            { value: 'ok', label: 'In stock' },
            { value: 'low', label: 'Low' },
            { value: 'out', label: 'Out' },
            ...(isAdmin ? [{ value: 'inactive' as const, label: 'Inactive' }] : []),
          ]}
        />
      </div>

      {loading && !data ? (
        <LoadingBlock />
      ) : error ? (
        <ErrorBlock message={error} onRetry={reload} />
      ) : rows.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={<Package className="h-6 w-6" />}
            title="No products match"
            hint="Try a different search or filter."
            action={
              isAdmin && (
                <button className="btn-primary" onClick={() => setAdding(true)}>
                  <Plus className="h-4 w-4" /> Add product
                </button>
              )
            }
          />
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="panel hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-line bg-slate-50/70">
                  <tr>
                    <th className="th">Product</th>
                    <th className="th">Category</th>
                    <th className="th text-right">Cost</th>
                    <th className="th text-right">Price</th>
                    <th className="th text-right">In stock</th>
                    <th className="th">Status</th>
                    <th className="th text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.map((p) => (
                    <tr key={productId(p) || p.sku} className={`hover:bg-slate-50/60 ${p.isActive ? '' : 'opacity-60'}`}>
                      <td className="td">
                        <p className="font-semibold">{p.name}</p>
                        <p className="num text-xs text-muted">{p.sku}</p>
                      </td>
                      <td className="td text-muted">{p.category}</td>
                      <td className="td num text-right text-muted">{money(p.purchasePrice)}</td>
                      <td className="td num text-right font-semibold">{money(p.sellingPrice)}</td>
                      <td className="td num whitespace-nowrap text-right">
                        <p className="font-semibold leading-tight">{num(p.availableStock)}</p>
                        <p className="text-xs text-muted">reorder at {num(p.reorderLevel)}</p>
                      </td>
                      <td className="td">
                        <StockBadge product={p} />
                      </td>
                      <td className="td">
                        <div className="flex justify-end gap-1">
                          <button className="btn-ghost !px-2.5 !py-1.5" onClick={() => setAdjusting(p)} title="Adjust stock" disabled={!p.isActive}>
                            <SlidersHorizontal className="h-4 w-4" /> Stock
                          </button>
                          {isAdmin && (
                            <>
                              <button className="btn-ghost !px-2.5 !py-1.5" onClick={() => setEditing(p)} aria-label={`Edit ${p.name}`} title="Edit">
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button className="btn-ghost !px-2.5 !py-1.5" onClick={() => toggle(p)} title={p.isActive ? 'Deactivate' : 'Activate'} aria-label={p.isActive ? `Deactivate ${p.name}` : `Activate ${p.name}`}>
                                <Power className={`h-4 w-4 ${p.isActive ? '' : 'text-emerald-600'}`} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {rows.map((p) => (
              <div key={productId(p) || p.sku} className={`panel p-4 ${p.isActive ? '' : 'opacity-60'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold leading-snug">{p.name}</p>
                    <p className="num text-xs text-muted">
                      {p.sku} · {p.category}
                    </p>
                  </div>
                  <StockBadge product={p} />
                </div>
                <div className="num mt-3 flex items-end justify-between">
                  <div>
                    <p className="text-lg font-extrabold">{money(p.sellingPrice)}</p>
                    <p className="text-xs text-muted">Cost {money(p.purchasePrice)}</p>
                  </div>
                  <p className="text-sm">
                    <span className="font-bold">{num(p.availableStock)}</span> <span className="text-muted">in stock</span>
                  </p>
                </div>
                <div className="mt-3 flex gap-2 border-t border-line pt-3">
                  <button className="btn-secondary flex-1 !py-1.5" onClick={() => setAdjusting(p)} disabled={!p.isActive}>
                    Adjust stock
                  </button>
                  {isAdmin && (
                    <>
                      <button className="btn-secondary !py-1.5" onClick={() => setEditing(p)} aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button className="btn-secondary !py-1.5" onClick={() => toggle(p)} aria-label={p.isActive ? 'Deactivate' : 'Activate'}>
                        <Power className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted">
            Showing <span className="num">{rows.length}</span> product{rows.length === 1 ? '' : 's'}
          </p>
        </>
      )}

      {(adding || editing) && <ProductModal product={editing} categories={categories} onClose={() => (setAdding(false), setEditing(null))} onSaved={afterChange} />}
      {adjusting && <AdjustmentModal product={adjusting} onClose={() => setAdjusting(null)} onDone={afterChange} />}
    </>
  );
};
