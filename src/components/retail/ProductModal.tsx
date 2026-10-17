import React, { useState } from 'react';
import { api, Product, productId } from '../../services/retailApiService';
import { Field, Modal, Spinner } from '../ui';
import { money } from '../../lib/format';

interface Props {
  product: Product | null;
  categories: string[];
  onClose: () => void;
  onSaved: (message: string) => void;
}

type Form = { sku: string; name: string; category: string; purchasePrice: string; sellingPrice: string; availableStock: string; reorderLevel: string; unit: string };

export const ProductModal: React.FC<Props> = ({ product, categories, onClose, onSaved }) => {
  const editing = !!product;
  const [f, setF] = useState<Form>({
    sku: product?.sku ?? '',
    name: product?.name ?? '',
    category: product?.category ?? '',
    purchasePrice: product ? String(product.purchasePrice) : '',
    sellingPrice: product ? String(product.sellingPrice) : '',
    availableStock: '0',
    reorderLevel: product ? String(product.reorderLevel) : '5',
    unit: product?.unit ?? 'pcs',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    const e: Partial<Record<keyof Form, string>> = {};
    if (!editing && !f.sku.trim()) e.sku = 'SKU is required.';
    if (!f.name.trim()) e.name = 'Name is required.';
    if (!f.category.trim()) e.category = 'Category is required.';
    const nonNeg = (v: string) => v.trim() !== '' && !isNaN(Number(v)) && Number(v) >= 0;
    if (!nonNeg(f.purchasePrice)) e.purchasePrice = 'Enter a price of 0 or more.';
    if (!nonNeg(f.sellingPrice)) e.sellingPrice = 'Enter a price of 0 or more.';
    const wholeNonNeg = (v: string) => nonNeg(v) && Number.isInteger(Number(v));
    if (!editing && !wholeNonNeg(f.availableStock)) e.availableStock = 'Enter a whole number, 0 or more.';
    if (!wholeNonNeg(f.reorderLevel)) e.reorderLevel = 'Enter a whole number, 0 or more.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setBusy(true);
    setServerError('');
    try {
      const common = {
        name: f.name.trim(),
        category: f.category.trim(),
        purchasePrice: Number(f.purchasePrice),
        sellingPrice: Number(f.sellingPrice),
        reorderLevel: Number(f.reorderLevel),
        unit: f.unit.trim() || 'pcs',
      };
      if (product) {
        await api.updateProduct(productId(product), common);
        onSaved(`${common.name} updated.`);
      } else {
        await api.createProduct({ ...common, sku: f.sku.trim(), availableStock: Number(f.availableStock) });
        onSaved(`${common.name} added to the catalogue.`);
      }
    } catch (err: any) {
      setServerError(err?.message || 'Could not save the product.');
      setBusy(false);
    }
  };

  const margin = Number(f.sellingPrice) - Number(f.purchasePrice);
  const showMargin = f.sellingPrice !== '' && f.purchasePrice !== '' && !isNaN(margin);

  return (
    <Modal
      title={editing ? 'Edit product' : 'Add product'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="product-form" className="btn-primary" disabled={busy}>
            {busy && <Spinner />} {editing ? 'Save changes' : 'Add product'}
          </button>
        </>
      }
    >
      <form id="product-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
        <Field label="SKU" error={errors.sku} hint={editing ? 'SKU can’t be changed after creation.' : 'Unique code, e.g. LAP-DL-XPS.'}>
          <input className="field" value={f.sku} onChange={set('sku')} disabled={editing} />
        </Field>
        <Field label="Unit" error={errors.unit}>
          <input className="field" value={f.unit} onChange={set('unit')} placeholder="pcs" />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Product name" error={errors.name}>
            <input className="field" value={f.name} onChange={set('name')} />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Category" error={errors.category}>
            <input className="field" list="category-options" value={f.category} onChange={set('category')} placeholder="Pick one or type a new category" />
            <datalist id="category-options">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
        </div>

        <Field label="Purchase price (₹)" error={errors.purchasePrice}>
          <input className="field num" inputMode="decimal" value={f.purchasePrice} onChange={set('purchasePrice')} />
        </Field>
        <Field
          label="Selling price (₹)"
          error={errors.sellingPrice}
          hint={showMargin ? (margin < 0 ? 'Selling below purchase price.' : `Margin ${money(margin)} per unit.`) : undefined}
        >
          <input className="field num" inputMode="decimal" value={f.sellingPrice} onChange={set('sellingPrice')} />
        </Field>

        {!editing && (
          <Field label="Opening stock" error={errors.availableStock}>
            <input className="field num" inputMode="numeric" value={f.availableStock} onChange={set('availableStock')} />
          </Field>
        )}
        <Field label="Reorder level" error={errors.reorderLevel} hint="Flagged as low stock at or below this number.">
          <input className="field num" inputMode="numeric" value={f.reorderLevel} onChange={set('reorderLevel')} />
        </Field>

        {editing && (
          <p className="text-sm text-muted sm:col-span-2">To change the quantity on hand, use “Adjust stock” on the product so the change is logged.</p>
        )}

        {serverError && (
          <p role="alert" className="rounded-[10px] border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 sm:col-span-2">
            {serverError}
          </p>
        )}
      </form>
    </Modal>
  );
};
