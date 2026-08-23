import React, { useState } from 'react';
import {
  User,
  Package,
  FileText,
  Wrench,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Send,
  Bot,
  MessageSquare,
} from 'lucide-react';
import {
  User as UserType,
  Order,
  CustomFurnitureRequest,
  ServiceBooking,
} from '../types';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

interface CustomerDashboardProps {
  currentUser: UserType;
  orders: Order[];
  quotes: CustomFurnitureRequest[];
  bookings: ServiceBooking[];
  onOpenTracking: (orderId: string) => void;
  onOpenInvoice: (order: Order) => void;
  onRefreshData: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  currentUser,
  orders,
  quotes,
  bookings,
  onOpenTracking,
  onOpenInvoice,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'quotes' | 'bookings' | 'addresses' | 'ai_doctor'>('orders');

  // AI Wood Doctor Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: 'model',
      content: `Hello ${currentUser.name}! I am Master Arthur Vance, Chief Woodwright at WoodCraft Carpentry. How can I assist you with timber selection, finish maintenance, joint repairs, or custom furniture planning today?`,
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Filter for this customer
  const myOrders = orders.filter((o) => o.customerId === currentUser.id);
  const myQuotes = quotes.filter((q) => q.customerId === currentUser.id);
  const myBookings = bookings.filter((b) => b.customerId === currentUser.id);

