import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Filter,
  SlidersHorizontal,
  Search,
  ArrowUpDown,
  Check,
  Grid,
  List,
  Sparkles,
  TreePine,
} from 'lucide-react';
import { Product, ProductCategory } from '../types';
import { ProductCard } from './ProductCard';

interface ProductCatalogProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, finish?: string) => void;
  onRequestCustomization: (product: Product) => void;
  initialCategory?: ProductCategory | 'All';
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenCustomBuilder: () => void;
}

const CATEGORIES: Array<ProductCategory | 'All'> = [
  'All',
  'Beds',
  'Sofas',
  'Dining Tables',
  'Chairs',
  'Wardrobes',
  'TV Units',
  'Kitchen Cabinets',
  'Office Furniture',
  'Doors & Windows',
  'Custom Furniture',
];

const WOOD_MATERIALS = [
  'All Woods',
  'Teak',
  'Oak',
  'Walnut',
  'Sheesham',
  'Pine',
  'Ash',
];

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  onRequestCustomization,
  initialCategory = 'All',
  searchQuery,
  setSearchQuery,
  onOpenCustomBuilder,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>(initialCategory);
  const [selectedWood, setSelectedWood] = useState<string>('All Woods');
  const [maxPrice, setMaxPrice] = useState<number>(120000);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchCategory = p.category.toLowerCase().includes(q);
          const matchMaterial = p.materials.some((m) => m.toLowerCase().includes(q));
          const matchDesc = p.description.toLowerCase().includes(q);
          if (!matchName && !matchCategory && !matchMaterial && !matchDesc) return false;
        }

        // Wood species filter
        if (selectedWood !== 'All Woods') {
          const hasWood = p.materials.some((m) => m.toLowerCase().includes(selectedWood.toLowerCase()));
          if (!hasWood) return false;
        }

        // Price filter
        if (p.price > maxPrice) return false;

        // Stock filter
        if (onlyInStock && !p.inStock) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [products, selectedCategory, searchQuery, selectedWood, maxPrice, onlyInStock, sortBy]);

  return (
    <div id="product-catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header & Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-[#e7dfd5] gap-4"
      >
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fef3c7] text-[#92400e] text-xs font-bold uppercase tracking-wider mb-2 border border-[#fde68a]">
            <TreePine className="w-3.5 h-3.5 text-[#b45309]" />
            <span>Handcrafted Collection</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#291e14]">
            Master Woodcraft Catalog
          </h2>
          <p className="text-sm text-[#6e5d52] mt-1 max-w-xl">
            Explore heirloom solid hardwood furniture crafted to architectural tolerances. Every piece includes structural warranty and certified wood provenance.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          id="catalog-custom-builder-banner-btn"
          onClick={onOpenCustomBuilder}
          className="self-start md:self-auto px-5 py-2.5 bg-gradient-to-r from-[#fef3c7] to-[#fde68a] hover:from-[#fde68a] hover:to-[#fcd34d] text-[#78350f] border border-[#fcd34d] font-semibold text-xs rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-[#b45309]" />
          <span>Need Custom Dimensions? Build Custom</span>
        </motion.button>
      </motion.div>

      {/* Category Pills Slider with subtle animation */}
      <div className="py-6 overflow-x-auto no-scrollbar flex items-center gap-2 border-b border-[#f0eae1]">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <motion.button
              whileTap={{ scale: 0.96 }}
              key={cat}
              id={`category-tab-${cat.replace(/\s+/g, '-').toLowerCase()}`}
              onClick={() => setSelectedCategory(cat)}
              className={`relative px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#78350f] text-white shadow-md'
                  : 'bg-[#f7f3eb] text-[#57483f] hover:bg-[#ede5d8] hover:text-[#291e14]'
              }`}
            >
              {cat}
            </motion.button>
          );
        })}
      </div>

      {/* Filter and Control Toolbar */}
      <div className="py-5 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Quick search & Active count */}
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#8c7e75] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by name, teak, oak, finish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#dfd4c5] rounded-xl text-xs text-[#291e14] placeholder-[#a89b91] focus:outline-hidden focus:border-[#78350f] shadow-2xs transition-colors"
            />
          </div>
          <span className="text-xs text-[#8c7e75] font-medium hidden sm:inline">
            Showing <strong className="text-[#291e14] font-bold">{filteredProducts.length}</strong> items
          </span>
        </div>

        {/* Right: Filters, Wood Species, Price & Sort */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Wood Type Selector */}
          <div className="flex items-center gap-1.5 text-xs text-[#57483f] bg-white border border-[#dfd4c5] px-3 py-1.5 rounded-xl shadow-2xs">
            <span className="text-[#8c7e75] font-medium">Timber:</span>
            <select
              value={selectedWood}
              onChange={(e) => setSelectedWood(e.target.value)}
              className="bg-transparent font-semibold text-[#291e14] focus:outline-hidden cursor-pointer"
            >
              {WOOD_MATERIALS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          {/* In Stock Checkbox */}
          <label className="flex items-center gap-2 text-xs text-[#57483f] cursor-pointer bg-white border border-[#dfd4c5] px-3 py-2 rounded-xl shadow-2xs hover:bg-[#fcfaf7] transition-colors">
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(e) => setOnlyInStock(e.target.checked)}
              className="rounded text-[#78350f] focus:ring-[#78350f] accent-[#78350f]"
            />
            <span className="font-medium">In Stock Only</span>
          </label>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 text-xs text-[#57483f] bg-white border border-[#dfd4c5] px-3 py-1.5 rounded-xl shadow-2xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#8c7e75]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-semibold text-[#291e14] focus:outline-hidden cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated (Stars)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Price Range Slider */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-6 p-4 bg-gradient-to-r from-[#fdfbf7] to-[#f7f2ea] rounded-2xl border border-[#f0eae1] flex flex-wrap items-center justify-between gap-4 shadow-2xs"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#57483f]">Price Limit:</span>
          <input
            type="range"
            min="10000"
            max="120000"
            step="2500"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="accent-[#78350f] w-36 sm:w-48 cursor-pointer"
          />
          <span className="text-xs font-bold text-[#78350f] bg-white px-2.5 py-1 rounded-lg border border-[#e7dfd5] shadow-2xs">
            Up to ₹{maxPrice.toLocaleString('en-IN')}
          </span>
        </div>

        {searchQuery || selectedWood !== 'All Woods' || selectedCategory !== 'All' || maxPrice < 120000 || onlyInStock ? (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedWood('All Woods');
              setSelectedCategory('All');
              setMaxPrice(120000);
              setOnlyInStock(false);
            }}
            className="text-xs text-[#b45309] hover:underline font-semibold cursor-pointer"
          >
            Reset All Filters
          </button>
        ) : null}
      </motion.div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-20 text-center bg-[#fdfbf7] rounded-3xl border border-[#e7dfd5] p-8 shadow-xs"
        >
          <div className="w-16 h-16 rounded-full bg-[#fef3c7] text-[#92400e] flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-serif font-bold text-[#291e14]">
            No Furniture Pieces Found
          </h3>
          <p className="text-xs text-[#6e5d52] mt-1 max-w-md mx-auto">
            Try adjusting your search keywords, price slider, or wood species filter. Or submit a custom furniture requirement!
          </p>
          <button
            onClick={onOpenCustomBuilder}
            className="mt-5 px-6 py-2.5 bg-[#78350f] text-white text-xs font-semibold rounded-xl hover:bg-[#5c280a] cursor-pointer shadow-xs transition-colors"
          >
            Request Custom Furniture Build
          </button>
        </motion.div>
      ) : (
        <motion.div
          layout
          id="products-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
                onAddToCart={onAddToCart}
                onRequestCustomization={onRequestCustomization}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

