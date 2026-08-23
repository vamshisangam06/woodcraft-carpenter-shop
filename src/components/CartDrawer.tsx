import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Tag,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { OrderItem } from '../types';
import { api } from '../services/api';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  onUpdateQuantity: (productId: string, quantity: number, finish?: string) => void;
  onRemoveItem: (productId: string, finish?: string) => void;
  onProceedToCheckout: (appliedDiscount: number, couponCode?: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  const [couponInput, setCouponInput] = useState<string>('WOOD10');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState<string>('');
  const [validatingCoupon, setValidatingCoupon] = useState<boolean>(false);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 1000 || subtotal === 0 ? 0 : 75;
  const tax = Math.round(subtotal * 0.08); // 8% sales tax

  const discountAmount = appliedCoupon
    ? appliedCoupon.discountPercent
      ? (subtotal * appliedCoupon.discountPercent) / 100
      : appliedCoupon.discountFlat || 0
    : 0;

  const grandTotal = Math.max(0, subtotal + deliveryFee + tax - discountAmount);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setValidatingCoupon(true);
    setCouponError('');

    try {
      const res = await api.validateCoupon(couponInput.trim(), subtotal);
      if (res.valid && res.coupon) {
        setAppliedCoupon(res.coupon);
      } else {
        setAppliedCoupon(null);
        setCouponError(res.message || 'Invalid promo code');
      }
    } catch {
      setCouponError('Failed to validate code');
    } finally {
      setValidatingCoupon(false);
    }
  };

  return (
    <div
      id="cart-drawer-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end transition-opacity"
    >
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#f0eae1] flex items-center justify-between bg-[#fdfbf7]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#78350f]" />
            <h3 className="font-serif font-bold text-base text-[#291e14]">
              Shopping Cart ({items.reduce((s, i) => s + i.quantity, 0)})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#8c7e75] hover:text-[#291e14] rounded-lg hover:bg-[#f3ede2]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 divide-y divide-[#f5efe6]">
          {items.length === 0 ? (
            <div className="py-20 text-center text-[#8c7e75]">
              <ShoppingBag className="w-12 h-12 mx-auto text-[#dfd4c5] mb-3" />
              <p className="font-medium text-sm text-[#291e14]">Your cart is empty</p>
              <p className="text-xs text-[#8c7e75] mt-1">
                Explore our handcrafted solid wood pieces or customize your own!
              </p>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={`${item.productId}-${item.selectedFinish}-${idx}`} className="pt-4 first:pt-0 flex gap-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-18 h-18 rounded-xl object-cover bg-[#f7f3eb] border border-[#e7dfd5] shrink-0"
                />

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <h4 className="text-xs font-bold text-[#291e14] line-clamp-1">
                        {item.name}
                      </h4>
                      <button
                        onClick={() => onRemoveItem(item.productId, item.selectedFinish)}
                        className="text-[#9ca3af] hover:text-[#dc2626] p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {item.selectedFinish && (
                      <p className="text-[11px] text-[#854d0e] font-medium">
                        Finish: {item.selectedFinish}
                      </p>
                    )}

                    {item.selectedDimensions && (
                      <p className="text-[10px] text-[#8c7e75]">
                        Custom: {item.selectedDimensions}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-[#dfd4c5] rounded-lg bg-[#fdfbf7] overflow-hidden">
                      <button
                        onClick={() => onUpdateQuantity(item.productId, item.quantity - 1, item.selectedFinish)}
                        className="px-2 py-0.5 text-xs text-[#57483f] hover:bg-[#f3ede2]"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold text-[#291e14]">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.productId, item.quantity + 1, item.selectedFinish)}
                        className="px-2 py-0.5 text-xs text-[#57483f] hover:bg-[#f3ede2]"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-xs font-bold text-[#291e14]">
                      ${(((item.price ?? (item as any).unitPrice ?? 0)) * (item.quantity ?? 1)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Calculations */}
        {items.length > 0 && (
          <div className="p-6 bg-[#fdfbf7] border-t border-[#f0eae1] space-y-4">
            {/* Promo Code Input */}
            <div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-[#8c7e75] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Coupon (e.g. WOOD10)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#dfd4c5] rounded-xl text-xs uppercase font-bold text-[#291e14] focus:outline-hidden focus:border-[#78350f]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={validatingCoupon}
                  className="px-3 py-1.5 bg-[#78350f] text-white text-xs font-semibold rounded-xl hover:bg-[#5c280a]"
                >
                  {validatingCoupon ? 'Checking...' : 'Apply'}
                </button>
              </div>

              {appliedCoupon && (
                <div className="mt-1.5 flex items-center justify-between text-xs text-[#15803d] font-semibold">
                  <span>Coupon {appliedCoupon.code} applied!</span>
                  <button
                    onClick={() => setAppliedCoupon(null)}
                    className="text-[10px] text-[#dc2626] hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}

              {couponError && (
                <p className="mt-1 text-[11px] text-[#dc2626]">{couponError}</p>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs text-[#57483f] pt-2 border-t border-[#f0eae1]">
              <div className="flex justify-between">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items):</span>
                <span className="font-semibold text-[#291e14]">${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Workshop White-Glove Delivery:</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="text-[#15803d] font-bold">FREE (Orders $1,000+)</span>
                  ) : (
                    `$${deliveryFee}`
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Sales Tax (8%):</span>
                <span>${tax.toLocaleString()}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-[#15803d] font-bold">
                  <span>Coupon Discount:</span>
                  <span>-${discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-bold text-[#291e14] pt-2 border-t border-[#e7dfd5]">
                <span>Total Amount:</span>
                <span className="text-base text-[#92400e]">${grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={() => onProceedToCheckout(discountAmount, appliedCoupon?.code)}
              className="w-full py-3.5 px-4 bg-[#78350f] hover:bg-[#5c280a] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Secure Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1 text-[10px] text-[#8c7e75]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#15803d]" />
              <span>100% Solid Seasoned Timber • 10-Year Warranty</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
