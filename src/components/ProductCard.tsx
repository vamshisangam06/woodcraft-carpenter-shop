import React from 'react';
import { Star, ShoppingCart, Ruler, Sparkles, Check } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product, selectedFinish?: string) => void;
  onRequestCustomization: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onAddToCart,
  onRequestCustomization,
}) => {
  const [selectedFinish, setSelectedFinish] = React.useState<string>(
    product.finishes[0] || 'Natural Matte'
  );

  return (
    <div
      id={`product-card-${product.id}`}
      className="group bg-white rounded-2xl border border-[#e8e0d5] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-4/3 bg-[#f7f3eb] cursor-pointer" onClick={() => onSelect(product)}>
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className="px-2.5 py-1 bg-[#291e14]/80 text-white text-[11px] font-semibold rounded-md backdrop-blur-xs">
            {product.category}
          </span>
          {product.featured && (
            <span className="px-2.5 py-0.5 bg-[#b45309] text-white text-[10px] font-bold rounded-md uppercase tracking-wider">
              Featured
            </span>
          )}
        </div>

        {/* Stock Status Badge */}
        <div className="absolute top-3 right-3">
          {product.inStock ? (
            <span className="px-2 py-0.5 bg-[#dcfce7] text-[#15803d] text-[10px] font-bold rounded-md border border-[#bbf7d0]">
              In Stock ({product.stockCount})
            </span>
          ) : (
            <span className="px-2 py-0.5 bg-[#fee2e2] text-[#991b1b] text-[10px] font-bold rounded-md">
              Made to Order
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1 text-xs text-[#786b62]">
            <div className="flex text-[#f59e0b]">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="font-bold text-[#291e14]">{product.rating}</span>
            <span>({product.reviewCount} reviews)</span>
            <span className="text-[#d1c7bc]">•</span>
            <span className="text-[#8c7e75] font-mono text-[10px]">{product.sku}</span>
          </div>

          {/* Title */}
          <h3
            className="text-base font-serif font-bold text-[#291e14] hover:text-[#78350f] cursor-pointer mt-1 line-clamp-1"
            onClick={() => onSelect(product)}
          >
            {product.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-[#6e5d52] line-clamp-2 mt-1 leading-relaxed">
            {product.shortDescription || product.description}
          </p>

          {/* Dimensions */}
          <div className="flex items-center gap-1.5 text-[11px] text-[#786b62] bg-[#fdfbf7] p-2 rounded-lg border border-[#f0eae1] mt-2.5">
            <Ruler className="w-3.5 h-3.5 text-[#b45309] shrink-0" />
            <span>
              {product.dimensions.length}"L × {product.dimensions.width}"W × {product.dimensions.height}"H
            </span>
          </div>

          {/* Materials snippet */}
          <div className="mt-2 flex flex-wrap gap-1">
            {product.woodType && (
              <span className="text-[10px] px-2 py-0.5 bg-[#fdf2e9] text-[#78350f] rounded-md font-bold border border-[#fbd3b6]">
                {product.woodType}
              </span>
            )}
            {product.materials.filter((m) => m !== product.woodType).slice(0, product.woodType ? 1 : 2).map((mat, idx) => (
              <span
                key={idx}
                className="text-[10px] px-2 py-0.5 bg-[#f5efe6] text-[#57483f] rounded-md font-medium"
              >
                {mat}
              </span>
            ))}
          </div>

          {/* Available Finishes */}
          <div className="mt-3">
            <p className="text-[10px] font-bold text-[#8c7e75] uppercase tracking-wider">
              Finish: <span className="text-[#291e14] lowercase capitalize">{selectedFinish}</span>
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              {product.finishes.map((finish) => (
                <button
                  key={finish}
                  onClick={() => setSelectedFinish(finish)}
                  title={finish}
                  className={`text-[10px] px-2 py-1 rounded-md border transition-all ${
                    selectedFinish === finish
                      ? 'bg-[#78350f] text-white border-[#78350f] font-semibold'
                      : 'bg-[#faf7f2] text-[#57483f] border-[#e7dfd5] hover:bg-[#ede5d8]'
                  }`}
                >
                  {finish.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing and Action Buttons */}
        <div className="pt-3 border-t border-[#f0eae1]">
          <div className="flex items-baseline justify-between mb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-[#291e14]">
                ${(product.price ?? 0).toLocaleString()}
              </span>
              {product.originalPrice != null && product.originalPrice > product.price && (
                <span className="text-xs text-[#9ca3af] line-through">
                  ${product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            <span className="text-[11px] text-[#15803d] font-semibold">
              Ships in {product.estimatedDeliveryDays || 7}d
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              id={`add-to-cart-btn-${product.id}`}
              onClick={() => onAddToCart(product, selectedFinish)}
              className="w-full py-2 px-3 bg-[#78350f] hover:bg-[#5c280a] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>

            <button
              id={`customize-btn-${product.id}`}
              onClick={() => onRequestCustomization(product)}
              className="w-full py-2 px-3 bg-[#fdf3e7] hover:bg-[#faebd7] text-[#92400e] border border-[#fcd34d] text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#b45309]" />
              <span>Customize</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
