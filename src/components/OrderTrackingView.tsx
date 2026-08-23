import React, { useState } from 'react';
import {
  Package,
  CheckCircle2,
  Clock,
  Hammer,
  Truck,
  FileText,
  Search,
  ChevronRight,
  ShieldCheck,
  User,
  Phone,
  Camera,
  Layers,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface OrderTrackingViewProps {
  orders: Order[];
  onOpenInvoice: (order: Order) => void;
}

const STAGES: Array<{ status: OrderStatus; label: string; icon: any }> = [
  { status: 'Order Placed', label: 'Order Placed', icon: Package },
  { status: 'Confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { status: 'In Production', label: 'In Production', icon: Hammer },
  { status: 'Quality Check', label: 'Quality Check', icon: ShieldCheck },
  { status: 'Ready', label: 'Ready', icon: Layers },
  { status: 'Shipped', label: 'Shipped', icon: Truck },
  { status: 'Delivered', label: 'Delivered', icon: CheckCircle2 },
];

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  orders,
  onOpenInvoice,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');
  const [searchCode, setSearchCode] = useState<string>('');

  const activeOrder = orders.find((o) => o.id === selectedOrderId || o.orderNumber === searchCode) || orders[0];

  const getStageIndex = (status: OrderStatus) => {
    return STAGES.findIndex((s) => s.status === status);
  };

  const currentStageIndex = activeOrder ? getStageIndex(activeOrder.orderStatus) : 0;

  return (
    <div id="order-tracking-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-[#e7dfd5] gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#92400e]">
            Live Production Telemetry
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#291e14] mt-1">
            Order & Workshop Tracking
          </h2>
          <p className="text-sm text-[#6e5d52] mt-1">
            Follow your custom timber through kiln-drying, master joinery, polish coats, and white-glove dispatch.
          </p>
        </div>

        {/* Order Search */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8c7e75] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter Order # (e.g. WC-ORD-8821)"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="pl-9 pr-3 py-2 bg-white border border-[#dfd4c5] rounded-xl text-xs text-[#291e14] focus:outline-hidden focus:border-[#78350f]"
            />
          </div>
        </div>
      </div>

      {/* Orders Selector Pills */}
      {orders.length > 1 && (
        <div className="py-4 flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-[#f0eae1]">
          <span className="text-xs font-bold text-[#8c7e75] whitespace-nowrap">Your Orders:</span>
          {orders.map((ord) => (
            <button
              key={ord.id}
              onClick={() => setSelectedOrderId(ord.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeOrder?.id === ord.id
                  ? 'bg-[#78350f] text-white shadow-xs'
                  : 'bg-[#f7f3eb] text-[#57483f] hover:bg-[#ede5d8]'
              }`}
            >
              #{ord.orderNumber} ({ord.orderStatus})
            </button>
          ))}
        </div>
      )}

      {activeOrder ? (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Stepper & Details */}
          <div className="lg:col-span-8 space-y-6">
            {/* Visual 7-Stage Stepper Pipeline */}
            <div className="bg-white rounded-3xl border border-[#e7dfd5] p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#f0eae1]">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#291e14]">
                    Order #{activeOrder.orderNumber}
                  </h3>
                  <p className="text-xs text-[#8c7e75]">
                    Placed on {new Date(activeOrder.createdAt).toLocaleDateString()} • {activeOrder.items.length} items
                  </p>
                </div>

                <button
                  onClick={() => onOpenInvoice(activeOrder)}
                  className="px-3.5 py-1.5 bg-[#f7f3eb] hover:bg-[#f0eae1] text-[#78350f] border border-[#dfd4c5] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-[#b45309]" />
                  <span>View Tax Invoice</span>
                </button>
              </div>

              {/* Responsive Stepper */}
              <div className="pt-6 pb-2">
                <div className="hidden sm:grid grid-cols-7 gap-1 text-center relative">
                  {/* Stepper connecting line */}
                  <div className="absolute top-5 left-8 right-8 h-1 bg-[#ede5d8] -z-0" />
                  <div
                    className="absolute top-5 left-8 h-1 bg-[#78350f] -z-0 transition-all duration-500"
                    style={{
                      width: `${(currentStageIndex / (STAGES.length - 1)) * 88}%`,
                    }}
                  />

                  {STAGES.map((stg, idx) => {
                    const isCompleted = idx <= currentStageIndex;
                    const isCurrent = idx === currentStageIndex;
                    const Icon = stg.icon;

                    return (
                      <div key={stg.status} className="relative z-10 flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            isCompleted
                              ? 'bg-[#78350f] text-white shadow-md'
                              : 'bg-[#f7f3eb] text-[#a89b91] border border-[#e7dfd5]'
                          } ${isCurrent ? 'ring-4 ring-[#fde68a]' : ''}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span
                          className={`text-[11px] mt-2 font-semibold ${
                            isCurrent
                              ? 'text-[#78350f] font-bold'
                              : isCompleted
                              ? 'text-[#291e14]'
                              : 'text-[#a89b91]'
                          }`}
                        >
                          {stg.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Mobile Stepper view */}
                <div className="sm:hidden flex items-center justify-between p-3 bg-[#fdf3e7] rounded-xl border border-[#fde68a]">
                  <div className="flex items-center gap-2">
                    <Hammer className="w-4 h-4 text-[#78350f]" />
                    <span className="text-xs font-bold text-[#78350f]">Current Stage:</span>
                  </div>
                  <span className="px-2.5 py-1 bg-[#78350f] text-white text-xs font-bold rounded-lg">
                    {activeOrder.orderStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Production Timeline Milestones with Photos */}
            <div className="bg-white rounded-3xl border border-[#e7dfd5] p-6 shadow-xs space-y-4">
              <h4 className="font-serif font-bold text-base text-[#291e14] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#b45309]" />
                <span>Workshop Logs & Inspection Milestones</span>
              </h4>

              <div className="space-y-4 divide-y divide-[#f5efe6]">
                {(activeOrder.timeline || []).map((entry, idx) => (
                  <div key={idx} className="pt-4 first:pt-0 flex gap-4">
                    <div className="w-3 h-3 rounded-full bg-[#b45309] mt-1.5 shrink-0 ring-4 ring-[#fef3c7]" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#291e14]">{entry.status}</span>
                        <span className="text-[11px] text-[#8c7e75]">{entry.timestamp}</span>
                      </div>
                      <p className="text-xs text-[#57483f] leading-relaxed">{entry.description}</p>
                      {entry.updatedBy && (
                        <p className="text-[10px] text-[#8c7e75]">Logged by: {entry.updatedBy}</p>
                      )}
                      {entry.photoMilestoneUrl && (
                        <div className="mt-2 w-48 h-32 rounded-xl overflow-hidden border border-[#dfd4c5] shadow-2xs">
                          <img
                            src={entry.photoMilestoneUrl}
                            alt="Milestone"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Items List */}
            <div className="bg-white rounded-3xl border border-[#e7dfd5] p-6 shadow-xs space-y-3">
              <h4 className="font-serif font-bold text-base text-[#291e14]">
                Items In This Build ({activeOrder.items.length})
              </h4>
              <div className="divide-y divide-[#f5efe6]">
                {activeOrder.items.map((item, idx) => (
                  <div key={idx} className="py-3 first:pt-0 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image || (item as any).productImage}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover bg-[#f7f3eb] border border-[#e7dfd5]"
                      />
                      <div>
                        <p className="text-xs font-bold text-[#291e14]">{item.name || (item as any).productName}</p>
                        <p className="text-[11px] text-[#8c7e75]">
                          Qty: {item.quantity} {item.selectedFinish ? `• Finish: ${item.selectedFinish}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#291e14]">
                      ${(((item.price ?? (item as any).unitPrice ?? 0)) * (item.quantity ?? 1)).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Assigned Master Carpenter & Delivery Address */}
          <div className="lg:col-span-4 space-y-6">
            {/* Master Carpenter Card */}
            <div className="bg-white rounded-3xl border border-[#e7dfd5] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#f0eae1]">
                <h4 className="font-serif font-bold text-sm text-[#291e14]">
                  Assigned Master Joiner
                </h4>
                <span className="px-2 py-0.5 bg-[#dcfce7] text-[#15803d] text-[10px] font-bold rounded-md">
                  Active
                </span>
              </div>

              {(activeOrder as any).assignedCarpenter || activeOrder.assignedCarpenterName ? (
                <div className="flex items-center gap-3">
                  <img
                    src={(activeOrder as any).assignedCarpenter?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'}
                    alt={(activeOrder as any).assignedCarpenter?.name || activeOrder.assignedCarpenterName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#b45309]"
                  />
                  <div>
                    <h5 className="text-xs font-bold text-[#291e14]">
                      {(activeOrder as any).assignedCarpenter?.name || activeOrder.assignedCarpenterName}
                    </h5>
                    <p className="text-[11px] text-[#786b62]">
                      {(activeOrder as any).assignedCarpenter?.specialty || 'Master Joiner & Finish Specialist'}
                    </p>
                    <p className="text-[11px] text-[#8c7e75] mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#b45309]" />
                      <span>{(activeOrder as any).assignedCarpenter?.phone || '+1 (555) 349-8821'}</span>
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#8c7e75]">
                  Assigning master joiner based on timber species requirements.
                </p>
              )}
            </div>

            {/* Shipping & Payment Card */}
            <div className="bg-[#fdfbf7] rounded-3xl border border-[#e7dfd5] p-6 space-y-3 text-xs">
              <h4 className="font-serif font-bold text-sm text-[#291e14]">
                Destination & Payment Summary
              </h4>

              <div>
                <span className="text-[#8c7e75] block">Delivery Recipient:</span>
                <p className="font-semibold text-[#291e14] mt-0.5">
                  {activeOrder.customerName} ({activeOrder.customerPhone})
                </p>
                <p className="text-[#57483f] mt-0.5">
                  {activeOrder.shippingAddress?.street}, {activeOrder.shippingAddress?.city}, {activeOrder.shippingAddress?.state} {activeOrder.shippingAddress?.postalCode || (activeOrder.shippingAddress as any)?.zipCode}
                </p>
              </div>

              <div className="pt-2 border-t border-[#f0eae1] flex justify-between">
                <span className="text-[#8c7e75]">Payment Status:</span>
                <span className="font-bold uppercase text-[#15803d]">
                  {activeOrder.paymentStatus} ({activeOrder.paymentMethod})
                </span>
              </div>

              <div className="flex justify-between font-bold text-sm text-[#291e14] pt-1">
                <span>Grand Total:</span>
                <span className="text-[#92400e]">${(activeOrder.grandTotal ?? (activeOrder as any).totalAmount ?? 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center text-[#8c7e75]">
          No active order found. Enter your order ID above.
        </div>
      )}
    </div>
  );
};
