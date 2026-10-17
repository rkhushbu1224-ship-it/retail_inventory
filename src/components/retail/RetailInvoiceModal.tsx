import React from 'react';
import { Printer } from 'lucide-react';
import { Sale } from '../../services/retailApiService';
import { Modal } from '../ui';
import { dateTime, money, num } from '../../lib/format';

export const RetailInvoiceModal: React.FC<{ sale: Sale; onClose: () => void; title?: string }> = ({ sale, onClose, title = 'Invoice' }) => (
  <Modal
    title={title}
    onClose={onClose}
    wide
    footer={
      <>
        <button className="btn-secondary" onClick={onClose}>
          Close
        </button>
        <button className="btn-primary" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Print invoice
        </button>
      </>
    }
  >
    <div id="invoice-print" className="mx-auto max-w-xl bg-white text-sm text-ink">
      <div className="flex items-start justify-between gap-4 border-b border-dashed border-slate-300 pb-4">
        <div>
          <p className="text-lg font-extrabold">Khushbu Electronic Store</p>
          <p className="text-muted">Tax invoice</p>
        </div>
        <div className="text-right">
          <p className="num font-bold">{sale.invoiceNumber}</p>
          <p className="text-muted">{dateTime(sale.createdAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-b border-dashed border-slate-300 py-4">
        <div>
          <p className="text-xs text-muted">Billed to</p>
          <p className="font-semibold">{sale.customerName || 'Walk-in customer'}</p>
          {sale.customerPhone && <p className="num text-muted">{sale.customerPhone}</p>}
        </div>
        <div className="text-right">
          <p className="text-xs text-muted">Payment</p>
          <p className="font-semibold">{sale.paymentMethod}</p>
          <p className="text-muted">Served by {sale.soldBy?.name || '—'}</p>
        </div>
      </div>

      <table className="w-full">
        <thead>
          <tr className="text-left text-xs text-muted">
            <th className="py-2 font-semibold">Item</th>
            <th className="py-2 text-right font-semibold">Qty</th>
            <th className="py-2 text-right font-semibold">Price</th>
            <th className="py-2 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody className="num">
          {sale.items.map((it, i) => (
            <tr key={i} className="border-t border-slate-100">
              <td className="py-2 pr-2 font-sans">
                <p className="font-semibold">{it.name}</p>
                <p className="text-xs text-muted">{it.sku}</p>
              </td>
              <td className="py-2 text-right">{num(it.quantity)}</td>
              <td className="py-2 text-right">{money(it.unitPrice)}</td>
              <td className="py-2 text-right font-semibold">{money(it.itemTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="num mt-3 space-y-1.5 border-t border-dashed border-slate-300 pt-3">
        <Row label="Subtotal" value={money(sale.subtotal)} />
        {sale.discountAmount > 0 && <Row label={`Discount (${sale.discountPercent}%)`} value={`− ${money(sale.discountAmount)}`} />}
        <Row label={`Tax (${sale.taxPercent}%)`} value={money(sale.taxAmount)} />
        <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-base font-extrabold">
          <dt>Total</dt>
          <dd>{money(sale.totalAmount)}</dd>
        </div>
      </dl>

      {sale.notes && <p className="mt-4 text-muted">Note: {sale.notes}</p>}
      <p className="mt-6 text-center text-xs text-muted">Thank you for shopping with us.</p>
    </div>
  </Modal>
);

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <dt className="font-sans text-muted">{label}</dt>
    <dd>{value}</dd>
  </div>
);
