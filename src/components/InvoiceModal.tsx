import React from 'react';
import { X, Printer, Hammer, ShieldCheck, Download } from 'lucide-react';
import { Order } from '../types';

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="invoice-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-[#e7dfd5] overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Controls Bar */}
        <div className="px-6 py-4 border-b border-[#f0eae1] flex items-center justify-between bg-[#fdfbf7] print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#78350f]">WoodCraft Carpentry Official Tax Invoice</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-[#78350f] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-[#5c280a] cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#8c7e75] hover:text-[#291e14] rounded-lg hover:bg-[#f3ede2] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 space-y-8 bg-white text-[#291e14] font-sans print:p-0">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-[#78350f] pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#78350f] text-white flex items-center justify-center">
                <Hammer className="w-7 h-7 text-[#fde68a]" />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#291e14]">WoodCraft Carpentry</h2>
                <p className="text-xs text-[#854d0e] font-semibold tracking-wider uppercase">Master Joinery & Architectural Woodworks</p>
                <p className="text-[11px] text-[#786b62] mt-0.5">102 Timber Mill Road, Sawmill District, OR 97477 • GSTIN: 33WOODCRAFT9921</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-[#78350f] uppercase tracking-widest block">TAX INVOICE</span>
              <p className="text-lg font-bold font-mono text-[#291e14] mt-0.5">#{order.orderNumber}</p>
              <p className="text-xs text-[#8c7e75]">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Billed To & Shipping */}
          <div className="grid grid-cols-2 gap-8 text-xs">
            <div>
              <span className="font-bold text-[#78350f] uppercase tracking-wider block mb-1">Billed & Shipped To:</span>
              <p className="font-bold text-sm text-[#291e14]">{order.customerName}</p>
              <p className="text-[#57483f] mt-0.5">{order.shippingAddress.street}</p>
              <p className="text-[#57483f]">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
              <p className="text-[#8c7e75] mt-1">Phone: {order.customerPhone}</p>
              <p className="text-[#8c7e75]">Email: {order.customerEmail}</p>
            </div>

            <div className="text-right space-y-1">
              <span className="font-bold text-[#78350f] uppercase tracking-wider block mb-1">Order Details:</span>
              <p className="text-[#57483f]">Payment Method: <strong className="uppercase text-[#291e14]">{order.paymentMethod}</strong></p>
              <p className="text-[#57483f]">Payment Status: <strong className="uppercase text-[#15803d]">{order.paymentStatus}</strong></p>
              <p className="text-[#57483f]">Fulfillment Status: <strong>{order.orderStatus}</strong></p>
              {order.assignedCarpenterName && (
                <p className="text-[#78350f] font-semibold">Master Joiner: {order.assignedCarpenterName}</p>
              )}
            </div>
          </div>

          {/* Table of Items */}
          <div className="border border-[#e7dfd5] rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fdfbf7] text-[#291e14] font-bold border-b border-[#e7dfd5]">
                <tr>
                  <th className="p-3">Item & Specifications</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0eae1]">
                {order.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="p-3">
                      <p className="font-bold text-[#291e14]">{it.name}</p>
                      <p className="text-[11px] text-[#8c7e75]">
                        {it.selectedFinish ? `Finish: ${it.selectedFinish}` : 'Standard Solid Hardwood'}
                        {it.selectedDimensions ? ` • ${it.selectedDimensions}` : ''}
                      </p>
                    </td>
                    <td className="p-3 text-center font-bold">{it.quantity}</td>
                    <td className="p-3 text-right font-mono">${(it.price ?? 0).toLocaleString()}</td>
                    <td className="p-3 text-right font-bold font-mono">
                      ${((it.price ?? 0) * (it.quantity ?? 1)).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Subtotals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-[#57483f]">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold">${(order.subtotal ?? 0).toLocaleString()}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-[#15803d] font-semibold">
                  <span>Promotional Discount:</span>
                  <span className="font-mono">-${order.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-[#57483f]">
                <span>White-Glove Shipping:</span>
                <span className="font-mono font-semibold">
                  {order.deliveryCharges === 0 ? 'FREE' : `$${order.deliveryCharges}`}
                </span>
              </div>
              <div className="flex justify-between text-[#57483f]">
                <span>Sales Tax (8%):</span>
                <span className="font-mono font-semibold">${order.taxAmount}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#291e14] pt-2 border-t-2 border-[#78350f]">
                <span>Grand Total Paid:</span>
                <span className="text-base text-[#92400e] font-mono">${(order.grandTotal ?? 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Guarantee stamp */}
          <div className="pt-6 border-t border-[#f0eae1] flex items-center justify-between text-xs text-[#8c7e75]">
            <div className="flex items-center gap-2 text-[#78350f] font-semibold">
              <ShieldCheck className="w-5 h-5 text-[#b45309]" />
              <span>Certified 10-Year WoodCraft Structural Joinery Guarantee</span>
            </div>
            <div className="text-right">
              <p className="font-serif italic font-bold text-[#78350f]">Arthur Vance</p>
              <p className="text-[10px] text-[#8c7e75]">Master Joiner & Workshop Director</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
