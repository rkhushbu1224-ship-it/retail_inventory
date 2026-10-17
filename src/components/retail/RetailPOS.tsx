import React, { useMemo, useState } from 'react';
import { Minus, PackageSearch, Plus, Receipt, Search, ShoppingCart, Trash2 } from 'lucide-react';
import { api, PAYMENT_METHODS, PaymentMethod, Product, productId, Sale } from '../../services/retailApiService';
import { useAsync } from '../../hooks/useAsync';
import { Badge, EmptyState, ErrorBlock, LoadingBlock, PageHeader, Spinner } from '../ui';
import { money, num, roundMoney, stockStatus } from '../../lib/format';
import { RetailInvoiceModal } from './RetailInvoiceModal';

type Cart = Record<string, { product: Product; qty: number }>;

export const RetailPOS: React.FC<{ onStockChanged: () => void }> = ({ onStockChanged }) => {
  const { data, error, loading, reload } = useAsync(() => api.getProducts({ status: 'active' }), []);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [cart, setCart] = useState<Cart>({});
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [payment, setPayment] = useState<PaymentMethod>('Cash');
  const [discount, setDiscount] = useState('0');
  const [tax, setTax] = useState('18');
  const [busy, setBusy] = useState(false);
  const [saleError, setSaleError] = useState('');
  const [done, setDone] = useState<Sale | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  const products = data?.products ?? [];
  const categories = data?.categories ?? [];

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter(
      (p) => (category === 'All' || p.category === category) && (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
    );
  }, [products, search, category]);

  const lines = Object.values(cart);
  const itemCount = lines.reduce((n, l) => n + l.qty, 0);

  // Preview only — the server recalculates every amount when the sale is saved.
  const discountPct = Math.min(100, Math.max(0, Number(discount) || 0));
  const taxPct = Math.max(0, Number(tax) || 0);
  const subtotal = roundMoney(lines.reduce((s, l) => s + l.product.sellingPrice * l.qty, 0));
  const discountAmt = roundMoney((subtotal * discountPct) / 100);
  const taxAmt = roundMoney(((subtotal - discountAmt) * taxPct) / 100);
  const total = roundMoney(subtotal - discountAmt + taxAmt);

  const add = (p: Product) => {
    if (p.availableStock <= 0) return;
    const key = productId(p) || p.sku;
    setSaleError('');
    setCart((c) => {
      const cur = c[key]?.qty ?? 0;
      return { ...c, [key]: { product: p, qty: Math.min(cur + 1, p.availableStock) } };
    });
  };

  const setQty = (key: string, qty: number) =>
    setCart((c) => {
      const line = c[key];
      if (!line) return c;
      const clamped = Math.min(Math.max(0, Math.floor(qty) || 0), line.product.availableStock);
      if (clamped === 0) {
        const { [key]: _removed, ...rest } = c;
        return rest;
      }
      return { ...c, [key]: { ...line, qty: clamped } };
    });

  const reset = () => {
    setCart({});
    setCustomerName('');
    setCustomerPhone('');
    setDiscount('0');
    setPayment('Cash');
    setSaleError('');
    setCartOpen(false);
  };

  const complete = async () => {
    if (lines.length === 0) return;
    if (customerPhone.trim() && !/^[+\d][\d\s-]{6,14}$/.test(customerPhone.trim())) {
      return setSaleError('Enter a valid phone number, or leave it blank.');
    }
    setBusy(true);
    setSaleError('');
    try {
      const sale = await api.createSale({
        items: lines.map((l) => ({ productId: productId(l.product), sku: l.product.sku, quantity: l.qty })),
        paymentMethod: payment,
        discountPercent: discountPct,
        taxPercent: taxPct,
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
      });
      setDone(sale);
      reset();
      reload();
      onStockChanged();
    } catch (e: any) {
      setSaleError(e.message);
      reload(); // stock may have changed since the page loaded
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="New sale" hint="Tap a product to add it. Prices and tax are confirmed by the server when you complete the sale." />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Product picker */}
        <section>
          <div className="mb-3 flex flex-wrap gap-3">
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input className="field pl-9" placeholder="Search name or SKU" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search products" />
            </div>
            <select className="field !w-auto" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
              <option value="All">All categories</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          {loading && !data ? (
            <LoadingBlock label="Loading products…" />
          ) : error ? (
            <ErrorBlock message={error} onRetry={reload} />
          ) : visible.length === 0 ? (
            <div className="panel">
              <EmptyState icon={<PackageSearch className="h-6 w-6" />} title="No products found" hint="Try another search or category." />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-3">
              {visible.map((p) => {
                const key = productId(p) || p.sku;
                const s = stockStatus(p.availableStock, p.reorderLevel);
                const inCart = cart[key]?.qty ?? 0;
                const soldOut = p.availableStock <= 0;
                const atMax = inCart >= p.availableStock;
                return (
                  <button
                    key={key}
                    onClick={() => add(p)}
                    disabled={soldOut || atMax}
                    className={`panel relative flex flex-col p-4 text-left transition-colors enabled:hover:border-brand-500 disabled:cursor-not-allowed ${
                      soldOut ? 'opacity-55' : ''
                    } ${inCart ? 'border-brand-500 ring-1 ring-brand-500' : ''}`}
                  >
                    {inCart > 0 && (
                      <span className="num absolute right-3 top-3 flex h-6 min-w-6 items-center justify-center rounded-full bg-brand-600 px-1.5 text-xs font-bold text-white">
                        {inCart}
                      </span>
                    )}
                    <p className="num text-xs text-muted">{p.sku}</p>
                    <p className="mt-0.5 line-clamp-2 min-h-[2.75rem] pr-6 font-semibold leading-snug">{p.name}</p>
                    <div className="mt-3 flex items-end justify-between">
                      <p className="num text-lg font-extrabold">{money(p.sellingPrice)}</p>
                      {soldOut ? (
                        <Badge tone="red">Out of stock</Badge>
                      ) : s === 'low' ? (
                        <Badge tone="amber">{num(p.availableStock)} left</Badge>
                      ) : (
                        <span className="num text-xs text-muted">{num(p.availableStock)} in stock</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Cart: side panel on desktop, bottom sheet on small screens */}
        <aside
          className={`${cartOpen ? 'fixed inset-x-0 bottom-0 top-14 z-40 overflow-y-auto bg-canvas p-4' : 'hidden'} lg:sticky lg:top-6 lg:block lg:self-start lg:overflow-visible lg:bg-transparent lg:p-0`}
        >
          <div className="rounded-t-2xl border border-b-0 border-line bg-white">
            <div className="flex items-center justify-between px-5 pt-5">
              <h2 className="flex items-center gap-2 text-base font-extrabold">
                <Receipt className="h-[18px] w-[18px] text-brand-600" /> Current sale
              </h2>
              <div className="flex items-center gap-2">
                {lines.length > 0 && (
                  <button className="text-sm font-semibold text-muted hover:text-rose-700" onClick={reset}>
                    Clear
                  </button>
                )}
                <button className="btn-ghost !px-2 !py-1 lg:hidden" onClick={() => setCartOpen(false)}>
                  Close
                </button>
              </div>
            </div>

            {lines.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-muted">
                <ShoppingCart className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                No items yet. Pick a product to start.
              </div>
            ) : (
              <ul className="mt-3 divide-y divide-dashed divide-slate-200 px-5">
                {Object.entries(cart).map(([key, l]) => (
                  <li key={key} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-snug">{l.product.name}</p>
                        <p className="num text-xs text-muted">{money(l.product.sellingPrice)} each</p>
                      </div>
                      <p className="num text-sm font-bold">{money(l.product.sellingPrice * l.qty)}</p>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-lg border border-line">
                        <button className="p-1.5 text-muted hover:text-ink" onClick={() => setQty(key, l.qty - 1)} aria-label="Decrease quantity">
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <input
                          className="num w-10 border-x border-line bg-transparent py-1 text-center text-sm font-semibold outline-none"
                          inputMode="numeric"
                          value={l.qty}
                          onChange={(e) => setQty(key, Number(e.target.value))}
                          aria-label={`Quantity of ${l.product.name}`}
                        />
                        <button
                          className="p-1.5 text-muted hover:text-ink disabled:opacity-30"
                          onClick={() => setQty(key, l.qty + 1)}
                          disabled={l.qty >= l.product.availableStock}
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {l.qty >= l.product.availableStock && <span className="text-xs font-semibold text-tag-700">Max in stock</span>}
                      <button className="p-1.5 text-muted hover:text-rose-700" onClick={() => setQty(key, 0)} aria-label={`Remove ${l.product.name}`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {lines.length > 0 && (
              <div className="space-y-4 px-5 pb-5 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <input className="field" placeholder="Customer name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} aria-label="Customer name" />
                  <input className="field num" placeholder="Phone" inputMode="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} aria-label="Customer phone" />
                </div>

                <div className="grid grid-cols-2 gap-1.5" role="radiogroup" aria-label="Payment method">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m}
                      role="radio"
                      aria-checked={payment === m}
                      onClick={() => setPayment(m)}
                      className={`rounded-[10px] border px-2 py-2 text-sm font-semibold transition-colors ${
                        payment === m ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-line text-muted hover:bg-slate-50'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <label className="text-xs font-semibold text-muted">
                    Discount %
                    <input className="field num mt-1" inputMode="decimal" value={discount} onChange={(e) => setDiscount(e.target.value)} />
                  </label>
                  <label className="text-xs font-semibold text-muted">
                    Tax %
                    <input className="field num mt-1" inputMode="decimal" value={tax} onChange={(e) => setTax(e.target.value)} />
                  </label>
                </div>

                <dl className="num space-y-1.5 border-t border-dashed border-slate-300 pt-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="font-sans text-muted">Subtotal ({itemCount} item{itemCount === 1 ? '' : 's'})</dt>
                    <dd>{money(subtotal)}</dd>
                  </div>
                  {discountAmt > 0 && (
                    <div className="flex justify-between">
                      <dt className="font-sans text-muted">Discount</dt>
                      <dd>− {money(discountAmt)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="font-sans text-muted">Tax</dt>
                    <dd>{money(taxAmt)}</dd>
                  </div>
                  <div className="flex items-baseline justify-between border-t border-slate-200 pt-2 text-xl font-extrabold">
                    <dt className="font-sans">Total</dt>
                    <dd>{money(total)}</dd>
                  </div>
                </dl>

                {saleError && (
                  <p role="alert" className="rounded-[10px] border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                    {saleError}
                  </p>
                )}

                <button className="btn-primary w-full !py-3 text-base" onClick={complete} disabled={busy}>
                  {busy && <Spinner />} Complete sale · {money(total)}
                </button>
              </div>
            )}
          </div>
          <div className="receipt-edge" aria-hidden />
        </aside>
      </div>

      {/* Mobile: open-cart bar */}
      {!cartOpen && lines.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white p-3 lg:hidden">
          <button className="btn-primary w-full !py-3" onClick={() => setCartOpen(true)}>
            <ShoppingCart className="h-4 w-4" /> View sale · {itemCount} item{itemCount === 1 ? '' : 's'} · {money(total)}
          </button>
        </div>
      )}

      {done && <RetailInvoiceModal sale={done} title="Sale completed" onClose={() => setDone(null)} />}
    </>
  );
};
