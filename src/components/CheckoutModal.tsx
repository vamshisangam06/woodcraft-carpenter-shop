import React, { useState } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  Truck,
  CheckCircle2,
  Lock,
  Building,
  DollarSign,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { User, OrderItem, Order } from '../types';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  items: OrderItem[];
  appliedDiscount: number;
  couponCode?: string;
  onOrderCompleted: (createdOrder: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  items,
  appliedDiscount,
  couponCode,
  onOrderCompleted,
}) => {
  const [fullName, setFullName] = useState(currentUser.name || 'Aarav Sharma');
  const [email, setEmail] = useState(currentUser.email || 'aarav.sharma@example.com');
  const [phone, setPhone] = useState(currentUser.phone || '+91 98765 43210');
  const [street, setStreet] = useState(currentUser.address || '42 Indiranagar, 100ft Road');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [postalCode, setPostalCode] = useState('560038');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'card' | 'netbanking'>('upi');

  // Card details state
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('890');

  const [processing, setProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 35000 || subtotal === 0 ? 0 : 1500;
  const tax = Math.round(subtotal * 0.12);
  const grandTotal = Math.max(0, subtotal + deliveryFee + tax - appliedDiscount);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const order = await api.createOrder({
        customerId: currentUser.id,
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        shippingAddress: {
          fullName,
          phone,
          street,
          city,
          state,
          postalCode,
        },
        items,
        subtotal,
        customizationCharges: 0,
        deliveryCharges: deliveryFee,
        taxAmount: tax,
        discountAmount: appliedDiscount,
        couponApplied: couponCode,
        grandTotal,
        preferredDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        orderStatus: 'Order Placed',
        notes: orderNotes,
      });

      setCompletedOrder(order);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#78350f', '#b45309', '#f59e0b', '#10b981'],
      });
      onOrderCompleted(order);
    } catch (err) {
      console.error('Order creation failed:', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      id="checkout-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-[#e7dfd5] overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#f0eae1] flex items-center justify-between bg-[#fdfbf7]">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#78350f]" />
            <h3 className="font-serif font-bold text-base text-[#291e14]">
              Secure WoodCraft Checkout
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#8c7e75] hover:text-[#291e14] rounded-lg hover:bg-[#f3ede2]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {completedOrder ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#dcfce7] text-[#15803d] flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#15803d]">
              Order Confirmed & Production Scheduled
            </span>
            <h2 className="text-2xl font-serif font-bold text-[#291e14]">
              Order #{completedOrder.orderNumber}
            </h2>
            <p className="text-xs text-[#57483f] max-w-md mx-auto leading-relaxed">
              Thank you, <strong>{completedOrder.customerName}</strong>! Your order for {items.length} handcrafted pieces has been registered into our workshop production line.
            </p>

            <div className="p-4 bg-[#fdfbf7] rounded-2xl border border-[#f0eae1] max-w-md mx-auto text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-[#8c7e75]">Delivery Address:</span>
                <span className="font-semibold text-[#291e14]">{completedOrder.shippingAddress.street}, {completedOrder.shippingAddress.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8c7e75]">Payment Method:</span>
                <span className="font-bold text-[#78350f] uppercase">{completedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8c7e75]">Total Paid:</span>
                <span className="font-bold text-base text-[#291e14]">₹{(completedOrder.grandTotal ?? 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#78350f] text-white text-xs font-bold rounded-xl hover:bg-[#5c280a]"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Step 1: Customer Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#78350f] text-white text-[10px] font-bold flex items-center justify-center">
                  1
                </span>
                <h4 className="font-serif font-bold text-sm text-[#291e14]">
                  Delivery Address & Recipient
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-bold text-[#291e14] block mb-1">Full Name:</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2.5 bg-[#fdfbf7] border border-[#dfd4c5] rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#291e14] block mb-1">Email Address:</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 bg-[#fdfbf7] border border-[#dfd4c5] rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#291e14] block mb-1">Phone Number:</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-[#fdfbf7] border border-[#dfd4c5] rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs pt-1">
                <div className="sm:col-span-2">
                  <label className="font-bold text-[#291e14] block mb-1">Street Address:</label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full p-2.5 bg-[#fdfbf7] border border-[#dfd4c5] rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#291e14] block mb-1">City / State:</label>
                  <input
                    type="text"
                    required
                    value={`${city}, ${state}`}
                    onChange={(e) => {
                      const parts = e.target.value.split(',');
                      setCity(parts[0]?.trim() || '');
                      setState(parts[1]?.trim() || '');
                    }}
                    className="w-full p-2.5 bg-[#fdfbf7] border border-[#dfd4c5] rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#291e14] block mb-1">Pin Code:</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full p-2.5 bg-[#fdfbf7] border border-[#dfd4c5] rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="space-y-3 pt-4 border-t border-[#f0eae1]">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#78350f] text-white text-[10px] font-bold flex items-center justify-center">
                  2
                </span>
                <h4 className="font-serif font-bold text-sm text-[#291e14]">
                  Select Payment Method
                </h4>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'upi', label: 'UPI / QR Code', icon: QrCode, desc: 'Google Pay, PhonePe, Paytm' },
                  { id: 'card', label: 'Credit/Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
                  { id: 'netbanking', label: 'Net Banking', icon: Building, desc: 'All Indian Banks' },
                  { id: 'cod', label: 'Cash on Delivery', icon: DollarSign, desc: 'Pay at installation' },
                ].map((pm) => {
                  const Icon = pm.icon;
                  const isSel = paymentMethod === pm.id;
                  return (
                    <div
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id as any)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isSel
                          ? 'bg-[#fdf3e7] border-[#b45309] ring-1 ring-[#b45309]'
                          : 'bg-[#fdfbf7] border-[#dfd4c5] hover:bg-[#fbf7f0]'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isSel ? 'text-[#78350f]' : 'text-[#8c7e75]'}`} />
                      <p className="font-bold text-xs text-[#291e14] mt-2">{pm.label}</p>
                      <p className="text-[10px] text-[#8c7e75] mt-0.5">{pm.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Payment Details */}
              {paymentMethod === 'card' && (
                <div className="p-4 bg-[#fdfbf7] rounded-2xl border border-[#dfd4c5] grid grid-cols-3 gap-3 text-xs">
                  <div className="col-span-3">
                    <label className="font-bold block mb-1">Card Number:</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full p-2.5 bg-white border border-[#dfd4c5] rounded-xl font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Expiry:</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full p-2.5 bg-white border border-[#dfd4c5] rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">CVV:</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full p-2.5 bg-white border border-[#dfd4c5] rounded-xl text-xs"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="p-4 bg-[#fdf3e7] rounded-2xl border border-[#fde68a] flex items-center gap-4 text-xs">
                  <div className="w-16 h-16 bg-white p-2 rounded-xl border border-[#dfd4c5] shrink-0 flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-[#78350f]" />
                  </div>
                  <div>
                    <p className="font-bold text-[#78350f]">WoodCraft Workshop UPI ID:</p>
                    <code className="text-xs font-bold text-[#291e14] bg-white px-2 py-1 rounded-md mt-1 inline-block">
                      woodcraft.carpentry@upi
                    </code>
                    <p className="text-[10px] text-[#8c7e75] mt-1">Instant digital payment verification via BHIM / UPI.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Order Summary & Place Order */}
            <div className="pt-4 border-t border-[#f0eae1] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs space-y-0.5">
                <span className="text-[#8c7e75]">Total ({items.length} items + GST):</span>
                <p className="text-2xl font-serif font-bold text-[#92400e]">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </p>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#78350f] hover:bg-[#5c280a] text-white font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>{processing ? 'Processing Payment...' : 'Authorize & Place Order'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
