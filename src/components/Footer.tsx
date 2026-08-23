import React from 'react';
import {
  Hammer,
  ShieldCheck,
  Award,
  Phone,
  Mail,
  MapPin,
  Clock,
  ExternalLink,
  Heart,
} from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenAIAdvisor: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAIAdvisor }) => {
  return (
    <footer id="main-footer" className="bg-[#291e14] text-[#e7dfd5] pt-16 pb-12 border-t border-[#451a03]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#453629]">
          {/* Col 1: Brand & Philosophy */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#b45309] to-[#78350f] flex items-center justify-center text-white shadow-md">
                <Hammer className="w-5 h-5 text-[#fde68a]" />
              </div>
              <span className="text-2xl font-serif font-bold text-white tracking-tight">
                WoodCraft
              </span>
            </div>
            <p className="text-xs text-[#b8aba0] leading-relaxed max-w-sm">
              Heirloom-grade solid wood furniture hand-joined by master carpenters. We source certified sustainably harvested Burma Teak, White Oak, Walnut, and Indian Sheesham.
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs text-[#fde68a]">
              <ShieldCheck className="w-4 h-4 text-[#d97706]" />
              <span>10-Year Warranty • 100% Solid Kiln-Dried Hardwood</span>
            </div>
          </div>

          {/* Col 2: Furniture Categories */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider">
              Furniture Collections
            </h4>
            <ul className="space-y-2 text-xs text-[#b8aba0]">
              {['Beds & Headboards', 'Dining Tables & Slabs', 'Louver Wardrobes', 'Acoustic TV Consoles', 'Modular Kitchen Cabinets', 'Office Desks'].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => onNavigate('catalog')}
                    className="hover:text-[#fde68a] transition-colors"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Carpenter Services & Tools */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider">
              Carpentry Services
            </h4>
            <ul className="space-y-2 text-xs text-[#b8aba0]">
              {['Furniture Repair & Joinery', 'Polishing & PU Painting', 'Modular Kitchen Fitting', 'Door & Lock Alignment', 'Custom Woodwork Consultation', 'On-Site Carpenter Booking'].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => onNavigate('services')}
                    className="hover:text-[#fde68a] transition-colors"
                  >
                    {item}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={onOpenAIAdvisor}
                  className="text-[#fde68a] font-semibold hover:underline flex items-center gap-1"
                >
                  ✨ AI Wood Doctor
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Workshop & Location */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider">
              Master Workshop
            </h4>
            <div className="space-y-2 text-xs text-[#b8aba0]">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#d97706] shrink-0 mt-0.5" />
                <span>102 Timber Mill Road, Sawmill District, Springfield, OR 97477</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#d97706] shrink-0" />
                <span>+1 (555) 980-WOOD / +1 (555) 432-JOIN</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#d97706] shrink-0" />
                <span>Mon - Sat: 8:00 AM – 7:30 PM</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8c7e75] gap-4">
          <p>© {new Date().getFullYear()} WoodCraft Carpentry Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <span>Kiln-Dried Moisture Guarantee (8-10%)</span>
            <span>•</span>
            <span>Zero Particle-Board Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
