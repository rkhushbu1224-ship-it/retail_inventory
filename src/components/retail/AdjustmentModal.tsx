import React, { useState } from 'react';
import { AdjustmentType, api, Product } from '../../services/retailApiService';
import { Field, Modal, Spinner } from '../ui';
import { num } from '../../lib/format';

const TYPES: Array<{ value: AdjustmentType; label: string; adds: boolean; help: string }> = [
  { value: 'STOCK_RECEIVED', label: 'Stock received', adds: true, help: 'New units arrived from a supplier.' },
  { value: 'RETURN', label: 'Customer return', adds: true, help: 'Units came back and can be sold again.' },
  { value: 'MANUAL_ADJUSTMENT', label: 'Stock correction (remove)', adds: false, help: 'Fix a miscount by removing units.' },
  { value: 'DAMAGE', label: 'Damaged or lost', adds: false, help: 'Write off units that can’t be sold.' },
];

interface Props {
  product: Product;
  defaultType?: AdjustmentType;
  onClose: () => void;
  onDone: (message: string) => void;
}

export const AdjustmentModal: React.FC<Props> = ({ product, defaultType = 'STOCK_RECEIVED', onClose, onDone }) => {
  const [type, setType] = useState<AdjustmentType>(defaultType);
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const t = TYPES.find((x) => x.value === type)!;
  const n = Number(qty);
  const validQty = qty.trim() !== '' && Number.isInteger(n) && n > 0;
  const next = validQty ? product.availableStock + (t.adds ? n : -n) : null;
  const tooMany = next !== null && next < 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validQty) return setError('Enter a whole number greater than 0.');
    if (tooMany) return setError(`Only ${product.availableStock} in stock. Stock can’t go below zero.`);
    setBusy(true);
    setError('');
    try {
      const r = await api.recordAdjustment({ product, adjustmentType: type, quantity: n, reason: reason.trim() || undefined });
      onDone(r.message);
    } catch (err: any) {
      setError(err?.message || 'Could not record the change.');
      setBusy(false);
    }
  };

  return (
    <Modal
      title="Adjust stock"
      onClose={onClose}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose} type="button">
            Cancel
          </button>
          <button className="btn-primary" type="submit" form="adjust-form" disabled={busy}>
            {busy && <Spinner />} Save change
          </button>
        </>
      }
    >
      <div className="mb-4 rounded-xl bg-canvas px-4 py-3">
        <p className="font-bold">{product.name}</p>
        <p className="text-sm text-muted">
          <span className="num">{product.sku}</span> · currently <span className="num font-semibold text-ink">{num(product.availableStock)}</span> {product.unit}
        </p>
      </div>

      <form id="adjust-form" onSubmit={submit} className="space-y-4" noValidate>
        <fieldset>
          <legend className="mb-1.5 text-sm font-semibold">What happened?</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {TYPES.map((o) => (
              <label
                key={o.value}
                className={`cursor-pointer rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                  type === o.value ? 'border-brand-600 bg-brand-50' : 'border-line hover:bg-slate-50'
                }`}
              >
                <input type="radio" name="adj" className="sr-only" checked={type === o.value} onChange={() => setType(o.value)} />
                <span className="block font-semibold">{o.label}</span>
                <span className="block text-xs text-muted">{o.help}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <Field label={`Quantity to ${t.adds ? 'add' : 'remove'}`}>
          <input className="field num" inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)} autoFocus />
        </Field>

        {next !== null && (
          <p className={`num rounded-[10px] px-3 py-2 text-sm font-semibold ${tooMany ? 'bg-rose-50 text-rose-800' : 'bg-brand-50 text-brand-800'}`}>
            {num(product.availableStock)} → {tooMany ? 'not enough stock' : num(next)}
          </p>
        )}

        <Field label="Note (optional)">
          <input className="field" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. PO #1042 from Ingram" />
        </Field>

        {error && (
          <p role="alert" className="rounded-[10px] border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
};
