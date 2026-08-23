import React, { useState } from 'react';
import {
  Wrench,
  Hammer,
  Clock,
  CheckCircle2,
  MapPin,
  Camera,
  Layers,
  Phone,
} from 'lucide-react';
import { Order, ServiceBooking, User, OrderStatus } from '../types';
import { api } from '../services/api';

interface CarpenterPortalProps {
  currentUser: User;
  orders: Order[];
  bookings: ServiceBooking[];
  onRefreshData: () => void;
}

export const CarpenterPortal: React.FC<CarpenterPortalProps> = ({
  currentUser,
  orders,
  bookings,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'builds' | 'visits'>('builds');

  // Milestone update state
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [nextStage, setNextStage] = useState<OrderStatus>('Quality Check');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  // Assigned to current carpenter or all if carpenter ID matches or demo
  const assignedOrders = orders.filter(
    (o) =>
      o.assignedCarpenterId === currentUser.id ||
      (o.assignedCarpenterName && o.assignedCarpenterName.includes(currentUser.name))
  );
  const assignedBookings = bookings.filter(
    (b) =>
      b.assignedWorkerId === currentUser.id ||
      (b.assignedWorkerName && b.assignedWorkerName.includes(currentUser.name))
  );

  const handleUpdateMilestone = async (orderId: string) => {
    try {
      await api.updateOrderStatus(
        orderId,
        nextStage,
        notes || `Progressed to ${nextStage} by ${currentUser.name}`,
        currentUser.name,
        photoUrl || undefined
      );
      setSelectedOrderId(null);
      setNotes('');
      setPhotoUrl('');
      onRefreshData();
    } catch (err) {
      console.error('Failed to update stage:', err);
    }
  };

  const handleCompleteBooking = async (bookingId: string) => {
    try {
      await api.updateBookingStatus(bookingId, 'completed', 'Completed site repair and alignment.');
      onRefreshData();
    } catch (err) {
      console.error('Failed to complete booking:', err);
    }
  };

  return (
    <div id="carpenter-portal-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-gradient-to-r from-[#064e3b] to-[#047857] rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'}
            alt=""
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#a7f3d0] shadow-md"
          />
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#a7f3d0] bg-black/30 px-2 py-0.5 rounded">
              Carpenter Worker Portal
            </span>
            <h2 className="text-2xl font-serif font-bold mt-1 text-white">{currentUser.name}</h2>
            <p className="text-xs text-[#d1fae5] mt-0.5">Master Joiner & Finish Specialist</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-center">
            <span className="text-xs text-[#a7f3d0] block font-medium">Assigned Builds</span>
            <span className="text-lg font-bold text-white">{assignedOrders.length || orders.length}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-center">
            <span className="text-xs text-[#a7f3d0] block font-medium">Service Visits</span>
            <span className="text-lg font-bold text-white">{assignedBookings.length || bookings.length}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-[#e7dfd5] pb-4 mb-6">
        <button
          onClick={() => setActiveTab('builds')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'builds'
              ? 'bg-[#065f46] text-white shadow-xs'
              : 'bg-[#f7f3eb] text-[#57483f]'
          }`}
        >
          Active Workshop Builds ({assignedOrders.length || orders.length})
        </button>
        <button
          onClick={() => setActiveTab('visits')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'visits'
              ? 'bg-[#065f46] text-white shadow-xs'
              : 'bg-[#f7f3eb] text-[#57483f]'
          }`}
        >
          On-Site Service Calls ({assignedBookings.length || bookings.length})
        </button>
      </div>

      {activeTab === 'builds' && (
        <div className="space-y-4">
          {(assignedOrders.length > 0 ? assignedOrders : orders).map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-[#e7dfd5] p-6 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#f0eae1] gap-2">
                <div>
                  <span className="font-serif font-bold text-base text-[#291e14]">
                    Build #{order.orderNumber}
                  </span>
                  <p className="text-xs text-[#8c7e75]">
                    Customer: {order.customerName} • Status: <strong>{order.orderStatus}</strong>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedOrderId(order.id);
                    setNextStage(
                      order.orderStatus === 'In Production'
                        ? 'Quality Check'
                        : order.orderStatus === 'Quality Check'
                        ? 'Ready'
                        : 'Shipped'
                    );
                  }}
                  className="px-4 py-2 bg-[#065f46] hover:bg-[#044e39] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Log Stage Progress
                </button>
              </div>

              {/* Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {order.items.map((it, idx) => (
                  <div key={idx} className="p-3 bg-[#fdfbf7] rounded-xl border border-[#f0eae1] flex items-center gap-3">
                    <img src={it.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <p className="font-bold text-[#291e14]">{it.name} ({it.quantity}x)</p>
                      <p className="text-[11px] text-[#8c7e75]">Finish: {it.selectedFinish || 'Natural'}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Update subform */}
              {selectedOrderId === order.id && (
                <div className="p-4 bg-[#f0fdf4] rounded-2xl border border-[#bbf7d0] space-y-3">
                  <h5 className="font-bold text-xs text-[#065f46]">Update Production Milestone:</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-bold block mb-1">Target Stage:</label>
                      <select
                        value={nextStage}
                        onChange={(e) => setNextStage(e.target.value as OrderStatus)}
                        className="w-full p-2 bg-white border border-[#bbf7d0] rounded-lg font-bold text-[#065f46]"
                      >
                        <option value="In Production">In Production</option>
                        <option value="Quality Check">Quality Check</option>
                        <option value="Ready">Ready</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold block mb-1">Milestone Inspection Photo URL:</label>
                      <input
                        type="text"
                        value={photoUrl}
                        onChange={(e) => setPhotoUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full p-2 bg-white border border-[#bbf7d0] rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-xs">Carpenter Notes:</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Mortise and tenons aligned. First polyurethane top coat curing."
                      className="w-full p-2 bg-white border border-[#bbf7d0] rounded-lg text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setSelectedOrderId(null)}
                      className="px-3 py-1.5 bg-white text-xs font-bold rounded-lg border border-[#dfd4c5] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdateMilestone(order.id)}
                      className="px-4 py-1.5 bg-[#065f46] text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Submit Milestone
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'visits' && (
        <div className="space-y-4">
          {(assignedBookings.length > 0 ? assignedBookings : bookings).map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-3xl border border-[#e7dfd5] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1 text-xs">
                <span className="font-serif font-bold text-base text-[#291e14]">
                  {b.serviceName} (#{b.bookingNumber})
                </span>
                <p className="text-[#57483f]">Customer: {b.customerName} ({b.customerPhone})</p>
                <p className="text-[#8c7e75]">Address: {b.address.street}, {b.address.city}</p>
                <p className="text-[#065f46] font-semibold">Scheduled: {b.preferredDate} ({b.preferredTimeSlot})</p>
                <p className="italic text-[#6e5d52]">Issue: "{b.problemDescription}"</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {b.status !== 'completed' ? (
                  <button
                    onClick={() => handleCompleteBooking(b.id)}
                    className="px-4 py-2 bg-[#065f46] text-white text-xs font-bold rounded-xl hover:bg-[#044e39] flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Mark Completed
                  </button>
                ) : (
                  <span className="px-3 py-1 bg-[#dcfce7] text-[#15803d] text-xs font-bold rounded-lg">
                    Job Completed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