  const handleRespondToQuote = async (quoteId: string, action: 'accepted' | 'rejected') => {
    try {
      await api.respondToQuotation(quoteId, action);
      if (action === 'accepted') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#78350f', '#b45309', '#15803d'],
        });
      }
      onRefreshData();
    } catch (err) {
      console.error('Failed to respond to quote:', err);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput.trim();
    const newHistory = [...chatMessages, { role: 'user', content: userText }];
    setChatMessages(newHistory);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await api.askWoodDoctor(userText, newHistory);
      setChatMessages([...newHistory, { role: 'model', content: res.reply }]);
    } catch {
      setChatMessages([
        ...newHistory,
        {
          role: 'model',
          content: 'I could not reach the workshop AI connection. Solid wood expands in high humidity—remember to condition with beeswax twice a year!',
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div id="customer-dashboard-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* User Header Profile */}
      <div className="bg-gradient-to-r from-[#451a03] to-[#78350f] rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
            alt={currentUser.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#fde68a] shadow-md"
          />
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#fde68a] bg-black/30 px-2 py-0.5 rounded">
              Customer Account
            </span>
            <h2 className="text-2xl font-serif font-bold mt-1 text-white">{currentUser.name}</h2>
            <p className="text-xs text-[#fef3c7] mt-0.5">{currentUser.email} • {currentUser.phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-center">
            <span className="text-xs text-[#fde68a] block font-medium">Orders</span>
            <span className="text-lg font-bold text-white">{myOrders.length}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-center">
            <span className="text-xs text-[#fde68a] block font-medium">Quotations</span>
            <span className="text-lg font-bold text-white">{myQuotes.length}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-center">
            <span className="text-xs text-[#fde68a] block font-medium">Bookings</span>
            <span className="text-lg font-bold text-white">{myBookings.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e7dfd5] pb-4 mb-6 overflow-x-auto no-scrollbar">
        {[
          { id: 'orders', label: 'My Furniture Orders', icon: Package, count: myOrders.length },
          { id: 'quotes', label: 'Custom Quotations', icon: FileText, count: myQuotes.length },
          { id: 'bookings', label: 'Carpenter Service Visits', icon: Wrench, count: myBookings.length },
          { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
          { id: 'ai_doctor', label: 'AI Wood Doctor Chat', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${
                isActive
                  ? 'bg-[#78350f] text-white shadow-xs'
                  : 'bg-[#f7f3eb] text-[#57483f] hover:bg-[#ede5d8]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-2 py-0.2 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#e7dfd5] text-[#291e14]'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {myOrders.length === 0 ? (
            <div className="py-16 text-center text-[#8c7e75] bg-white rounded-3xl border border-[#e7dfd5]">
              <Package className="w-12 h-12 mx-auto text-[#dfd4c5] mb-2" />
              <p className="font-semibold text-sm text-[#291e14]">No orders placed yet</p>
            </div>
          ) : (
            myOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-[#e7dfd5] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-base text-[#291e14]">
                      Order #{order.orderNumber}
                    </span>
                    <span className="px-2.5 py-0.5 bg-[#fef3c7] text-[#92400e] text-[11px] font-bold rounded-md uppercase">
                      {order.orderStatus}
                    </span>
                  </div>

                  <p className="text-xs text-[#8c7e75]">
                    Placed on {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items • ₹{(order.grandTotal ?? (order as any).totalAmount ?? 0).toLocaleString('en-IN')} ({order.paymentMethod.toUpperCase()})
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    {order.items.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-[#f7f3eb] text-[#57483f] px-2.5 py-1 rounded-lg border border-[#e7dfd5]"
                      >
                        {item.name || (item as any).productName} ({item.quantity}x)
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => onOpenTracking(order.id)}
                    className="px-4 py-2 bg-[#78350f] hover:bg-[#5c280a] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                  >
                    Track Progress
                  </button>
                  <button
                    onClick={() => onOpenInvoice(order)}
                    className="px-4 py-2 bg-[#f7f3eb] hover:bg-[#ede5d8] text-[#57483f] border border-[#dfd4c5] text-xs font-bold rounded-xl transition-colors"
                  >
                    Invoice
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: QUOTATIONS */}
      {activeTab === 'quotes' && (
        <div className="space-y-4">
          {myQuotes.length === 0 ? (
            <div className="py-16 text-center text-[#8c7e75] bg-white rounded-3xl border border-[#e7dfd5]">
              <FileText className="w-12 h-12 mx-auto text-[#dfd4c5] mb-2" />
              <p className="font-semibold text-sm text-[#291e14]">No custom quotations requested yet</p>
            </div>
          ) : (
            myQuotes.map((q) => (
              <div
                key={q.id}
                className="bg-white rounded-3xl border border-[#e7dfd5] p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#f0eae1] gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-base text-[#291e14]">
                        Quotation #{q.quoteNumber}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                          q.status === 'quoted'
                            ? 'bg-[#dcfce7] text-[#15803d]'
                            : q.status === 'accepted'
                            ? 'bg-[#dbeafe] text-[#1e40af]'
                            : q.status === 'pending_review'
                            ? 'bg-[#fef3c7] text-[#92400e]'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {q.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-[#8c7e75] mt-0.5">
                      Submitted on {new Date(q.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {q.quotation && (
                    <div className="text-right">
                      <span className="text-xs text-[#8c7e75]">Official Workshop Quote:</span>
                      <p className="text-xl font-bold text-[#92400e]">
                        ₹{q.quotation.grandTotal.toLocaleString('en-IN')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Specs Box */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#fdfbf7] p-3.5 rounded-2xl border border-[#f0eae1]">
                  <div>
                    <span className="text-[#8c7e75]">Furniture Piece:</span>
                    <p className="font-semibold text-[#291e14]">{q.furnitureType}</p>
                  </div>
                  <div>
                    <span className="text-[#8c7e75]">Dimensions:</span>
                    <p className="font-semibold text-[#291e14]">
                      {q.dimensions.length}"L × {q.dimensions.width}"W × {q.dimensions.height}"H {q.dimensions.unit}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#8c7e75]">Selected Hardwood:</span>
                    <p className="font-semibold text-[#291e14]">{q.woodType} ({q.finishType})</p>
                  </div>
                </div>

                {/* Bill of Materials Breakdown if Quoted */}
                {q.quotation && (
                  <div className="p-4 bg-[#f7f3eb] rounded-2xl border border-[#e7dfd5] space-y-2 text-xs">
                    <p className="font-bold text-[#78350f] uppercase tracking-wider text-[10px]">
                      Official Bill of Materials & Workshop Labor Breakdown:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[#57483f]">
                      <div>
                        <span className="text-[#8c7e75] block">Timber Lumber:</span>
                        <strong className="text-[#291e14]">₹{q.quotation.materialCost.toLocaleString('en-IN')}</strong>
                      </div>
                      <div>
                        <span className="text-[#8c7e75] block">Joinery Labor:</span>
                        <strong className="text-[#291e14]">₹{q.quotation.laborCost.toLocaleString('en-IN')}</strong>
                      </div>
                      <div>
                        <span className="text-[#8c7e75] block">PU Finish & Sealer:</span>
                        <strong className="text-[#291e14]">₹{q.quotation.finishCost.toLocaleString('en-IN')}</strong>
                      </div>
                      <div>
                        <span className="text-[#8c7e75] block">Delivery & Install:</span>
                        <strong className="text-[#291e14]">₹{q.quotation.deliveryCost.toLocaleString('en-IN')}</strong>
                      </div>
                    </div>

                    {q.quotation.adminNotes && (
                      <p className="text-[11px] text-[#6e5d52] pt-2 border-t border-[#e0d6c8] italic">
                        "{q.quotation.adminNotes}"
                      </p>
                    )}

                    {/* Customer Action (Accept & Pay / Decline) */}
                    {q.status === 'quoted' && (
                      <div className="pt-3 flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleRespondToQuote(q.id, 'rejected')}
                          className="px-4 py-2 bg-white text-[#dc2626] border border-[#fecaca] text-xs font-bold rounded-xl hover:bg-[#fef2f2]"
                        >
                          Decline Quote
                        </button>
                        <button
                          onClick={() => handleRespondToQuote(q.id, 'accepted')}
                          className="px-5 py-2 bg-[#15803d] hover:bg-[#166534] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Accept & Confirm Build</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {myBookings.length === 0 ? (
            <div className="py-16 text-center text-[#8c7e75] bg-white rounded-3xl border border-[#e7dfd5]">
              <Wrench className="w-12 h-12 mx-auto text-[#dfd4c5] mb-2" />
              <p className="font-semibold text-sm text-[#291e14]">No carpenter service visits booked</p>
            </div>
          ) : (
            myBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-3xl border border-[#e7dfd5] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-sm text-[#291e14]">
                      {b.serviceName || (b as any).serviceType}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                        b.status === 'completed'
                          ? 'bg-[#dcfce7] text-[#15803d]'
                          : b.status === 'assigned'
                          ? 'bg-[#dbeafe] text-[#1e40af]'
                          : 'bg-[#fef3c7] text-[#92400e]'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                  <p className="text-[#57483f]">
                    Scheduled: <strong>{b.preferredDate || (b as any).scheduledDate}</strong> ({b.preferredTimeSlot || (b as any).scheduledTimeSlot})
                  </p>
                  <p className="text-[#8c7e75]">
                    {typeof b.address === 'string' ? b.address : `${b.address.street}, ${b.address.city}, ${b.address.state || ''}`}
                  </p>
                  {(b.assignedWorkerName || (b as any).assignedCarpenter?.name) && (
                    <p className="text-[#065f46] font-semibold">
                      Assigned Joiner: {b.assignedWorkerName || (b as any).assignedCarpenter?.name}
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs text-[#8c7e75]">Estimated Cost:</span>
                  <p className="text-base font-bold text-[#291e14]">₹{((b.finalCost || b.estimatedCost) ?? 0).toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: SAVED ADDRESSES */}
      {activeTab === 'addresses' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {((currentUser as any).addresses || [
            {
              street: currentUser.address || '42 Indiranagar, 100ft Road',
              city: 'Bengaluru',
              state: 'Karnataka',
              zipCode: '560038',
              country: 'India',
              isDefault: true,
            },
          ]).map((addr: any, idx: number) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-[#e7dfd5] p-5 shadow-xs space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#291e14]">{addr.street}</span>
                {addr.isDefault && (
                  <span className="px-2 py-0.5 bg-[#fef3c7] text-[#92400e] font-bold text-[10px] rounded-md">
                    Default Address
                  </span>
                )}
              </div>
              <p className="text-[#57483f]">
                {addr.city}, {addr.state} {addr.zipCode || addr.postalCode}
              </p>
              <p className="text-[#8c7e75]">{addr.country || 'United States'}</p>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: AI WOOD DOCTOR CHAT */}
      {activeTab === 'ai_doctor' && (
        <div className="bg-white rounded-3xl border border-[#e7dfd5] overflow-hidden shadow-md flex flex-col h-[520px]">
          <div className="px-6 py-4 bg-[#fdfbf7] border-b border-[#f0eae1] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#78350f] text-[#fde68a] flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-[#291e14]">
                Master Arthur Vance — AI Wood Doctor
              </h4>
              <p className="text-[11px] text-[#8c7e75]">
                Expert advice on timber species, moisture acclimation, polish care, and joint repair
              </p>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#fbf8f2]/60">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role !== 'user' && (
                  <div className="w-7 h-7 rounded-full bg-[#78350f] text-white flex items-center justify-center text-xs shrink-0 mt-1">
                    🪵
                  </div>
                )}
                <div
                  className={`max-w-lg p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#78350f] text-white rounded-tr-xs'
                      : 'bg-white text-[#291e14] border border-[#e7dfd5] rounded-tl-xs shadow-2xs'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex gap-2 items-center text-xs text-[#8c7e75]">
                <div className="w-2 h-2 rounded-full bg-[#b45309] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#b45309] animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-[#b45309] animate-bounce [animation-delay:0.4s]" />
                <span>Consulting timber archives...</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendChatMessage} className="p-4 bg-white border-t border-[#f0eae1] flex gap-2">
            <input
              type="text"
              placeholder="Ask about fixing scratches, Burma teak vs oak, polyurethane finishes..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-[#fdfbf7] border border-[#dfd4c5] rounded-xl text-xs text-[#291e14] focus:outline-hidden focus:border-[#78350f]"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="px-5 py-2.5 bg-[#78350f] hover:bg-[#5c280a] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
