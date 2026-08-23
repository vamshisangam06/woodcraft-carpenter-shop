import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  Wrench,
  CheckCircle2,
  Star,
  Layers,
  Ruler,
  Compass,
  Clock,
  Sparkle,
} from 'lucide-react';

interface HeroSectionProps {
  onShopFurniture: () => void;
  onBookCarpenter: () => void;
  onGetQuote: () => void;
  onOpenAIAdvisor: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onShopFurniture,
  onBookCarpenter,
  onGetQuote,
  onOpenAIAdvisor,
}) => {
  return (
    <section id="hero-section" className="relative overflow-hidden bg-gradient-to-b from-[#fbf8f2] via-[#f7f1e7] to-[#ede4d6] border-b border-[#e7dfd5]">
      {/* Decorative Warm & Cool Ambient Glows */}
      <div className="absolute top-0 right-1/4 -mt-24 w-96 h-96 bg-[#f59e0b]/15 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />
      <div className="absolute bottom-0 left-0 -mb-24 w-96 h-96 bg-[#059669]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 -mr-20 w-80 h-80 bg-[#78350f]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-16 lg:pb-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Text & CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#fef3c7] via-[#fef9c3] to-[#ecfdf5] border border-[#fde68a] text-[#92400e] text-xs font-semibold shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#d97706] animate-spin" style={{ animationDuration: '6s' }} />
              <span>Bespoke Architectural Woodworking & Certified Master Joiners</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#291e14] leading-[1.12] tracking-tight"
            >
              Crafted With Wood.{' '}
              <span className="bg-gradient-to-r from-[#92400e] via-[#b45309] to-[#d97706] bg-clip-text text-transparent underline decoration-[#d97706]/40 underline-offset-8">
                Designed For You.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-lg sm:text-xl text-[#57483f] max-w-2xl leading-relaxed font-sans"
            >
              From heirloom Grade-A Burma Teak beds to precision live-edge dining tables and on-demand master carpenter repairs. We combine traditional Japanese joinery with modern CNC accuracy.
            </motion.p>

            {/* 3 Primary Buttons: Shop Furniture, Book a Carpenter, Get a Quote */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-wrap items-center gap-3 pt-2"
            >
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                id="hero-cta-shop"
                onClick={onShopFurniture}
                className="px-6 py-3.5 bg-gradient-to-r from-[#78350f] to-[#5c280a] hover:from-[#8d3e12] hover:to-[#6d300c] text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer border border-[#92400e]/30"
              >
                <span>Shop Furniture</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                id="hero-cta-book-carpenter"
                onClick={onBookCarpenter}
                className="px-6 py-3.5 bg-white hover:bg-[#faf6ef] text-[#78350f] font-semibold text-sm rounded-xl border border-[#d6c4b2] shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Wrench className="w-4 h-4 text-[#92400e]" />
                <span>Book a Carpenter</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                id="hero-cta-get-quote"
                onClick={onGetQuote}
                className="px-6 py-3.5 bg-[#fef3c7] hover:bg-[#fde68a] text-[#92400e] font-semibold text-sm rounded-xl border border-[#fcd34d] shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Ruler className="w-4 h-4 text-[#b45309]" />
                <span>Get a Quote</span>
              </motion.button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="pt-6 border-t border-[#e5dcce] grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/60 border border-white/80 backdrop-blur-xs">
                <ShieldCheck className="w-5 h-5 text-[#b45309] shrink-0" />
                <div>
                  <p className="text-xs font-bold text-[#291e14]">10-Yr Warranty</p>
                  <p className="text-[11px] text-[#786b62]">Structural Joinery</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/60 border border-white/80 backdrop-blur-xs">
                <Layers className="w-5 h-5 text-[#059669] shrink-0" />
                <div>
                  <p className="text-xs font-bold text-[#291e14]">100% Solid Wood</p>
                  <p className="text-[11px] text-[#786b62]">Kiln-Dried Hardwood</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/60 border border-white/80 backdrop-blur-xs">
                <Award className="w-5 h-5 text-[#b45309] shrink-0" />
                <div>
                  <p className="text-xs font-bold text-[#291e14]">Master Joiners</p>
                  <p className="text-[11px] text-[#786b62]">10+ Yrs Experience</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/60 border border-white/80 backdrop-blur-xs">
                <Clock className="w-5 h-5 text-[#0284c7] shrink-0" />
                <div>
                  <p className="text-xs font-bold text-[#291e14]">Fast Dispatch</p>
                  <p className="text-[11px] text-[#786b62]">White-Glove Delivery</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Visual Furniture Showcase Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white group">
              <img
                src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1000&auto=format&fit=crop&q=80"
                alt="WoodCraft Heritage Burma Teak King Bed"
                className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#fde68a] bg-[#78350f]/90 px-2.5 py-1 rounded-md w-fit backdrop-blur-md border border-[#fde68a]/30">
                  Featured Masterpiece
                </span>
                <h3 className="text-xl font-serif font-bold mt-2 text-white">
                  Burma Teak Heritage Platform Bed
                </h3>
                <p className="text-xs text-[#f5efe6] mt-1 line-clamp-2">
                  Mortise-and-tenon interlocking joints, ergonomic angled headrest, hand-finished with organic tung & beeswax.
                </p>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/20">
                  <div className="flex items-center gap-1.5">
                    <div className="flex text-[#f59e0b]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-white">4.95 (42 reviews)</span>
                  </div>
                  <span className="text-xl font-bold text-[#fde68a]">₹48,500</span>
                </div>
              </div>
            </div>

            {/* Floating Live Carpenter Availability Badge with Gentle Floating Effect */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="absolute -bottom-5 -left-4 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-[#e7dfd5] flex items-center gap-3"
            >
              <div className="relative flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-[#16a34a]" />
                <div className="absolute w-5 h-5 rounded-full bg-[#16a34a]/30 animate-ping" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#291e14]">Carpenters On Call</p>
                <p className="text-[10px] text-[#786b62]">3 Specialists ready for dispatch today</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

