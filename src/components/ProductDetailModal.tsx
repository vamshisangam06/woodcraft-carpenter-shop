import React, { useState } from 'react';
import {
  X,
  Star,
  ShoppingCart,
  Sparkles,
  Ruler,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Hammer,
  Layers,
  Heart,
} from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, selectedFinish?: string, quantity?: number) => void;
  onBuyNow: (product: Product, selectedFinish?: string) => void;
  onRequestCustomization: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  onRequestCustomization,
}) => {
  if (!product) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedFinish, setSelectedFinish] = useState(product.finishes[0] || 'Natural Matte');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'care' | 'reviews'>('specs');

  return (
    <div
      id="product-detail-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-[#e7dfd5] overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#f0eae1] flex items-center justify-between bg-[#fdfbf7]">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#78350f] text-white text-[11px] font-bold rounded-md uppercase tracking-wider">
              {product.category}
            </span>
            <span className="text-xs font-mono text-[#8c7e75]">{product.sku}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#f3ede2] text-[#8c7e75] hover:text-[#291e14] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column: Image Gallery */}
          <div className="md:col-span-6 space-y-4">
            <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-[#f7f3eb] border border-[#e7dfd5]">
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.inStock ? (
                <span className="absolute top-3 right-3 px-2.5 py-1 bg-[#dcfce7] text-[#15803d] text-xs font-bold rounded-lg border border-[#bbf7d0]">
                  In Stock ({product.stockCount})
                </span>
              ) : (
                <span className="absolute top-3 right-3 px-2.5 py-1 bg-[#fee2e2] text-[#991b1b] text-xs font-bold rounded-lg">
                  Made to Order
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-2.5">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImageIndex === idx
                        ? 'border-[#78350f] scale-105 shadow-xs'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Guarantees */}
            <div className="bg-[#fdfbf7] p-4 rounded-2xl border border-[#f0eae1] space-y-2.5 text-xs text-[#57483f]">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#b45309]" />
                <span><strong>10-Year Structural Guarantee</strong> on mortise-tenon joinery.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-[#b45309]" />
                <span>White-glove assembly & room placement available on delivery.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 text-[#b45309]" />
                <span>30-Day Woodcraft satisfaction trial with insured return transit.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Details, Finishes & Actions */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-6">
            <div>
              {/* Rating */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex text-[#f59e0b]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-[#291e14]">{product.rating}</span>
                <span className="text-[#8c7e75]">({product.reviewCount} customer reviews)</span>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-serif font-bold text-[#291e14] mt-1.5 leading-snug">
                {product.name}
              </h2>

              {/* Price */}
              <div className="flex items-baseline gap-3 mt-3">
                <span className="text-3xl font-bold text-[#291e14]">
                  ${(product.price ?? 0).toLocaleString()}
                </span>
                {product.originalPrice != null && product.originalPrice > product.price && (
                  <span className="text-base text-[#9ca3af] line-through">
                    ${product.originalPrice.toLocaleString()}
                  </span>
                )}
                {product.originalPrice != null && product.originalPrice > product.price && (
                  <span className="text-xs font-semibold text-[#15803d] bg-[#dcfce7] px-2 py-0.5 rounded-md">
                    Save ${(product.originalPrice - product.price).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Dimensions Box */}
              <div className="mt-4 p-3.5 bg-[#f7f3eb] rounded-xl border border-[#e7dfd5]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#291e14]">
                  <Ruler className="w-4 h-4 text-[#b45309]" />
                  <span>Standard Dimensions:</span>
                </div>
                <p className="text-sm font-semibold text-[#57483f] mt-1">
                  {product.dimensions.length}" Length × {product.dimensions.width}" Width × {product.dimensions.height}" Height
                </p>
                <p className="text-[11px] text-[#8c7e75] mt-0.5">
                  Need a custom length/depth to fit your room alcove? Use the button below.
                </p>
              </div>

              {/* Materials Used & Wood Species */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-bold text-[#291e14] uppercase tracking-wider">
                    Hardwood Species & Hardware:
                  </p>
                  {product.woodType && (
                    <span className="px-2 py-0.5 bg-[#fef3c7] text-[#78350f] text-[11px] font-bold rounded-md border border-[#fde68a]">
                      🪵 {product.woodType}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {product.woodType && !product.materials.includes(product.woodType) && (
                    <span className="px-2.5 py-1 bg-[#fdf2e9] text-[#78350f] text-xs font-bold rounded-lg border border-[#fbd3b6]">
                      Solid {product.woodType}
                    </span>
                  )}
                  {product.materials.map((mat, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-[#f3ede2] text-[#443831] text-xs font-medium rounded-lg border border-[#e0d6c8]"
                    >
                      {mat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Finishes Selector */}
              <div className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-[#291e14] uppercase tracking-wider">
                    Finish / Color: <span className="text-[#92400e] capitalize">{selectedFinish}</span>
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {product.finishes.map((finish) => (
                    <button
                      key={finish}
                      onClick={() => setSelectedFinish(finish)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                        selectedFinish === finish
                          ? 'bg-[#78350f] text-white border-[#78350f] shadow-xs'
                          : 'bg-[#fdfbf7] text-[#57483f] border-[#e7dfd5] hover:bg-[#f3ede2]'
                      }`}
                    >
                      <span>{finish}</span>
                      {selectedFinish === finish && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mt-5 flex items-center gap-3">
                <span className="text-xs font-bold text-[#291e14]">Quantity:</span>
                <div className="flex items-center border border-[#dfd4c5] rounded-xl bg-white overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-sm hover:bg-[#f7f3eb] font-bold text-[#57483f]"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-bold text-[#291e14]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockCount || 10, quantity + 1))}
                    className="px-3 py-1.5 text-sm hover:bg-[#f7f3eb] font-bold text-[#57483f]"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* CTA Buttons (Add to Cart, Buy Now, Request Customization) */}
            <div className="space-y-2.5 pt-4 border-t border-[#f0eae1]">
              <div className="grid grid-cols-2 gap-3">
                <button
                  id="modal-add-to-cart-btn"
                  onClick={() => {
                    onAddToCart(product, selectedFinish, quantity);
                    onClose();
                  }}
                  className="py-3 px-4 bg-[#78350f] hover:bg-[#5c280a] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart (${(product.price * quantity).toLocaleString()})</span>
                </button>

                <button
                  id="modal-buy-now-btn"
                  onClick={() => {
                    onBuyNow(product, selectedFinish);
                    onClose();
                  }}
                  className="py-3 px-4 bg-[#b45309] hover:bg-[#92400e] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <span>Buy Now</span>
                </button>
              </div>

              <button
                id="modal-request-custom-btn"
                onClick={() => {
                  onRequestCustomization(product);
                  onClose();
                }}
                className="w-full py-2.5 px-4 bg-[#fef3c7] hover:bg-[#fde68a] text-[#78350f] border border-[#fcd34d] text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4 text-[#b45309]" />
                <span>Request Custom Dimensions or Wood Type</span>
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Tabs: Description, Care, Reviews */}
        <div className="px-6 py-4 bg-[#fbf8f2] border-t border-[#f0eae1]">
          <div className="flex items-center gap-4 border-b border-[#e7dfd5] pb-2 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-1 border-b-2 transition-colors ${
                activeTab === 'specs'
                  ? 'border-[#78350f] text-[#78350f]'
                  : 'border-transparent text-[#8c7e75]'
              }`}
            >
              Craftsmanship Details
            </button>
            <button
              onClick={() => setActiveTab('care')}
              className={`pb-1 border-b-2 transition-colors ${
                activeTab === 'care'
                  ? 'border-[#78350f] text-[#78350f]'
                  : 'border-transparent text-[#8c7e75]'
              }`}
            >
              Care & Conditioning
            </button>
          </div>

          <div className="pt-3 text-xs text-[#57483f] leading-relaxed">
            {activeTab === 'specs' && (
              <p>{product.description}</p>
            )}
            {activeTab === 'care' && (
              <p>
                {product.careInstructions ||
                  'Keep away from direct HVAC vents. Wipe spills immediately with a lint-free damp cloth. Condition wood surfaces with pure beeswax or mineral oil every 6 months to maintain deep luster.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
