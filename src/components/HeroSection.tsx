import React from 'react';
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
    <section id="hero-section" className="relative overflow-hidden bg-gradient-to-b from-[#fbf8f2] to-[#f4ede2] border-b border-[#e7dfd5]">
      {/* Decorative Wood Texture Glow */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-[#d97706]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-[#78350f]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-16 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Text & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fef3c7] border border-[#fde68a] text-[#92400e] text-xs font-semibold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#b45309]" />
              <span>Bespoke Architectural Woodworking & Certified Master Joiners</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#291e14] leading-[1.12] tracking-tight">
              Crafted With Wood.{' '}
              <span className="text-[#92400e] underline decoration-[#d97706]/40 underline-offset-8">
                Designed For You.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-[#57483f] max-w-2xl leading-relaxed font-sans">
              From heirloom Grade-A Burma Teak beds to precision live-edge dining tables and on-demand master carpenter repairs. We combine traditional Japanese joinery with modern CNC accuracy.
            </p>

            {/* Prompt Requested 3 Primary Buttons: Shop Furniture, Book a Carpenter, Get a Quote */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="hero-cta-shop"
                onClick={onShopFurniture}
                className="px-6 py-3.5 bg-[#78350f] hover:bg-[#5c280a] text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <span>Shop Furniture</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-cta-book-carpenter"
                onClick={onBookCarpenter}
                className="px-6 py-3.5 bg-[#f5ede0] hover:bg-[#ebdcc8] text-[#78350f] font-semibold text-sm rounded-xl border border-[#d6c4b2] shadow-2xs transition-all flex items-center gap-2"
              >
                <Wrench className="w-4 h-4 text-[#92400e]" />
                <span>Book a Carpenter</span>
              </button>

              <button
                id="hero-cta-get-quote"
                onClick={onGetQuote}
                className="px-6 py-3.5 bg-white hover:bg-[#fcfaf7] text-[#291e14] font-semibold text-sm rounded-xl border border-[#d6c4b2] shadow-2xs transition-all flex items-center gap-2"
              >
                <Ruler className="w-4 h-4 text-[#b45309]" />
                <span>Get a Quote</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 border-t border-[#e5dcce] grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#b45309] shrink-0" />
                <div>
                  <p className="text-xs font-bold text-[#291e14]">10-Yr Warranty</p>
                  <p className="text-[11px] text-[#786b62]">Structural Joinery</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#b45309] shrink-0" />
                <div>
                  <p className="text-xs font-bold text-[#291e14]">100% Solid Wood</p>
                  <p className="text-[11px] text-[#786b62]">Kiln-Dried Hardwood</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#b45309] shrink-0" />
                <div>
                  <p className="text-xs font-bold text-[#291e14]">Master Joiners</p>
                  <p className="text-[11px] text-[#786b62]">10+ Yrs Experience</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#b45309] shrink-0" />
                <div>
                  <p className="text-xs font-bold text-[#291e14]">Fast Dispatch</p>
                  <p className="text-[11px] text-[#786b62]">White-Glove Delivery</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Furniture Showcase Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
              <img
                src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1000&auto=format&fit=crop&q=80"
                alt="WoodCraft Heritage Burma Teak King Bed"
                className="w-full h-80 sm:h-96 object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#fde68a] bg-[#78350f]/80 px-2.5 py-1 rounded-md w-fit backdrop-blur-xs">
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
                  <span className="text-lg font-bold text-[#fde68a]">$1,290</span>
                </div>
              </div>
            </div>

            {/* Floating Live Carpenter Availability Badge */}
            <div className="absolute -bottom-5 -left-4 bg-white rounded-2xl p-3.5 shadow-xl border border-[#e7dfd5] flex items-center gap-3 animate-bounce duration-1000">
              <div className="w-3 h-3 rounded-full bg-[#16a34a] animate-ping" />
              <div>
                <p className="text-xs font-bold text-[#291e14]">Carpenters On Call</p>
                <p className="text-[10px] text-[#786b62]">3 Specialists ready for dispatch today</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
